/**
 * Loads the normalized artifacts produced by `pipeline/` into SQLite.
 * Idempotent for the public data tables: truncate, then insert. User tables are untouched.
 *
 * Usage: npm run db:seed
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { db } from "@/db/client";
import { parseCsv } from "@/db/csv";
import { dataset, marketStat, propertyUnit, territory, user } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { normalizeStreet } from "@/shared/slug";

const NORMALIZED = path.join(process.cwd(), "data", "normalized");

function readArtifact(fileName: string): string | null {
  const full = path.join(NORMALIZED, fileName);
  if (!existsSync(full)) {
    return null;
  }
  return readFileSync(full, "utf8");
}

function toInt(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value.replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIntOrNull(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value.replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function toFloatOrNull(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function seedDatasets(): Promise<number> {
  const raw = readArtifact("datasets.json");
  if (!raw) return 0;
  const rows = JSON.parse(raw) as Array<{
    id: string;
    name: string;
    publisher: string;
    license: string;
    licenseUrl?: string;
    sourceUrl: string;
    fetchedAt: string;
    referenceDate?: string;
    rowCount?: number;
    checksum?: string;
    notes?: string;
  }>;
  await db.delete(dataset);
  if (rows.length === 0) return 0;
  await db.insert(dataset).values(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      publisher: row.publisher,
      license: row.license,
      licenseUrl: row.licenseUrl ?? null,
      sourceUrl: row.sourceUrl,
      fetchedAt: row.fetchedAt,
      referenceDate: row.referenceDate ?? null,
      rowCount: row.rowCount ?? 0,
      checksum: row.checksum ?? null,
      notes: row.notes ?? null,
    })),
  );
  return rows.length;
}

async function seedTerritories(): Promise<number> {
  const raw = readArtifact("territories.csv");
  if (!raw) return 0;
  const { rows } = parseCsv(raw);
  await db.delete(territory);
  const values = rows
    .filter((row) => row.code_geo && row.name && row.level && row.slug)
    .map((row) => ({
      codeGeo: row.code_geo!,
      name: row.name!,
      level: row.level!,
      parentCode: row.parent_code || null,
      slug: row.slug!,
      population: toIntOrNull(row.population),
    }));
  for (const batch of chunk(values, 500)) {
    await db.insert(territory).values(batch);
  }
  return values.length;
}

async function seedPropertyUnits(): Promise<number> {
  const raw = readArtifact("property_units.csv");
  if (!raw) return 0;
  const { rows } = parseCsv(raw);
  await db.delete(propertyUnit);
  const values = rows
    .filter((row) => row.id && row.municipality_code && row.matricule)
    .map((row) => ({
      id: row.id!,
      municipalityCode: row.municipality_code!,
      matricule: row.matricule!,
      umv: row.umv || null,
      cubf: row.cubf || null,
      cubfLabel: row.cubf_label || null,
      propertyType: row.property_type || "autre",
      addrNo: row.addr_no || null,
      addrStreet: row.addr_street || null,
      addrStreetNorm: row.addr_street_norm || (row.addr_street ? normalizeStreet(row.addr_street) : null),
      addrSuite: row.addr_suite || null,
      landAreaM2: toFloatOrNull(row.land_area_m2),
      frontageM: toFloatOrNull(row.frontage_m),
      yearBuilt: toIntOrNull(row.year_built),
      floors: toFloatOrNull(row.floors),
      valueLandCents: toInt(row.value_land_cents),
      valueBuildingCents: toInt(row.value_building_cents),
      valueTotalCents: toInt(row.value_total_cents),
      valuePriorCents: toIntOrNull(row.value_prior_cents),
      lat: toFloatOrNull(row.lat),
      lon: toFloatOrNull(row.lon),
      marketRefDate: row.market_ref_date || null,
      rollYear: toInt(row.roll_year) || new Date().getFullYear(),
      sourceUrl: row.source_url!,
      datasetId: row.dataset_id!,
    }));
  for (const batch of chunk(values, 500)) {
    await db.insert(propertyUnit).values(batch);
  }
  return values.length;
}

async function seedMarketStats(): Promise<number> {
  const raw = readArtifact("market_stats.csv");
  if (!raw) return 0;
  const { rows } = parseCsv(raw);
  await db.delete(marketStat);
  const values = rows
    .filter((row) => row.id && row.region_code && row.kind && row.period)
    .map((row) => ({
      id: row.id!,
      period: row.period!,
      regionCode: row.region_code!,
      municipalityCode: row.municipality_code || null,
      kind: row.kind!,
      priceBand: row.price_band || null,
      count: toInt(row.count),
      datasetId: row.dataset_id!,
    }));
  for (const batch of chunk(values, 500)) {
    await db.insert(marketStat).values(batch);
  }
  return values.length;
}

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    return;
  }
  if (password.length < 12) {
    console.warn("[seed] ADMIN_PASSWORD ignored: use at least 12 characters.");
    return;
  }
  const passwordHash = await hashPassword(password);
  await db
    .insert(user)
    .values({
      id: crypto.randomUUID(),
      email,
      passwordHash,
      name: "Administration",
      role: "admin",
      createdAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: user.email,
      set: { passwordHash, role: "admin" },
    });
  console.log(`[seed] admin account ensured for ${email}`);
}

async function main(): Promise<void> {
  console.log(`[seed] reading artifacts from ${NORMALIZED}`);
  const datasets = await seedDatasets();
  const territories = await seedTerritories();
  const units = await seedPropertyUnits();
  const stats = await seedMarketStats();
  await seedAdmin();

  console.log(
    `[seed] datasets=${datasets} territories=${territories} propertyUnits=${units} marketStats=${stats}`,
  );

  if (units === 0) {
    console.warn(
      "[seed] No property units were loaded. Run `python3 pipeline/run.py` first, then `npm run db:seed`.",
    );
  }
}

main().catch((error) => {
  console.error("[seed] failed", error);
  process.exit(1);
});
