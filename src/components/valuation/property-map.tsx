"use client";

import dynamic from "next/dynamic";

const PropertyMapInner = dynamic(() => import("./property-map-inner"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" aria-hidden="true" />,
});

/**
 * Location card for a property record. The coordinates come from the official geo-referenced
 * roll; when they are missing we render nothing (never a guessed position).
 */
export function PropertyMap({
  lat,
  lon,
  label,
  openLabel,
}: {
  lat: number | null;
  lon: number | null;
  label: string;
  openLabel: string;
}) {
  if (lat === null || lon === null) return null;
  const osm = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
  return (
    <div>
      <div className="h-64 overflow-hidden rounded-xl border border-border md:h-72">
        <PropertyMapInner lat={lat} lon={lon} label={label} />
      </div>
      <a
        href={osm}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-3 inline-flex min-h-6 items-center text-sm font-semibold text-primary underline decoration-dotted underline-offset-2"
      >
        {openLabel} →
      </a>
    </div>
  );
}
