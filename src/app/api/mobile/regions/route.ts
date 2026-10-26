import { clientKey, rateLimit } from "@/lib/request-guards";
import { listRegions, provenanceFor } from "@/modules/market";
import { jsonError, jsonOk } from "@/shared/errors";

import { dedupeProvenance } from "../_provenance";

/**
 * GET /api/mobile/regions
 *
 * Read-only region list for the native market screen. The payload is the market module's own
 * `RegionSummary` (nullable aggregates included) plus the provenance of the datasets that
 * produced the figures.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  try {
    rateLimit(clientKey(request, "mobile-regions"), 60, 60_000);

    const [regions, statsProvenance, rollProvenance] = await Promise.all([
      listRegions(),
      provenanceFor("market_stats"),
      provenanceFor("property_unit"),
    ]);

    return jsonOk(
      {
        regions,
        provenance: dedupeProvenance([...statsProvenance, ...rollProvenance]),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
