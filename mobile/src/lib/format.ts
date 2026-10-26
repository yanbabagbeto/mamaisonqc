import type { Language } from "../i18n";

/**
 * Locale-aware formatting. One place for every number the app shows, mirroring
 * `src/shared/format.ts` on the web — except the locale follows the in-app language
 * (`fr-CA` default, `en-CA` for English) instead of being hardcoded to French.
 *
 * Money is always integer cents in, localized string out.
 */

export const LOCALES: Record<Language, string> = { fr: "fr-CA", en: "en-CA" };

export function localeFor(lang: Language): string {
  return LOCALES[lang];
}

const DASH = "—";

export function formatCad(cents: number | null | undefined, lang: Language, precise = false): string {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) return DASH;
  const digits = precise ? 2 : 0;
  return new Intl.NumberFormat(localeFor(lang), {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Math.round(cents) / 100);
}

export function formatNumber(value: number | null | undefined, lang: Language, digits = 0): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return DASH;
  return new Intl.NumberFormat(localeFor(lang), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCount(value: number | null | undefined, lang: Language): string {
  return formatNumber(value, lang);
}

/** 1234.5 → "1 234,5 m²" / "1,234.5 m²". */
export function formatArea(m2: number | null | undefined, lang: Language): string {
  if (m2 === null || m2 === undefined || !Number.isFinite(m2)) return DASH;
  return `${formatNumber(m2, lang, m2 % 1 === 0 ? 0 : 1)} m²`;
}

/** Basis points → percentage: 8000 → "80 %". */
export function formatBp(bp: number | null | undefined, lang: Language, digits = 0): string {
  if (bp === null || bp === undefined || !Number.isFinite(bp)) return DASH;
  return new Intl.NumberFormat(localeFor(lang), {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(bp / 10_000);
}

/** ISO date/time → "26 octobre 2026" / "October 26, 2026". UTC to match the web output. */
export function formatDate(iso: string | null | undefined, lang: Language): string {
  if (!iso) return DASH;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return DASH;
  return new Intl.DateTimeFormat(localeFor(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** "2025-10" → "octobre 2025" / "October 2025". Unparsable periods are returned verbatim. */
export function formatMonth(period: string | null | undefined, lang: Language): string {
  if (!period) return DASH;
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return period;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return period;
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat(localeFor(lang), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** "1234 rue Sainte-Catherine Ouest" + city → "…, Montréal". */
export function joinAddress(street: string | null | undefined, city: string | null | undefined): string {
  const parts = [street?.trim(), city?.trim()].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(", ") : DASH;
}
