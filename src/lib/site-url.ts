import { headers } from "next/headers";

import { env } from "@/lib/env";

/**
 * The public origin of the current request.
 *
 * `SITE_URL` wins when it is configured (production deployments with a canonical domain).
 * Otherwise the origin comes from the request itself, so a local deployment on :3300 never emits
 * `http://localhost:3000` in `<link rel="canonical">`, robots.txt or sitemap.xml.
 */
export async function getBaseUrl(): Promise<string> {
  if (env.SITE_URL) return env.SITE_URL.replace(/\/$/, "");

  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host") ?? "localhost:3000";
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const proto = forwardedProto ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Synchronous fallback for places that cannot await headers (kept for module-level defaults). */
export function staticBaseUrl(): string {
  return (env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
