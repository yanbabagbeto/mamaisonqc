/**
 * Pure owner-domain finance, mirrored from the web module `src/modules/owner/finance.ts`
 * (and `money-input.ts`) so the native app computes the same numbers offline, with no server call.
 *
 * TODO(align): the web module is now the source of truth. If the two implementations ever
 * diverge, extract the functions into a shared package consumed by both rather than editing one
 * side only. Until then, keep this file byte-for-byte equivalent in behaviour, and keep
 * `finance.test.ts` asserting the same invariants as `src/modules/owner/*.test.ts`.
 *
 * Conventions: integer cents and basis points (1 bp = 0,01 %); rates are annual, nominal and
 * compounded monthly (`annualRateBp / 120_000`); payments are rounded to the cent and the last
 * amortization payment absorbs rounding drift.
 */

export type MortgagePaymentInput = {
  principalCents: number;
  annualRateBp: number;
  amortizationMonths: number;
};

export type EquityInput = { estimateCents: number; balanceCents: number };

export type EquityResult = {
  equityCents: number;
  /** Equity as basis points of the estimate (8000 = 80 %), rounded to the nearest bp. */
  equityPctBp: number;
  negative: boolean;
};

export type RefinanceLimit = "plafond" | "solde" | "aucune";

export type RefinanceHeadroomInput = {
  estimateCents: number;
  balanceCents: number;
  maxLtvBp: number;
};

export type RefinanceHeadroomResult = {
  headroomCents: number;
  limitedBy: RefinanceLimit;
};

/** Product assumption, labelled in the UI: the refinance scenario uses an 80 % LTV ceiling. */
export const MAX_LTV_BP = 8_000;

/** 100 M$ in cents. Beyond that, the field is a typo, not a property. */
export const MONEY_MAX_CENTS = 10_000_000_000;
/** 25,00 %: generous ceiling that still catches a rate typed as basis points. */
export const RATE_MAX_BP = 2_500;
export const MAX_TOTAL_MONTHS = 600;

const SPACE_CHARS = /[\s\u00a0\u202f\u2009]/g;

function assertInteger(name: string, value: number, min: number, max = Number.MAX_SAFE_INTEGER): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be an integer between ${min} and ${max}`);
  }
}

function monthlyRate(annualRateBp: number): number {
  return annualRateBp / 120_000;
}

function assertRate(annualRateBp: number): void {
  assertInteger("annualRateBp", annualRateBp, 0, 10_000);
}

function assertMonths(amortizationMonths: number): void {
  assertInteger("amortizationMonths", amortizationMonths, 1, 600);
}

/** Monthly payment of a fully amortizing loan, rounded to the nearest cent. */
export function mortgagePaymentCents({
  principalCents,
  annualRateBp,
  amortizationMonths,
}: MortgagePaymentInput): number {
  assertInteger("principalCents", principalCents, 0);
  assertRate(annualRateBp);
  assertMonths(amortizationMonths);
  if (principalCents === 0) return 0;

  const rate = monthlyRate(annualRateBp);
  if (rate === 0) return Math.round(principalCents / amortizationMonths);

  const factor = Math.pow(1 + rate, -amortizationMonths);
  return Math.round((principalCents * rate) / (1 - factor));
}

export type AmortizationRow = {
  month: number;
  paymentCents: number;
  interestCents: number;
  principalCents: number;
  balanceCents: number;
};

/** Deterministic schedule; rows end at `amortizationMonths`, last row absorbs rounding. */
export function amortizationSchedule({
  principalCents,
  annualRateBp,
  amortizationMonths,
  maxRows,
}: MortgagePaymentInput & { maxRows?: number }): AmortizationRow[] {
  assertInteger("principalCents", principalCents, 0);
  assertRate(annualRateBp);
  assertMonths(amortizationMonths);
  if (maxRows !== undefined) assertInteger("maxRows", maxRows, 0);
  if (principalCents === 0 || maxRows === 0) return [];

  const rate = monthlyRate(annualRateBp);
  const scheduledPayment = mortgagePaymentCents({ principalCents, annualRateBp, amortizationMonths });
  const rows: AmortizationRow[] = [];
  let balance = principalCents;
  const rowLimit = maxRows === undefined ? amortizationMonths : Math.min(maxRows, amortizationMonths);

  for (let month = 1; month <= rowLimit; month += 1) {
    const interestCents = Math.round(balance * rate);
    let principalThisMonth = scheduledPayment - interestCents;
    let paymentCents = scheduledPayment;

    if (principalThisMonth <= 0) {
      throw new RangeError("The payment does not cover the interest at this rate");
    }

    if (month === amortizationMonths || principalThisMonth >= balance) {
      principalThisMonth = balance;
      paymentCents = balance + interestCents;
      balance = 0;
    } else {
      balance -= principalThisMonth;
    }

    rows.push({
      month,
      paymentCents,
      interestCents,
      principalCents: principalThisMonth,
      balanceCents: balance,
    });
    if (balance === 0) break;
  }

  return rows;
}

/** Equity = estimate − balance. A missing estimate reports 0 % rather than inventing a ratio. */
export function equity({ estimateCents, balanceCents }: EquityInput): EquityResult {
  assertInteger("estimateCents", estimateCents, 0);
  assertInteger("balanceCents", balanceCents, 0);

  const equityCents = estimateCents - balanceCents;
  const equityPctBp = estimateCents > 0 ? Math.round((equityCents / estimateCents) * 10_000) : 0;
  return { equityCents, equityPctBp, negative: equityCents < 0 };
}

/** Maximum loan allowed by an LTV scenario, rounded to the cent. */
export function maxLoanForLtv({
  estimateCents,
  maxLtvBp,
}: {
  estimateCents: number;
  maxLtvBp: number;
}): number {
  assertInteger("estimateCents", estimateCents, 0);
  assertInteger("maxLtvBp", maxLtvBp, 0, 10_000);
  return Math.round((estimateCents * maxLtvBp) / 10_000);
}

/** Additional borrowing an 80 %-style ceiling allows. Never negative. */
export function refinanceHeadroom({
  estimateCents,
  balanceCents,
  maxLtvBp,
}: RefinanceHeadroomInput): RefinanceHeadroomResult {
  assertInteger("balanceCents", balanceCents, 0);
  if (estimateCents <= 0) {
    assertInteger("estimateCents", estimateCents, 0);
    return { headroomCents: 0, limitedBy: "aucune" };
  }
  const ceiling = maxLoanForLtv({ estimateCents, maxLtvBp });
  const raw = ceiling - balanceCents;
  if (raw > 0) return { headroomCents: raw, limitedBy: "plafond" };
  return { headroomCents: 0, limitedBy: balanceCents > 0 ? "solde" : "aucune" };
}

export type RenewalScenarioInput = {
  balanceCents: number;
  currentRateBp: number;
  newRateBp: number;
  remainingMonths: number;
};

export type RenewalScenarioResult = {
  currentPaymentCents: number;
  newPaymentCents: number;
  monthlyDeltaCents: number;
  annualDeltaCents: number;
  remainingMonths: number;
};

/** "What happens to the payment if only the rate moves?" — ignores fees and penalties. */
export function renewalScenario({
  balanceCents,
  currentRateBp,
  newRateBp,
  remainingMonths,
}: RenewalScenarioInput): RenewalScenarioResult {
  assertInteger("balanceCents", balanceCents, 0);
  assertRate(currentRateBp);
  assertRate(newRateBp);
  assertMonths(remainingMonths);

  const currentPaymentCents = mortgagePaymentCents({
    principalCents: balanceCents,
    annualRateBp: currentRateBp,
    amortizationMonths: remainingMonths,
  });
  const newPaymentCents = mortgagePaymentCents({
    principalCents: balanceCents,
    annualRateBp: newRateBp,
    amortizationMonths: remainingMonths,
  });
  const monthlyDeltaCents = newPaymentCents - currentPaymentCents;

  return {
    currentPaymentCents,
    newPaymentCents,
    monthlyDeltaCents,
    annualDeltaCents: monthlyDeltaCents * 12,
    remainingMonths,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Text-input parsing (mirrors `src/modules/owner/money-input.ts`)
 * ---------------------------------------------------------------------------------------------- */

export type ParseFailure = "empty" | "format" | "range";
export type ParseResult<T> = { ok: true; value: T } | { ok: false; reason: ParseFailure };

function stripSpaces(value: string): string {
  return value.replace(SPACE_CHARS, "");
}

/** "450 000,50 $" → 45000050 ; "0" → 0 ; "abc" → format error. */
export function parseMoneyToCents(raw: string): ParseResult<number> {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, reason: "empty" };

  const cleaned = stripSpaces(trimmed).replace(/\$/g, "");
  if (cleaned.startsWith("-")) return { ok: false, reason: "format" };

  const match = /^(\d{1,12})(?:[,.](\d{1,2}))?$/.exec(cleaned);
  if (!match) return { ok: false, reason: "format" };

  const whole = match[1] ?? "0";
  const fraction = (match[2] ?? "").padEnd(2, "0");
  const cents = Number(whole) * 100 + Number(fraction);

  if (!Number.isSafeInteger(cents)) return { ok: false, reason: "range" };
  if (cents > MONEY_MAX_CENTS) return { ok: false, reason: "range" };
  return { ok: true, value: cents };
}

/** "4,79 %" → 479 bp ; "0" → 0 ; "25,5" → range error. */
export function parseRateToBp(raw: string): ParseResult<number> {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, reason: "empty" };

  const cleaned = stripSpaces(trimmed).replace(/%/g, "").replace(",", ".");
  const match = /^(\d{1,3})(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) return { ok: false, reason: "format" };

  const whole = match[1] ?? "0";
  const fraction = (match[2] ?? "").padEnd(2, "0");
  const bp = Number(whole) * 100 + Number(fraction);

  if (!Number.isSafeInteger(bp)) return { ok: false, reason: "range" };
  if (bp > RATE_MAX_BP) return { ok: false, reason: "range" };
  return { ok: true, value: bp };
}

/** Years + extra months → total months. "22" and "6" → 270. */
export function parseMonths(yearsRaw: string, monthsRaw: string): ParseResult<number> {
  const yearsTrimmed = yearsRaw.trim();
  if (yearsTrimmed === "") return { ok: false, reason: "empty" };

  const yearsMatch = /^(\d{1,2})$/.exec(yearsTrimmed);
  if (!yearsMatch) return { ok: false, reason: "format" };

  const monthsTrimmed = monthsRaw.trim();
  if (monthsTrimmed !== "" && !/^\d{1,2}$/.test(monthsTrimmed)) {
    return { ok: false, reason: "format" };
  }

  const years = Number(yearsMatch[1]);
  const extraMonths = monthsTrimmed === "" ? 0 : Number(monthsTrimmed);
  if (extraMonths > 11) return { ok: false, reason: "format" };
  if (years > 50) return { ok: false, reason: "range" };

  const total = years * 12 + extraMonths;
  if (total < 1 || total > MAX_TOTAL_MONTHS) return { ok: false, reason: "range" };
  return { ok: true, value: total };
}

/** 43934300 → "439343" ; 45000050 → "450000,50". Prefills a text input. */
export function centsToInputValue(cents: number): string {
  const safe = Math.max(0, Math.round(cents));
  const dollars = Math.trunc(safe / 100);
  const remaining = safe % 100;
  if (remaining === 0) return String(dollars);
  return `${dollars},${String(remaining).padStart(2, "0")}`;
}

/** 479 → "4,79" ; 500 → "5". */
export function bpToInputValue(bp: number): string {
  const safe = Math.max(0, Math.round(bp));
  const whole = Math.trunc(safe / 100);
  const remaining = safe % 100;
  if (remaining === 0) return String(whole);
  return `${whole},${String(remaining).padStart(2, "0")}`;
}
