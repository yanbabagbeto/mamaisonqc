import { z } from "zod";

export const MIN_ADDRESS_QUERY_LENGTH = 3;
export const MAX_ADDRESS_QUERY_LENGTH = 120;

/**
 * One schema for both consumers: `GET /api/address/search` and `/recherche`. The limit keeps
 * a single query well inside the geocoder's capabilities and the cache's key size.
 */
export const addressQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(
      MIN_ADDRESS_QUERY_LENGTH,
      "Indiquez une adresse d'au moins 3 caractères (numéro civique et rue).",
    )
    .max(
      MAX_ADDRESS_QUERY_LENGTH,
      "Adresse trop longue : 120 caractères maximum.",
    ),
});

export type AddressQuery = z.infer<typeof addressQuerySchema>;
