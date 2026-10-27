/**
 * Pure owner-domain finance. Everything is integer cents and basis points (1 bp = 0,01 %),
 * and these functions never read the clock, the database or the network: same input, same output.
 *
 * Conventions that the whole product relies on:
 * - money is never stored or returned as a float; only intermediate annuity factors are computed
 *   with doubles, then rounded to the nearest cent;
 * - **Canadian fixed-rate convention**: the nominal annual rate is compounded **semi-annually**
 *   (Interest Act, s. 6), so the periodic monthly rate is (1 + r/2)^(1/6) − 1, not r/12. A caller can
 *   opt into monthly compounding for variable-rate illustrations;
 * - payments are rounded to the cent, and the amortization schedule's last payment absorbs the
 *   rounding drift so the sum of principal repaid is exactly the principal borrowed.
 */

/** Canadian mortgages quote a nominal rate compounded semi-annually; variable rates use monthly. */
export type Compounding = "semi-annual" | "monthly";

export type MortgagePaymentInput = {
  /** Amount borrowed, in cents. */
  principalCents: number;
  /** Nominal annual rate in basis points (500 = 5,00 %). */
  annualRateBp: number;
  /** Number of monthly payments. */
  amortizationMonths: number;
  /** Defaults to "semi-annual" — the fixed-rate convention used everywhere in Canada. */
  compounding?: Compounding;
};

export type AmortizationRow = {
  /** 1-based payment number. */
  month: number;
  /** Amount paid this month, in cents (the last payment absorbs rounding). */
  paymentCents: number;
  /** Interest portion, in cents. */
  interestCents: number;
  /** Principal portion, in cents. */
  principalCents: number;
  /** Remaining balance after this payment, in cents (0 on the last row). */
  balanceCents: number;
};

export type EquityInput = {
  estimateCents: number;
  balanceCents: number;
};

export type EquityResult = {
  equityCents: number;
  /** Equity as basis points of the estimate (80 % = 8000), rounded to the nearest bp. */
  equityPctBp: number;
  negative: boolean;
};

export type RefinanceLimit = "plafond" | "solde" | "aucune";

export type RefinanceHeadroomInput = {
  estimateCents: number;
  balanceCents: number;
  /** Maximum loan-to-value allowed by the scenario, in basis points (8000 = 80 %). */
  maxLtvBp: number;
};

export type RefinanceHeadroomResult = {
  headroomCents: number;
  /**
   * What caps the headroom:
   * - `plafond`: the LTV ceiling still leaves room;
   * - `solde`: the balance reaches or exceeds that ceiling, so nothing is available;
   * - `aucune`: no usable estimate was supplied.
   */
  limitedBy: RefinanceLimit;
};

export type RenewalScenarioInput = {
  balanceCents: number;
  currentRateBp: number;
  newRateBp: number;
  remainingMonths: number;
};

export type RenewalScenarioResult = {
  currentPaymentCents: number;
  newPaymentCents: number;
  /** New payment minus current payment: positive means the payment rises. */
  monthlyDeltaCents: number;
  annualDeltaCents: number;
  remainingMonths: number;
};

function assertInteger(name: string, value: number, min: number, max = Number.MAX_SAFE_INTEGER): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be an integer between ${min} and ${max}`);
  }
}

/**
 * Periodic monthly rate for a nominal annual rate.
 * - semi-annual (default, fixed-rate): (1 + r/2)^(1/6) − 1
 * - monthly (variable-rate illustration): r/12
 */
export function periodicMonthlyRate(annualRateBp: number, compounding: Compounding = "semi-annual"): number {
  const annual = annualRateBp / 10_000;
  if (compounding === "monthly") return annual / 12;
  return Math.pow(1 + annual / 2, 1 / 6) - 1;
}

function assertRate(annualRateBp: number): void {
  // 0 % is valid; 100 % is already far outside any mortgage market and guards against typos.
  assertInteger("annualRateBp", annualRateBp, 0, 10_000);
}

function assertMonths(amortizationMonths: number): void {
  // 50 years = 600 monthly payments. Longer is a data-entry error, not a mortgage.
  assertInteger("amortizationMonths", amortizationMonths, 1, 600);
}

/**
 * Monthly payment of a fully amortizing loan, rounded to the nearest cent.
 *
 * Formula: M = P × r / (1 − (1 + r)^−n), with r = annualRateBp / 120 000.
 * A zero rate degenerates to P / n.
 */
export function mortgagePaymentCents({
  principalCents,
  annualRateBp,
  amortizationMonths,
  compounding = "semi-annual",
}: MortgagePaymentInput): number {
  assertInteger("principalCents", principalCents, 0);
  assertRate(annualRateBp);
  assertMonths(amortizationMonths);

  if (principalCents === 0) return 0;

  const rate = periodicMonthlyRate(annualRateBp, compounding);
  if (rate === 0) {
    return Math.round(principalCents / amortizationMonths);
  }

  const factor = Math.pow(1 + rate, -amortizationMonths);
  const payment = (principalCents * rate) / (1 - factor);
  return Math.round(payment);
}

/**
 * Deterministic monthly amortization schedule.
 *
 * Each row's interest is rounded to the cent, the principal portion is `payment − interest`, and
 * the final row is adjusted so `balanceCents` ends at exactly 0 and the principal portions sum to
 * the amount borrowed (the total paid can therefore differ from `payment × months` by a few cents).
 * `maxRows` truncates the schedule for display without changing any earlier row.
 */
export function amortizationSchedule({
  principalCents,
  annualRateBp,
  amortizationMonths,
  compounding = "semi-annual",
  maxRows,
}: MortgagePaymentInput & { maxRows?: number }): AmortizationRow[] {
  assertInteger("principalCents", principalCents, 0);
  assertRate(annualRateBp);
  assertMonths(amortizationMonths);
  if (maxRows !== undefined) {
    assertInteger("maxRows", maxRows, 0);
  }
  if (principalCents === 0 || maxRows === 0) return [];

  const rate = periodicMonthlyRate(annualRateBp, compounding);
  const scheduledPayment = mortgagePaymentCents({
    principalCents,
    annualRateBp,
    amortizationMonths,
    compounding,
  });
  const rows: AmortizationRow[] = [];
  let balance = principalCents;
  const rowLimit = maxRows === undefined ? amortizationMonths : Math.min(maxRows, amortizationMonths);

  for (let month = 1; month <= rowLimit; month += 1) {
    const interestCents = Math.round(balance * rate);
    let principalCentsThisMonth = scheduledPayment - interestCents;
    let paymentCents = scheduledPayment;

    if (principalCentsThisMonth <= 0) {
      throw new RangeError("The payment does not cover the interest at this rate");
    }

    const isFinalMonth = month === amortizationMonths;
    if (isFinalMonth || principalCentsThisMonth >= balance) {
      principalCentsThisMonth = balance;
      paymentCents = balance + interestCents;
      balance = 0;
    } else {
      balance -= principalCentsThisMonth;
    }

    rows.push({
      month,
      paymentCents,
      interestCents,
      principalCents: principalCentsThisMonth,
      balanceCents: balance,
    });

    if (balance === 0) break;
  }

  return rows;
}

/**
 * Equity = estimate − mortgage balance. When the estimate is 0 (no value entered, no roll value),
 * the percentage is reported as 0 rather than invented; `negative` still reflects the raw difference.
 */
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

/**
 * How much additional borrowing an 80 %-style LTV ceiling allows, before fees and lender rules.
 * Never negative: a balance above the ceiling means 0 available, not "negative headroom".
 */
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
  if (raw > 0) {
    return { headroomCents: raw, limitedBy: "plafond" };
  }
  return { headroomCents: 0, limitedBy: balanceCents > 0 ? "solde" : "aucune" };
}

/**
 * Compare the payment at the current rate with the payment at a proposed rate, keeping the same
 * balance and the same number of months left. This ignores fees, penalties and any change in term:
 * it answers "what happens to the monthly payment if only the rate moves?".
 */
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
