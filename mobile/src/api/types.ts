/**
 * Wire types for the mobile endpoints (`src/app/api/mobile/**`) and the shared address search.
 *
 * These mirror the *server* DTOs field for field. The route handlers shape domain rows into these
 * exact objects, so a rename on either side is a compile error rather than a blank screen.
 * Money is integer cents; confidence is a code, localized by the app (`src/i18n`).
 */

export type Confidence = "faible" | "moyenne" | "elevee";

/** Mirrors src/shared/provenance.ts. */
export type ProvenanceInfo = {
  datasetId: string;
  name: string;
  publisher: string;
  license: string;
  licenseUrl?: string | null;
  sourceUrl: string;
  referenceDate?: string | null;
  fetchedAt?: string | null;
};

/* ------------------------------------------------------------------------------------------------
 * GET /api/address/search?q=   (web endpoint owned by the valuation module)
 * ---------------------------------------------------------------------------------------------- */

/** Mirrors src/modules/geo/types.ts AddressCandidate. */
export type AddressCandidate = {
  label: string;
  civic: string;
  street: string;
  city: string;
  postal: string;
  lat: number | null;
  lon: number | null;
  /** Assessment roll number when the address resolves to an ingested unit, else null. */
  matricule: string | null;
};

export type AddressSearchPayload = { candidates: AddressCandidate[] };

/* ------------------------------------------------------------------------------------------------
 * GET /api/mobile/evaluation/[matricule]
 * ---------------------------------------------------------------------------------------------- */

export type MobilePropertyUnit = {
  matricule: string;
  /** Civic + odonym + suite, as stored in the roll. Never invented. */
  address: string;
  municipality: string | null;
  propertyType: string;
  landAreaM2: number | null;
  yearBuilt: number | null;
  valueTotalCents: number;
  valueLandCents: number;
  valueBuildingCents: number;
  valuePriorCents: number | null;
  marketRefDate: string | null;
  rollYear: number;
  umv: string | null;
  cubf: string | null;
};

export type MobileEstimate = {
  estimateCents: number;
  lowCents: number;
  highCents: number;
  confidence: Confidence;
  comparablesCount: number;
  /**
   * false when the engine had fewer than 3 comparables: the app must then show the roll value and
   * the "données insuffisantes" notice instead of an estimate (PRD).
   */
  estimateAvailable: boolean;
  method: string;
};

export type MobileComparable = {
  matricule: string;
  address: string;
  propertyType: string;
  landAreaM2: number | null;
  yearBuilt: number | null;
  valueTotalCents: number;
};

export type EvaluationPayload = {
  unit: MobilePropertyUnit;
  estimate: MobileEstimate;
  comparables: MobileComparable[];
  provenance: ProvenanceInfo[];
};

/* ------------------------------------------------------------------------------------------------
 * GET /api/mobile/regions and /api/mobile/regions/[code]
 * ---------------------------------------------------------------------------------------------- */

/** Mirrors src/modules/market/index.ts RegionSummary. */
export type RegionSummary = {
  code: string;
  name: string;
  slug: string;
  population: number | null;
  latestPeriod: string | null;
  salesCount: number | null;
  mortgageCount: number | null;
  difficultyCount: number | null;
  salesMedianBand: PriceBand | null;
  municipalityCount: number;
  coveredMunicipalities: number;
  unitCount: number;
  medianRollValueCents: number | null;
  hasStats: boolean;
  hasRoll: boolean;
};

export type RegionsPayload = { regions: RegionSummary[]; provenance: ProvenanceInfo[] };

export type TerritoryRef = {
  code: string;
  name: string;
  slug: string;
  population: number | null;
};

export type MarketSeriesPoint = {
  period: string;
  ventes: number | null;
  hypotheques: number | null;
  difficultes: number | null;
};

export type PriceBand = {
  label: string;
  minCents: number | null;
  maxCents: number | null;
  count: number;
};

export type MunicipalityRollRow = {
  code: string;
  name: string;
  slug: string;
  unitCount: number;
  medianRollValueCents: number | null;
  medianLandAreaM2: number | null;
  hasStats: boolean;
  covered: boolean;
};

export type RegionCoverage = {
  municipalityCount: number;
  coveredMunicipalities: number;
  municipalitiesWithStats: number;
  unitCount: number;
  medianRollValueCents: number | null;
  medianLandAreaM2: number | null;
  rollYear: number | null;
};

/** Mirrors the subset of src/modules/market/index.ts RegionDetail the app renders. */
export type RegionDetailPayload = {
  region: TerritoryRef;
  window: string[];
  latestPeriod: string | null;
  hasStats: boolean;
  series: MarketSeriesPoint[];
  totals: { ventes: number | null; hypotheques: number | null; difficultes: number | null };
  priceBands: PriceBand[];
  medianPriceBand: PriceBand | null;
  municipalities: MunicipalityRollRow[];
  coverage: RegionCoverage;
  provenance: ProvenanceInfo[];
};

/* ------------------------------------------------------------------------------------------------
 * GET /api/mobile/premarket, /api/mobile/premarket/[id], POST .../interets
 * ---------------------------------------------------------------------------------------------- */

/** Mirrors src/modules/premarket PublicListing. The address is masked (street + city only). */
export type PremarketListing = {
  id: string;
  street: string;
  city: string;
  propertyType: string;
  landAreaM2: number | null;
  askingPriceCents: number;
  horizon: string;
  description: string;
  createdAt: string;
  interestCount: number;
};

export type PremarketListPayload = { listings: PremarketListing[] };

export type PremarketDetailPayload = { listing: PremarketListing };

export type InterestInput = {
  name: string;
  email: string;
  message?: string;
};

/** Mirrors src/modules/premarket interestSchema constraints — the server re-validates. */
export const INTEREST_LIMITS = {
  nameMin: 2,
  nameMax: 80,
  messageMax: 600,
} as const;

export type InterestPayload = { interest: { id: string } };
