import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import * as schema from "@/db/schema";
import { env } from "@/lib/env";

/**
 * One connection per process: better-sqlite3 is synchronous and Next dev reloads modules,
 * so the handle lives on globalThis to survive hot reloads.
 */
const globalForDb = globalThis as unknown as {
  __mamaisonqcDb?: BetterSQLite3Database<typeof schema>;
  __mamaisonqcSqlite?: Database.Database;
};

function open(): BetterSQLite3Database<typeof schema> {
  const sqlite = new Database(env.DATABASE_URL);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  globalForDb.__mamaisonqcSqlite = sqlite;
  return drizzle(sqlite, { schema });
}

export const db = globalForDb.__mamaisonqcDb ?? open();

if (env.NODE_ENV !== "production") {
  globalForDb.__mamaisonqcDb = db;
}

export { schema };
export type Db = typeof db;
