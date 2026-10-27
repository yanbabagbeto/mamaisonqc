import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale } from "@/i18n/config";

/**
 * Bilingual routing without duplicating the route tree:
 *  - `/en/...`  → rewritten internally to `/...` with `x-maqc-locale: en`
 *  - `/fr/...`  → permanent redirect to `/...` (French is canonical at the root)
 *  - anything else → `x-maqc-locale: fr`
 * Next 16 renamed Middleware to Proxy (`proxy.ts`, exported as `proxy`).
 */
/**
 * Routes that require a session. The optimistic cookie check here returns a real 307 before the
 * response starts streaming (a `redirect()` inside a streamed page can only be applied client-side,
 * which leaves no-JS visitors on a blank page); the page itself still validates the session server-side.
 */
const PROTECTED_PREFIXES = [
  "/mes-interets",
  "/parametres",
  "/proprietaire/tableau-de-bord",
  "/pre-marche/publier",
];

export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  const english = pathname === "/en" || pathname.startsWith("/en/");
  const barePath = english ? pathname.replace(/^\/en/, "") || "/" : pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => barePath === prefix || barePath.startsWith(`${prefix}/`),
  );
  if (isProtected && !request.cookies.get("maqc_session")?.value) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `${english ? "/en" : ""}/connexion`;
    loginUrl.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

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
