import { describe, expect, it } from "vitest";

import {
  filterListings,
  groupByCity,
  parseExplorerFilters,
  sortForList,
  splitLocated,
} from "./filters";
import type { ExplorerListing } from "./types";

function listing(overrides: Partial<ExplorerListing> & { id: string }): ExplorerListing {
  return {
    street: "Rue Exemple",
    city: "Montréal",
    municipalityCode: "66023",
    propertyType: "unifamiliale",
    horizon: "3-6",
    askingPriceCents: 50_000_000,
    lat: 45.5,
    lon: -73.57,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const regionByMunicipality: Record<string, string | null> = {
  "66023": "06",
  "65005": "13",
  "58227": "16",
  "99999": null,
};

describe("parseExplorerFilters", () => {
  it("keeps known filters and drops unknown values", () => {
    expect(parseExplorerFilters({ type: "Plex", horizon: "6-12", region: "06" })).toEqual({
      propertyType: "plex",
      horizon: "6-12",
      regionCode: "06",
    });
    expect(parseExplorerFilters({ type: "chateau", horizon: "demain", region: "" })).toEqual({
      propertyType: null,
      horizon: null,
      regionCode: null,
    });
  });

  it("takes the first value of a repeated query parameter", () => {
    expect(parseExplorerFilters({ type: ["copropriete", "plex"] })).toEqual({
      propertyType: "copropriete",
      horizon: null,
      regionCode: null,
    });
  });

  it("rejects an oversized region code", () => {
    expect(parseExplorerFilters({ region: "x".repeat(33) }).regionCode).toBeNull();
  });
});

describe("filterListings", () => {
  const listings = [
    listing({ id: "a", propertyType: "unifamiliale", horizon: "3-6", municipalityCode: "66023" }),
    listing({ id: "b", propertyType: "plex", horizon: "6-12", municipalityCode: "65005" }),
    listing({ id: "c", propertyType: "plex", horizon: "3-6", municipalityCode: "58227" }),
    listing({ id: "d", propertyType: "plex", horizon: "3-6", municipalityCode: "99999" }),
  ];

  it("filters by property type and horizon", () => {
    const result = filterListings(
      listings,
      { propertyType: "plex", horizon: "3-6", regionCode: null },
      regionByMunicipality,
    );
    expect(result.map((item) => item.id)).toEqual(["c", "d"]);
  });

  it("filters by region through the municipality index", () => {
    const result = filterListings(
      listings,
      { propertyType: null, horizon: null, regionCode: "13" },
      regionByMunicipality,
    );
    expect(result.map((item) => item.id)).toEqual(["b"]);
  });

  it("excludes municipalities with no known region when a region filter is active", () => {
    const result = filterListings(
      listings,
      { propertyType: null, horizon: null, regionCode: "06" },
      regionByMunicipality,
    );
    expect(result.map((item) => item.id)).toEqual(["a"]);
  });

  it("returns every listing when no filter is set", () => {
    expect(
      filterListings(
        listings,
        { propertyType: null, horizon: null, regionCode: null },
        regionByMunicipality,
      ),
    ).toHaveLength(4);
  });
});

describe("splitLocated", () => {
  it("only marks listings with finite coordinates as located", () => {
    const { located, unlocated } = splitLocated([
      listing({ id: "located" }),
      listing({ id: "no-lat", lat: null }),
      listing({ id: "no-lon", lon: null }),
      listing({ id: "nan", lat: Number.NaN, lon: Number.NaN }),
    ]);

    expect(located.map((item) => item.id)).toEqual(["located"]);
    expect(unlocated.map((item) => item.id)).toEqual(["no-lat", "no-lon", "nan"]);
  });
});

describe("groupByCity", () => {
  it("groups unlocated listings by city, sorted, newest first inside a city", () => {
    const groups = groupByCity([
      listing({ id: "mtl-old", city: "Montréal", createdAt: "2025-01-01T00:00:00.000Z" }),
      listing({ id: "laval", city: "Laval", createdAt: "2025-02-01T00:00:00.000Z" }),
      listing({ id: "mtl-new", city: "Montréal", createdAt: "2026-01-01T00:00:00.000Z" }),
      listing({ id: "unknown", city: "" }),
    ]);

    expect(groups.map((group) => group.city)).toEqual(["—", "Laval", "Montréal"]);
    expect(groups[2]?.listings.map((item) => item.id)).toEqual(["mtl-new", "mtl-old"]);
  });
});

describe("sortForList", () => {
  it("sorts by city then newest first", () => {
    const sorted = sortForList([
      listing({ id: "b", city: "Montréal", createdAt: "2025-01-01T00:00:00.000Z" }),
      listing({ id: "a", city: "Laval", createdAt: "2025-01-01T00:00:00.000Z" }),
      listing({ id: "c", city: "Montréal", createdAt: "2026-01-01T00:00:00.000Z" }),
    ]);

    expect(sorted.map((item) => item.id)).toEqual(["a", "c", "b"]);
  });
});
