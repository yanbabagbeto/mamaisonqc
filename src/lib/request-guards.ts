import { env } from "@/lib/env";
import { AppError } from "@/shared/errors";

/**
 * CSRF defence for cookie-authenticated mutations: the browser always sends Origin on a
 * cross-site POST, so a same-origin check rejects forged form posts. SameSite=Lax on the
 * session cookie is the second layer.
 */
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) {
    // Same-origin non-CORS requests from older clients: fall back to the Referer host.
    const referer = request.headers.get("referer");
    if (!referer) return;
    try {
      if (new URL(referer).origin === new URL(env.SITE_URL).origin) return;
    } catch {
      throw new AppError("FORBIDDEN", "Requête refusée.");
    }
    throw new AppError("FORBIDDEN", "Requête refusée.");
  }
  if (origin !== new URL(env.SITE_URL).origin) {
    throw new AppError("FORBIDDEN", "Requête refusée.");
  }
}

/** Process-local fixed-window limiter. Good enough for one instance (ARCHITECTURE §6 rung 1). */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (bucket.count >= limit) {
    throw new AppError("RATE_LIMITED", "Trop de requêtes. Réessayez dans une minute.");
  }
  bucket.count += 1;
}

export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "local";
  return `${scope}:${ip}`;
}
