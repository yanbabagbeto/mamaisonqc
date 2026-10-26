import { findComparablesWithTier } from "./comparables";
import { coefficientOfVariation, median, percentile, weightedMedian } from "./stats";
import type { Confidence, Comparable, PropertyRecord, ValuationResult } from "./types";

/**
 * MaMaisonQC estimator — transparent, reproducible, and deliberately not a black box.
 *
 * Formula (documented in the UI, not just in code):
 *   1. select comparables (see `comparables.ts`);
 *   2. weighted median of `valueTotalCents`, weight = 1 / relative land-area distance;
 *   3. surface adjustment `(subject.landAreaM2 / medianComparableLandAreaM2) ** 0.25`,
 *      capped at ±15 % — a 4th-root exponent shrinks a raw area gap into a value gap, and the
 *      cap prevents a missing/odd area from moving the estimate more than the data can support.
 *      The adjustment is 1 when either side lacks a usable land area;
 *   4. `low`/`high` = P25/P75 of the comparable roll values, scaled by the same surface
 *      adjustment and widened if needed so the estimate stays inside the range; with fewer
 *      than 3 comparables the range is ±15 % of the estimate (no percentile is meaningful);
 *   5. confidence: `elevee` when >= 8 comparables AND CV < 0.25, `moyenne` when >= 4,
 *      `faible` otherwise (fewer than 4, or too dispersed to claim a tight range).
 *
 * Data-safety guards: a fallback comparable tier can still return a set whose values are on
 * another scale (a CUBF class spans a small duplex and a downtown complex). Two guards suppress
 * the estimate (`estimateAvailable: false`):
 *   - `dispersion`: P75/P25 > 4 or CV > 0.75 — the set is not one market;
 *   - `implausible`: for a fallback tier (not the strict UMV + CUBF + area tier), an estimate
 *     outside ±60 % of the official roll value is not defensible against the official figure.
 * The UI shows its "données insuffisantes" state; the returned cents for a suppressed estimate
 * are the roll value ±15 %, which is never rendered.
 *
 * The estimate is derived from official roll values — it is not an official assessment.
 *
 * `comparablesTier` is returned so the UI can disclose when the strict UMV + CUBF + area band
 * did not have enough units and a fallback was used (PRD AC-2, as amended).
 */
export const MIN_COMPARABLES_FOR_ESTIMATE = 3;
/** P75/P25 above this ratio means the set is not one market: no estimate. */
export const MAX_DISPERSION_RATIO = 4;
/** Population coefficient of variation above this is equally disqualifying. */
export const MAX_DISPERSION_CV = 0.75;
/** A fallback-tier estimate may not diverge more than 60 % from the official roll value. */
export const MAX_ROLL_DEVIATION = 0.6;
const SURFACE_EXPONENT = 0.25;
const SURFACE_CAP = 0.15;
const FALLBACK_RANGE = 0.15;
export const METHOD = "comparables-umv" as const;

function surfaceAdjustment(subject: PropertyRecord, comparables: Comparable[]): number {
  const subjectArea = subject.landAreaM2;
  if (subjectArea === null || !Number.isFinite(subjectArea) || subjectArea <= 0) return 1;
  const comparableAreas = comparables
    .map((comparable) => comparable.landAreaM2)
    .filter((area): area is number => area !== null && Number.isFinite(area) && area > 0);
  const medianArea = median(comparableAreas);
  if (medianArea === null || medianArea <= 0) return 1;
  const raw = (subjectArea / medianArea) ** SURFACE_EXPONENT;
  return Math.min(1 + SURFACE_CAP, Math.max(1 - SURFACE_CAP, raw));
}

/** True when the comparable values are too dispersed for a median to mean anything. */
export function isDispersionExtreme(values: number[]): boolean {
  if (values.length < MIN_COMPARABLES_FOR_ESTIMATE) return false;
  const p25 = percentile(values, 0.25);
  const p75 = percentile(values, 0.75);
  if (p25 !== null && p75 !== null && p25 > 0 && p75 / p25 > MAX_DISPERSION_RATIO) return true;
  const coefficient = coefficientOfVariation(values);
  return coefficient !== null && coefficient > MAX_DISPERSION_CV;
}

export function confidenceFor(
  comparablesCount: number,
  coefficient: number | null,
): Confidence {
  if (comparablesCount >= 8 && coefficient !== null && coefficient < 0.25) return "elevee";
  if (comparablesCount >= 4) return "moyenne";
  return "faible";
}

function fallbackRange(estimateCents: number): { lowCents: number; highCents: number } {
  return {
    lowCents: Math.max(0, Math.round(estimateCents * (1 - FALLBACK_RANGE))),
    highCents: Math.max(0, Math.round(estimateCents * (1 + FALLBACK_RANGE))),
  };
}

/** Hidden-estimate result: roll value ±15 % as inert numbers, plus the reason the UI must show. */
function suppressedResult(
  subject: PropertyRecord,
  comparables: Comparable[],
  comparablesTier: ValuationResult["comparablesTier"],
  reason: NonNullable<ValuationResult["insufficientReason"]>,
): ValuationResult {
  const estimateCents = Math.max(0, Math.round(subject.valueTotalCents));
  return {
    estimateCents,
    ...fallbackRange(estimateCents),
    confidence: "faible",
    comparables,
    comparablesCount: comparables.length,
    comparablesTier,
    estimateAvailable: false,
    insufficientReason: reason,
    method: METHOD,
  };
}

export function estimateProperty(
  subject: PropertyRecord,
  pool: PropertyRecord[],
): ValuationResult {
  const selection = findComparablesWithTier(subject, pool);
  const { comparables } = selection;
  const comparablesCount = comparables.length;

  if (comparablesCount === 0) {
    return suppressedResult(subject, comparables, selection.tier, "no-comparables");
  }

  const values = comparables.map((comparable) => comparable.valueTotalCents);
  if (isDispersionExtreme(values)) {
    return suppressedResult(subject, comparables, selection.tier, "dispersion");
  }

  const adjustment = surfaceAdjustment(subject, comparables);
  const weightedMedianCents =
    weightedMedian(
      comparables.map((comparable) => ({
        value: comparable.valueTotalCents,
        weight: comparable.weight,
      })),
    ) ??
    median(values) ??
    subject.valueTotalCents;
  const estimateCents = Math.max(0, Math.round(weightedMedianCents * adjustment));

  let lowCents: number;
  let highCents: number;
  if (comparablesCount >= MIN_COMPARABLES_FOR_ESTIMATE) {
    const p25 = percentile(values, 0.25);
    const p75 = percentile(values, 0.75);
    if (p25 !== null && p75 !== null) {
      lowCents = Math.min(Math.round(p25 * adjustment), estimateCents);
      highCents = Math.max(Math.round(p75 * adjustment), estimateCents);
    } else {
      const range = fallbackRange(estimateCents);
      lowCents = range.lowCents;
      highCents = range.highCents;
    }
  } else {
    const range = fallbackRange(estimateCents);
    lowCents = range.lowCents;
    highCents = range.highCents;
  }
  lowCents = Math.max(0, lowCents);

  const rollCents = subject.valueTotalCents;
  const fallbackTier = selection.tier !== "umv-cubf-area";
  if (
    fallbackTier &&
    rollCents > 0 &&
    (estimateCents > rollCents * (1 + MAX_ROLL_DEVIATION) ||
      estimateCents < rollCents * (1 - MAX_ROLL_DEVIATION))
  ) {
    return suppressedResult(subject, comparables, selection.tier, "implausible");
  }

  return {
    estimateCents,
    lowCents,
    highCents,
    confidence: confidenceFor(comparablesCount, coefficientOfVariation(values)),
    comparables,
    comparablesCount,
    comparablesTier: selection.tier,
    estimateAvailable: comparablesCount >= MIN_COMPARABLES_FOR_ESTIMATE,
    insufficientReason:
      comparablesCount >= MIN_COMPARABLES_FOR_ESTIMATE ? null : "too-few",
    method: METHOD,
  };
}
