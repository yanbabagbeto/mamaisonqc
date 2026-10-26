/**
 * Public surface of the owner domain for code outside the module.
 * Finance stays pure (no database import) so it can be used from client components, server pages
 * and unit tests alike. Database read models live in `./queries` and are imported directly by the
 * owner pages so that this barrel never drags a server-only module into a client bundle.
 */
export {
  amortizationSchedule,
  equity,
  maxLoanForLtv,
  mortgagePaymentCents,
  refinanceHeadroom,
  renewalScenario,
} from "./finance";
export type {
  AmortizationRow,
  EquityInput,
  EquityResult,
  MortgagePaymentInput,
  RefinanceHeadroomInput,
  RefinanceHeadroomResult,
  RefinanceLimit,
  RenewalScenarioInput,
  RenewalScenarioResult,
} from "./finance";

export {
  MAX_LTV_BP,
  equityStateFromParse,
  initialEquityState,
  initialEquityStateFromRoll,
  parseEquityInput,
} from "./equity";
export type {
  EquityComputation,
  EquityField,
  EquityFieldErrors,
  EquityFormValues,
  EquityParseResult,
  EquityState,
} from "./equity";

export { bpToInputValue, centsToInputValue, parseMoneyToCents, parseRateToBp, parseMonths } from "./money-input";
export type { ParseFailure, ParseResult } from "./money-input";

export { fill, messagesFor } from "./messages";
export type { OwnerMessages } from "./messages";
