"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { localePath, type Locale } from "@/i18n/config";
import type { BuyerMessages } from "@/modules/buyer/messages";
import type { LocatedListing } from "@/modules/buyer/types";
import { formatCad } from "@/shared/format";

/**
 * Leaflet markers are drawn with a `divIcon` using the product CSS variables, so no default
 * marker asset URL breaks under the bundler and the pin keeps the design tokens.
 */
const pinIcon = L.divIcon({
  className: "",
  html:
    '<span style="display:block;width:14px;height:14px;border-radius:999px;' +
    "background:var(--color-primary);border:2px solid var(--color-surface);" +
    'box-shadow:0 1px 3px rgb(0 0 0 / 0.35)"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

function FitBounds({ listings }: { listings: LocatedListing[] }) {
  const map = useMap();
  const points = useMemo(
    () => listings.map((listing) => [listing.lat, listing.lon] as [number, number]),
    [listings],
  );

  useEffect(() => {
    if (points.length === 0) return;
    const first = points[0];
    if (points.length === 1 && first) {
      map.setView(first, 13);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [32, 32] });
  }, [map, points]);

  return null;
}

/**
 * Real map, client-only. Only listings with finite `lat`/`lon` reach this component; the page
 * handles the "no coordinates" case with an explicit grouped list.
 */
export function LeafletMap({
  listings,
  messages,
  locale,
}: {
  listings: LocatedListing[];
  messages: BuyerMessages;
  locale: Locale;
}) {
  return (
    <div
      role="region"
      aria-label={messages.explorer.mapAria}
      className="relative z-0 overflow-hidden rounded-card border border-border"
    >
      <MapContainer
        center={[45.5019, -73.5674]}
        zoom={10}
        scrollWheelZoom={false}
        style={{ height: "28rem", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds listings={listings} />
        {listings.map((listing) => (
          <Marker key={listing.id} position={[listing.lat, listing.lon]} icon={pinIcon}>
            <Popup>
              <span className="block text-sm font-semibold text-ink">
                {listing.street || "—"}, {listing.city || "—"}
              </span>
              <span className="mt-1 block text-sm text-ink-soft">
                {formatCad(listing.askingPriceCents, locale)}
              </span>
              <Link
                href={localePath(`/pre-marche/${listing.id}`, locale)}
                className="mt-2 inline-block text-sm font-semibold text-primary underline"
              >
                {messages.explorer.tableView}
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
