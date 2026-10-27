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
  // Reference case, Canadian fixed-rate (semi-annual compounding, Interest Act s. 6):
  //   P = 300 000,00 $ = 30 000 000 cents, nominal 5,00 % = 500 bp, n = 300 months
  //   i = (1 + 0,05/2)^(1/6) − 1 = 0,004123915465
  //   M = P × i / (1 − (1 + i)^−n) = 174 481,3… cents → 174 481 cents = 1 744,81 $
  it("returns the Canadian semi-annual payment for 300 000 $ at 5 % over 25 years", () => {
    expect(
      mortgagePaymentCents({ principalCents: 30_000_000, annualRateBp: 500, amortizationMonths: 300 }),
    ).toBe(174_481);
  });

  it("matches the user-reported case: 600 000 $ at 4,79 % over 300 months", () => {
    // 3 418,25 $ with semi-annual compounding; monthly compounding would overstate it at 3 434,52 $.
    expect(
      mortgagePaymentCents({ principalCents: 60_000_000, annualRateBp: 479, amortizationMonths: 300 }),
    ).toBe(341_825);
    expect(
      mortgagePaymentCents({
        principalCents: 60_000_000,
        annualRateBp: 479,
        amortizationMonths: 300,
        compounding: "monthly",
      }),
    ).toBe(343_452);
  });

  it("supports explicit monthly compounding for variable-rate illustrations", () => {
    expect(
      mortgagePaymentCents({
        principalCents: 30_000_000,
        annualRateBp: 500,
        amortizationMonths: 300,
        compounding: "monthly",
      }),
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

  it("applies the documented first month (semi-annual rate)", () => {
    // Month 1 interest: 30 000 000 × 0,004123915465 = 123 717 cents.
    // Principal portion: 174 481 − 123 717 = 50 764 cents.
    expect(rows[0]).toEqual({
      month: 1,
      paymentCents: 174_481,
      interestCents: 123_717,
      principalCents: 50_764,
      balanceCents: 29_949_236,
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
    // The last payment absorbs the rounding drift.
    expect(last).toEqual({
      month: 300,
      paymentCents: 174_778,
      interestCents: 718,
      principalCents: 174_060,
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
      currentPaymentCents: 166_992,
      newPaymentCents: 154_968,
      monthlyDeltaCents: -12_024,
      annualDeltaCents: -144_288,
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
