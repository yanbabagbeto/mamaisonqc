import type { Comparable, ComparableTier, PropertyRecord } from "./types";

export type { ComparableTier } from "./types";

/**
 * Comparable selection — the core of the product's trust claim, so the rules are explicit:
 *
 * 1. same municipality, same assessor neighbourhood unit (`umv`) AND same CUBF use code,
 *    with the land area within ±25 % of the subject when both sides have one;
 * 2. fallback 1: same municipality + same `umv`, area ignored (the UMV is the assessor's own
 *    market segmentation, so it stays the strongest signal);
 * 3. fallback 2: same municipality + same CUBF, area ignored (same property class, wider area).
 *
 * The subject is always excluded, zero/negative roll values are never comparables, and the
 * first non-empty tier wins — we never mix a strong comparable with a weak one to pad the count.
 * At most 12 comparables, ordered by roll value descending then id ascending: the same input
 * always produces the same table (PRD AC-2, AC-3).
 */

const AREA_TOLERANCE = 0.25;
/** Tier 3 compares across UMV, so it uses a widened but real land-area band (±60 %). */
const WIDENED_AREA_TOLERANCE = 0.6;
export const MAX_COMPARABLES = 12;

function sameMunicipality(subject: PropertyRecord, candidate: PropertyRecord): boolean {
  return candidate.municipalityCode === subject.municipalityCode;
}

function sameNeighbourhood(subject: PropertyRecord, candidate: PropertyRecord): boolean {
  return (
    sameMunicipality(subject, candidate) &&
    subject.umv !== null &&
    candidate.umv !== null &&
    candidate.umv === subject.umv
  );
}

function sameUse(subject: PropertyRecord, candidate: PropertyRecord): boolean {
  return (
    sameMunicipality(subject, candidate) &&
    subject.cubf !== null &&
    candidate.cubf !== null &&
    candidate.cubf === subject.cubf
  );
}

function hasArea(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value > 0;
}

function areaWithinBand(
  subject: PropertyRecord,
  candidate: PropertyRecord,
  tolerance: number,
): boolean {
  // "when both present": a missing area cannot disqualify a comparable, it just cannot weight it.
  if (!hasArea(subject.landAreaM2) || !hasArea(candidate.landAreaM2)) return true;
  const ratio = candidate.landAreaM2 / subject.landAreaM2;
  return ratio >= 1 - tolerance && ratio <= 1 + tolerance;
}

function areaWithinTolerance(subject: PropertyRecord, candidate: PropertyRecord): boolean {
  return areaWithinBand(subject, candidate, AREA_TOLERANCE);
}

function areaWithinWidenedTolerance(
  subject: PropertyRecord,
  candidate: PropertyRecord,
): boolean {
  return areaWithinBand(subject, candidate, WIDENED_AREA_TOLERANCE);
}

function areaDistanceRatio(
  subject: PropertyRecord,
  candidate: PropertyRecord,
): number | null {
  if (!hasArea(subject.landAreaM2) || !hasArea(candidate.landAreaM2)) return null;
  return Math.abs(candidate.landAreaM2 / subject.landAreaM2 - 1);
}

/** Weight = 1 / relative area distance; 1 when no area distance exists or the areas are identical. */
function weightFor(distance: number | null): number {
  if (distance === null) return 1;
  if (distance <= 0) return 1;
  return 1 / distance;
}

export type ComparableSelection = {
  tier: ComparableTier | null;
  comparables: Comparable[];
};

export function findComparablesWithTier(
  subject: PropertyRecord,
  pool: PropertyRecord[],
): ComparableSelection {
  // Deduplicate by id first: a pool built from two queries must not double-count a unit.
  const unique = new Map<string, PropertyRecord>();
  for (const record of pool) {
    if (record.id === subject.id) continue;
    if (!(record.valueTotalCents > 0)) continue;
    if (!unique.has(record.id)) unique.set(record.id, record);
  }
  const eligible = [...unique.values()];

  const tier1 = eligible.filter(
    (candidate) =>
      sameNeighbourhood(subject, candidate) &&
      sameUse(subject, candidate) &&
      areaWithinTolerance(subject, candidate),
  );
  const tier2 = eligible.filter((candidate) => sameNeighbourhood(subject, candidate));
  const tier3 = eligible.filter(
    (candidate) =>
      sameUse(subject, candidate) && areaWithinWidenedTolerance(subject, candidate),
  );

  let tier: ComparableTier | null = null;
  let chosen: PropertyRecord[] = [];
  if (tier1.length > 0) {
    tier = "umv-cubf-area";
    chosen = tier1;
  } else if (tier2.length > 0) {
    tier = "umv";
    chosen = tier2;
  } else if (tier3.length > 0) {
    tier = "municipality-cubf";
    chosen = tier3;
  }

  const comparables = chosen
    .map<Comparable>((candidate) => {
      const distance = areaDistanceRatio(subject, candidate);
      return {
        ...candidate,
        areaDistanceRatio: distance,
        weight: weightFor(distance),
      };
    })
    .sort((a, b) => b.valueTotalCents - a.valueTotalCents || a.id.localeCompare(b.id))
    .slice(0, MAX_COMPARABLES);

  return { tier, comparables };
}

export function findComparables(subject: PropertyRecord, pool: PropertyRecord[]): Comparable[] {
  return findComparablesWithTier(subject, pool).comparables;
}

export { AREA_TOLERANCE, WIDENED_AREA_TOLERANCE };
