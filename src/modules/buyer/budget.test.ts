import { describe, expect, it } from "vitest";

import { computeBudget, loanFromPaymentCents, parseBudget, TDS_BP } from "./budget";

const base = {
  annualIncomeCents: 12_000_000,
  monthlyDebtsCents: 50_000,
  downPaymentCents: 5_000_000,
  rateBp: 479,
  amortizationMonths: 300,
};

describe("loanFromPaymentCents", () => {
  it("is payment × months at a zero rate", () => {
    expect(loanFromPaymentCents({ paymentCents: 350_000, annualRateBp: 0, months: 300 })).toBe(
      105_000_000,
    );
  });

  it("returns zero for a zero payment", () => {
    expect(loanFromPaymentCents({ paymentCents: 0, annualRateBp: 479, months: 300 })).toBe(0);
  });

  it("decreases when the rate rises for the same payment", () => {
    const low = loanFromPaymentCents({ paymentCents: 350_000, annualRateBp: 300, months: 300 });
    const high = loanFromPaymentCents({ paymentCents: 350_000, annualRateBp: 600, months: 300 });
    expect(low).toBeGreaterThan(high);
    expect(high).toBeGreaterThan(0);
  });

  it("rejects invalid inputs", () => {
    expect(() =>
      loanFromPaymentCents({ paymentCents: 350_000, annualRateBp: 479, months: 0 }),
    ).toThrow(RangeError);
    expect(() =>
      loanFromPaymentCents({ paymentCents: 350_000, annualRateBp: -1, months: 300 }),
    ).toThrow(RangeError);
  });
});

describe("computeBudget", () => {
  it("applies the 40 % TDS assumption and adds the down payment to the budget", () => {
    const result = computeBudget(base);

    expect(TDS_BP).toBe(4_000);
    expect(result.grossMonthlyIncomeCents).toBe(1_000_000);
    expect(result.monthlyHousingCents).toBe(350_000);
    expect(result.monthlyDebtsCents).toBe(50_000);
    expect(result.maxLoanCents).toBeGreaterThan(0);
    expect(result.maxPurchaseCents).toBe(result.maxLoanCents + base.downPaymentCents);
    expect(result.downPaymentCents).toBe(base.downPaymentCents);
    expect(result.debtLimited).toBe(false);
    expect(result.tdsBp).toBe(4_000);
  });

  it("caps the capacity at zero when debts consume the whole envelope", () => {
    const result = computeBudget({ ...base, monthlyDebtsCents: 400_000 });

    expect(result.monthlyHousingCents).toBe(0);
    expect(result.maxLoanCents).toBe(0);
    expect(result.maxPurchaseCents).toBe(base.downPaymentCents);
    expect(result.debtLimited).toBe(true);
  });

  it("keeps a zero down payment valid without inventing a budget increase", () => {
    const result = computeBudget({ ...base, downPaymentCents: 0 });
    expect(result.maxPurchaseCents).toBe(result.maxLoanCents);
  });
});

describe("parseBudget", () => {
  it("accepts French-formatted money and returns a computation", () => {
    const result = parseBudget({
      income: "120 000",
      debts: "500",
      downPayment: "50 000",
      rate: "4,79",
      years: "25",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.values.income).toBe("120 000");
    expect(result.computation.grossMonthlyIncomeCents).toBe(1_000_000);
    expect(result.computation.rateBp).toBe(479);
    expect(result.computation.amortizationMonths).toBe(300);
    expect(result.computation.maxPurchaseCents).toBeGreaterThan(base.downPaymentCents);
  });

  it("reports every missing field at once and no result", () => {
    const result = parseBudget({ income: "", debts: "", downPayment: "", rate: "", years: "" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.income).toBeTruthy();
    expect(result.errors.debts).toBeTruthy();
    expect(result.errors.downPayment).toBeTruthy();
    expect(result.errors.rate).toBeTruthy();
    expect(result.errors.years).toBeTruthy();
  });

  it("rejects an out-of-range rate, a short amortization and a zero income", () => {
    const result = parseBudget({
      income: "0",
      debts: "0",
      downPayment: "0",
      rate: "25,01",
      years: "4",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.income).toContain("supérieur à 0");
    expect(result.errors.rate).toContain("25 %");
    expect(result.errors.years).toContain("5 et 50");
  });

  it("returns English field errors when the locale is en", () => {
    const result = parseBudget(
      { income: "", debts: "abc", downPayment: "", rate: "", years: "" },
      "en",
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.income).toBe("Enter your gross annual income.");
    expect(result.errors.debts).toBe("Invalid amount: use digits, for example 500.");
    expect(result.errors.rate).toBe("Enter an annual rate (for example 4.79).");
  });

  it("accepts a zero-interest scenario", () => {
    const result = parseBudget({
      income: "60 000",
      debts: "0",
      downPayment: "0",
      rate: "0",
      years: "25",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // 40 % of 5 000 $ = 2 000 $/month for 300 months at 0 %.
    expect(result.computation.monthlyHousingCents).toBe(200_000);
    expect(result.computation.maxLoanCents).toBe(60_000_000);
  });
});
