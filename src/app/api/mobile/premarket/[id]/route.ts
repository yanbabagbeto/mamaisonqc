import { clientKey, rateLimit } from "@/lib/request-guards";
import { getPublicListing } from "@/modules/premarket";
import { AppError, jsonError, jsonOk } from "@/shared/errors";

/**
 * GET /api/mobile/premarket/[id]
 *
 * One public listing (masked address), so the native detail screen loads data instead of trusting
 * route params. A paused/removed listing is a 404, exactly like the web page.
 */
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    rateLimit(clientKey(request, "mobile-premarket-detail"), 60, 60_000);

    const { id } = await context.params;
    const trimmed = id.trim();
    if (trimmed.length === 0 || trimmed.length > 100) {
      throw new AppError("INVALID_INPUT", "Annonce invalide.");
    }

    const listing = await getPublicListing(trimmed);
    if (!listing) {
      throw new AppError("NOT_FOUND", "Cette annonce n'est plus active ou n'existe pas.");
    }
    return jsonOk({ listing }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
