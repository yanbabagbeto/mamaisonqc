/**
 * Address candidate returned by the Adresses Québec geocoder (MERN), enriched with the
 * assessment-roll matricule when the address resolves to a unit we have ingested.
 *
 * `matricule` is `null` whenever the address exists but is not covered by the ingested
 * roll (no municipality match, no civic match, or several candidates — we never guess).
 */
export type AddressCandidate = {
  /** Human-readable string exactly as the geocoder built it ("1234-705 rue Sainte-Catherine Ouest, Montréal H3B4G5"). */
  label: string;
  /** Primary civic number, no unit suffix ("1234" for "1234-705"). Empty when unknown. */
  civic: string;
  /** Odonym as used by the roll ("Rue Sainte-Catherine Ouest"). Empty when unknown. */
  street: string;
  /** Municipality name ("Montréal"). */
  city: string;
  /** Canadian postal code, no space ("H3B4G5"). Empty when unknown. */
  postal: string;
  lat: number | null;
  lon: number | null;
  matricule: string | null;
};

/** Raw shape of one `findAddressCandidates` entry. Only the fields we read are typed. */
export type MernCandidate = {
  address?: string;
  location?: { x?: number; y?: number };
  attributes?: Record<string, unknown>;
};
