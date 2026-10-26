import { describe, expect, it } from "vitest";

import {
  amortizationSchedule,
  equity,
  maxLoanForLtv,
  mortgagePaymentCents,
  refinanceHeadroom,
  renewalScenario,
} from "./finance";

describe("mortgagePaymentCents", () => {
  // Reference case, computed by hand from M = P × r / (1 − (1 + r)^−n):
  //   P = 300 000,00 $ = 30 000 000 cents
  //   annual rate = 5,00 % = 500 bp → r = 0,05 / 12 = 0,0041666667
  //   n = 25 years × 12 = 300 months
  //   (1 + r)^−300 = 0,28724980…
  //   denominator = 1 − 0,28724980 = 0,71275020
  //   M = 30 000 000 × 0,0041666667 / 0,71275020 = 175 377,0124… cents
  //   rounded to the cent: 175 377 cents = 1 753,77 $
  it("returns the documented payment for 300 000 $ at 5 % over 25 years", () => {
    expect(
      mortgagePaymentCents({ principalCents: 30_000_000, annualRateBp: 500, amortizationMonths: 300 }),
    ).toBe(175_377);
  });

  it("handles a zero rate as principal divided by months, rounded", () => {
    expect(
      mortgagePaymentCents({ principalCents: 10_000_000, annualRateBp: 0, amortizationMonths: 7 }),
    ).toBe(1_428_571);
  });

  it("rounds a fractional cent to the nearest cent", () => {
    expect(mortgagePaymentCents({ principalCents: 100, annualRateBp: 0, amortizationMonths: 3 })).toBe(
      33,
    );
  });

  it("returns 0 for a zero principal", () => {
    expect(mortgagePaymentCents({ principalCents: 0, annualRateBp: 500, amortizationMonths: 300 })).toBe(
      0,
    );
  });

  it("rejects invalid inputs instead of guessing", () => {
    expect(() =>
      mortgagePaymentCents({ principalCents: -1, annualRateBp: 500, amortizationMonths: 300 }),
    ).toThrow(RangeError);
    expect(() =>
      mortgagePaymentCents({ principalCents: 1_000, annualRateBp: 500, amortizationMonths: 0 }),
    ).toThrow(RangeError);
    expect(() =>
      mortgagePaymentCents({ principalCents: 1_000, annualRateBp: -5, amortizationMonths: 12 }),
    ).toThrow(RangeError);
    expect(() =>
      mortgagePaymentCents({ principalCents: 1_000.5, annualRateBp: 500, amortizationMonths: 12 }),
    ).toThrow(RangeError);
  });
});

describe("amortizationSchedule", () => {
  const rows = amortizationSchedule({
    principalCents: 30_000_000,
    annualRateBp: 500,
    amortizationMonths: 300,
  });

  it("produces one row per monthly payment and ends at a zero balance", () => {
    expect(rows).toHaveLength(300);
    expect(rows.at(-1)?.balanceCents).toBe(0);
  });

  it("applies the documented first month", () => {
    // Month 1 interest: 30 000 000 × 0,05 / 12 = 125 000 cents = 1 250,00 $.
    // Principal portion: 175 377 − 125 000 = 50 377 cents.
    expect(rows[0]).toEqual({
      month: 1,
      paymentCents: 175_377,
      interestCents: 125_000,
      principalCents: 50_377,
      balanceCents: 29_949_623,
    });
  });

  it("sums the principal portions to exactly the amount borrowed", () => {
    const totalPrincipal = rows.reduce((sum, row) => sum + row.principalCents, 0);
    expect(Math.abs(totalPrincipal - 30_000_000)).toBeLessThanOrEqual(1);
  });

  it("keeps the last payment within a cent of the scheduled payment", () => {
    const last = rows.at(-1);
    expect(last).toBeDefined();
    expect(last?.month).toBe(300);
    // The last payment absorbs the rounding drift: 174 653 principal + 728 interest.
    expect(last).toEqual({
      month: 300,
      paymentCents: 175_381,
      interestCents: 728,
      principalCents: 174_653,
      balanceCents: 0,
    });
  });

  it("keeps every balance non-negative and strictly decreasing", () => {
    let previous = Number.POSITIVE_INFINITY;
    for (const row of rows) {
      expect(row.balanceCents).toBeGreaterThanOrEqual(0);
      expect(row.balanceCents).toBeLessThan(previous);
      previous = row.balanceCents;
    }
  });

  it("handles a zero rate and still repays exactly the principal", () => {
    const zeroRateRows = amortizationSchedule({
      principalCents: 10_000_000,
      annualRateBp: 0,
      amortizationMonths: 7,
    });
    expect(zeroRateRows).toHaveLength(7);
    expect(zeroRateRows[0]?.interestCents).toBe(0);
    expect(zeroRateRows.at(-1)?.paymentCents).toBe(1_428_574);
    expect(zeroRateRows.reduce((sum, row) => sum + row.principalCents, 0)).toBe(10_000_000);
  });

  it("truncates for display with maxRows without changing earlier rows", () => {
    const truncated = amortizationSchedule({
      principalCents: 30_000_000,
      annualRateBp: 500,
      amortizationMonths: 300,
      maxRows: 12,
    });
    expect(truncated).toHaveLength(12);
    expect(truncated[0]).toEqual(rows[0]);
    expect(truncated.at(-1)?.balanceCents).toBeGreaterThan(0);
  });

  it("returns an empty schedule for zero principal or maxRows = 0", () => {
    expect(
      amortizationSchedule({ principalCents: 0, annualRateBp: 500, amortizationMonths: 12 }),
    ).toEqual([]);
    expect(
      amortizationSchedule({
        principalCents: 1_000_000,
        annualRateBp: 500,
        amortizationMonths: 12,
        maxRows: 0,
      }),
    ).toEqual([]);
  });
});

describe("equity", () => {
  it("returns positive equity and its share of the estimate in basis points", () => {
    expect(equity({ estimateCents: 50_000_000, balanceCents: 42_000_000 })).toEqual({
      equityCents: 8_000_000,
      equityPctBp: 1_600,
      negative: false,
    });
  });

  it("rounds the percentage to the nearest basis point", () => {
    expect(equity({ estimateCents: 30_000_000, balanceCents: 10_000_000 })).toEqual({
      equityCents: 20_000_000,
      equityPctBp: 6_667,
      negative: false,
    });
  });

  it("flags negative equity with the exact deficit", () => {
    expect(equity({ estimateCents: 40_000_000, balanceCents: 45_000_000 })).toEqual({
      equityCents: -5_000_000,
      equityPctBp: -1_250,
      negative: true,
    });
  });

  it("does not invent a percentage when no estimate exists", () => {
    expect(equity({ estimateCents: 0, balanceCents: 5_000_000 })).toEqual({
      equityCents: -5_000_000,
      equityPctBp: 0,
      negative: true,
    });
  });
});

describe("refinanceHeadroom", () => {
  it("computes the room left under an 80 % LTV ceiling", () => {
    expect(
      refinanceHeadroom({ estimateCents: 50_000_000, balanceCents: 30_000_000, maxLtvBp: 8_000 }),
    ).toEqual({ headroomCents: 10_000_000, limitedBy: "plafond" });
    expect(maxLoanForLtv({ estimateCents: 50_000_000, maxLtvBp: 8_000 })).toBe(40_000_000);
  });

  it("caps the headroom at 0 when the balance exceeds the ceiling", () => {
    expect(
      refinanceHeadroom({ estimateCents: 40_000_000, balanceCents: 45_000_000, maxLtvBp: 8_000 }),
    ).toEqual({ headroomCents: 0, limitedBy: "solde" });
  });

  it("returns 0 exactly when the balance sits at the ceiling", () => {
    expect(
      refinanceHeadroom({ estimateCents: 40_000_000, balanceCents: 32_000_000, maxLtvBp: 8_000 }),
    ).toEqual({ headroomCents: 0, limitedBy: "solde" });
  });

  it("reports no basis when there is no estimate", () => {
    expect(
      refinanceHeadroom({ estimateCents: 0, balanceCents: 0, maxLtvBp: 8_000 }),
    ).toEqual({ headroomCents: 0, limitedBy: "aucune" });
  });
});

describe("renewalScenario", () => {
  it("compares the payment at the current rate and at a new rate", () => {
    const result = renewalScenario({
      balanceCents: 25_000_000,
      currentRateBp: 520,
      newRateBp: 430,
      remainingMonths: 240,
    });
    expect(result).toEqual({
      currentPaymentCents: 167_764,
      newPaymentCents: 155_476,
      monthlyDeltaCents: -12_288,
      annualDeltaCents: -147_456,
      remainingMonths: 240,
    });
  });

  it("returns a zero delta when the rate does not change", () => {
    const result = renewalScenario({
      balanceCents: 10_000_000,
      currentRateBp: 500,
      newRateBp: 500,
      remainingMonths: 120,
    });
    expect(result.monthlyDeltaCents).toBe(0);
    expect(result.annualDeltaCents).toBe(0);
  });

  it("rejects a non-positive remaining amortization", () => {
    expect(() =>
      renewalScenario({
        balanceCents: 10_000_000,
        currentRateBp: 500,
        newRateBp: 400,
        remainingMonths: 0,
      }),
    ).toThrow(RangeError);
  });
});
