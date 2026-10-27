import { env } from "@/lib/env";
import { AppError } from "@/shared/errors";

/**
 * CSRF defence for cookie-authenticated mutations.
 *
 * The browser always sends `Origin` on a cross-site POST, so comparing it to the origin this
 * request was actually served from rejects forged form posts — while still working when the app
 * runs on another host/port than `SITE_URL` (local deployment, preview URL, proxy).
 * `SITE_URL` is accepted as an additional allowed origin for reverse-proxy setups where the
 * internal request URL differs from the public one.
 */
export function assertSameOrigin(request: Request): void {
  const originHeader = request.headers.get("origin");
  const referer = request.headers.get("referer");

  let claimed: string | null = originHeader;
  if (!claimed && referer) {
    try {
      claimed = new URL(referer).origin;
    } catch {
      throw new AppError("FORBIDDEN", "Requête refusée.");
    }
  }
  // No Origin and no Referer: a non-browser client (curl, mobile app). Cookie auth still applies,
  // SameSite=Lax still blocks cross-site cookie sending, so this is not a CSRF vector.
  if (!claimed) return;

  const allowed = new Set<string>();
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost && forwardedProto) {
    allowed.add(`${forwardedProto}://${forwardedHost}`);
  }
  try {
    allowed.add(new URL(request.url).origin);
  } catch {
    // ignore malformed request URLs
  }
  if (env.SITE_URL) {
    try {
      allowed.add(new URL(env.SITE_URL).origin);
    } catch {
      // ignore malformed SITE_URL
    }
  }

  if (!allowed.has(claimed)) {
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
