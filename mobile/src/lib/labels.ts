import type { Dictionary, Language } from "../i18n";
import { format } from "../i18n";
import type { PriceBand } from "../api/types";
import { formatCad } from "./format";

/**
 * Localized labels for server *codes*. The API returns stable codes (`unifamiliale`,
 * `faible`, `3-6`, `plafond`) precisely so the app can translate them; a code the dictionaries
 * do not know is shown verbatim rather than hidden.
 */

export function propertyTypeLabel(t: Dictionary, code: string): string {
  const map = t.propertyTypes as Record<string, string>;
  return map[code] ?? t.propertyTypes.autre;
}

export type ConfidenceTone = "success" | "warning" | "neutral";

export function confidenceLabel(t: Dictionary, code: string): string {
  const map = t.evaluation.estimateConfidenceValue as Record<string, string>;
  return map[code] ?? code;
}

export function confidenceTone(code: string): ConfidenceTone {
  if (code === "elevee") return "success";
  if (code === "moyenne") return "warning";
  return "neutral";
}

export function horizonLabel(t: Dictionary, code: string): string {
  const map = t.premarket.horizons as Record<string, string>;
  return map[code] ?? code;
}

export function limitedByLabel(t: Dictionary, code: string): string {
  if (code === "plafond") return t.owner.limitedByPlafond;
  if (code === "solde") return t.owner.limitedBySolde;
  return t.owner.limitedByAucune;
}

/**
 * Localized label for a source price band. The Registre foncier publishes its own band labels; we
 * keep the label verbatim when its bounds cannot be parsed, and never compute an average price.
 */
export function bandLabel(band: PriceBand, t: Dictionary, lang: Language): string {
  if (band.minCents === null && band.maxCents === null) return band.label;
  if (band.minCents === null) {
    return format(t.market.bandOpenLow, { value: formatCad(band.maxCents, lang) });
  }
  if (band.maxCents === null) {
    return format(t.market.bandOpenHigh, { value: formatCad(band.minCents, lang) });
  }
  return format(t.market.bandRange, {
    min: formatCad(band.minCents, lang),
    max: formatCad(band.maxCents, lang),
  });
}
