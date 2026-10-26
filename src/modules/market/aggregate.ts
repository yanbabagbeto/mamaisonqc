/**
 * Pure aggregation helpers for the market module.
 *
 * No database, no React, no formatting: every function here is deterministic and unit-tested in
 * `aggregate.test.ts`. Money is integer cents, exactly as stored by the schema.
 *
 * Method notes (documented because they appear in the UI copy):
 * - Prices are never averaged. The only price summary we publish is the *median band*: the price
 *   band where the cumulative count of sales crosses 50 %. That is a fact about the source's own
 *   bands, not an invented average price.
 * - Medians and quantiles below are computed on the exact values returned by SQLite, with linear
 *   interpolation between the two middle values when the count is even (R-7 definition).
 * - Roll-value bands are built from the real assessed values of the ingested units: edges are
 *   quantiles rounded up to the next 10 000 $ so that the displayed bounds are exact dollars. The
 *   UI states that the bands are built from the roll, and shows every edge.
 */

export const MARKET_KINDS = ["ventes", "hypotheques", "difficultes"] as const;
export type MarketKind = (typeof MARKET_KINDS)[number];

export const PROPERTY_TYPE_ORDER = [
  "unifamiliale",
  "copropriete",
  "plex",
  "terrain",
  "non-residentiel",
  "autre",
] as const;
export type PropertyType = (typeof PROPERTY_TYPE_ORDER)[number];

export type MarketSeriesPoint = {
  period: string;
  ventes: number | null;
  hypotheques: number | null;
  difficultes: number | null;
};

export type PriceBandBucket = {
  /** Label kept verbatim from the source (Registre foncier). */
  label: string;
  /** Parsed lower bound in cents, null when the band is open on the low side ("moins de…"). */
  minCents: number | null;
  /** Parsed upper bound in cents, null when the band is open on the high side ("… et plus"). */
  maxCents: number | null;
  count: number;
};

export type ValueBand = {
  minCents: number;
  /** Null for the last (open-ended) band. */
  maxCents: number | null;
  count: number;
};

export type KindCountRow = { period: string; kind: string; count: number };
export type UnitFact = { propertyType: string; valueTotalCents: number; landAreaM2: number | null };

export type RollTypeSummary = {
  propertyType: string;
  count: number;
  medianValueCents: number | null;
  medianLandAreaM2: number | null;
};

const NUMBER_TOKEN = /\d[\d\s\u00a0\u202f,.]*/g;
const OPENED_LOW = /moins|inferieur|inférieur|jusqu|<|au plus/;
const OPENED_HIGH = /plus|superieur|supérieur|>|\+/;

/**
 * Parses the source's own price-band label into cents bounds.
 * Returns null when the shape is unknown: the caller keeps the label and its count, it never
 * guesses a range. Handles `300000-349999`, `300 000 $ à 349 999 $`, `moins de 200 000 $`,
 * `1 000 000 $ et plus`.
 */
export function parsePriceBandLabel(
  label: string,
): { minCents: number | null; maxCents: number | null } | null {
  const normalized = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u00a0\u202f]/g, " ");

  const numbers: number[] = [];
  for (const match of normalized.matchAll(NUMBER_TOKEN)) {
    const digits = match[0].replace(/[^\d]/g, "");
    if (!digits) continue;
    const parsed = Number.parseInt(digits, 10);
    if (Number.isFinite(parsed)) numbers.push(parsed * 100);
  }

  const first = numbers[0];
  if (first === undefined) return null;

  const openedLow = OPENED_LOW.test(normalized);
  const openedHigh = OPENED_HIGH.test(normalized);
  if (openedLow && openedHigh) return null;
  if (openedLow) return { minCents: null, maxCents: first };
  if (openedHigh) return { minCents: first, maxCents: null };

  const second = numbers[1];
  if (second !== undefined) return { minCents: first, maxCents: second };
  return null;
}

/**
 * Sort groups: open-low bands first, closed bands next, open-high bands, then labels the parser
 * could not read (kept last so they never land in the middle of the price order).
 */
function bandRank(band: PriceBandBucket): number {
  if (band.minCents === null) return band.maxCents === null ? 3 : 0;
  return band.maxCents === null ? 2 : 1;
}

function compareBands(a: PriceBandBucket, b: PriceBandBucket): number {
  const rank = bandRank(a) - bandRank(b);
  if (rank !== 0) return rank;
  if (a.minCents !== b.minCents) {
    return (a.minCents ?? 0) - (b.minCents ?? 0);
  }
  if (a.maxCents !== b.maxCents) {
    return (a.maxCents ?? 0) - (b.maxCents ?? 0);
  }
  return a.label.localeCompare(b.label, "fr-CA");
}

/**
 * Sums counts per band label and sorts bands from the lowest to the highest price.
 * Labels this parser cannot read keep their count and are sorted last: no data is dropped.
 */
export function aggregatePriceBands(
  rows: ReadonlyArray<{ priceBand: string | null; count: number }>,
): PriceBandBucket[] {
  const byLabel = new Map<string, PriceBandBucket>();
  for (const row of rows) {
    const label = row.priceBand?.trim();
    if (!label) continue;
    const count = Number.isFinite(row.count) && row.count > 0 ? row.count : 0;
    const existing = byLabel.get(label);
    if (existing) {
      existing.count += count;
      continue;
    }
    const parsed = parsePriceBandLabel(label);
    byLabel.set(label, {
      label,
      minCents: parsed?.minCents ?? null,
      maxCents: parsed?.maxCents ?? null,
      count,
    });
  }
  return [...byLabel.values()].sort(compareBands);
}

/** The band where the cumulative count of sales crosses 50 %; null when there is no sale. */
export function medianBand(bands: ReadonlyArray<PriceBandBucket>): PriceBandBucket | null {
  const total = bands.reduce((sum, band) => sum + band.count, 0);
  if (total <= 0) return null;
  const target = total / 2;
  let cumulative = 0;
  for (const band of bands) {
    cumulative += band.count;
    if (cumulative >= target) return band;
  }
  return bands[bands.length - 1] ?? null;
}

/** Median of the exact values, linear interpolation for even counts. Null for empty input. */
export function median(values: ReadonlyArray<number>): number | null {
  const clean = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (clean.length === 0) return null;
  const middle = Math.floor(clean.length / 2);
  if (clean.length % 2 === 1) return clean[middle] ?? null;
  const low = clean[middle - 1] ?? 0;
  const high = clean[middle] ?? low;
  return (low + high) / 2;
}

/** Linear-interpolated quantile (p in [0, 1]); null for empty input. */
export function quantile(values: ReadonlyArray<number>, p: number): number | null {
  const clean = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (clean.length === 0) return null;
  const position = (clean.length - 1) * Math.min(Math.max(p, 0), 1);
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const low = clean[lower] ?? clean[0] ?? 0;
  if (lower === upper) return low;
  const high = clean[upper] ?? low;
  return low * (upper - position) + high * (position - lower);
}

const BAND_STEP_CENTS = 10_000 * 100;

/**
 * Builds the assessed-value distribution of the ingested roll units.
 * Edges are quantiles of the real values, rounded up to the next 10 000 $, so every displayed
 * bound is an exact dollar amount. The last band is open-ended ("… et plus").
 */
export function buildValueBands(values: ReadonlyArray<number>, buckets = 5): ValueBand[] {
  const clean = values
    .filter((value) => Number.isFinite(value) && value >= 0)
    .sort((a, b) => a - b);
  if (clean.length === 0) return [];

  const bucketCount = Math.max(1, Math.floor(buckets));
  const min = clean[0] ?? 0;
  const max = clean[clean.length - 1] ?? 0;
  const edges: number[] = [Math.floor(min / BAND_STEP_CENTS) * BAND_STEP_CENTS];

  for (let index = 1; index < bucketCount; index += 1) {
    const raw = quantile(clean, index / bucketCount);
    if (raw === null) continue;
    // Guard against floating-point dust (e.g. 31 000 000.000000004) before rounding up.
    const rounded = Math.ceil(Math.round(raw) / BAND_STEP_CENTS) * BAND_STEP_CENTS;
    const previous = edges[edges.length - 1] ?? 0;
    if (rounded > previous) edges.push(rounded);
  }

  if (edges.length === 1) {
    return [{ minCents: edges[0] ?? min, maxCents: null, count: clean.length }];
  }

  const bands: ValueBand[] = [];
  for (let index = 0; index < edges.length; index += 1) {
    const minCents = edges[index] ?? 0;
    const next = edges[index + 1];
    const maxCents = next === undefined ? null : next - 100;
    let count = 0;
    for (const value of clean) {
      if (value >= minCents && (maxCents === null || value <= maxCents)) count += 1;
    }
    if (count > 0) bands.push({ minCents, maxCents, count });
  }
  if (bands.length === 0) return [{ minCents: min, maxCents: max, count: clean.length }];
  return bands;
}

/** Distinct periods sorted ascending, keeping only the `count` most recent ones. */
export function takeLatestPeriods(periods: ReadonlyArray<string>, count = 12): string[] {
  if (count <= 0) return [];
  const unique = [...new Set(periods.map((period) => period.trim()).filter(Boolean))].sort();
  return unique.slice(-count);
}

/** Sums per period. A period with no row stays null: a missing month is not a zero. */
export function sumCountsByPeriod(
  rows: ReadonlyArray<{ period: string; count: number }>,
  periods: ReadonlyArray<string>,
): Array<number | null> {
  const sums = new Map<string, number>();
  for (const row of rows) {
    sums.set(row.period, (sums.get(row.period) ?? 0) + row.count);
  }
  return periods.map((period) => sums.get(period) ?? null);
}

/** Builds the aligned series (ventes / hypothèques / difficultés) over the given window. */
export function buildSeries(
  rows: ReadonlyArray<KindCountRow>,
  periods: ReadonlyArray<string>,
): MarketSeriesPoint[] {
  const ventes = new Map<string, number>();
  const hypotheques = new Map<string, number>();
  const difficultes = new Map<string, number>();

  for (const row of rows) {
    const bucket =
      row.kind === "ventes" ? ventes : row.kind === "hypotheques" ? hypotheques : row.kind === "difficultes" ? difficultes : null;
    if (!bucket) continue;
    bucket.set(row.period, (bucket.get(row.period) ?? 0) + row.count);
  }

  return periods.map((period) => ({
    period,
    ventes: ventes.get(period) ?? null,
    hypotheques: hypotheques.get(period) ?? null,
    difficultes: difficultes.get(period) ?? null,
  }));
}

/** Total of one kind over the window; null when the source published nothing for that kind. */
export function sumSeries(
  series: ReadonlyArray<MarketSeriesPoint>,
  kind: MarketKind,
): number | null {
  let total = 0;
  let seen = false;
  for (const point of series) {
    const value = point[kind];
    if (value !== null) {
      total += value;
      seen = true;
    }
  }
  return seen ? total : null;
}

export function seriesTotals(series: ReadonlyArray<MarketSeriesPoint>): {
  ventes: number | null;
  hypotheques: number | null;
  difficultes: number | null;
} {
  return {
    ventes: sumSeries(series, "ventes"),
    hypotheques: sumSeries(series, "hypotheques"),
    difficultes: sumSeries(series, "difficultes"),
  };
}

/**
 * Region-level stats may be published twice (a region total and one row per municipality).
 * Region aggregates use the rows without `municipality_code` when they exist; otherwise the
 * municipal rows are summed. This prevents double counting either way.
 */
export function preferRegionTotals<T extends { municipalityCode: string | null }>(
  rows: ReadonlyArray<T>,
): T[] {
  const regionTotals = rows.filter((row) => row.municipalityCode === null);
  return regionTotals.length > 0 ? regionTotals : [...rows];
}

/** Per-property-type inventory: count, median assessed value, median land area. */
export function summarizeUnitsByType(units: ReadonlyArray<UnitFact>): RollTypeSummary[] {
  const byType = new Map<string, UnitFact[]>();
  for (const unit of units) {
    const type = unit.propertyType || "autre";
    const list = byType.get(type) ?? [];
    list.push(unit);
    byType.set(type, list);
  }

  const summaries: RollTypeSummary[] = [];
  for (const [propertyType, list] of byType) {
    const areas = list
      .map((unit) => unit.landAreaM2)
      .filter((area): area is number => area !== null && Number.isFinite(area));
    summaries.push({
      propertyType,
      count: list.length,
      medianValueCents: median(list.map((unit) => unit.valueTotalCents)),
      medianLandAreaM2: median(areas),
    });
  }

  const rank = (type: string): number => {
    const index = PROPERTY_TYPE_ORDER.indexOf(type as PropertyType);
    return index === -1 ? PROPERTY_TYPE_ORDER.length : index;
  };

  return summaries.sort(
    (a, b) => rank(a.propertyType) - rank(b.propertyType) || a.propertyType.localeCompare(b.propertyType, "fr-CA"),
  );
}
