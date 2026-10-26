import { count } from "drizzle-orm";

import { db } from "@/db/client";
import { dataset, marketStat, propertyUnit, territory } from "@/db/schema";
import { jsonError, jsonOk } from "@/shared/errors";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const [units] = await db.select({ value: count() }).from(propertyUnit);
    const [territories] = await db.select({ value: count() }).from(territory);
    const [stats] = await db.select({ value: count() }).from(marketStat);
    const [datasets] = await db.select({ value: count() }).from(dataset);

    return jsonOk({
      status: "ok",
      coverage: {
        propertyUnits: Number(units?.value ?? 0),
        territories: Number(territories?.value ?? 0),
        marketStats: Number(stats?.value ?? 0),
        datasets: Number(datasets?.value ?? 0),
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
