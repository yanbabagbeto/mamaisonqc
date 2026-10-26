import { cache } from "react";
import { and, asc, desc, eq, inArray, ne, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { dataset, propertyUnit, territory } from "@/db/schema";
import type { ProvenanceInfo } from "@/shared/provenance";

import { estimateProperty } from "./estimate";
import type { ValuationResult } from "./types";

/**
 * Read adapter for the valuation page. It is the only file in `modules/valuation` that touches
 * the database: everything else stays pure and unit-testable.
 *
 * The comparable pool is capped at 300 rows per query and ordered deterministically before the
 * pure selector applies its ±25 % / tier rules. A municipality has at most ~60k units in v1
 * (docs/DATA-CONTRACT.md §4), so a same-UMV pool is always far below the cap.
 */
const POOL_LIMIT = 300;

export type PropertyUnitRow = typeof propertyUnit.$inferSelect;
export type DatasetRow = typeof dataset.$inferSelect;

export type EvaluationPageData = {
  unit: PropertyUnitRow;
  municipality: { name: string; slug: string } | null;
  provenance: ProvenanceInfo[];
  valuation: ValuationResult;
};

function hasPositiveValue(rows: PropertyUnitRow[]): PropertyUnitRow[] {
  return rows.filter((row) => row.valueTotalCents > 0);
}

/**
 * Order the pool by land-area proximity to the subject before the cap. Ordering by value alone
 * used to fetch the 300 most expensive units of a CUBF class, which are usually on another
 * scale; closest-area-first gives the fallback tiers a fair chance and keeps the cap meaningful.
 */
function poolOrder(unit: PropertyUnitRow) {
  const area = unit.landAreaM2;
  if (typeof area !== "number" || !Number.isFinite(area) || area <= 0) {
    return [desc(propertyUnit.valueTotalCents), asc(propertyUnit.id)];
  }
  return [
    sql`abs(coalesce(${propertyUnit.landAreaM2}, 0) - ${area})`,
    desc(propertyUnit.valueTotalCents),
    asc(propertyUnit.id),
  ];
}

async function loadComparablePool(unit: PropertyUnitRow): Promise<PropertyUnitRow[]> {
  if (unit.umv) {
    const rows = await db
      .select()
      .from(propertyUnit)
      .where(
        and(
          eq(propertyUnit.municipalityCode, unit.municipalityCode),
          eq(propertyUnit.umv, unit.umv),
          ne(propertyUnit.id, unit.id),
        ),
      )
      .orderBy(...poolOrder(unit))
      .limit(POOL_LIMIT);
    if (hasPositiveValue(rows).length > 0) return rows;
  }

  if (unit.cubf) {
    const rows = await db
      .select()
      .from(propertyUnit)
      .where(
        and(
          eq(propertyUnit.municipalityCode, unit.municipalityCode),
          eq(propertyUnit.cubf, unit.cubf),
          ne(propertyUnit.id, unit.id),
        ),
      )
      .orderBy(...poolOrder(unit))
      .limit(POOL_LIMIT);
    return hasPositiveValue(rows);
  }

  return [];
}

function toProvenance(rows: DatasetRow[]): ProvenanceInfo[] {
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

/**
 * Per-request memoized loader shared by `generateMetadata` and the page (React `cache`), so a
 * single render never runs the same SQL twice.
 *
 * `matricule` is unique per municipality in the schema, not province-wide; if the ingested data
 * ever contains the same matricule in two municipalities we deterministically take the lowest
 * `id` instead of showing a random owner's page.
 */
export const getEvaluationPageData = cache(
  async (matricule: string): Promise<EvaluationPageData | null> => {
    const trimmed = matricule.trim();
    if (!trimmed) return null;

    const units = await db
      .select()
      .from(propertyUnit)
      .where(eq(propertyUnit.matricule, trimmed))
      .orderBy(asc(propertyUnit.id))
      .limit(2);
    const unit = units[0];
    if (!unit) return null;

    const pool = await loadComparablePool(unit);
    const valuation = estimateProperty(unit, pool);

    const municipalities = await db
      .select({ name: territory.name, slug: territory.slug })
      .from(territory)
      .where(
        and(eq(territory.codeGeo, unit.municipalityCode), eq(territory.level, "municipalite")),
      )
      .limit(1);

    const datasetIds = [
      ...new Set([unit.datasetId, ...valuation.comparables.map((comparable) => comparable.datasetId)]),
    ].sort();
    const datasetRows = datasetIds.length
      ? await db.select().from(dataset).where(inArray(dataset.id, datasetIds))
      : [];

    return {
      unit,
      municipality: municipalities[0] ?? null,
      provenance: toProvenance([...datasetRows].sort((a, b) => a.id.localeCompare(b.id))),
      valuation,
    };
  },
);
