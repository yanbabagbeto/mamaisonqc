/**
 * Formatting helpers. One place for every number the product shows.
 * Every helper takes an optional locale (defaults to French) so a page can render
 * French at `/` and English at `/en/...` without duplicating formatting logic.
 */
export type FormatLocale = "fr" | "en";

const numberLocale: Record<FormatLocale, string> = { fr: "fr-CA", en: "en-CA" };

function tag(locale: FormatLocale | undefined): string {
  return numberLocale[locale ?? "fr"];
}

function cad(locale: FormatLocale | undefined, fractionDigits: number): Intl.NumberFormat {
  return new Intl.NumberFormat(tag(locale), {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

const cachedCadFr = cad("fr", 0);
const cachedCadEn = cad("en", 0);
const cachedCadPreciseFr = cad("fr", 2);
const cachedCadPreciseEn = cad("en", 2);

/** 43934300 → "439 343 $" (fr) / "$439,343" (en) */
export function formatCad(cents: number, locale: FormatLocale = "fr"): string {
  const formatter = locale === "en" ? cachedCadEn : cachedCadFr;
  return formatter.format(Math.round(cents) / 100);
}

/** 43934300 → "439 343,00 $" / "$439,343.00" */
export function formatCadPrecise(cents: number, locale: FormatLocale = "fr"): string {
  const formatter = locale === "en" ? cachedCadPreciseEn : cachedCadPreciseFr;
  return formatter.format(Math.round(cents) / 100);
}

export function formatNumber(value: number, locale: FormatLocale = "fr"): string {
  return new Intl.NumberFormat(tag(locale)).format(value);
}

/** 0.9812 → "98,1 %" / "98.1%" */
export function formatPercent(ratio: number, digits = 1, locale: FormatLocale = "fr"): string {
  const formatter = new Intl.NumberFormat(tag(locale), {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return formatter.format(ratio);
}

/** "2026-10-26" → "26 octobre 2026" / "October 26, 2026" */
export function formatDateFr(iso: string | null | undefined, locale: FormatLocale = "fr"): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(tag(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Alias with a locale-neutral name for new code. */
export const formatDate = formatDateFr;

/** "2025-10" → "octobre 2025" / "October 2025" */
export function formatMonthFr(period: string | null | undefined, locale: FormatLocale = "fr"): string {
  if (!period) return "—";
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return period;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return period;
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat(tag(locale), { month: "long", year: "numeric", timeZone: "UTC" }).format(
    date,
  );
}

export const formatMonth = formatMonthFr;

/** 1234.5 → "1 234,5 m²" / "1,234.5 m²" */
export function formatArea(m2: number | null | undefined, locale: FormatLocale = "fr"): string {
  if (m2 == null || Number.isNaN(m2)) return "—";
  return `${new Intl.NumberFormat(tag(locale), { maximumFractionDigits: 1 }).format(m2)} m²`;
}

/** 3100000 → "3,1 M" ; 40290 → "40 290" */
export function formatCompact(value: number, locale: FormatLocale = "fr"): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${new Intl.NumberFormat(tag(locale), { maximumFractionDigits: 1 }).format(value / 1_000_000)} M`;
  }
  if (Math.abs(value) >= 10_000) {
    return `${new Intl.NumberFormat(tag(locale), { maximumFractionDigits: 0 }).format(value / 1000)} k`;
  }
  return formatNumber(value, locale);
}

/** 57 → "57 jours" / "57 days" */
export function formatDays(days: number, locale: FormatLocale = "fr"): string {
  const unit = locale === "en" ? (days === 1 ? "day" : "days") : days === 1 ? "jour" : "jours";
  return `${new Intl.NumberFormat(tag(locale), { maximumFractionDigits: 0 }).format(days)} ${unit}`;
}

export function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
