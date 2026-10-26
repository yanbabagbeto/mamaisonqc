import type { TerritoryRow } from "./types";

/**
 * Resolves each municipality to its administrative region from the territory rows.
 *
 * Quebec's public geographic code tree is municipality → MRC → region, except for cities that
 * are their own MRC-level territory (e.g. Montréal, Laval), whose parent is the region directly.
 * The function returns `null` when the chain is incomplete: the explorer then excludes the
 * municipality from a region filter instead of guessing a region.
 */
export function buildRegionIndex(rows: TerritoryRow[]): Record<string, string | null> {
  const byCode = new Map<string, TerritoryRow>();
  for (const row of rows) {
    byCode.set(row.codeGeo, row);
  }

  const index: Record<string, string | null> = {};
  for (const row of rows) {
    if (row.level !== "municipalite") continue;
    const parent = row.parentCode ? byCode.get(row.parentCode) : undefined;
    let regionCode: string | null = null;
    if (parent) {
      if (parent.level === "region") {
        regionCode = parent.codeGeo;
      } else if (parent.level === "mrc" && parent.parentCode) {
        const region = byCode.get(parent.parentCode);
        regionCode = region && region.level === "region" ? region.codeGeo : null;
      }
    }
    index[row.codeGeo] = regionCode;
  }
  return index;
}

/** Region code for a municipality, or `null` when the territory tree does not reach a region. */
export function regionCodeForMunicipality(
  index: Record<string, string | null>,
  municipalityCode: string,
): string | null {
  return index[municipalityCode] ?? null;
}
