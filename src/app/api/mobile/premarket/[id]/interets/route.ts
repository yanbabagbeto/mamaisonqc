import { clientKey, rateLimit } from "@/lib/request-guards";
import { interestSchema, recordInterest } from "@/modules/premarket";
import { AppError, jsonError, jsonOk } from "@/shared/errors";

/**
 * POST /api/mobile/premarket/[id]/interets
 *
 * Same Zod schema and same domain write as the web route (`/api/premarket/[id]/interets`), so a
 * native interest and a browser interest can never diverge. Public (the web route is public) and
 * rate-limited per IP.
 *
 * Deliberately no `assertSameOrigin`: a native request carries no Origin header, and a CSRF
 * check keyed to SITE_URL would reject every phone. The write is protected by the strict schema,
 * the rate limit and the domain module's ownership/listing checks; it returns no owner data.
 */
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    rateLimit(clientKey(request, "mobile-premarket-interest"), 10, 60_000);

    const { id } = await context.params;
    const trimmed = id.trim();
    if (trimmed.length === 0 || trimmed.length > 100) {
      throw new AppError("INVALID_INPUT", "Annonce invalide.");
    }

    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = interestSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError("INVALID_INPUT", "Formulaire invalide.", parsed.error.flatten().fieldErrors);
    }

    const result = await recordInterest(trimmed, parsed.data);
    return jsonOk({ interest: result }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
