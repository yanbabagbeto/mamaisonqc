/**
 * Structural input of the valuation engine. Deliberately independent from Drizzle so the
 * module stays pure and unit-testable: the data adapter (`data.ts`) passes rows that satisfy it.
 */
export type PropertyRecord = {
  id: string;
  matricule: string;
  municipalityCode: string;
  umv: string | null;
  cubf: string | null;
  propertyType: string;
  addrNo: string | null;
  addrStreet: string | null;
  addrSuite: string | null;
  landAreaM2: number | null;
  yearBuilt: number | null;
  valueTotalCents: number;
  marketRefDate: string | null;
  rollYear: number;
  datasetId: string;
};

/** One retained comparable, with the two derived numbers the estimate uses (never rendered raw). */
export type Comparable = PropertyRecord & {
  /** |candidate.landAreaM2 / subject.landAreaM2 − 1|; `null` when one side has no area. */
  areaDistanceRatio: number | null;
  /** `1 / areaDistanceRatio` when a distance exists, otherwise 1. */
  weight: number;
};

export type Confidence = "faible" | "moyenne" | "elevee";

/** Which comparable rule won. Tier 1 is the strict UMV + CUBF + area band; any other tier is disclosed in the UI. */
export type ComparableTier = "umv-cubf-area" | "umv" | "municipality-cubf";

export type ValuationResult = {
  estimateCents: number;
  lowCents: number;
  highCents: number;
  confidence: Confidence;
  comparables: Comparable[];
  comparablesCount: number;
  /** Winning comparable tier (`null` when no comparable was found) — drives the AC-2 disclosure line. */
  comparablesTier: ComparableTier | null;
  /** False means the page must render the "données insuffisantes" state instead of an estimate. */
  estimateAvailable: boolean;
  /** Why the estimate is hidden; `null` when it is available. */
  insufficientReason: "no-comparables" | "too-few" | "dispersion" | "implausible" | null;
  method: "comparables-umv";
};
