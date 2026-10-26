import { randomUUID } from "node:crypto";

import { z } from "zod";

import { db } from "@/db/client";
import { consentEvent } from "@/db/schema";
import { jsonError, jsonOk } from "@/shared/errors";
import { clientKey, rateLimit } from "@/lib/request-guards";

const schema = z.object({
  choice: z.enum(["accepte", "refuse"]),
  policyVersion: z.string().trim().min(1).max(20),
});

/**
 * First-party consent log. No IP, no user agent, no cookie identifier: a per-browser random key
 * generated client-side would be pseudonymous, so we store a random session key instead (Loi 25
 * data minimisation).
 */
export async function POST(request: Request): Promise<Response> {
  try {
    rateLimit(clientKey(request, "consent"), 20, 60_000);
    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonOk({ recorded: false });
    }
    await db.insert(consentEvent).values({
      id: randomUUID(),
      sessionKey: randomUUID(),
      choice: parsed.data.choice,
      policyVersion: parsed.data.policyVersion,
      createdAt: new Date().toISOString(),
    });
    return jsonOk({ recorded: true });
  } catch (error) {
    return jsonError(error);
  }
}
