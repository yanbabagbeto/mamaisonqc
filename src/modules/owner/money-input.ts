/**
 * Parsing for the owner tools' text inputs. Pure and testable.
 *
 * Money is parsed as a string down to cents (never through `parseFloat`, which would reintroduce
 * floating-point drift). Percentages become basis points, and amortization becomes whole months.
 * Both Quebec/European and English/Canadian conventions are accepted:
 *   "450 000", "450 000,50", "450,000.50", "1.234,56", "4,79 %", "4.79 %".
 * A 3-digit group after a single comma or dot is read as a thousands separator ("450,000"), while
 * 1-2 digits after it are read as cents ("450,50"). The last separator is the decimal one when both
 * are present.
 */

export type ParseFailure = "empty" | "format" | "range";

export type ParseResult<T> = { ok: true; value: T } | { ok: false; reason: ParseFailure };

/** 100 M$ in cents. Beyond that, the field is a typo, not a property. */
export const MONEY_MAX_CENTS = 10_000_000_000;
/** 25,00 %: generous ceiling that still catches a rate typed as basis points (e.g. "479"). */
export const RATE_MAX_BP = 2_500;
export const MAX_TOTAL_MONTHS = 600;

const SPACE_CHARS = /[\s\u00a0\u202f\u2009]/g;

function stripSpaces(value: string): string {
  return value.replace(SPACE_CHARS, "");
}

type SplitAmount = { whole: string; fraction: string } | null;

/**
 * Split a cleaned amount into whole dollars and a 2-digit fraction.
 * Returns null for malformed input, and lets the caller apply the range check.
 */
function splitAmount(cleaned: string): SplitAmount {
  if (!/^\d[\d.,]*$/.test(cleaned) || cleaned.endsWith(".") || cleaned.endsWith(",")) {
    return null;
  }

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const hasComma = lastComma !== -1;
  const hasDot = lastDot !== -1;

  if (hasComma && hasDot) {
    const decimalIndex = Math.max(lastComma, lastDot);
    const decimalSeparator = cleaned[decimalIndex];
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";
    const wholeRaw = cleaned.slice(0, decimalIndex).split(thousandsSeparator).join("");
    const fractionRaw = cleaned.slice(decimalIndex + 1);
    if (!/^\d+$/.test(wholeRaw) || !/^\d{1,2}$/.test(fractionRaw)) return null;
    return { whole: wholeRaw, fraction: fractionRaw.padEnd(2, "0") };
  }

  const separator = hasComma ? "," : hasDot ? "." : null;
  if (separator === null) {
    if (!/^\d+$/.test(cleaned)) return null;
    return { whole: cleaned, fraction: "00" };
  }

  const parts = cleaned.split(separator);
  if (parts.some((part) => part === "") || parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }

  // Several separators: they can only be thousands groups ("1,234,567").
  if (parts.length > 2) {
    const [, ...groups] = parts;
    if (!groups.every((group) => group.length === 3)) return null;
    return { whole: parts.join(""), fraction: "00" };
  }

  const [whole, fraction] = parts as [string, string];
  // A single separator followed by exactly 3 digits and a short leading group is thousands.
  if (fraction.length === 3 && whole.length <= 3) {
    return { whole: `${whole}${fraction}`, fraction: "00" };
  }
  if (fraction.length > 2) return null;
  return { whole, fraction: fraction.padEnd(2, "0") };
}

/** "450 000,50 $" → 45000050 ; "450,000.50" → 45000050 ; "0" → 0. */
export function parseMoneyToCents(raw: string): ParseResult<number> {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, reason: "empty" };

  const cleaned = stripSpaces(trimmed).replace(/\$/g, "");
  if (cleaned.startsWith("-")) return { ok: false, reason: "format" };

  const parts = splitAmount(cleaned);
  if (!parts) return { ok: false, reason: "format" };
  if (parts.whole.length > 12) return { ok: false, reason: "range" };

  const cents = Number(parts.whole) * 100 + Number(parts.fraction);
  if (!Number.isSafeInteger(cents)) return { ok: false, reason: "range" };
  if (cents > MONEY_MAX_CENTS) return { ok: false, reason: "range" };
  return { ok: true, value: cents };
}

/** "4,79 %" → 479 bp ; "4.79" → 479 bp ; "0" → 0 ; "25,5" → range error. */
export function parseRateToBp(raw: string): ParseResult<number> {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, reason: "empty" };

  const cleaned = stripSpaces(trimmed).replace(/%/g, "").replace(",", ".");
  const match = /^(\d{1,3})(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) return { ok: false, reason: "format" };

  const whole = match[1];
  const fraction = (match[2] ?? "").padEnd(2, "0");
  const bp = Number(whole) * 100 + Number(fraction);

  if (!Number.isSafeInteger(bp)) return { ok: false, reason: "range" };
  if (bp > RATE_MAX_BP) return { ok: false, reason: "range" };
  return { ok: true, value: bp };
}

/** Years + extra months → total months. "22" and "6" → 270 ; "0" and "0" → range error. */
export function parseMonths(yearsRaw: string, monthsRaw: string): ParseResult<number> {
  const yearsTrimmed = yearsRaw.trim();
  if (yearsTrimmed === "") return { ok: false, reason: "empty" };

  const yearsMatch = /^(\d{1,2})$/.exec(yearsTrimmed);
  if (!yearsMatch) return { ok: false, reason: "format" };

  const monthsTrimmed = monthsRaw.trim();
  if (monthsTrimmed === "") {
    // An empty "extra months" field is read as zero.
  } else if (!/^\d{1,2}$/.test(monthsTrimmed)) {
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

/** 43934300 → "439343" ; 45000050 → "450000,50" (fr) or "450000.50" (en). */
export function centsToInputValue(cents: number, locale: "fr" | "en" = "fr"): string {
  const safe = Math.max(0, Math.round(cents));
  const dollars = Math.trunc(safe / 100);
  const remaining = safe % 100;
  if (remaining === 0) return String(dollars);
  const separator = locale === "en" ? "." : ",";
  return `${dollars}${separator}${String(remaining).padStart(2, "0")}`;
}

/** 479 → "4,79" (fr) or "4.79" (en). Used to prefill a rate input. */
export function bpToInputValue(bp: number, locale: "fr" | "en" = "fr"): string {
  const safe = Math.max(0, Math.round(bp));
  const whole = Math.trunc(safe / 100);
  const remaining = safe % 100;
  if (remaining === 0) return String(whole);
  const separator = locale === "en" ? "." : ",";
  return `${whole}${separator}${String(remaining).padStart(2, "0")}`;
}
