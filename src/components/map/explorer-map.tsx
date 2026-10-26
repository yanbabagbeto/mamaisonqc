"use client";

import dynamic from "next/dynamic";

import type { BuyerMessages } from "@/modules/buyer/messages";
import type { LocatedListing } from "@/modules/buyer/types";
import type { Locale } from "@/i18n/config";

/**
 * Leaflet is loaded only in the browser (`ssr: false` lives in this Client Component wrapper,
 * because Next 16 forbids it directly in a Server Component). The map is a convenience: the page
 * always renders the same results as an accessible table and as a list grouped by city.
 */
const LeafletMap = dynamic(() => import("./leaflet-map").then((module) => module.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[28rem] items-center justify-center rounded-card border border-border bg-muted text-sm text-muted-fg">
      …
    </div>
  ),
});

export function ExplorerMap({
  listings,
  messages,
  locale,
}: {
  listings: LocatedListing[];
  messages: BuyerMessages;
  locale: Locale;
}) {
  return <LeafletMap listings={listings} messages={messages} locale={locale} />;
}
