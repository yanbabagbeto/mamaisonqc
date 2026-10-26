import { AppError } from "@/shared/errors";
import { env } from "@/lib/env";

import type { AddressCandidate, MernCandidate } from "./types";

/**
 * Adresses Québec geocoder client (MERN, CC-BY 4.0).
 *
 * `findAddressCandidates` returns ArcGIS "candidates": attributes carry the address parts and a
 * `location` (Web Mercator-free lon/lat in the service spatial reference). We treat the payload
 * as untrusted data: every field is re-parsed, never interpolated into SQL/HTML.
 *
 * Timeout: 3 s (docs/ARCHITECTURE.md §5). One retry with a 250 ms base delay + jitter.
 */
const TIMEOUT_MS = 3_000;
const RETRY_BASE_MS = 250;
/** The geocoder answers in a few KB; anything larger is not a candidate list we should parse. */
const MAX_BODY_CHARS = 512_000;
const MAX_LOCATIONS = 8;

const UPSTREAM_MESSAGE =
  "Recherche d'adresse indisponible. Réessayez dans un instant ou explorez le marché par région.";

const CIVIC_PREFIX = /^\s*(\d+)/;

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function asCoordinate(value: unknown): number | null {
  const raw = asText(value);
  if (!raw) return null;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * MERN is inconsistent across match types: for "1234-705 rue Sainte-Catherine Ouest" it returns
 * `Num = 705` (the unit) and `Unite = 1234` (the primary civic), while a plain address puts the
 * civic in `Num`. The label always begins with the primary civic, so it wins; `Unite` then `Num`
 * are fallbacks. `src/shared/slug.primaryCivicNumber` normalizes the result for roll matching.
 */
function civicFrom(attributes: Record<string, unknown>, label: string): string {
  const fromLabel = label.match(CIVIC_PREFIX)?.[1];
  if (fromLabel) return fromLabel;
  const unit = asText(attributes.Unite);
  if (unit) return unit;
  return asText(attributes.Num);
}

/** Last-resort odonym when `Odonyme` is empty: strip the civic prefix and the trailing city/postal. */
function streetFromLabel(label: string, city: string): string {
  const withoutCivic = label.replace(/^\s*\d+\s*(?:[-–]\s*\d+\s*)?/, "").trim();
  const cityIndex = city ? withoutCivic.toLowerCase().lastIndexOf(city.toLowerCase()) : -1;
  const street = cityIndex > 0 ? withoutCivic.slice(0, cityIndex) : withoutCivic;
  return street.replace(/[,\s]+$/, "").trim();
}

/**
 * Maps one raw candidate to the product contract. Returns `null` for street-segment suggestions
 * (no civic number, e.g. "Rue Sainte-Catherine, Montréal-Est"): they cannot resolve to a roll
 * unit and would only suggest that a specific address exists when it does not.
 */
export function parseMernCandidate(raw: MernCandidate): AddressCandidate | null {
  const attributes = raw.attributes ?? {};
  const label = asText(attributes.Match_addr) || asText(raw.address);
  const city = asText(attributes.City);
  const civic = civicFrom(attributes, label);
  const street = asText(attributes.Odonyme) || streetFromLabel(label, city);
  if (!civic || !street) return null;

  const postal = asText(attributes.ZIP).replace(/\s+/g, "").toUpperCase();
  const latitude = asCoordinate(attributes.Latitude);
  const longitude = asCoordinate(attributes.Longitude);
  const fallbackLat = typeof raw.location?.y === "number" ? raw.location.y : null;
  const fallbackLon = typeof raw.location?.x === "number" ? raw.location.x : null;

  return {
    label: label || [civic, street, city, postal].filter(Boolean).join(", "),
    civic,
    street,
    city,
    postal,
    lat: latitude ?? fallbackLat,
    lon: longitude ?? fallbackLon,
    matricule: null,
  };
}

function isRecord(value: unknown): value is MernCandidate {
  return typeof value === "object" && value !== null;
}

async function requestCandidates(query: string): Promise<AddressCandidate[]> {
  const base = env.GEOCODER_URL.replace(/\/+$/, "");
  const url = new URL(`${base}/findAddressCandidates`);
  url.searchParams.set("SingleLine", query);
  url.searchParams.set("f", "json");
  url.searchParams.set("outFields", "*");
  url.searchParams.set("maxLocations", String(MAX_LOCATIONS));

  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new AppError("UPSTREAM_UNAVAILABLE", UPSTREAM_MESSAGE);
  }

  if (!response.ok) {
    throw new AppError("UPSTREAM_UNAVAILABLE", UPSTREAM_MESSAGE);
  }

  const body = await response.text();
  if (body.length > MAX_BODY_CHARS) {
    throw new AppError("UPSTREAM_UNAVAILABLE", UPSTREAM_MESSAGE);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new AppError("UPSTREAM_UNAVAILABLE", UPSTREAM_MESSAGE);
  }

  const rawCandidates =
    typeof payload === "object" && payload !== null && "candidates" in payload
      ? (payload as { candidates?: unknown }).candidates
      : undefined;
  if (!Array.isArray(rawCandidates)) return [];

  return rawCandidates
    .filter(isRecord)
    .map(parseMernCandidate)
    .filter((candidate): candidate is AddressCandidate => candidate !== null)
    .slice(0, MAX_LOCATIONS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** One network attempt, plus one retry after ~250 ms of jitter. */
export async function fetchAddressCandidates(query: string): Promise<AddressCandidate[]> {
  try {
    return await requestCandidates(query);
  } catch {
    await sleep(RETRY_BASE_MS + Math.floor(Math.random() * 100));
    return requestCandidates(query);
  }
}

export { UPSTREAM_MESSAGE };
