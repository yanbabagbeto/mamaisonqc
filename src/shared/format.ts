/** Formatting helpers. One place for every number the product shows. */

const cadFormatter = new Intl.NumberFormat("fr-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const cadPreciseFormatter = new Intl.NumberFormat("fr-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("fr-CA");

const minutesFormat = new Intl.NumberFormat("fr-CA", { maximumFractionDigits: 0 });

/** 43934300 → "439 343 $" */
export function formatCad(cents: number): string {
  return cadFormatter.format(Math.round(cents) / 100);
}

/** 43934300 → "439 343,00 $" */
export function formatCadPrecise(cents: number): string {
  return cadPreciseFormatter.format(Math.round(cents) / 100);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** 0.9812 → "98,1 %" */
export function formatPercent(ratio: number, digits = 1): string {
  const formatter = new Intl.NumberFormat("fr-CA", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return formatter.format(ratio);
}

/** "2026-10-01" or ISO datetime → "26 octobre 2026" */
export function formatDateFr(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** "2025-10" → "octobre 2025" */
export function formatMonthFr(period: string | null | undefined): string {
  if (!period) return "—";
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return period;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return new Intl.DateTimeFormat("fr-CA", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    date,
  );
}

/** 1234.5 → "1 234,5 m²" */
export function formatArea(m2: number | null | undefined): string {
  if (m2 == null || Number.isNaN(m2)) return "—";
  return `${new Intl.NumberFormat("fr-CA", { maximumFractionDigits: 1 }).format(m2)} m²`;
}

/** 3100000 → "3,1 M" ; 40290 → "40 290" */
export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${new Intl.NumberFormat("fr-CA", { maximumFractionDigits: 1 }).format(value / 1_000_000)} M`;
  }
  if (Math.abs(value) >= 10_000) {
    return `${new Intl.NumberFormat("fr-CA", { maximumFractionDigits: 0 }).format(value / 1000)} k`;
  }
  return numberFormatter.format(value);
}

/** 57 → "57 jours" */
export function formatDays(days: number): string {
  return `${minutesFormat.format(days)} ${days === 1 ? "jour" : "jours"}`;
}

/** Adds `count` months to an ISO date/period. Used by calculators, kept pure for tests. */
export function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
