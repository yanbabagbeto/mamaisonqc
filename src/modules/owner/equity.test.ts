import { describe, expect, it } from "vitest";

import { bpToInputValue, centsToInputValue, parseMoneyToCents, parseMonths, parseRateToBp } from "./money-input";
import { initialEquityStateFromRoll, parseEquityInput, MAX_LTV_BP } from "./equity";

describe("parseMoneyToCents", () => {
  it("parses French-Canadian amounts without floating point", () => {
    expect(parseMoneyToCents("450 000")).toEqual({ ok: true, value: 45_000_000 });
    expect(parseMoneyToCents("450\u00a0000,50 $")).toEqual({ ok: true, value: 45_000_050 });
    expect(parseMoneyToCents("1 234,5")).toEqual({ ok: true, value: 123_450 });
    expect(parseMoneyToCents("439343.00")).toEqual({ ok: true, value: 43_934_300 });
    expect(parseMoneyToCents("0")).toEqual({ ok: true, value: 0 });
  });

  it("rejects empty, malformed, negative and oversized values", () => {
    expect(parseMoneyToCents("")).toEqual({ ok: false, reason: "empty" });
    expect(parseMoneyToCents("   ")).toEqual({ ok: false, reason: "empty" });
    expect(parseMoneyToCents("12abc")).toEqual({ ok: false, reason: "format" });
    expect(parseMoneyToCents("-5")).toEqual({ ok: false, reason: "format" });
    // A single separator followed by exactly 3 digits is a thousands separator, in both languages.
    expect(parseMoneyToCents("1,234")).toEqual({ ok: true, value: 123_400 });
    expect(parseMoneyToCents("450,000.50")).toEqual({ ok: true, value: 45_000_050 });
    expect(parseMoneyToCents("1.234,56")).toEqual({ ok: true, value: 123_456 });
    expect(parseMoneyToCents("1,234,567")).toEqual({ ok: true, value: 123_456_700 });
    expect(parseMoneyToCents("999 999 999 999")).toEqual({ ok: false, reason: "range" });
  });
});

describe("parseRateToBp", () => {
  it("converts percentages to basis points", () => {
    expect(parseRateToBp("4,79")).toEqual({ ok: true, value: 479 });
    expect(parseRateToBp("4.79 %")).toEqual({ ok: true, value: 479 });
    expect(parseRateToBp("0")).toEqual({ ok: true, value: 0 });
    expect(parseRateToBp("5")).toEqual({ ok: true, value: 500 });
  });

  it("rejects malformed and out-of-range rates", () => {
    expect(parseRateToBp("")).toEqual({ ok: false, reason: "empty" });
    expect(parseRateToBp("4,795")).toEqual({ ok: false, reason: "format" });
    expect(parseRateToBp("25,01")).toEqual({ ok: false, reason: "range" });
    expect(parseRateToBp("abc")).toEqual({ ok: false, reason: "format" });
  });
});

describe("parseMonths", () => {
  it("combines whole years and extra months", () => {
    expect(parseMonths("22", "")).toEqual({ ok: true, value: 264 });
    expect(parseMonths("22", "6")).toEqual({ ok: true, value: 270 });
    expect(parseMonths("0", "6")).toEqual({ ok: true, value: 6 });
  });

  it("rejects empty years, bad months and out-of-range amortization", () => {
    expect(parseMonths("", "0")).toEqual({ ok: false, reason: "empty" });
    expect(parseMonths("10", "12")).toEqual({ ok: false, reason: "format" });
    expect(parseMonths("0", "0")).toEqual({ ok: false, reason: "range" });
    expect(parseMonths("50", "11")).toEqual({ ok: false, reason: "range" });
  });
});

describe("input value conversion", () => {
  it("round-trips cents and basis points into text inputs", () => {
    expect(centsToInputValue(43_934_300)).toBe("439343");
    expect(centsToInputValue(45_000_050)).toBe("450000,50");
    expect(centsToInputValue(45_000_050, "en")).toBe("450000.50");
    expect(bpToInputValue(479)).toBe("4,79");
    expect(bpToInputValue(500)).toBe("5");
  });
});

describe("parseEquityInput", () => {
  it("computes payment, equity and 80 % refinance headroom from valid values", () => {
    const result = parseEquityInput({
      value: "500 000",
      balance: "300 000",
      rate: "5",
      years: "25",
      months: "0",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.computation).toEqual({
      estimateCents: 50_000_000,
      balanceCents: 30_000_000,
      rateBp: 500,
      amortizationMonths: 300,
      paymentCents: 174_481,
      equityCents: 20_000_000,
      equityPctBp: 4_000,
      negative: false,
      deficitCents: 0,
      headroomCents: 10_000_000,
      limitedBy: "plafond",
      maxLoanCents: 40_000_000,
    });
    expect(MAX_LTV_BP).toBe(8_000);
  });

  it("returns the exact deficit and no refinance room when the balance exceeds the value", () => {
    const result = parseEquityInput({
      value: "400 000",
      balance: "450 000",
      rate: "5,2",
      years: "20",
      months: "0",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.computation.negative).toBe(true);
    expect(result.computation.equityCents).toBe(-5_000_000);
    expect(result.computation.deficitCents).toBe(5_000_000);
    expect(result.computation.headroomCents).toBe(0);
    expect(result.computation.limitedBy).toBe("solde");
  });

  it("accepts a zero balance (no mortgage) and computes no payment", () => {
    const result = parseEquityInput({
      value: "350 000",
      balance: "0",
      rate: "4,5",
      years: "25",
      months: "0",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.computation.paymentCents).toBe(0);
    expect(result.computation.equityCents).toBe(35_000_000);
    expect(result.computation.equityPctBp).toBe(10_000);
    expect(result.computation.headroomCents).toBe(28_000_000);
  });

  it("reports every missing field at once and returns no result", () => {
    const result = parseEquityInput({ value: "", balance: "", rate: "", years: "", months: "" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.value).toBeTruthy();
    expect(result.errors.balance).toBeTruthy();
    expect(result.errors.rate).toBeTruthy();
    expect(result.errors.years).toBeTruthy();
  });

  it("rejects a zero property value and a malformed rate", () => {
    const result = parseEquityInput({
      value: "0",
      balance: "0",
      rate: "abcd",
      years: "25",
      months: "0",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.value).toBe("La valeur doit être supérieure à 0.");
    expect(result.errors.rate).toContain("Taux invalide");
  });

  it("builds the initial state from a roll value without inventing a result", () => {
    const state = initialEquityStateFromRoll(43_934_300);
    expect(state.status).toBe("idle");
    expect(state.values.value).toBe("439343");
    expect(state.values.balance).toBe("");
    expect(state.result).toBeNull();
  });
});

describe("localized validation", () => {
  it("returns English field errors when the locale is en", () => {
    const result = parseEquityInput(
      { value: "", balance: "abc", rate: "", years: "", months: "" },
      "en",
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.value).toBe("Enter the property value.");
    expect(result.errors.balance).toBe("Invalid amount: use digits, for example 300,000.");
    expect(result.errors.rate).toBe("Enter the annual rate (for example 4.79).");
    expect(result.errors.years).toBe("Enter the remaining amortization in years.");
  });
});
