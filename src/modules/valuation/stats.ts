/** Pure statistics helpers for the comparables estimator. No I/O, no formatting. */

export type WeightedValue = { value: number; weight: number };

function sortedCopy(values: number[]): number[] {
  return [...values].sort((a, b) => a - b);
}

/** Median of a numeric sample; `null` for an empty sample. Even sizes average the two middles. */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = sortedCopy(values);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle];
  if (upper === undefined) return null;
  if (sorted.length % 2 === 1) return upper;
  const lower = sorted[middle - 1];
  return lower === undefined ? upper : (lower + upper) / 2;
}

/**
 * Weighted median: sort by value, walk the cumulative weight, return the first value whose
 * cumulative weight reaches half of the total. On an exact half split with a following value,
 * average the two (the same convention as the arithmetic median).
 */
export function weightedMedian(items: WeightedValue[]): number | null {
  const valid = items.filter(
    (item) => Number.isFinite(item.value) && Number.isFinite(item.weight) && item.weight > 0,
  );
  if (valid.length === 0) return null;
  const sorted = [...valid].sort((a, b) => a.value - b.value);
  const total = sorted.reduce((sum, item) => sum + item.weight, 0);
  const half = total / 2;
  let cumulative = 0;
  for (let index = 0; index < sorted.length; index += 1) {
    const current = sorted[index];
    if (!current) continue;
    cumulative += current.weight;
    if (cumulative > half) return current.value;
    if (cumulative === half) {
      const next = sorted[index + 1];
      return next ? (current.value + next.value) / 2 : current.value;
    }
  }
  const last = sorted[sorted.length - 1];
  return last ? last.value : null;
}

/**
 * Linear-interpolated percentile on a 0–1 scale (`0.25`, `0.75`). Identical to
 * `numpy.percentile(values, q)` with the default linear method, so the P25–P75 range is
 * reproducible outside this codebase.
 */
export function percentile(values: number[], ratio: number): number | null {
  if (values.length === 0) return null;
  const sorted = sortedCopy(values);
  const clamped = Math.min(1, Math.max(0, ratio));
  const rank = (sorted.length - 1) * clamped;
  const lowerIndex = Math.floor(rank);
  const upperIndex = Math.ceil(rank);
  const lower = sorted[lowerIndex];
  const upper = sorted[upperIndex];
  if (lower === undefined || upper === undefined) return null;
  if (lowerIndex === upperIndex) return lower;
  return lower + (upper - lower) * (rank - lowerIndex);
}

/** Population coefficient of variation (σ/μ). `null` for fewer than 2 values or a zero mean. */
export function coefficientOfVariation(values: number[]): number | null {
  if (values.length < 2) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (mean === 0) return null;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}
