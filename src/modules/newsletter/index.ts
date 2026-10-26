import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { auditEvent, newsletterSubscriber } from "@/db/schema";
import { AppError } from "@/shared/errors";

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse courriel invalide."),
  source: z.string().trim().min(1).max(40).default("site"),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

/**
 * Idempotent single opt-in (PRD F6). No email is sent in v1: the row is the record,
 * and the UI confirms inline. Unsubscribing keeps the row (proof of removal) and sets a date.
 */
export async function subscribe(raw: unknown): Promise<{ subscribed: true; alreadySubscribed: boolean }> {
  const input = subscribeSchema.safeParse(raw);
  if (!input.success) {
    throw new AppError("INVALID_INPUT", "Adresse courriel invalide.");
  }
  const { email, source } = input.data;
  const now = new Date().toISOString();

  const existing = await db
    .select({ id: newsletterSubscriber.id, unsubscribedAt: newsletterSubscriber.unsubscribedAt })
    .from(newsletterSubscriber)
    .where(eq(newsletterSubscriber.email, email))
    .limit(1);

  if (existing.length > 0) {
    const row = existing[0]!;
    if (row.unsubscribedAt !== null) {
      await db
        .update(newsletterSubscriber)
        .set({ unsubscribedAt: null, consentAt: now, source })
        .where(eq(newsletterSubscriber.id, row.id));
      return { subscribed: true, alreadySubscribed: false };
    }
    return { subscribed: true, alreadySubscribed: true };
  }

  await db.insert(newsletterSubscriber).values({
    id: crypto.randomUUID(),
    email,
    consentAt: now,
    source,
    unsubscribeToken: randomBytes(24).toString("base64url"),
    unsubscribedAt: null,
  });

  await db.insert(auditEvent).values({
    id: crypto.randomUUID(),
    actorId: null,
    action: "newsletter.subscribed",
    entity: "newsletter_subscriber",
    entityId: email,
    payloadJson: JSON.stringify({ source }),
    createdAt: now,
  });

  return { subscribed: true, alreadySubscribed: false };
}

export async function unsubscribe(token: string): Promise<boolean> {
  const [row] = await db
    .select({ id: newsletterSubscriber.id })
    .from(newsletterSubscriber)
    .where(eq(newsletterSubscriber.unsubscribeToken, token))
    .limit(1);
  if (!row) return false;
  await db
    .update(newsletterSubscriber)
    .set({ unsubscribedAt: new Date().toISOString() })
    .where(eq(newsletterSubscriber.id, row.id));
  return true;
}
