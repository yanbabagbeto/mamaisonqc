import { env } from "@/lib/env";

import { geocoderCacheKey, readFreshCache, readStaleCache, writeCache } from "./cache";
import { fetchAddressCandidates } from "./client";
import { resolveMatricule } from "./resolve";
import { MAX_ADDRESS_QUERY_LENGTH, MIN_ADDRESS_QUERY_LENGTH } from "./schema";
import type { AddressCandidate } from "./types";

/**
 * Public entry point of the geo module: cached geocoder search + roll resolution.
 *
 * - `GEOCODER_OFFLINE=1` short-circuits to an empty list (tests, offline demo) without writing
 *   the cache, so switching the flag back on does not serve stale empty results.
 * - Fresh cache is served first (24 h). On upstream failure, a < 7-day entry is served instead
 *   (docs/ARCHITECTURE.md §5); otherwise the error propagates for the route to map to 503.
 */
export async function searchAddresses(query: string): Promise<AddressCandidate[]> {
  const normalizedQuery = query.trim().replace(/\s+/g, " ");
  if (env.geocoderOffline) return [];
  if (
    normalizedQuery.length < MIN_ADDRESS_QUERY_LENGTH ||
    normalizedQuery.length > MAX_ADDRESS_QUERY_LENGTH
  ) {
    return [];
  }

  const key = geocoderCacheKey(normalizedQuery);
  const fresh = readFreshCache(key);
  if (fresh) return fresh;

  try {
    const rawCandidates = await fetchAddressCandidates(normalizedQuery);
    const candidates = await Promise.all(
      rawCandidates.map(async (candidate) => ({
        ...candidate,
        matricule: await resolveMatricule(candidate),
      })),
    );
    writeCache(key, candidates);
    return candidates;
  } catch (error) {
    const stale = readStaleCache(key);
    if (stale) return stale;
    throw error;
  }
}
