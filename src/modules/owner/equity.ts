/**
 * Form parsing and computation for the owner equity calculator.
 * Pure functions only: the Server Action validates, calls this module, and returns a serializable
 * state. No database, no clock, no environment.
 */
import type { Locale } from "@/i18n/config";

import {
  equity,
  maxLoanForLtv,
  mortgagePaymentCents,
  refinanceHeadroom,
  type RefinanceLimit,
} from "./finance";
import { centsToInputValue, parseMoneyToCents, parseMonths, parseRateToBp } from "./money-input";
import { messagesFor } from "./messages";

/** Product assumption, labelled as such in the UI: the refinance scenario uses an 80 % LTV ceiling. */
export const MAX_LTV_BP = 8_000;

export type EquityField = "value" | "balance" | "rate" | "years" | "months";

export type EquityFormValues = Record<EquityField, string>;

export type EquityFieldErrors = Partial<Record<EquityField, string>>;

export type EquityComputation = {
  estimateCents: number;
  balanceCents: number;
  rateBp: number;
  amortizationMonths: number;
  paymentCents: number;
  equityCents: number;
  equityPctBp: number;
  negative: boolean;
  /** Exact shortfall when equity is negative, in cents (0 otherwise). */
  deficitCents: number;
  headroomCents: number;
  limitedBy: RefinanceLimit;
  maxLoanCents: number;
};

export type EquityParseResult =
  | { ok: true; values: EquityFormValues; computation: EquityComputation }
  | { ok: false; values: EquityFormValues; errors: EquityFieldErrors };

export type EquityState = {
  status: "idle" | "invalid" | "ok";
  values: EquityFormValues;
  errors: EquityFieldErrors;
  result: EquityComputation | null;
};

export const EMPTY_EQUITY_VALUES: EquityFormValues = {
  value: "",
  balance: "",
  rate: "",
  years: "",
  months: "",
};

export function initialEquityState(overrides: Partial<EquityFormValues> = {}): EquityState {
  return {
    status: "idle",
    values: { ...EMPTY_EQUITY_VALUES, ...overrides },
    errors: {},
    result: null,
  };
}

/** Build the initial state from a roll value (cents), leaving the other fields empty. */
export function initialEquityStateFromRoll(valueCents: number, locale: Locale = "fr"): EquityState {
  return initialEquityState({ value: centsToInputValue(valueCents, locale) });
}

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

type EquityErrorMessages = ReturnType<typeof messagesFor>["equity"]["errors"];

function moneyError(
  reason: "empty" | "format" | "range",
  which: "value" | "balance",
  t: EquityErrorMessages,
): string {
  if (reason === "empty") {
    return which === "value" ? t.valueRequired : t.balanceRequired;
  }
  if (reason === "range") {
    return which === "value" ? t.valueRange : t.balanceRange;
  }
  return which === "value" ? t.valueInvalid : t.balanceInvalid;
}

/**
 * Validate and compute in one pass. Every field error is attached to its field; the caller only
 * shows a result when there are zero errors (PRD F5.fail: no guessed defaults, no partial result).
 */
export function parseEquityInput(
  raw: {
    value?: unknown;
    balance?: unknown;
    rate?: unknown;
    years?: unknown;
    months?: unknown;
  },
  locale: Locale = "fr",
): EquityParseResult {
  const t = messagesFor(locale).equity.errors;
  const values: EquityFormValues = {
    value: asString(raw.value).trim(),
    balance: asString(raw.balance).trim(),
    rate: asString(raw.rate).trim(),
    years: asString(raw.years).trim(),
    months: asString(raw.months).trim(),
  };
  const errors: EquityFieldErrors = {};

  const estimate = parseMoneyToCents(values.value);
  if (!estimate.ok) {
    errors.value = moneyError(estimate.reason, "value", t);
  } else if (estimate.value === 0) {
    errors.value = t.valueZero;
  }

  const balance = parseMoneyToCents(values.balance);
  if (!balance.ok) {
    errors.balance = moneyError(balance.reason, "balance", t);
  }

  const rate = parseRateToBp(values.rate);
  if (!rate.ok) {
    errors.rate =
      rate.reason === "empty"
        ? t.rateRequired
        : rate.reason === "range"
          ? t.rateRange
          : t.rateInvalid;
  }

  const months = parseMonths(values.years, values.months);
  if (!months.ok) {
    if (months.reason === "empty") {
      errors.years = t.yearsRequired;
    } else if (months.reason === "format") {
      if (/^\d{1,2}$/.test(values.months) && Number(values.months) > 11) {
        errors.months = t.monthsInvalid;
      } else if (!/^\d{1,2}$/.test(values.years)) {
        errors.years = t.yearsInvalid;
      } else {
        errors.months = t.monthsInvalid;
      }
    } else {
      errors.years = t.monthsRange;
    }
  }

  // Type narrowing: if any of these failed, we return below without touching the values.
  if (!estimate.ok || !balance.ok || !rate.ok || !months.ok) {
    return { ok: false, values, errors };
  }

  const estimateCents = estimate.value;
  const balanceCents = balance.value;
  const rateBp = rate.value;
  const amortizationMonths = months.value;

  const paymentCents =
    balanceCents > 0
      ? mortgagePaymentCents({
          principalCents: balanceCents,
          annualRateBp: rateBp,
          amortizationMonths,
        })
      : 0;
  const equityResult = equity({ estimateCents, balanceCents });
  const headroom = refinanceHeadroom({ estimateCents, balanceCents, maxLtvBp: MAX_LTV_BP });

  return {
    ok: true,
    values,
    computation: {
      estimateCents,
      balanceCents,
      rateBp,
      amortizationMonths,
      paymentCents,
      equityCents: equityResult.equityCents,
      equityPctBp: equityResult.equityPctBp,
      negative: equityResult.negative,
      deficitCents: equityResult.negative ? Math.abs(equityResult.equityCents) : 0,
      headroomCents: headroom.headroomCents,
      limitedBy: headroom.limitedBy,
      maxLoanCents: maxLoanForLtv({ estimateCents, maxLtvBp: MAX_LTV_BP }),
    },
  };
}

/** Map a parse result to the `useActionState` state the client form renders. */
export function equityStateFromParse(parsed: EquityParseResult): EquityState {
  if (parsed.ok) {
    return { status: "ok", values: parsed.values, errors: {}, result: parsed.computation };
  }
  return { status: "invalid", values: parsed.values, errors: parsed.errors, result: null };
}
