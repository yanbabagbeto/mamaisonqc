/**
 * Tests for the pure finance helpers mirrored from `src/modules/owner/finance.ts`.
 * Run with `npm test` (Node's built-in test runner, TypeScript stripped natively).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  amortizationSchedule,
  centsToInputValue,
  equity,
  MAX_LTV_BP,
  maxLoanForLtv,
  mortgagePaymentCents,
  parseMoneyToCents,
  parseMonths,
  parseRateToBp,
  refinanceHeadroom,
  renewalScenario,
} from "./finance.ts";

describe("parseMoneyToCents", () => {
  it("accepts French-Canadian input with spaces, nbsp and a dollar sign", () => {
    assert.deepEqual(parseMoneyToCents("450 000"), { ok: true, value: 45_000_000 });
    assert.deepEqual(parseMoneyToCents("450\u00a0000,50 $"), { ok: true, value: 45_000_050 });
    assert.deepEqual(parseMoneyToCents("450000.50"), { ok: true, value: 45_000_050 });
    assert.deepEqual(parseMoneyToCents("0"), { ok: true, value: 0 });
  });

  it("rejects empty, malformed and out-of-range input", () => {
    assert.deepEqual(parseMoneyToCents("  "), { ok: false, reason: "empty" });
    assert.deepEqual(parseMoneyToCents("abc"), { ok: false, reason: "format" });
    assert.deepEqual(parseMoneyToCents("-5"), { ok: false, reason: "format" });
    assert.deepEqual(parseMoneyToCents("450 000,123"), { ok: false, reason: "format" });
    assert.deepEqual(parseMoneyToCents("999999999999"), { ok: false, reason: "range" });
  });
});

describe("parseRateToBp", () => {
  it("converts percentages to basis points", () => {
    assert.deepEqual(parseRateToBp("4,79"), { ok: true, value: 479 });
    assert.deepEqual(parseRateToBp("4,79 %"), { ok: true, value: 479 });
    assert.deepEqual(parseRateToBp("5"), { ok: true, value: 500 });
    assert.deepEqual(parseRateToBp("0"), { ok: true, value: 0 });
  });

  it("treats a rate typed in basis points as out of range", () => {
    assert.deepEqual(parseRateToBp("479"), { ok: false, reason: "range" });
    assert.deepEqual(parseRateToBp(""), { ok: false, reason: "empty" });
  });
});

describe("parseMonths", () => {
  it("adds years and extra months", () => {
    assert.deepEqual(parseMonths("25", "0"), { ok: true, value: 300 });
    assert.deepEqual(parseMonths("22", "6"), { ok: true, value: 270 });
    assert.deepEqual(parseMonths("25", ""), { ok: true, value: 300 });
  });

  it("rejects zero, more than 50 years and bad months", () => {
    assert.deepEqual(parseMonths("0", "0"), { ok: false, reason: "range" });
    assert.deepEqual(parseMonths("51", "0"), { ok: false, reason: "range" });
    assert.deepEqual(parseMonths("25", "12"), { ok: false, reason: "format" });
    assert.deepEqual(parseMonths("abc", "0"), { ok: false, reason: "format" });
  });
});

describe("mortgagePaymentCents", () => {
  it("degenerates to principal / months at a zero rate", () => {
    assert.equal(
      mortgagePaymentCents({ principalCents: 30_000_000, annualRateBp: 0, amortizationMonths: 300 }),
      100_000,
    );
  });

  it("matches the documented annuity formula M = P·r / (1 − (1+r)^−n)", () => {
    // Reference computed independently from the formula with r = 0,05/12 and n = 300.
    // 100 000 $ at 5,00 % over 25 years → 584,59 $/mois.
    assert.equal(
      mortgagePaymentCents({ principalCents: 10_000_000, annualRateBp: 500, amortizationMonths: 300 }),
      58_459,
    );
    // 300 000 $ at 5,00 % over 25 years → 1 753,77 $/mois.
    assert.equal(
      mortgagePaymentCents({ principalCents: 30_000_000, annualRateBp: 500, amortizationMonths: 300 }),
      175_377,
    );
  });

  it("returns 0 for a zero principal", () => {
    assert.equal(
      mortgagePaymentCents({ principalCents: 0, annualRateBp: 500, amortizationMonths: 300 }),
      0,
    );
  });
});

describe("amortizationSchedule", () => {
  it("ends at exactly zero and repays exactly the principal", () => {
    const rows = amortizationSchedule({
      principalCents: 25_000_000,
      annualRateBp: 479,
      amortizationMonths: 240,
    });
    assert.equal(rows.length, 240);
    assert.equal(rows.at(-1)?.balanceCents, 0);
    const principalRepaid = rows.reduce((sum, row) => sum + row.principalCents, 0);
    assert.equal(principalRepaid, 25_000_000);
  });

  it("truncates for display without changing earlier rows", () => {
    const full = amortizationSchedule({
      principalCents: 10_000_000,
      annualRateBp: 500,
      amortizationMonths: 300,
    });
    const truncated = amortizationSchedule({
      principalCents: 10_000_000,
      annualRateBp: 500,
      amortizationMonths: 300,
      maxRows: 3,
    });
    assert.equal(truncated.length, 3);
    assert.deepEqual(truncated, full.slice(0, 3));
  });
});

describe("equity", () => {
  it("computes positive equity and its percentage of the estimate", () => {
    assert.deepEqual(equity({ estimateCents: 50_000_000, balanceCents: 20_000_000 }), {
      equityCents: 30_000_000,
      equityPctBp: 6_000,
      negative: false,
    });
  });

  it("reports negative equity with the exact difference", () => {
    assert.deepEqual(equity({ estimateCents: 30_000_000, balanceCents: 32_000_000 }), {
      equityCents: -2_000_000,
      equityPctBp: -667,
      negative: true,
    });
  });

  it("reports 0 % when there is no usable estimate", () => {
    assert.deepEqual(equity({ estimateCents: 0, balanceCents: 10_000 }), {
      equityCents: -10_000,
      equityPctBp: 0,
      negative: true,
    });
  });
});

describe("refinanceHeadroom", () => {
  it("is capped by the 80 % LTV ceiling", () => {
    const result = refinanceHeadroom({
      estimateCents: 50_000_000,
      balanceCents: 20_000_000,
      maxLtvBp: MAX_LTV_BP,
    });
    assert.equal(maxLoanForLtv({ estimateCents: 50_000_000, maxLtvBp: MAX_LTV_BP }), 40_000_000);
    assert.deepEqual(result, { headroomCents: 20_000_000, limitedBy: "plafond" });
  });

  it("is zero when the balance reaches the ceiling", () => {
    assert.deepEqual(
      refinanceHeadroom({ estimateCents: 50_000_000, balanceCents: 45_000_000, maxLtvBp: MAX_LTV_BP }),
      { headroomCents: 0, limitedBy: "solde" },
    );
  });

  it("is 'aucune' without a usable estimate", () => {
    assert.deepEqual(
      refinanceHeadroom({ estimateCents: 0, balanceCents: 0, maxLtvBp: MAX_LTV_BP }),
      { headroomCents: 0, limitedBy: "aucune" },
    );
  });
});

describe("renewalScenario", () => {
  it("computes the payment delta when only the rate moves", () => {
    const result = renewalScenario({
      balanceCents: 20_000_000,
      currentRateBp: 350,
      newRateBp: 479,
      remainingMonths: 240,
    });
    assert.ok(result.newPaymentCents > result.currentPaymentCents);
    assert.equal(result.monthlyDeltaCents, result.newPaymentCents - result.currentPaymentCents);
    assert.equal(result.annualDeltaCents, result.monthlyDeltaCents * 12);
  });
});

describe("input prefill helpers", () => {
  it("formats cents and basis points without losing a cent", () => {
    assert.equal(centsToInputValue(43_934_300), "439343");
    assert.equal(centsToInputValue(45_000_050), "450000,50");
    assert.equal(centsToInputValue(-5), "0");
  });
});
