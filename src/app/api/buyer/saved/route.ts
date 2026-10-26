import { getCurrentUser, requireUser } from "@/lib/auth";
import { assertSameOrigin, clientKey, rateLimit } from "@/lib/request-guards";
import { listSavedListingIds, saveListing, unsaveListing } from "@/modules/buyer/queries";
import { savedListingSchema } from "@/modules/buyer/schema";
import { AppError, jsonError, jsonOk } from "@/shared/errors";

/**
 * Saved pre-market listings. Ownership always comes from the session: the body only carries a
 * listing id, never a user id. Saves are idempotent against the unique (user_id, listing_id) index.
 */

export async function GET(request: Request): Promise<Response> {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return jsonOk({ ids: [], saved: false });
    }
    const listingId = new URL(request.url).searchParams.get("listingId")?.trim() ?? "";
    if (listingId) {
      const ids = await listSavedListingIds(current.id);
      return jsonOk({ saved: ids.includes(listingId) });
    }
    return jsonOk({ ids: await listSavedListingIds(current.id) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    const current = await requireUser();
    rateLimit(clientKey(request, `buyer-saved:${current.id}`), 60, 60_000);
    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = savedListingSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError("INVALID_INPUT", "Fiche invalide.", parsed.error.issues.map((i) => i.message));
    }
    return jsonOk(await saveListing(current.id, parsed.data.listingId), { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    const current = await requireUser();
    rateLimit(clientKey(request, `buyer-saved:${current.id}`), 60, 60_000);
    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = savedListingSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError("INVALID_INPUT", "Fiche invalide.", parsed.error.issues.map((i) => i.message));
    }
    return jsonOk(await unsaveListing(current.id, parsed.data.listingId));
  } catch (error) {
    return jsonError(error);
  }
}
