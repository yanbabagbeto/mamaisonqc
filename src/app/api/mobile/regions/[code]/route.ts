import { clientKey, rateLimit } from "@/lib/request-guards";
import { getRegion, provenanceFor } from "@/modules/market";
import { AppError, jsonError, jsonOk } from "@/shared/errors";

import { dedupeProvenance } from "../../_provenance";

/**
 * GET /api/mobile/regions/[code]
 *
 * Region detail for the native market screen: period series, totals, price bands, roll coverage
 * per municipality and provenance. `code` accepts the MAMH `code_geo` or the region slug, exactly
 * like the web page (`resolveRegion`).
 */
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> },
): Promise<Response> {
  try {
    rateLimit(clientKey(request, "mobile-region-detail"), 60, 60_000);

    const { code } = await context.params;
    const trimmed = code.trim();
    if (trimmed.length === 0 || trimmed.length > 100) {
      throw new AppError("INVALID_INPUT", "Région invalide.");
    }

    const detail = await getRegion(trimmed);
    if (!detail) {
      throw new AppError("NOT_FOUND", "Cette région n'existe pas dans nos données.");
    }

    const [statsProvenance, rollProvenance] = await Promise.all([
      provenanceFor("market_stats"),
      provenanceFor("property_unit"),
    ]);

    return jsonOk(
      {
        region: detail.region,
        window: detail.window,
        latestPeriod: detail.latestPeriod,
        hasStats: detail.hasStats,
        series: detail.series,
        totals: detail.totals,
        priceBands: detail.priceBands,
        medianPriceBand: detail.medianPriceBand,
        municipalities: detail.municipalities,
        coverage: detail.coverage,
        provenance: dedupeProvenance([...statsProvenance, ...rollProvenance]),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
