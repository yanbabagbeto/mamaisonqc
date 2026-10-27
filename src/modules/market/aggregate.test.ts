import { describe, expect, it } from "vitest";

import {
  aggregatePriceBands,
  cleanTerritoryName,
  buildSeries,
  buildValueBands,
  median,
  medianBand,
  parsePriceBandLabel,
  preferRegionTotals,
  quantile,
  seriesTotals,
  summarizeUnitsByType,
  sumCountsByPeriod,
  sumSeries,
  takeLatestPeriods,
  type MarketSeriesPoint,
} from "./aggregate";

describe("parsePriceBandLabel", () => {
  it("parses the source's dash format", () => {
    expect(parsePriceBandLabel("300000-349999")).toEqual({
      minCents: 30_000_000,
      maxCents: 34_999_900,
    });
  });

  it("parses a French label with spaces and dollar signs", () => {
    expect(parsePriceBandLabel("300 000 $ à 349 999 $")).toEqual({
      minCents: 30_000_000,
      maxCents: 34_999_900,
    });
  });

  it("parses an open low band", () => {
    expect(parsePriceBandLabel("Moins de 250 000 $")).toEqual({ minCents: null, maxCents: 25_000_000 });
  });

  it("parses an open high band", () => {
    expect(parsePriceBandLabel("1 000 000 $ et plus")).toEqual({ minCents: 100_000_000, maxCents: null });
  });

  it("returns null rather than guessing an unreadable shape", () => {
    expect(parsePriceBandLabel("Non disponible")).toBeNull();
    expect(parsePriceBandLabel("")).toBeNull();
    expect(parsePriceBandLabel("250 000 $")).toBeNull();
  });
});

describe("aggregatePriceBands", () => {
  it("sums counts per label and sorts from low to high", () => {
    const bands = aggregatePriceBands([
      { priceBand: "500 000 $ et plus", count: 2 },
      { priceBand: "moins de 250 000 $", count: 4 },
      { priceBand: "250 000 $ à 499 999 $", count: 3 },
      { priceBand: "moins de 250 000 $", count: 1 },
    ]);
    expect(bands.map((band) => band.label)).toEqual([
      "moins de 250 000 $",
      "250 000 $ à 499 999 $",
      "500 000 $ et plus",
    ]);
    expect(bands[0]?.count).toBe(5);
    expect(bands[2]?.minCents).toBe(50_000_000);
    expect(bands[2]?.maxCents).toBeNull();
  });

  it("keeps unknown labels and their counts at the end", () => {
    const bands = aggregatePriceBands([
      { priceBand: "format inconnu", count: 7 },
      { priceBand: "0-99 999", count: 2 },
    ]);
    expect(bands).toHaveLength(2);
    expect(bands[0]?.label).toBe("0-99 999");
    expect(bands[1]?.label).toBe("format inconnu");
    expect(bands[1]?.count).toBe(7);
  });

  it("ignores rows without a band (plain counts)", () => {
    expect(aggregatePriceBands([{ priceBand: null, count: 10 }])).toEqual([]);
  });

  it("returns an empty array for empty input", () => {
    expect(aggregatePriceBands([])).toEqual([]);
  });
});

describe("medianBand", () => {
  it("returns the band where cumulative sales cross 50 %", () => {
    const bands = aggregatePriceBands([
      { priceBand: "0-199 999", count: 2 },
      { priceBand: "200 000-299 999", count: 4 },
      { priceBand: "300 000 et plus", count: 4 },
    ]);
    expect(medianBand(bands)?.label).toBe("200 000-299 999");
  });

  it("returns null when there is no sale", () => {
    expect(medianBand([])).toBeNull();
  });
});

describe("median", () => {
  it("returns null for empty input", () => {
    expect(median([])).toBeNull();
  });

  it("returns the middle value for an odd count", () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it("interpolates between the two middle values for an even count", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([1, 2])).toBe(1.5);
  });

  it("keeps a real zero distinct from a missing value", () => {
    expect(median([100, 0, 200])).toBe(100);
    expect(median([0])).toBe(0);
  });
});

describe("quantile", () => {
  it("returns the bounds at p=0 and p=1", () => {
    expect(quantile([10, 20, 30], 0)).toBe(10);
    expect(quantile([10, 20, 30], 1)).toBe(30);
  });

  it("interpolates in the middle", () => {
    expect(quantile([0, 10], 0.5)).toBe(5);
  });

  it("returns null for empty input", () => {
    expect(quantile([], 0.5)).toBeNull();
  });
});

describe("buildValueBands", () => {
  it("builds explicit dollar edges from real values", () => {
    const values = [
      15_000_000, 20_000_000, 25_000_000, 30_000_000, 35_000_000,
    ];
    const bands = buildValueBands(values);
    // Quantiles of the five real values, rounded up to the next 10 000 $.
    expect(bands.map((band) => band.minCents)).toEqual([
      15_000_000, 19_000_000, 23_000_000, 27_000_000, 31_000_000,
    ]);
    expect(bands[0]?.maxCents).toBe(18_999_900);
    expect(bands[bands.length - 1]?.maxCents).toBeNull();
    expect(bands.reduce((total, band) => total + band.count, 0)).toBe(values.length);
  });

  it("collapses to one open band when every value is identical", () => {
    const bands = buildValueBands([10_000_000, 10_000_000, 10_000_000]);
    expect(bands).toEqual([{ minCents: 10_000_000, maxCents: null, count: 3 }]);
  });

  it("returns an empty array for empty input", () => {
    expect(buildValueBands([])).toEqual([]);
  });
});

describe("takeLatestPeriods", () => {
  it("keeps only the 12 most recent periods, ascending, without duplicates", () => {
    const periods = [
      "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06",
      "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12",
      "2025-01", "2025-01",
    ];
    const window = takeLatestPeriods(periods, 12);
    expect(window).toHaveLength(12);
    expect(window[0]).toBe("2024-02");
    expect(window[window.length - 1]).toBe("2025-01");
    expect(window).toEqual([...window].sort());
  });

  it("returns an empty array for empty input", () => {
    expect(takeLatestPeriods([], 12)).toEqual([]);
  });
});

describe("buildSeries", () => {
  it("aligns each kind on the window and keeps missing kinds null", () => {
    const series = buildSeries(
      [
        { period: "2026-01", kind: "ventes", count: 5 },
        { period: "2026-01", kind: "ventes", count: 2 },
        { period: "2026-01", kind: "hypotheques", count: 0 },
        { period: "2026-02", kind: "ventes", count: 1 },
      ],
      ["2026-01", "2026-02", "2026-03"],
    );
    expect(series).toEqual([
      { period: "2026-01", ventes: 7, hypotheques: 0, difficultes: null },
      { period: "2026-02", ventes: 1, hypotheques: null, difficultes: null },
      { period: "2026-03", ventes: null, hypotheques: null, difficultes: null },
    ]);
  });
});

describe("series totals", () => {
  const series: MarketSeriesPoint[] = [
    { period: "2026-01", ventes: 2, hypotheques: null, difficultes: 1 },
    { period: "2026-02", ventes: 3, hypotheques: 4, difficultes: null },
  ];

  it("sums only the periods that published a value", () => {
    expect(sumSeries(series, "ventes")).toBe(5);
    expect(sumSeries(series, "hypotheques")).toBe(4);
    expect(sumSeries(series, "difficultes")).toBe(1);
  });

  it("returns null when a kind was never published", () => {
    const empty: MarketSeriesPoint[] = [
      { period: "2026-01", ventes: null, hypotheques: null, difficultes: null },
    ];
    expect(sumSeries(empty, "ventes")).toBeNull();
    expect(seriesTotals(empty)).toEqual({ ventes: null, hypotheques: null, difficultes: null });
  });
});

describe("sumCountsByPeriod", () => {
  it("sums duplicate rows and keeps absent periods null", () => {
    expect(
      sumCountsByPeriod(
        [
          { period: "2026-01", count: 2 },
          { period: "2026-01", count: 3 },
        ],
        ["2026-01", "2026-02"],
      ),
    ).toEqual([5, null]);
  });
});

describe("preferRegionTotals", () => {
  it("prefers region-level rows over municipal rows to avoid double counting", () => {
    const rows = [
      { municipalityCode: null, count: 10 },
      { municipalityCode: "66023", count: 4 },
    ];
    expect(preferRegionTotals(rows)).toEqual([{ municipalityCode: null, count: 10 }]);
  });

  it("falls back to municipal rows when the source has no region totals", () => {
    const rows = [
      { municipalityCode: "66023", count: 4 },
      { municipalityCode: "65005", count: 6 },
    ];
    expect(preferRegionTotals(rows)).toEqual(rows);
  });

  it("returns an empty array for empty input", () => {
    expect(preferRegionTotals([])).toEqual([]);
  });
});

describe("summarizeUnitsByType", () => {
  it("counts units and computes medians per type, ignoring null land areas", () => {
    const summaries = summarizeUnitsByType([
      { propertyType: "unifamiliale", valueTotalCents: 30_000_000, landAreaM2: 500 },
      { propertyType: "unifamiliale", valueTotalCents: 40_000_000, landAreaM2: null },
      { propertyType: "unifamiliale", valueTotalCents: 50_000_000, landAreaM2: 700 },
      { propertyType: "plex", valueTotalCents: 70_000_000, landAreaM2: 300 },
    ]);
    expect(summaries.map((summary) => summary.propertyType)).toEqual(["unifamiliale", "plex"]);
    expect(summaries[0]).toEqual({
      propertyType: "unifamiliale",
      count: 3,
      medianValueCents: 40_000_000,
      medianLandAreaM2: 600,
    });
    expect(summaries[1]?.medianLandAreaM2).toBe(300);
  });

  it("returns an empty array when no unit is ingested", () => {
    expect(summarizeUnitsByType([])).toEqual([]);
  });
});

describe("cleanTerritoryName", () => {
  it("turns the source double hyphen into a single en dash", () => {
    expect(cleanTerritoryName("Gaspésie--Îles-de-la-Madeleine")).toBe("Gaspésie–Îles-de-la-Madeleine");
    expect(cleanTerritoryName("Saguenay--Lac-Saint-Jean")).toBe("Saguenay–Lac-Saint-Jean");
  });

  it("leaves ordinary hyphenated names untouched", () => {
    expect(cleanTerritoryName("Les Îles-de-la-Madeleine")).toBe("Les Îles-de-la-Madeleine");
    expect(cleanTerritoryName("  Montréal  ")).toBe("Montréal");
  });
});
