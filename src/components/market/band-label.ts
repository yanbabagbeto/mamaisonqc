import type { Locale } from "@/i18n/config";

import type { PriceBandBucket, ValueBand } from "@/modules/market/aggregate";
import type { MarketMessages } from "@/modules/market/messages";

import { formatCad } from "@/shared/format";

/**
 * Labels for the source's price bands and for the roll-value bands.
 *
 * A price band is kept verbatim from the Registre foncier; only the numbers are humanised
 * ("300000-349999" → "300 000 $ à 349 999 $"). When the source label cannot be parsed, the raw
 * label is displayed unchanged: no range is invented.
 */
export function priceBandLabel(
  band: PriceBandBucket,
  locale: Locale,
  labels: MarketMessages,
): string {
  if (band.minCents !== null && band.maxCents !== null) {
    return labels.bands.range(formatCad(band.minCents, locale), formatCad(band.maxCents, locale));
  }
  if (band.maxCents !== null) return labels.bands.lessThan(formatCad(band.maxCents, locale));
  if (band.minCents !== null) return labels.bands.andUp(formatCad(band.minCents, locale));
  return band.label;
}

/** Roll-value bands are built from the real assessed values; the bounds are exact dollars. */
export function valueBandLabel(band: ValueBand, locale: Locale, labels: MarketMessages): string {
  if (band.maxCents === null) return labels.bands.andUp(formatCad(band.minCents, locale));
  if (band.maxCents === band.minCents) return formatCad(band.minCents, locale);
  return labels.bands.range(formatCad(band.minCents, locale), formatCad(band.maxCents, locale));
}

/** Property types come from the roll schema; their labels are translated, the values are not. */
export function propertyTypeLabel(propertyType: string, labels: MarketMessages): string {
  switch (propertyType) {
    case "unifamiliale":
      return labels.propertyTypes.unifamiliale;
    case "copropriete":
      return labels.propertyTypes.copropriete;
    case "plex":
      return labels.propertyTypes.plex;
    case "terrain":
      return labels.propertyTypes.terrain;
    case "non-residentiel":
      return labels.propertyTypes.nonResidentiel;
    case "autre":
      return labels.propertyTypes.autre;
    default:
      return propertyType;
  }
}

/** Values accepted by the municipality `?type=` filter (PRD F4). */
export const PROPERTY_TYPE_VALUES = ["unifamiliale", "copropriete", "plex"] as const;

export function propertyTypeOptions(
  labels: MarketMessages,
): Array<{ value: string | null; label: string }> {
  return [
    { value: null, label: labels.propertyTypes.all },
    ...PROPERTY_TYPE_VALUES.map((value) => ({ value: value as string, label: propertyTypeLabel(value, labels) })),
  ];
}
