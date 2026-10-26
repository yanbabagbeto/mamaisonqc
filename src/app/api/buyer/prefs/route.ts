import { requireUser } from "@/lib/auth";
import { assertSameOrigin, clientKey, rateLimit } from "@/lib/request-guards";
import { saveNotificationPrefs } from "@/modules/buyer/queries";
import { prefsSchema } from "@/modules/buyer/schema";
import { AppError, jsonError, jsonOk } from "@/shared/errors";

/** Notification preferences for the signed-in account. Upserted per key, never another user's rows. */
export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    const current = await requireUser();
    rateLimit(clientKey(request, `buyer-prefs:${current.id}`), 30, 60_000);

    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = prefsSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError("INVALID_INPUT", "Préférences invalides.", parsed.error.issues.map((i) => i.message));
    }

    await saveNotificationPrefs(current.id, parsed.data);
    return jsonOk({ prefs: parsed.data });
  } catch (error) {
    return jsonError(error);
  }
}
