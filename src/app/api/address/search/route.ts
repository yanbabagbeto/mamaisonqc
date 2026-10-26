import { addressQuerySchema, searchAddresses } from "@/modules/geo";
import { clientKey, rateLimit } from "@/lib/request-guards";
import { AppError, jsonError, jsonOk } from "@/shared/errors";

/**
 * GET /api/address/search?q=
 *
 * Public, read-only, rate-limited 30 requests/min/IP (docs/ARCHITECTURE.md §3). Every failure
 * leaves through the shared error envelope: the client never sees a stack trace, SQL or the
 * upstream response body. A geocoder outage is a 503 `UPSTREAM_UNAVAILABLE`, not a 500.
 */
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

export async function GET(request: Request): Promise<Response> {
  try {
    rateLimit(clientKey(request, "address-search"), RATE_LIMIT, RATE_WINDOW_MS);

    const url = new URL(request.url);
    const parsed = addressQuerySchema.safeParse({ q: url.searchParams.get("q") ?? "" });
    if (!parsed.success) {
      throw new AppError(
        "INVALID_INPUT",
        parsed.error.issues[0]?.message ?? "Adresse invalide.",
        parsed.error.issues.map((issue) => issue.message),
      );
    }

    const candidates = await searchAddresses(parsed.data.q);
    // Addresses are personal-ish data: never let a CDN or proxy share one visitor's search.
    return jsonOk({ candidates }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AppError) {
      return jsonError(error);
    }
    console.error("[api/address/search] unexpected error", error);
    return jsonError(new AppError("INTERNAL", "Une erreur est survenue."));
  }
}
