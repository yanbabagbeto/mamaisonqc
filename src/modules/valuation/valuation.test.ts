import { describe, expect, it } from "vitest";

import { findComparables, findComparablesWithTier } from "./comparables";
import {
  confidenceFor,
  estimateProperty,
  isDispersionExtreme,
  MIN_COMPARABLES_FOR_ESTIMATE,
} from "./estimate";
import { coefficientOfVariation, median, percentile, weightedMedian } from "./stats";
import type { PropertyRecord } from "./types";

/** Roll values are integer cents everywhere (docs/DATA-CONTRACT.md). */
function dollars(amount: number): number {
  return Math.round(amount * 100);
}

function unit(overrides: Partial<PropertyRecord> & { id: string }): PropertyRecord {
  return {
    municipalityCode: "66023",
    umv: "U1",
    cubf: "1000",
    propertyType: "unifamiliale",
    addrNo: "100",
    addrStreet: "Rue Exemple",
    addrSuite: null,
    landAreaM2: 600,
    yearBuilt: 1970,
    valueTotalCents: dollars(400_000),
    marketRefDate: "2025-07-01",
    rollYear: 2026,
    datasetId: "role-evaluation-2026",
    ...overrides,
    id: overrides.id,
    matricule: overrides.matricule ?? overrides.id,
  };
}

const subject = unit({ id: "sub", matricule: "SUB-1", valueTotalCents: dollars(420_000) });

describe("median", () => {
  it("returns null for an empty sample", () => {
    expect(median([])).toBeNull();
  });

  it("returns the middle value for an odd sample", () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it("averages the two middle values for an even sample", () => {
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });
});

describe("weightedMedian", () => {
  it("returns null for an empty sample", () => {
    expect(weightedMedian([])).toBeNull();
  });

  it("moves the median toward the heavier weight", () => {
    expect(
      weightedMedian([
        { value: 100, weight: 1 },
        { value: 200, weight: 3 },
      ]),
    ).toBe(200);
  });

  it("averages the two values on an exact half split", () => {
    expect(
      weightedMedian([
        { value: 100, weight: 1 },
        { value: 300, weight: 1 },
      ]),
    ).toBe(200);
  });

  it("ignores non-positive or non-finite weights", () => {
    expect(
      weightedMedian([
        { value: 100, weight: 0 },
        { value: 200, weight: -2 },
        { value: 300, weight: Number.NaN },
        { value: 500, weight: 1 },
      ]),
    ).toBe(500);
  });
});

describe("percentile", () => {
  it("returns null for an empty sample", () => {
    expect(percentile([], 0.25)).toBeNull();
  });

  it("linearly interpolates P25 and P75", () => {
    const values = [100, 200, 300, 400];
    expect(percentile(values, 0.25)).toBe(175);
    expect(percentile(values, 0.75)).toBe(325);
  });

  it("returns the single value when the sample has one element", () => {
    expect(percentile([100], 0.25)).toBe(100);
    expect(percentile([100], 0.75)).toBe(100);
  });
});

describe("coefficientOfVariation", () => {
  it("computes the population CV", () => {
    expect(coefficientOfVariation([400, 500])).toBeCloseTo(50 / 450, 10);
  });

  it("returns null below two values or with a zero mean", () => {
    expect(coefficientOfVariation([400])).toBeNull();
    expect(coefficientOfVariation([0, 0])).toBeNull();
  });
});

describe("confidenceFor", () => {
  it("is elevee from 8 comparables with CV under 0.25", () => {
    expect(confidenceFor(8, 0.24)).toBe("elevee");
    expect(confidenceFor(12, 0.05)).toBe("elevee");
  });

  it("is moyenne at the CV boundary, without a CV, and from 4 comparables", () => {
    expect(confidenceFor(8, 0.25)).toBe("moyenne");
    expect(confidenceFor(8, null)).toBe("moyenne");
    expect(confidenceFor(4, null)).toBe("moyenne");
  });

  it("is faible below 4 comparables", () => {
    expect(confidenceFor(3, 0.1)).toBe("faible");
    expect(confidenceFor(0, 0.1)).toBe("faible");
  });
});

describe("findComparables", () => {
  it("excludes the subject and keeps only the same municipality + UMV + CUBF + area band", () => {
    const sameEverything = unit({ id: "same", valueTotalCents: dollars(410_000) });
    const sameStreetFarArea = unit({ id: "far-area", landAreaM2: 1000 });
    const otherUmv = unit({ id: "other-umv", umv: "U2" });
    const otherCubf = unit({ id: "other-cubf", cubf: "2000" });
    const otherMunicipality = unit({ id: "other-muni", municipalityCode: "65005" });

    const selection = findComparablesWithTier(subject, [
      subject,
      sameEverything,
      sameStreetFarArea,
      otherUmv,
      otherCubf,
      otherMunicipality,
    ]);

    expect(selection.tier).toBe("umv-cubf-area");
    expect(selection.comparables.map((comparable) => comparable.id)).toEqual(["same"]);
  });

  it("falls back to the same UMV when the area band excludes everything", () => {
    const farArea = unit({ id: "far", landAreaM2: 1000 });
    const differentUse = unit({ id: "other-use", cubf: "2000" });

    const selection = findComparablesWithTier(subject, [farArea, differentUse]);

    expect(selection.tier).toBe("umv");
    expect(selection.comparables.map((comparable) => comparable.id).sort()).toEqual([
      "far",
      "other-use",
    ]);
  });

  it("falls back to the same municipality + CUBF when the UMV has no other unit", () => {
    const otherUmv = unit({ id: "other-umv", umv: "U9" });

    const selection = findComparablesWithTier(subject, [otherUmv]);

    expect(selection.tier).toBe("municipality-cubf");
    expect(selection.comparables.map((comparable) => comparable.id)).toEqual(["other-umv"]);
  });

  it("returns no comparable and a null tier for an empty or unrelated pool", () => {
    expect(findComparablesWithTier(subject, [])).toEqual({ tier: null, comparables: [] });
    const unrelated = unit({ id: "unrelated", umv: "U9", cubf: "9000", landAreaM2: 2000 });
    expect(findComparablesWithTier(subject, [unrelated]).comparables).toHaveLength(0);
  });

  it("never matches on a null UMV or CUBF", () => {
    const bare = unit({ id: "bare", umv: null, cubf: null });
    expect(findComparables(subject, [bare])).toHaveLength(0);
  });

  it("orders by value descending then id ascending", () => {
    const high = unit({ id: "c", valueTotalCents: dollars(500_000) });
    const low = unit({ id: "b", valueTotalCents: dollars(450_000) });
    const tieA = unit({ id: "a", valueTotalCents: dollars(450_000) });

    const comparables = findComparables(subject, [low, high, tieA]);

    expect(comparables.map((comparable) => comparable.id)).toEqual(["c", "a", "b"]);
  });

  it("caps the set at 12 comparables", () => {
    const pool = Array.from({ length: 15 }, (_, index) =>
      unit({
        id: `comp-${String(index).padStart(2, "0")}`,
        valueTotalCents: dollars(400_000 + index * 1_000),
      }),
    );

    const comparables = findComparables(subject, pool);

    expect(comparables).toHaveLength(12);
    // Highest values first, so the three lowest are dropped.
    expect(comparables[0]?.valueTotalCents).toBe(dollars(414_000));
    expect(comparables[11]?.valueTotalCents).toBe(dollars(403_000));
  });

  it("weights a comparable by its relative land-area distance", () => {
    const atBoundary = unit({ id: "boundary", landAreaM2: 750 });
    const noArea = unit({ id: "no-area", landAreaM2: null });

    const selection = findComparablesWithTier(subject, [atBoundary, noArea]);
    const boundary = selection.comparables.find((comparable) => comparable.id === "boundary");
    const noAreaComp = selection.comparables.find((comparable) => comparable.id === "no-area");

    expect(boundary?.areaDistanceRatio).toBeCloseTo(0.25, 10);
    expect(boundary?.weight).toBeCloseTo(4, 10);
    expect(noAreaComp?.areaDistanceRatio).toBeNull();
    expect(noAreaComp?.weight).toBe(1);
  });

  it("excludes zero-value roll units", () => {
    const zeroValue = unit({ id: "zero", valueTotalCents: 0 });
    expect(findComparables(subject, [zeroValue])).toHaveLength(0);
  });
});

describe("estimateProperty", () => {
  it("returns the roll value ±15 % with faible confidence when there is no comparable", () => {
    const result = estimateProperty(subject, []);

    expect(result.method).toBe("comparables-umv");
    expect(result.comparablesCount).toBe(0);
    expect(result.comparables).toEqual([]);
    expect(result.confidence).toBe("faible");
    expect(result.comparablesTier).toBeNull();
    expect(result.estimateAvailable).toBe(false);
    expect(result.insufficientReason).toBe("no-comparables");
    expect(result.estimateCents).toBe(dollars(420_000));
    expect(result.lowCents).toBe(dollars(357_000));
    expect(result.highCents).toBe(dollars(483_000));
  });

  it("handles a single comparable with a ±15 % range and faible confidence", () => {
    const only = unit({ id: "only", valueTotalCents: dollars(350_000), landAreaM2: 600 });
    const result = estimateProperty(subject, [only]);

    expect(result.comparablesCount).toBe(1);
    expect(result.estimateCents).toBe(dollars(350_000));
    expect(result.comparablesTier).toBe("umv-cubf-area");
    expect(result.estimateAvailable).toBe(false);
    expect(result.insufficientReason).toBe("too-few");
    expect(result.lowCents).toBe(dollars(297_500));
    expect(result.highCents).toBe(dollars(402_500));
    expect(result.confidence).toBe("faible");
  });

  it("uses the weighted median and P25/P75 for three comparables", () => {
    const pool = [
      unit({ id: "a", valueTotalCents: dollars(300_000) }),
      unit({ id: "b", valueTotalCents: dollars(400_000) }),
      unit({ id: "c", valueTotalCents: dollars(500_000) }),
    ];

    const result = estimateProperty(subject, pool);

    expect(result.comparablesCount).toBe(MIN_COMPARABLES_FOR_ESTIMATE);
    expect(result.estimateCents).toBe(dollars(400_000));
    expect(result.lowCents).toBe(dollars(350_000));
    expect(result.highCents).toBe(dollars(450_000));
    expect(result.estimateAvailable).toBe(true);
    expect(result.insufficientReason).toBeNull();
    // 3 comparables cannot claim moyenne confidence even with a tight spread.
    expect(result.confidence).toBe("faible");
  });

  it("is moyenne from four comparables", () => {
    const pool = [
      unit({ id: "a", valueTotalCents: dollars(300_000) }),
      unit({ id: "b", valueTotalCents: dollars(400_000) }),
      unit({ id: "c", valueTotalCents: dollars(500_000) }),
      unit({ id: "d", valueTotalCents: dollars(600_000) }),
    ];

    const result = estimateProperty(subject, pool);

    // Even count: weighted median averages the two middle values with equal weights.
    expect(result.estimateCents).toBe(dollars(450_000));
    expect(result.lowCents).toBe(dollars(375_000));
    expect(result.highCents).toBe(dollars(525_000));
    expect(result.confidence).toBe("moyenne");
  });

  it("is elevee with eight tight comparables (CV under 0.25)", () => {
    const pool = Array.from({ length: 8 }, (_, index) =>
      unit({
        id: `comp-${index}`,
        valueTotalCents: dollars(400_000 + index * 10_000),
      }),
    );

    const result = estimateProperty(subject, pool);

    expect(result.comparablesCount).toBe(8);
    expect(result.estimateCents).toBe(dollars(435_000));
    expect(result.lowCents).toBe(dollars(417_500));
    expect(result.highCents).toBe(dollars(452_500));
    expect(result.confidence).toBe("elevee");
  });

  it("caps an upward surface adjustment at +15 %", () => {
    // Same UMV but another CUBF, so the second tier drops the ±25 % area rule.
    const pool = Array.from({ length: 3 }, (_, index) =>
      unit({
        id: `small-${index}`,
        cubf: "2000",
        landAreaM2: 100,
        valueTotalCents: dollars(400_000),
      }),
    );
    const wideSubject = unit({ id: "wide", landAreaM2: 1000 });

    const result = estimateProperty(wideSubject, pool);

    expect(result.estimateCents).toBe(dollars(460_000));
    expect(result.comparablesTier).toBe("umv");
    expect(result.lowCents).toBe(dollars(460_000));
    expect(result.highCents).toBe(dollars(460_000));
  });

  it("caps a downward surface adjustment at −15 %", () => {
    const pool = Array.from({ length: 3 }, (_, index) =>
      unit({
        id: `large-${index}`,
        landAreaM2: 1000,
        valueTotalCents: dollars(400_000),
      }),
    );
    const smallSubject = unit({ id: "small", landAreaM2: 100 });

    const result = estimateProperty(smallSubject, pool);

    expect(result.estimateCents).toBe(dollars(340_000));
  });

  it("applies the documented 4th-root adjustment inside the cap", () => {
    const pool = Array.from({ length: 3 }, (_, index) =>
      unit({
        id: `mid-${index}`,
        landAreaM2: 1000,
        valueTotalCents: dollars(400_000),
      }),
    );
    const midSubject = unit({ id: "mid-subject", landAreaM2: 700 });

    const result = estimateProperty(midSubject, pool);
    const expected = Math.round(dollars(400_000) * 0.7 ** 0.25);

    expect(result.estimateCents).toBe(expected);
  });

  it("reports the municipality + CUBF fallback tier so the UI can disclose it", () => {
    const pool = [
      unit({ id: "other-umv", umv: "U9", valueTotalCents: dollars(420_000) }),
    ];
    const result = estimateProperty(subject, pool);

    expect(result.comparablesTier).toBe("municipality-cubf");
    expect(result.comparablesCount).toBe(1);
    expect(result.estimateAvailable).toBe(false);
    expect(result.insufficientReason).toBe("too-few");
  });

  it("flags a dispersed set via the P75/P25 ratio or the coefficient of variation", () => {
    expect(isDispersionExtreme([dollars(100_000), dollars(110_000), dollars(1_000_000), dollars(2_000_000)])).toBe(true);
    expect(isDispersionExtreme([dollars(300_000), dollars(400_000), dollars(500_000)])).toBe(false);
    // Fewer than 3 values is handled by the count rule, not the dispersion rule.
    expect(isDispersionExtreme([dollars(1), dollars(10_000_000)])).toBe(false);
  });

  it("excludes far-area tier-3 comparables and returns no estimate for the 264 Sainte-Catherine shape", () => {
    const subject264 = unit({
      id: "264-sainte-catherine",
      umv: "2044",
      cubf: "1000",
      propertyType: "plex",
      landAreaM2: 170.9,
      valueTotalCents: dollars(1_073_800),
    });
    const result = estimateProperty(subject264, [
      unit({ id: "100-de-gaspe", umv: "1101", cubf: "1000", propertyType: "plex", landAreaM2: 341_606, valueTotalCents: 70_478_000_000 }),
      unit({ id: "297-robert-bourassa", umv: "6637", cubf: "1000", propertyType: "plex", landAreaM2: 3141.6, valueTotalCents: 17_457_000_000 }),
    ]);

    expect(result.comparablesCount).toBe(0);
    expect(result.comparablesTier).toBeNull();
    expect(result.estimateAvailable).toBe(false);
    expect(result.insufficientReason).toBe("no-comparables");
  });

  it("accepts tier-3 comparables inside the widened ±60 % area band and keeps the estimate sane", () => {
    const subject264 = unit({
      id: "264-sainte-catherine",
      umv: "2044",
      cubf: "1000",
      propertyType: "plex",
      landAreaM2: 170.9,
      valueTotalCents: dollars(1_073_800),
    });
    const result = estimateProperty(subject264, [
      unit({ id: "near-1", umv: "9001", cubf: "1000", propertyType: "plex", landAreaM2: 200, valueTotalCents: dollars(1_000_000) }),
      unit({ id: "near-2", umv: "9002", cubf: "1000", propertyType: "plex", landAreaM2: 210, valueTotalCents: dollars(1_100_000) }),
      unit({ id: "near-3", umv: "9003", cubf: "1000", propertyType: "plex", landAreaM2: 180, valueTotalCents: dollars(1_200_000) }),
    ]);

    expect(result.comparablesTier).toBe("municipality-cubf");
    expect(result.comparablesCount).toBe(3);
    expect(result.estimateAvailable).toBe(true);
    expect(result.estimateCents).toBeGreaterThanOrEqual(dollars(1_073_800) * 0.4);
    expect(result.estimateCents).toBeLessThanOrEqual(dollars(1_073_800) * 1.6);
  });

  it("suppresses a fallback-tier estimate that diverges more than 60 % from the roll value", () => {
    const subject264 = unit({
      id: "264-sainte-catherine",
      umv: "2044",
      cubf: "1000",
      propertyType: "plex",
      landAreaM2: 170.9,
      valueTotalCents: dollars(1_073_800),
    });
    const result = estimateProperty(subject264, [
      unit({ id: "rich-1", propertyType: "plex", umv: "9001", cubf: "1000", landAreaM2: 200, valueTotalCents: dollars(5_000_000) }),
      unit({ id: "rich-2", propertyType: "plex", umv: "9002", cubf: "1000", landAreaM2: 210, valueTotalCents: dollars(5_100_000) }),
      unit({ id: "rich-3", propertyType: "plex", umv: "9003", cubf: "1000", landAreaM2: 180, valueTotalCents: dollars(5_200_000) }),
    ]);

    expect(result.comparablesTier).toBe("municipality-cubf");
    expect(result.comparablesCount).toBe(3);
    expect(result.estimateAvailable).toBe(false);
    expect(result.insufficientReason).toBe("implausible");
  });

  it("suppresses the estimate when the comparable values are too dispersed", () => {
    const dispersedSubject = unit({ id: "dispersed-subject", umv: "2044", cubf: "1000", landAreaM2: 200 });
    const result = estimateProperty(dispersedSubject, [
      unit({ id: "d1", umv: "9001", landAreaM2: 200, valueTotalCents: dollars(100_000) }),
      unit({ id: "d2", umv: "9002", landAreaM2: 200, valueTotalCents: dollars(110_000) }),
      unit({ id: "d3", umv: "9003", landAreaM2: 200, valueTotalCents: dollars(1_000_000) }),
      unit({ id: "d4", umv: "9004", landAreaM2: 200, valueTotalCents: dollars(2_000_000) }),
    ]);

    expect(result.comparablesCount).toBe(4);
    expect(result.insufficientReason).toBe("dispersion");
    expect(result.estimateAvailable).toBe(false);
    // The hidden numbers fall back to the roll value, not to the absurd median.
    expect(result.estimateCents).toBe(dollars(400_000));
  });

  it("keeps the estimate inside the P25–P75 range", () => {
    const pool = Array.from({ length: 6 }, (_, index) =>
      unit({
        id: `comp-${index}`,
        valueTotalCents: dollars(300_000 + index * 20_000),
      }),
    );
    const result = estimateProperty(subject, pool);

    expect(result.lowCents).toBeLessThanOrEqual(result.estimateCents);
    expect(result.highCents).toBeGreaterThanOrEqual(result.estimateCents);
    expect(result.comparablesCount).toBe(6);
  });
});


describe("property-type homogeneity", () => {
  it("never mixes a plex into the comparables of a single-family home", () => {
    const subject = unit({ id: "s", matricule: "s", propertyType: "unifamiliale" });
    const sameType = unit({ id: "a", matricule: "a", propertyType: "unifamiliale" });
    const plex = unit({ id: "b", matricule: "b", propertyType: "plex" });

    const result = findComparablesWithTier(subject, [sameType, plex]);
    expect(result.comparables.map((c) => c.id)).toEqual(["a"]);
  });
});
