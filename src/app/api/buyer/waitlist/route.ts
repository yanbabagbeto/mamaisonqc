import { getCurrentUser } from "@/lib/auth";
import { assertSameOrigin, clientKey, rateLimit } from "@/lib/request-guards";
import { createWaitlistRequest, hasWaitlistRequest } from "@/modules/buyer/queries";
import { waitlistSchema } from "@/modules/buyer/schema";
import { AppError, jsonError, jsonOk } from "@/shared/errors";

/**
 * Pre-approval waitlist. Public (a signed-in account is optional), rate-limited per IP, and the
 * explicit consent flag is required by the schema: without it, nothing is written. No email is
 * sent — the row is the record, and consent is timestamped in the audit log.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    rateLimit(clientKey(request, "buyer-waitlist"), 5, 60_000);

    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = waitlistSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError(
        "INVALID_INPUT",
        parsed.error.issues[0]?.message ?? "Formulaire invalide.",
        parsed.error.issues.map((issue) => issue.message),
      );
    }

    const existing = await hasWaitlistRequest(parsed.data.email);
    if (existing) {
      return jsonOk({ already: true });
    }

    const current = await getCurrentUser();
    const result = await createWaitlistRequest({
      userId: current?.id ?? null,
      email: parsed.data.email,
      note: parsed.data.note || null,
      policyVersion: parsed.data.policyVersion,
    });
    return jsonOk(result, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
