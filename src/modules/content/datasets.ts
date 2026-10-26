/**
 * Dataset catalogue read model for `/donnees` (PRD AC-8 / AC-18 trust page).
 * Returns `null` when the table does not exist yet (fresh checkout before `db:build`) so the page
 * can fall back to the curated catalogue instead of crashing or inventing row counts.
 */
import { db } from "@/db/client";
import { dataset } from "@/db/schema";

export type DatasetRow = typeof dataset.$inferSelect;

export async function listDatasets(): Promise<DatasetRow[] | null> {
  try {
    const rows = await db.select().from(dataset).orderBy(dataset.name);
    return rows;
  } catch {
    return null;
  }
}
