import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale } from "@/i18n/config";

/**
 * Bilingual routing without duplicating the route tree:
 *  - `/en/...`  → rewritten internally to `/...` with `x-maqc-locale: en`
 *  - `/fr/...`  → permanent redirect to `/...` (French is canonical at the root)
 *  - anything else → `x-maqc-locale: fr`
 * Next 16 renamed Middleware to Proxy (`proxy.ts`, exported as `proxy`).
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  // `/en/...` is rewritten to `/...`; the rewritten request passes through the proxy again, so an
  // upstream decision must never be downgraded to the default locale here.
  if (!requestHeaders.has("x-maqc-locale")) {
    requestHeaders.set("x-maqc-locale", defaultLocale);
  }

  if (pathname === "/fr" || pathname.startsWith("/fr/")) {
    const target = request.nextUrl.clone();
    target.pathname = pathname.replace(/^\/fr/, "") || "/";
    return NextResponse.redirect(target, 308);
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const target = request.nextUrl.clone();
    target.pathname = pathname.replace(/^\/en/, "") || "/";
    target.search = search;
    const headers = new Headers(request.headers);
    headers.set("x-maqc-locale", "en");
    return NextResponse.rewrite(target, { request: { headers } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.[\\w]+$).*)"],
};
