"use client";

import { useEffect } from "react";

/**
 * One-shot query-param cleaner: the welcome/logout banner reads its flag once, then the flag is
 * removed from the URL so a reload does not resurrect the banner.
 *
 * Uses `history.replaceState` rather than a router navigation: a router.replace right after load
 * interrupts the visitor's (and the test runner's) next navigation.
 */
export function StripQueryParam({ param }: { param: string }) {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(param)) return;
    url.searchParams.delete(param);
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, "", next);
  }, [param]);

  return null;
}
