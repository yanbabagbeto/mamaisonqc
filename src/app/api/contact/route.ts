import { randomUUID } from "node:crypto";

import { z } from "zod";

import { db } from "@/db/client";
import { outbox } from "@/db/schema";
import { AppError, jsonError, jsonOk } from "@/shared/errors";
import { assertSameOrigin, clientKey, rateLimit } from "@/lib/request-guards";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  message: z.string().trim().min(10).max(1500),
});

/**
 * Contact messages land in the outbox (no mail provider in v1). The admin console is the delivery
 * channel, which is honest and auditable rather than silently dropping the message.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    rateLimit(clientKey(request, "contact"), 3, 60_000);
    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new AppError("INVALID_INPUT", "Formulaire invalide.", parsed.error.flatten().fieldErrors);
    }
    await db.insert(outbox).values({
      id: randomUUID(),
      kind: "mail",
      toEmail: parsed.data.email,
      subject: `Contact — ${parsed.data.name}`,
      body: parsed.data.message,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    return jsonOk({ received: true });
  } catch (error) {
    return jsonError(error);
  }
}
