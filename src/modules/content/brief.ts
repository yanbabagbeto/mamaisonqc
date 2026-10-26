/**
 * Read model for Le Brief. Queries `market_stat` directly with Drizzle (the task's contract):
 * total sales by administrative region for the latest period that has data.
 *
 * If no rows exist — the normal state before the ETL finishes — the caller renders the designed
 * "édition à venir" state. No fallback number is ever invented.
 */
import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { dataset, marketStat, territory } from "@/db/schema";
import type { ProvenanceInfo } from "@/shared/provenance";

import { KNOWN_DATASETS } from "../../../content/data-sources";

export type RegionSales = {
  regionCode: string;
  /** Null when the territory table does not name the region yet. Never invented. */
  regionName: string | null;
  sales: number;
};

export type BriefEdition = {
  period: string;
  regions: RegionSales[];
  total: number;
  archive: { period: string; sales: number }[];
  provenance: ProvenanceInfo[];
};

function provenanceFor(rows: (typeof dataset.$inferSelect)[]): ProvenanceInfo[] {
  if (rows.length > 0) {
    return rows.map((row) => ({
      datasetId: row.id,
      name: row.name,
      publisher: row.publisher,
      license: row.license,
      licenseUrl: row.licenseUrl,
      sourceUrl: row.sourceUrl,
      referenceDate: row.referenceDate,
      fetchedAt: row.fetchedAt,
    }));
  }
  // The dataset table is the source of truth; if the ETL has not registered its row yet we still
  // name the real official source rather than printing a figure without attribution (AC-8).
  return KNOWN_DATASETS.filter((known) => known.id === "registre-foncier-stats").map((known) => ({
    datasetId: known.id,
    name: known.name,
    publisher: known.publisher,
    license: known.license,
    licenseUrl: known.licenseUrl,
    sourceUrl: known.sourceUrl,
    referenceDate: null,
    fetchedAt: null,
  }));
}

export async function loadBriefEdition(): Promise<BriefEdition | null> {
  try {
    const [latest] = await db
      .select({ period: marketStat.period })
      .from(marketStat)
      .where(eq(marketStat.kind, "ventes"))
      .orderBy(desc(marketStat.period))
      .limit(1);

    if (!latest) return null;
    const period = latest.period;

    const regionRows = await db
      .select({
        regionCode: marketStat.regionCode,
        regionName: territory.name,
        sales: sql<number>`coalesce(sum(${marketStat.count}), 0)`,
      })
      .from(marketStat)
      .leftJoin(territory, eq(territory.codeGeo, marketStat.regionCode))
      .where(and(eq(marketStat.kind, "ventes"), eq(marketStat.period, period)))
      .groupBy(marketStat.regionCode, territory.name)
      .orderBy(desc(sql`coalesce(sum(${marketStat.count}), 0)`));

    const archiveRows = await db
      .select({
        period: marketStat.period,
        sales: sql<number>`coalesce(sum(${marketStat.count}), 0)`,
      })
      .from(marketStat)
      .where(eq(marketStat.kind, "ventes"))
      .groupBy(marketStat.period)
      .orderBy(desc(marketStat.period))
      .limit(6);

    const datasetIds = await db
      .selectDistinct({ id: marketStat.datasetId })
      .from(marketStat)
      .where(eq(marketStat.kind, "ventes"));
    const datasetRows = await db.select().from(dataset);
    const usedIds = new Set(datasetIds.map((row) => row.id));
    const usedDatasets = datasetRows.filter((row) => usedIds.has(row.id));

    const regions: RegionSales[] = regionRows.map((row) => ({
      regionCode: row.regionCode,
      regionName: row.regionName,
      sales: Number(row.sales),
    }));

    return {
      period,
      regions,
      total: regions.reduce((sum, region) => sum + region.sales, 0),
      archive: archiveRows.map((row) => ({ period: row.period, sales: Number(row.sales) })),
      provenance: provenanceFor(usedDatasets),
    };
  } catch {
    // Missing tables (fresh checkout before `db:build`) must degrade to the designed empty state,
    // not crash the page. The empty state says the data is not ingested — no invented figures.
    return null;
  }
}
