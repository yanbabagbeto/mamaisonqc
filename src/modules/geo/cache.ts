import { stripAccents } from "@/shared/slug";

import type { AddressCandidate } from "./types";

/**
 * Process-local geocoder cache. Rationale (docs/ARCHITECTURE.md §5): the MERN geocoder is the
 * only outbound dependency; a 24 h cache keeps the product usable when it is slow or down.
 *
 * - fresh entries (24 h) are served without any network call;
 * - stale entries (up to 7 days) are served only when the geocoder fails, so a degraded
 *   search still returns a real address instead of an empty page;
 * - the store is bounded (500 keys, insertion-order eviction) because the process is shared
 *   by every visitor and must not grow without limit.
 *
 * A multi-instance deployment needs a shared cache; this is the documented rung-1 tradeoff.
 */
const FRESH_TTL_MS = 24 * 60 * 60 * 1000;
const STALE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 500;

type CacheEntry = {
  candidates: AddressCandidate[];
  freshUntil: number;
  staleUntil: number;
};

const store = new Map<string, CacheEntry>();

/** Same normalization intent as address matching: accents, case and whitespace must not split keys. */
export function geocoderCacheKey(query: string): string {
  return stripAccents(query).toLowerCase().replace(/\s+/g, " ").trim();
}

function touch(key: string, entry: CacheEntry): CacheEntry {
  // Re-insert to keep Map iteration order = least-recently-written first.
  store.delete(key);
  store.set(key, entry);
  return entry;
}

/** Returns a candidate list younger than 24 h, or `null`. */
export function readFreshCache(key: string): AddressCandidate[] | null {
  const entry = store.get(key);
  if (!entry) return null;
  const now = Date.now();
  if (entry.freshUntil <= now) return null;
  touch(key, entry);
  return entry.candidates;
}

/** Returns a candidate list younger than 7 days, or `null`. Used only when the geocoder fails. */
export function readStaleCache(key: string): AddressCandidate[] | null {
  const entry = store.get(key);
  if (!entry) return null;
  const now = Date.now();
  if (entry.staleUntil <= now) {
    store.delete(key);
    return null;
  }
  touch(key, entry);
  return entry.candidates;
}

export function writeCache(key: string, candidates: AddressCandidate[]): void {
  const now = Date.now();
  store.delete(key);
  while (store.size >= MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey === undefined) break;
    store.delete(oldestKey);
  }
  store.set(key, {
    candidates,
    freshUntil: now + FRESH_TTL_MS,
    staleUntil: now + STALE_TTL_MS,
  });
}

/** Test hook: the cache is process-wide, so tests need a deterministic reset. */
export function clearGeocoderCache(): void {
  store.clear();
}

/** Test hook: bounded-cache assertions. */
export function geocoderCacheSize(): number {
  return store.size;
}
