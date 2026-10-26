/**
 * Market read models.
 *
 * Every function here reads SQLite through Drizzle and returns plain serialisable objects; no UI,
 * no formatting (the pages format through `@/shared/format`). The DB is empty until the ingest
 * pipeline has run, so every aggregate is nullable: a missing figure is `null`, never `0`.
 *
 * Windows: the market pages read the `MARKET_WINDOW_PERIODS` most recent periods that exist in
 * `market_stat` (ascending). This is stated in the UI.
 *
 * Medians: computed over the exact values returned by SQLite (`aggregate.median`), with linear
 * interpolation when the count is even. The UI labels them as medians of the ingested rows.
 *
 * Region totals: the Registre foncier may publish a region total and a municipality breakdown. To
 * avoid counting twice, region aggregates use the rows whose `municipality_code` is NULL when they
 * exist, and sum the municipal rows otherwise (`aggregate.preferRegionTotals`).
 */
import { cache } from "react";

import { and, asc, desc, eq, gte, inArray, isNotNull, lte, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { dataset, marketStat, propertyUnit, territory } from "@/db/schema";
import type { ProvenanceInfo } from "@/shared/provenance";

import {
  aggregatePriceBands,
  buildSeries,
  buildValueBands,
  median,
  medianBand,
  preferRegionTotals,
  PROPERTY_TYPE_ORDER,
  seriesTotals,
  summarizeUnitsByType,
  takeLatestPeriods,
  type MarketSeriesPoint,
  type PriceBandBucket,
  type RollTypeSummary,
  type ValueBand,
} from "./aggregate";

export const MARKET_WINDOW_PERIODS = 12;

/** Property types exposed as a filter on the municipality page (PRD F4). */
export const PROPERTY_TYPE_FILTERS = ["unifamiliale", "copropriete", "plex"] as const;
export type PropertyTypeFilter = (typeof PROPERTY_TYPE_FILTERS)[number];

export type TerritoryRef = {
  code: string;
  name: string;
  slug: string;
  population: number | null;
};

export type Coverage = {
  /** Municipality codes with at least one ingested roll unit. */
  codes: string[];
  countsByMunicipality: Record<string, number>;
  totalUnits: number;
};

export type RegionSummary = {
  code: string;
  name: string;
  slug: string;
  population: number | null;
  latestPeriod: string | null;
  salesCount: number | null;
  mortgageCount: number | null;
  difficultyCount: number | null;
  salesMedianBand: PriceBandBucket | null;
  municipalityCount: number;
  coveredMunicipalities: number;
  unitCount: number;
  medianRollValueCents: number | null;
  hasStats: boolean;
  hasRoll: boolean;
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

export type RegionDetail = {
  region: TerritoryRef;
  window: string[];
  latestPeriod: string | null;
  hasStats: boolean;
  series: MarketSeriesPoint[];
  totals: { ventes: number | null; hypotheques: number | null; difficultes: number | null };
  priceBands: PriceBandBucket[];
  medianPriceBand: PriceBandBucket | null;
  municipalities: MunicipalityRollRow[];
  coverage: RegionCoverage;
};

export type RollFilterView = {
  /** null means "all types". */
  propertyType: string | null;
  unitCount: number;
  medianValueCents: number | null;
  medianLandAreaM2: number | null;
  valueBands: ValueBand[];
};

export type MunicipalityDetail = {
  municipality: TerritoryRef;
  region: TerritoryRef | null;
  window: string[];
  latestPeriod: string | null;
  hasStats: boolean;
  series: MarketSeriesPoint[];
  totals: { ventes: number | null; hypotheques: number | null; difficultes: number | null };
  priceBands: PriceBandBucket[];
  medianPriceBand: PriceBandBucket | null;
  /**
   * Parent-region aggregates. The Registre foncier publishes its statistics at the region level
   * only (no `municipality_code`), so the municipality page falls back to these, labelled as
   * regional figures. They are never presented as municipal numbers.
   */
  regionStats: {
    hasStats: boolean;
    regionCode: string | null;
    latestPeriod: string | null;
    series: MarketSeriesPoint[];
    totals: { ventes: number | null; hypotheques: number | null; difficultes: number | null };
    priceBands: PriceBandBucket[];
    medianPriceBand: PriceBandBucket | null;
  };
  roll: {
    unitCount: number;
    rollYear: number | null;
    medianValueCents: number | null;
    medianLandAreaM2: number | null;
    byType: RollTypeSummary[];
    filter: RollFilterView;
  };
};

type TerritoryRow = {
  code: string;
  name: string;
  level: string;
  parentCode: string | null;
  slug: string;
  population: number | null;
};

type StatRow = {
  regionCode: string;
  municipalityCode: string | null;
  period: string;
  kind: string;
  count: number;
};

type BandRow = {
  regionCode: string;
  municipalityCode: string | null;
  priceBand: string | null;
  count: number;
};

type UnitValueRow = { municipalityCode: string; valueTotalCents: number };

type RegionUnitRow = {
  municipalityCode: string;
  propertyType: string;
  valueTotalCents: number;
  landAreaM2: number | null;
  rollYear: number;
};

/* -------------------------------------------------------------------------------------------------
 * Low-level loaders (cached per request: generateMetadata and the page share the same reads)
 * ---------------------------------------------------------------------------------------------- */

const loadTerritories = cache(async (): Promise<TerritoryRow[]> => {
  return db
    .select({
      code: territory.codeGeo,
      name: territory.name,
      level: territory.level,
      parentCode: territory.parentCode,
      slug: territory.slug,
      population: territory.population,
    })
    .from(territory);
});

const loadRecentPeriods = cache(async (limit: number): Promise<string[]> => {
  const rows = await db
    .select({ period: marketStat.period })
    .from(marketStat)
    .groupBy(marketStat.period)
    .orderBy(desc(marketStat.period))
    .limit(Math.max(limit, 1));
  return rows.map((row) => row.period);
});

export const latestPeriod = cache(async (): Promise<string | null> => {
  const [first] = await loadRecentPeriods(1);
  return first ?? null;
});

/** The `count` most recent distinct periods, ascending. Empty when no stat is ingested. */
export const periodWindow = cache(async (count = MARKET_WINDOW_PERIODS): Promise<string[]> => {
  const recent = await loadRecentPeriods(count);
  return takeLatestPeriods(recent, count);
});

const loadStats = cache(async (start: string, end: string): Promise<StatRow[]> => {
  const rows = await db
    .select({
      regionCode: marketStat.regionCode,
      municipalityCode: marketStat.municipalityCode,
      period: marketStat.period,
      kind: marketStat.kind,
      count: sql<number>`sum(${marketStat.count})`,
    })
    .from(marketStat)
    .where(and(gte(marketStat.period, start), lte(marketStat.period, end)))
    .groupBy(
      marketStat.regionCode,
      marketStat.municipalityCode,
      marketStat.period,
      marketStat.kind,
    );
  return rows.map((row) => ({ ...row, count: Number(row.count) || 0 }));
});

const loadBandRows = cache(async (start: string, end: string): Promise<BandRow[]> => {
  const rows = await db
    .select({
      regionCode: marketStat.regionCode,
      municipalityCode: marketStat.municipalityCode,
      priceBand: marketStat.priceBand,
      count: sql<number>`sum(${marketStat.count})`,
    })
    .from(marketStat)
    .where(
      and(
        gte(marketStat.period, start),
        lte(marketStat.period, end),
        eq(marketStat.kind, "ventes"),
        isNotNull(marketStat.priceBand),
      ),
    )
    .groupBy(marketStat.regionCode, marketStat.municipalityCode, marketStat.priceBand);
  return rows.map((row) => ({ ...row, count: Number(row.count) || 0 }));
});

const loadAllUnitValues = cache(async (): Promise<UnitValueRow[]> => {
  return db
    .select({
      municipalityCode: propertyUnit.municipalityCode,
      valueTotalCents: propertyUnit.valueTotalCents,
    })
    .from(propertyUnit);
});

const loadUnitsForMunicipalities = cache(async (codesKey: string): Promise<RegionUnitRow[]> => {
  const codes = codesKey.split(",").filter(Boolean);
  if (codes.length === 0) return [];
  return db
    .select({
      municipalityCode: propertyUnit.municipalityCode,
      propertyType: propertyUnit.propertyType,
      valueTotalCents: propertyUnit.valueTotalCents,
      landAreaM2: propertyUnit.landAreaM2,
      rollYear: propertyUnit.rollYear,
    })
    .from(propertyUnit)
    .where(inArray(propertyUnit.municipalityCode, codes));
});

/** Municipality codes that have at least one ingested roll unit, with their unit counts. */
export const coverage = cache(async (): Promise<Coverage> => {
  const rows = await db
    .select({ code: propertyUnit.municipalityCode, count: sql<number>`count(*)` })
    .from(propertyUnit)
    .groupBy(propertyUnit.municipalityCode);

  const countsByMunicipality: Record<string, number> = {};
  let totalUnits = 0;
  for (const row of rows) {
    const count = Number(row.count) || 0;
    if (count <= 0) continue;
    countsByMunicipality[row.code] = count;
    totalUnits += count;
  }
  return { codes: Object.keys(countsByMunicipality).sort(), countsByMunicipality, totalUnits };
});

/* -------------------------------------------------------------------------------------------------
 * Territory helpers
 * ---------------------------------------------------------------------------------------------- */

function indexTerritories(rows: ReadonlyArray<TerritoryRow>): Map<string, TerritoryRow> {
  const map = new Map<string, TerritoryRow>();
  for (const row of rows) map.set(row.code, row);
  return map;
}

/** Walks `parent_code` upward (municipalité → MRC → région) and returns the region row. */
function regionOf(code: string, byCode: Map<string, TerritoryRow>): TerritoryRow | null {
  let current: TerritoryRow | null = byCode.get(code) ?? null;
  for (let depth = 0; current && depth < 6; depth += 1) {
    if (current.level === "region") return current;
    current = current.parentCode ? byCode.get(current.parentCode) ?? null : null;
  }
  return null;
}

function toRef(row: TerritoryRow): TerritoryRef {
  return { code: row.code, name: row.name, slug: row.slug, population: row.population };
}

function byName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name, "fr-CA");
}

function finiteNumbers(values: ReadonlyArray<number | null>): number[] {
  return values.filter((value): value is number => value !== null && Number.isFinite(value));
}

function latestPeriodOf(rows: ReadonlyArray<{ period: string }>): string | null {
  let latest: string | null = null;
  for (const row of rows) {
    if (latest === null || row.period > latest) latest = row.period;
  }
  return latest;
}

export const resolveRegion = cache(async (param: string): Promise<TerritoryRef | null> => {
  const needle = param.trim();
  if (!needle) return null;
  const rows = await loadTerritories();
  const lower = needle.toLowerCase();
  const match = rows.find(
    (row) => row.level === "region" && (row.slug === lower || row.code === needle),
  );
  return match ? toRef(match) : null;
});

export type ResolvedMunicipality = {
  municipality: TerritoryRef;
  region: TerritoryRef | null;
};

export const resolveMunicipality = cache(
  async (param: string): Promise<ResolvedMunicipality | null> => {
    const needle = param.trim();
    if (!needle) return null;
    const rows = await loadTerritories();
    const lower = needle.toLowerCase();
    const match = rows.find(
      (row) => row.level === "municipalite" && (row.slug === lower || row.code === needle),
    );
    if (!match) return null;
    const byCode = indexTerritories(rows);
    const region = regionOf(match.code, byCode);
    return { municipality: toRef(match), region: region ? toRef(region) : null };
  },
);

/* -------------------------------------------------------------------------------------------------
 * Region list + detail
 * ---------------------------------------------------------------------------------------------- */

export const listRegions = cache(async (): Promise<RegionSummary[]> => {
  const territories = await loadTerritories();
  const regions = territories.filter((row) => row.level === "region");
  if (regions.length === 0) return [];

  const window = await periodWindow();
  const unitCoverage = await coverage();
  const unitValues = await loadAllUnitValues();
  const start = window[0];
  const end = window.at(-1);
  const stats = start && end ? await loadStats(start, end) : [];
  const bandRows = start && end ? await loadBandRows(start, end) : [];

  const byCode = indexTerritories(territories);

  const municipalitiesByRegion = new Map<string, TerritoryRow[]>();
  for (const row of territories) {
    if (row.level !== "municipalite") continue;
    const region = regionOf(row.code, byCode);
    if (!region) continue;
    const list = municipalitiesByRegion.get(region.code) ?? [];
    list.push(row);
    municipalitiesByRegion.set(region.code, list);
  }

  const valuesByRegion = new Map<string, number[]>();
  for (const unit of unitValues) {
    const region = regionOf(unit.municipalityCode, byCode);
    if (!region) continue;
    const list = valuesByRegion.get(region.code) ?? [];
    list.push(unit.valueTotalCents);
    valuesByRegion.set(region.code, list);
  }

  return regions
    .map((region): RegionSummary => {
      const regionRows = stats.filter((row) => row.regionCode === region.code);
      const series = buildSeries(preferRegionTotals(regionRows), window);
      const regionBands = aggregatePriceBands(
        preferRegionTotals(bandRows.filter((row) => row.regionCode === region.code)).map((row) => ({
          priceBand: row.priceBand,
          count: row.count,
        })),
      );
      const municipalities = municipalitiesByRegion.get(region.code) ?? [];
      const covered = municipalities.filter(
        (municipality) => (unitCoverage.countsByMunicipality[municipality.code] ?? 0) > 0,
      );
      const unitCount = covered.reduce(
        (total, municipality) => total + (unitCoverage.countsByMunicipality[municipality.code] ?? 0),
        0,
      );
      const values = valuesByRegion.get(region.code) ?? [];

      return {
        code: region.code,
        name: region.name,
        slug: region.slug,
        population: region.population,
        latestPeriod: latestPeriodOf(regionRows),
        salesCount: seriesTotals(series).ventes,
        mortgageCount: seriesTotals(series).hypotheques,
        difficultyCount: seriesTotals(series).difficultes,
        salesMedianBand: medianBand(regionBands),
        municipalityCount: municipalities.length,
        coveredMunicipalities: covered.length,
        unitCount,
        medianRollValueCents: median(values),
        hasStats: regionRows.length > 0,
        hasRoll: unitCount > 0,
      };
    })
    .sort(byName);
});

export const getRegion = cache(async (param: string): Promise<RegionDetail | null> => {
  const regionRef = await resolveRegion(param);
  if (!regionRef) return null;

  const territories = await loadTerritories();
  const window = await periodWindow();
  const byCode = indexTerritories(territories);
  const municipalities = territories
    .filter(
      (row) => row.level === "municipalite" && regionOf(row.code, byCode)?.code === regionRef.code,
    )
    .sort(byName);

  const start = window[0];
  const end = window.at(-1);
  const stats = start && end ? await loadStats(start, end) : [];
  const bandRows = start && end ? await loadBandRows(start, end) : [];
  const codesKey = municipalities
    .map((row) => row.code)
    .sort()
    .join(",");
  const units = codesKey ? await loadUnitsForMunicipalities(codesKey) : [];

  const regionRows = stats.filter((row) => row.regionCode === regionRef.code);
  const series = buildSeries(preferRegionTotals(regionRows), window);
  const bands = aggregatePriceBands(
    preferRegionTotals(bandRows.filter((row) => row.regionCode === regionRef.code)).map((row) => ({
      priceBand: row.priceBand,
      count: row.count,
    })),
  );

  const unitsByMunicipality = new Map<string, RegionUnitRow[]>();
  for (const unit of units) {
    const list = unitsByMunicipality.get(unit.municipalityCode) ?? [];
    list.push(unit);
    unitsByMunicipality.set(unit.municipalityCode, list);
  }

  const municipalityRows: MunicipalityRollRow[] = municipalities.map((municipality) => {
    const rows = unitsByMunicipality.get(municipality.code) ?? [];
    return {
      code: municipality.code,
      name: municipality.name,
      slug: municipality.slug,
      unitCount: rows.length,
      medianRollValueCents: median(rows.map((row) => row.valueTotalCents)),
      medianLandAreaM2: median(finiteNumbers(rows.map((row) => row.landAreaM2))),
      hasStats: stats.some((row) => row.municipalityCode === municipality.code),
      covered: rows.length > 0,
    };
  });

  const rollYears = units.map((unit) => unit.rollYear).filter((year) => Number.isFinite(year));

  return {
    region: regionRef,
    window,
    latestPeriod: latestPeriodOf(regionRows),
    hasStats: regionRows.length > 0,
    series,
    totals: seriesTotals(series),
    priceBands: bands,
    medianPriceBand: medianBand(bands),
    municipalities: municipalityRows,
    coverage: {
      municipalityCount: municipalityRows.length,
      coveredMunicipalities: municipalityRows.filter((row) => row.covered).length,
      municipalitiesWithStats: municipalityRows.filter((row) => row.hasStats).length,
      unitCount: units.length,
      medianRollValueCents: median(units.map((unit) => unit.valueTotalCents)),
      medianLandAreaM2: median(finiteNumbers(units.map((unit) => unit.landAreaM2))),
      rollYear: rollYears.length > 0 ? Math.max(...rollYears) : null,
    },
  };
});

/* -------------------------------------------------------------------------------------------------
 * Municipality detail
 * ---------------------------------------------------------------------------------------------- */

export const getMunicipality = cache(
  async (
    param: string,
    propertyType: string | null = null,
  ): Promise<MunicipalityDetail | null> => {
    const resolved = await resolveMunicipality(param);
    if (!resolved) return null;
    const municipality = resolved.municipality;

    const window = await periodWindow();
    const start = window[0];
    const end = window.at(-1);
    const stats = start && end ? await loadStats(start, end) : [];
    const bandRows = start && end ? await loadBandRows(start, end) : [];

    const units = await db
      .select({
        propertyType: propertyUnit.propertyType,
        valueTotalCents: propertyUnit.valueTotalCents,
        landAreaM2: propertyUnit.landAreaM2,
        rollYear: propertyUnit.rollYear,
      })
      .from(propertyUnit)
      .where(eq(propertyUnit.municipalityCode, municipality.code));

    const municipalityRows = stats.filter(
      (row) => row.municipalityCode === municipality.code,
    );
    const series = buildSeries(municipalityRows, window);
    const bands = aggregatePriceBands(
      bandRows
        .filter((row) => row.municipalityCode === municipality.code)
        .map((row) => ({ priceBand: row.priceBand, count: row.count })),
    );

    const regionCode = resolved.region?.code ?? null;
    const regionRows = regionCode
      ? stats.filter((row) => row.regionCode === regionCode)
      : [];
    const regionSeries = buildSeries(preferRegionTotals(regionRows), window);
    const regionBands = aggregatePriceBands(
      preferRegionTotals(
        regionCode ? bandRows.filter((row) => row.regionCode === regionCode) : [],
      ).map((row) => ({ priceBand: row.priceBand, count: row.count })),
    );

    // An unknown `?type=` value is ignored rather than trusted: the filter only narrows the roll.
    const filterType =
      propertyType && (PROPERTY_TYPE_ORDER as ReadonlyArray<string>).includes(propertyType)
        ? propertyType
        : null;
    const filteredUnits = filterType
      ? units.filter((unit) => unit.propertyType === filterType)
      : units;

    const rollYears = units.map((unit) => unit.rollYear).filter((year) => Number.isFinite(year));

    return {
      municipality,
      region: resolved.region,
      window,
      latestPeriod: latestPeriodOf(municipalityRows),
      hasStats: municipalityRows.length > 0,
      series,
      totals: seriesTotals(series),
      priceBands: bands,
      medianPriceBand: medianBand(bands),
      regionStats: {
        hasStats: regionRows.length > 0,
        regionCode,
        latestPeriod: latestPeriodOf(regionRows),
        series: regionSeries,
        totals: seriesTotals(regionSeries),
        priceBands: regionBands,
        medianPriceBand: medianBand(regionBands),
      },
      roll: {
        unitCount: units.length,
        rollYear: rollYears.length > 0 ? Math.max(...rollYears) : null,
        medianValueCents: median(units.map((unit) => unit.valueTotalCents)),
        medianLandAreaM2: median(finiteNumbers(units.map((unit) => unit.landAreaM2))),
        byType: summarizeUnitsByType(
          units.map((unit) => ({
            propertyType: unit.propertyType,
            valueTotalCents: unit.valueTotalCents,
            landAreaM2: unit.landAreaM2,
          })),
        ),
        filter: {
          propertyType: filterType,
          unitCount: filteredUnits.length,
          medianValueCents: median(filteredUnits.map((unit) => unit.valueTotalCents)),
          medianLandAreaM2: median(finiteNumbers(filteredUnits.map((unit) => unit.landAreaM2))),
          valueBands: buildValueBands(filteredUnits.map((unit) => unit.valueTotalCents)),
        },
      },
    };
  },
);

/* -------------------------------------------------------------------------------------------------
 * Provenance
 * ---------------------------------------------------------------------------------------------- */

type DatasetRow = {
  id: string;
  name: string;
  publisher: string;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string;
  referenceDate: string | null;
  fetchedAt: string;
};

function toProvenance(row: DatasetRow): ProvenanceInfo {
  return {
    datasetId: row.id,
    name: row.name,
    publisher: row.publisher,
    license: row.license,
    licenseUrl: row.licenseUrl,
    sourceUrl: row.sourceUrl,
    referenceDate: row.referenceDate,
    fetchedAt: row.fetchedAt,
  };
}

async function loadDatasets(ids: ReadonlyArray<string>): Promise<ProvenanceInfo[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .select({
      id: dataset.id,
      name: dataset.name,
      publisher: dataset.publisher,
      license: dataset.license,
      licenseUrl: dataset.licenseUrl,
      sourceUrl: dataset.sourceUrl,
      referenceDate: dataset.referenceDate,
      fetchedAt: dataset.fetchedAt,
    })
    .from(dataset)
    .where(inArray(dataset.id, [...ids]));
  return rows.map(toProvenance);
}

/**
 * Provenance for the datasets that actually produced the figures on a page:
 * `market_stats` for Registre foncier figures, `property_unit` for roll-derived figures.
 * Empty until the ingest has run.
 */
export const provenanceFor = cache(
  async (source: "market_stats" | "property_unit"): Promise<ProvenanceInfo[]> => {
    const rows =
      source === "market_stats"
        ? await db
            .select({ id: marketStat.datasetId })
            .from(marketStat)
            .groupBy(marketStat.datasetId)
        : await db
            .select({ id: propertyUnit.datasetId })
            .from(propertyUnit)
            .groupBy(propertyUnit.datasetId);
    return loadDatasets(rows.map((row) => row.id));
  },
);

/** Every registered dataset, used by the "sources" section of the index page. */
export const allDatasetProvenance = cache(async (): Promise<ProvenanceInfo[]> => {
  const rows = await db
    .select({
      id: dataset.id,
      name: dataset.name,
      publisher: dataset.publisher,
      license: dataset.license,
      licenseUrl: dataset.licenseUrl,
      sourceUrl: dataset.sourceUrl,
      referenceDate: dataset.referenceDate,
      fetchedAt: dataset.fetchedAt,
    })
    .from(dataset)
    .orderBy(asc(dataset.name));
  return rows.map(toProvenance);
});
