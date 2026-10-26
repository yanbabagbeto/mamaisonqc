/**
 * One function per endpoint the app consumes. All of them go through `requestJson`, so every
 * screen gets the same timeout, envelope handling and error codes.
 */

import { getJson, postJson } from "./client";
import type {
  AddressSearchPayload,
  EvaluationPayload,
  InterestInput,
  InterestPayload,
  PremarketDetailPayload,
  PremarketListPayload,
  RegionDetailPayload,
  RegionsPayload,
} from "./types";

/** Web endpoint: `{ ok, data: { candidates } }` (MERN geocoder, 3 characters minimum). */
export function searchAddresses(query: string): Promise<AddressSearchPayload> {
  return getJson<AddressSearchPayload>(`/api/address/search?q=${encodeURIComponent(query.trim())}`);
}

export function getEvaluation(matricule: string): Promise<EvaluationPayload> {
  return getJson<EvaluationPayload>(`/api/mobile/evaluation/${encodeURIComponent(matricule.trim())}`);
}

export function getRegions(): Promise<RegionsPayload> {
  return getJson<RegionsPayload>("/api/mobile/regions");
}

export function getRegion(code: string): Promise<RegionDetailPayload> {
  return getJson<RegionDetailPayload>(`/api/mobile/regions/${encodeURIComponent(code.trim())}`);
}

export function getPremarketListings(): Promise<PremarketListPayload> {
  return getJson<PremarketListPayload>("/api/mobile/premarket");
}

export function getPremarketListing(id: string): Promise<PremarketDetailPayload> {
  return getJson<PremarketDetailPayload>(`/api/mobile/premarket/${encodeURIComponent(id.trim())}`);
}

export function sendInterest(id: string, input: InterestInput): Promise<InterestPayload> {
  return postJson<InterestPayload>(
    `/api/mobile/premarket/${encodeURIComponent(id.trim())}/interets`,
    input,
  );
}
