/** Buyer-domain shared types. Pure data shapes only — no Drizzle, no UI. */

export type ExplorerListing = {
  id: string;
  /** Masked public street name (never the civic number). */
  street: string;
  city: string;
  municipalityCode: string;
  propertyType: string;
  horizon: string;
  askingPriceCents: number;
  /** Real centroid from the ingested roll; `null` when the roll has no coordinates. */
  lat: number | null;
  lon: number | null;
  createdAt: string;
};

export type LocatedListing = ExplorerListing & { lat: number; lon: number };

export type ExplorerFilters = {
  propertyType: string | null;
  horizon: string | null;
  regionCode: string | null;
};

export type RegionOption = {
  code: string;
  name: string;
  slug: string;
};

export type TerritoryRow = {
  codeGeo: string;
  level: string;
  parentCode: string | null;
};

export type BuyerSavedListing = {
  savedId: string;
  listingId: string;
  street: string;
  city: string;
  propertyType: string;
  horizon: string;
  askingPriceCents: number;
  savedAt: string;
};

export type BuyerInterest = {
  id: string;
  listingId: string;
  street: string;
  city: string;
  message: string | null;
  status: string;
  createdAt: string;
};

export const NOTIFICATION_KEYS = ["offres", "annonce", "marche", "conseils"] as const;
export type NotificationKey = (typeof NOTIFICATION_KEYS)[number];
export type NotificationPrefs = Record<NotificationKey, boolean>;

export function defaultNotificationPrefs(): NotificationPrefs {
  return { offres: true, annonce: true, marche: true, conseils: true };
}
