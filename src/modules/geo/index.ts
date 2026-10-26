export { searchAddresses } from "./search";
export {
  addressQuerySchema,
  MAX_ADDRESS_QUERY_LENGTH,
  MIN_ADDRESS_QUERY_LENGTH,
  type AddressQuery,
} from "./schema";
export { GEOCODER_PROVENANCE } from "./provenance";
export {
  clearGeocoderCache,
  geocoderCacheKey,
  geocoderCacheSize,
} from "./cache";
export { parseMernCandidate, UPSTREAM_MESSAGE } from "./client";
export { clearMunicipalityCache, resolveMatricule } from "./resolve";
export type { AddressCandidate } from "./types";
