import type { ExplorerFilters, ExplorerListing, LocatedListing } from "./types";

/**
 * Explorer filtering is pure so the page and the unit tests share one rule set. Listings arrive
 * sorted by createdAt desc / id desc from the data layer; filters preserve that order and never
 * invent a property. A region filter needs the municipality → region index (see `regions.ts`).
 */

export const EXPLORER_TYPES = [
  "unifamiliale",
  "copropriete",
  "plex",
  "terrain",
  "non-residentiel",
  "autre",
] as const;

export const EXPLORER_HORIZONS = ["0-3", "3-6", "6-12", "12+"] as const;

function firstString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function parseExplorerFilters(
  raw: Record<string, string | string[] | undefined>,
): ExplorerFilters {
  const type = firstString(raw.type).trim().toLowerCase();
  const horizon = firstString(raw.horizon).trim();
  const region = firstString(raw.region).trim();
  return {
    propertyType: (EXPLORER_TYPES as readonly string[]).includes(type) ? type : null,
    horizon: (EXPLORER_HORIZONS as readonly string[]).includes(horizon) ? horizon : null,
    regionCode: region.length > 0 && region.length <= 32 ? region : null,
  };
}

export function filterListings(
  listings: ExplorerListing[],
  filters: ExplorerFilters,
  regionByMunicipality: Record<string, string | null>,
): ExplorerListing[] {
  return listings.filter((listing) => {
    if (filters.propertyType && listing.propertyType !== filters.propertyType) return false;
    if (filters.horizon && listing.horizon !== filters.horizon) return false;
    if (filters.regionCode) {
      const region = regionByMunicipality[listing.municipalityCode] ?? null;
      if (region !== filters.regionCode) return false;
    }
    return true;
  });
}

/** Markers are only produced for real coordinates; everything else stays in the list. */
export function splitLocated(listings: ExplorerListing[]): {
  located: LocatedListing[];
  unlocated: ExplorerListing[];
} {
  const located: LocatedListing[] = [];
  const unlocated: ExplorerListing[] = [];
  for (const listing of listings) {
    if (
      typeof listing.lat === "number" &&
      Number.isFinite(listing.lat) &&
      typeof listing.lon === "number" &&
      Number.isFinite(listing.lon)
    ) {
      located.push({ ...listing, lat: listing.lat, lon: listing.lon });
    } else {
      unlocated.push(listing);
    }
  }
  return { located, unlocated };
}

/** Groups the unlocated listings by city, cities sorted for a stable, testable list. */
export function groupByCity(listings: ExplorerListing[]): Array<{
  city: string;
  listings: ExplorerListing[];
}> {
  const groups = new Map<string, ExplorerListing[]>();
  for (const listing of listings) {
    const city = listing.city.trim() || "—";
    const group = groups.get(city);
    if (group) {
      group.push(listing);
    } else {
      groups.set(city, [listing]);
    }
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "fr"))
    .map(([city, cityListings]) => ({
      city,
      listings: [...cityListings].sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
      ),
    }));
}

/** Deterministic list order used by the accessible table. */
export function sortForList(listings: ExplorerListing[]): ExplorerListing[] {
  return [...listings].sort(
    (a, b) =>
      a.city.localeCompare(b.city, "fr") ||
      b.createdAt.localeCompare(a.createdAt) ||
      a.id.localeCompare(b.id),
  );
}

