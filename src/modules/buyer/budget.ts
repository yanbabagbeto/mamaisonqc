import type { Locale } from "@/i18n/config";
import {
  bpToInputValue,
  centsToInputValue,
  parseMoneyToCents,
  parseMonths,
  parseRateToBp,
} from "@/modules/owner/money-input";

import { messagesFor } from "./messages";

/**
 * Borrowing-capacity estimate — pure arithmetic, no lender rules invented.
 *
 * One documented assumption: total debt service (TDS) must stay at or under 40 % of gross monthly
 * income, from which monthly debts are subtracted. The borrowing capacity is the present value of
 * the remaining monthly amount at the input rate and amortization. This is NOT a pre-approval:
 * lenders apply their own ratios, stress tests, fees and credit checks (stated in the UI).
 */
export const TDS_BP = 4_000;
export const MIN_AMORTIZATION_MONTHS = 60;
export const MAX_AMORTIZATION_MONTHS = 600;

export type BudgetField = "income" | "debts" | "downPayment" | "rate" | "years";

export type BudgetValues = Record<BudgetField, string>;

export type BudgetFieldErrors = Partial<Record<BudgetField, string>>;

export type BudgetComputation = {
  grossMonthlyIncomeCents: number;
  monthlyDebtsCents: number;
  /** Monthly amount available for housing under the 40 % TDS assumption, never negative. */
  monthlyHousingCents: number;
  maxLoanCents: number;
  maxPurchaseCents: number;
  downPaymentCents: number;
  rateBp: number;
  amortizationMonths: number;
  tdsBp: number;
  /** True when monthly debts alone consume the entire 40 % envelope. */
  debtLimited: boolean;
};

export type BudgetParseResult =
  | { ok: true; values: BudgetValues; computation: BudgetComputation }
  | { ok: false; values: BudgetValues; errors: BudgetFieldErrors };

/**
 * Present value of `paymentCents` paid monthly for `months` at `annualRateBp`.
 * r = 0 degenerates to payment × months. Rounded to the cent.
 */
export function loanFromPaymentCents({
  paymentCents,
  annualRateBp,
  months,
}: {
  paymentCents: number;
  annualRateBp: number;
  months: number;
}): number {
  if (!Number.isInteger(paymentCents) || paymentCents < 0) {
    throw new RangeError("paymentCents must be a non-negative integer");
  }
  if (!Number.isInteger(months) || months < 1 || months > 600) {
    throw new RangeError("months must be between 1 and 600");
  }
  if (!Number.isInteger(annualRateBp) || annualRateBp < 0 || annualRateBp > 2_500) {
    throw new RangeError("annualRateBp must be between 0 and 2500");
  }
  if (paymentCents === 0) return 0;
  const rate = annualRateBp / 120_000;
  if (rate === 0) return paymentCents * months;
  const factor = Math.pow(1 + rate, -months);
  return Math.round((paymentCents * (1 - factor)) / rate);
}

export function computeBudget(input: {
  annualIncomeCents: number;
  monthlyDebtsCents: number;
  downPaymentCents: number;
  rateBp: number;
  amortizationMonths: number;
}): BudgetComputation {
  const grossMonthlyIncomeCents = Math.round(input.annualIncomeCents / 12);
  const monthlyHousingCents = Math.max(
    0,
    Math.round((grossMonthlyIncomeCents * TDS_BP) / 10_000) - input.monthlyDebtsCents,
  );
  const maxLoanCents = loanFromPaymentCents({
    paymentCents: monthlyHousingCents,
    annualRateBp: input.rateBp,
    months: input.amortizationMonths,
  });
  return {
    grossMonthlyIncomeCents,
    monthlyDebtsCents: input.monthlyDebtsCents,
    monthlyHousingCents,
    maxLoanCents,
    maxPurchaseCents: maxLoanCents + input.downPaymentCents,
    downPaymentCents: input.downPaymentCents,
    rateBp: input.rateBp,
    amortizationMonths: input.amortizationMonths,
    tdsBp: TDS_BP,
    debtLimited: monthlyHousingCents === 0 && input.monthlyDebtsCents > 0,
  };
}

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

/** Validate then compute. Every field error is attached to its field; no partial result is returned. */
export function parseBudget(
  raw: Partial<Record<BudgetField, unknown>>,
  locale: Locale = "fr",
): BudgetParseResult {
  const t = messagesFor(locale).financing.errors;
  const values: BudgetValues = {
    income: asString(raw.income).trim(),
    debts: asString(raw.debts).trim(),
    downPayment: asString(raw.downPayment).trim(),
    rate: asString(raw.rate).trim(),
    years: asString(raw.years).trim(),
  };
  const errors: BudgetFieldErrors = {};

  const income = parseMoneyToCents(values.income);
  if (!income.ok) {
    errors.income =
      income.reason === "empty" ? t.incomeRequired : income.reason === "range" ? t.incomeRange : t.incomeInvalid;
  } else if (income.value === 0) {
    errors.income = t.incomeRange;
  }

  const debts = parseMoneyToCents(values.debts);
  if (!debts.ok) {
    errors.debts =
      debts.reason === "empty" ? t.debtsRequired : debts.reason === "range" ? t.debtsInvalid : t.debtsInvalid;
  }

  const down = parseMoneyToCents(values.downPayment);
  if (!down.ok) {
    errors.downPayment =
      down.reason === "empty" ? t.downRequired : down.reason === "range" ? t.downInvalid : t.downInvalid;
  }

  const rate = parseRateToBp(values.rate);
  if (!rate.ok) {
    errors.rate =
      rate.reason === "empty" ? t.rateRequired : rate.reason === "range" ? t.rateRange : t.rateInvalid;
  }

  const months = parseMonths(values.years, "0");
  if (!months.ok) {
    errors.years =
      months.reason === "empty"
        ? t.yearsRequired
        : months.reason === "format"
          ? t.yearsInvalid
          : t.yearsRange;
  } else if (months.value < MIN_AMORTIZATION_MONTHS || months.value > MAX_AMORTIZATION_MONTHS) {
    errors.years = t.yearsRange;
  }

  if (!income.ok || !debts.ok || !down.ok || !rate.ok || !months.ok || errors.years) {
    return { ok: false, values, errors };
  }

  return {
    ok: true,
    values,
    computation: computeBudget({
      annualIncomeCents: income.value,
      monthlyDebtsCents: debts.value,
      downPaymentCents: down.value,
      rateBp: rate.value,
      amortizationMonths: months.value,
    }),
  };
}

/** Prefill helper for the calculator's "reset to current values" behaviour. */
export function budgetValuesToInputs(input: {
  annualIncomeCents: number;
  monthlyDebtsCents: number;
  downPaymentCents: number;
  rateBp: number;
  amortizationMonths: number;
}): BudgetValues {
  return {
    income: centsToInputValue(input.annualIncomeCents),
    debts: centsToInputValue(input.monthlyDebtsCents),
    downPayment: centsToInputValue(input.downPaymentCents),
    rate: bpToInputValue(input.rateBp),
    years: String(Math.round(input.amortizationMonths / 12)),
  };
}
