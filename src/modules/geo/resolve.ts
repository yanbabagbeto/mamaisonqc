import { and, eq, like, type SQL } from "drizzle-orm";

import { db } from "@/db/client";
import { propertyUnit, territory } from "@/db/schema";
import { normalizeStreet, primaryCivicNumber } from "@/shared/slug";

/**
 * Resolves a geocoder candidate to an assessment-roll matricule.
 *
 * Contract (task-2): municipality name (territory level `municipalite`) → `property_unit` rows
 * with that `municipality_code`, a matching normalized street and a matching primary civic
 * number. If the match is ambiguous (>1 distinct matricule) we return `null`: showing another
 * owner's valuation is worse than showing "fiche non disponible".
 *
 * Two street passes:
 *   1. exact normalized street (both sides run through `normalizeStreet`);
 *   2. loose LIKE on the street core with the leading type ("rue", "avenue"…) and the trailing
 *      orientation ("ouest", "est"…) removed — the roll and the geocoder do not always agree on
 *      whether the type/direction belongs to the odonym.
 * The civic number, city and municipality code are always enforced, so the loose pass cannot
 * silently attach an address to another street.
 */

type MatchResult =
  | { status: "match"; matricule: string }
  | { status: "none" }
  | { status: "ambiguous" };

const STREET_TYPES = new Set([
  "rue",
  "avenue",
  "av",
  "boulevard",
  "boul",
  "chemin",
  "ch",
  "rang",
  "route",
  "rte",
  "place",
  "pl",
  "impasse",
  "imp",
  "allee",
  "croissant",
  "crois",
  "montee",
  "terrasse",
  "square",
  "quai",
  "cote",
  "sentier",
  "sent",
  "voie",
  "autoroute",
  "auto",
  "pont",
  "parc",
  "lac",
  "ruelle",
  "passage",
  "traverse",
  "vieux",
]);

const ORIENTATIONS = new Set(["ouest", "est", "nord", "sud"]);

function streetCore(street: string): string {
  const tokens = normalizeStreet(street).split(" ").filter(Boolean);
  while (tokens.length > 0 && STREET_TYPES.has(tokens[0] ?? "")) tokens.shift();
  while (tokens.length > 0 && ORIENTATIONS.has(tokens[tokens.length - 1] ?? "")) tokens.pop();
  return tokens.join(" ");
}

const MUNICIPALITY_CACHE_TTL_MS = 5 * 60 * 1000;

let municipalityCache: { readAt: number; byName: Map<string, string[]> } | null = null;

/**
 * Municipality names are stable data, but the roll is being ingested while the app runs, so the
 * lookup is refreshed every 5 minutes instead of cached for the process lifetime.
 */
async function municipalityCodesByName(): Promise<Map<string, string[]>> {
  const now = Date.now();
  if (municipalityCache && now - municipalityCache.readAt < MUNICIPALITY_CACHE_TTL_MS) {
    return municipalityCache.byName;
  }
  const rows = await db
    .select({ codeGeo: territory.codeGeo, name: territory.name })
    .from(territory)
    .where(eq(territory.level, "municipalite"));
  const byName = new Map<string, string[]>();
  for (const row of rows) {
    const key = normalizeStreet(row.name);
    if (!key) continue;
    const codes = byName.get(key);
    if (codes) {
      codes.push(row.codeGeo);
    } else {
      byName.set(key, [row.codeGeo]);
    }
  }
  municipalityCache = { readAt: now, byName };
  return byName;
}

async function unitsForStreet(
  municipalityCode: string,
  streetPredicate: SQL<unknown>,
  civic: string,
): Promise<MatchResult> {
  const rows = await db
    .select({ matricule: propertyUnit.matricule, addrNo: propertyUnit.addrNo })
    .from(propertyUnit)
    .where(and(eq(propertyUnit.municipalityCode, municipalityCode), streetPredicate));

  const matricules = new Set<string>();
  for (const row of rows) {
    if (primaryCivicNumber(row.addrNo ?? "") === civic) {
      matricules.add(row.matricule);
    }
  }
  if (matricules.size === 0) return { status: "none" };
  if (matricules.size > 1) return { status: "ambiguous" };
  const [matricule] = matricules;
  return matricule ? { status: "match", matricule } : { status: "none" };
}

export async function resolveMatricule(candidate: {
  city: string;
  street: string;
  civic: string;
}): Promise<string | null> {
  const cityKey = normalizeStreet(candidate.city);
  const streetKey = normalizeStreet(candidate.street);
  const civic = primaryCivicNumber(candidate.civic);
  if (!cityKey || !streetKey || !civic) return null;

  const municipalityCodes = (await municipalityCodesByName()).get(cityKey);
  // A duplicated municipality name is ambiguous: do not guess which territory owns the address.
  if (!municipalityCodes || municipalityCodes.length !== 1) return null;
  const municipalityCode = municipalityCodes[0];
  if (!municipalityCode) return null;

  const exact = await unitsForStreet(municipalityCode, eq(propertyUnit.addrStreetNorm, streetKey), civic);
  if (exact.status === "match") return exact.matricule;
  if (exact.status === "ambiguous") return null;

  const core = streetCore(candidate.street);
  if (!core || core === streetKey) return null;
  const loose = await unitsForStreet(
    municipalityCode,
    like(propertyUnit.addrStreetNorm, `%${core}%`),
    civic,
  );
  return loose.status === "match" ? loose.matricule : null;
}

/** Test/dev hook: the roll can be rebuilt while the process runs. */
export function clearMunicipalityCache(): void {
  municipalityCache = null;
}
