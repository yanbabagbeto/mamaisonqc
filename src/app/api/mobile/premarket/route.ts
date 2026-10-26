import { clientKey, rateLimit } from "@/lib/request-guards";
import { listPublicListings } from "@/modules/premarket";
import { jsonError, jsonOk } from "@/shared/errors";

/**
 * GET /api/mobile/premarket
 *
 * Active pre-market listings. The address is masked by the domain module (`PublicListing`:
 * street + city only, never the civic number — PRD AC-12). No auth: this is the public view.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  try {
    rateLimit(clientKey(request, "mobile-premarket"), 60, 60_000);
    const listings = await listPublicListings();
    return jsonOk({ listings }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
