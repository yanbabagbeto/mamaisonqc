import { z } from "zod";

import { NOTIFICATION_KEYS } from "./types";

/**
 * API schemas for the buyer endpoints. The API is not locale-prefixed (`src/proxy.ts` skips
 * `/api`), so its validation messages stay French; the UI always shows its own localized copy.
 */
export const savedListingSchema = z.object({
  listingId: z.string().trim().min(1).max(64),
});

export const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().min(1).max(254).email("Adresse courriel invalide."),
  note: z.string().trim().max(500).optional().default(""),
  consent: z.literal(true, {
    message: "Le consentement à la conservation des données est requis.",
  }),
  policyVersion: z.string().trim().min(1).max(40).optional().default("loi25-v1"),
});

export const prefsSchema = z.object({
  offres: z.boolean(),
  annonce: z.boolean(),
  marche: z.boolean(),
  conseils: z.boolean(),
});

export type SavedListingInput = z.infer<typeof savedListingSchema>;
export type WaitlistInput = z.infer<typeof waitlistSchema>;
export type PrefsInput = z.infer<typeof prefsSchema>;

export function notificationKeys(): readonly string[] {
  return NOTIFICATION_KEYS;
}
