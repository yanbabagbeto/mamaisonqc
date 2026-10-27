import { z } from "zod";

/**
 * Server-only environment. Importing this module from a client component is a bug:
 * we fail loudly instead of leaking configuration into the browser bundle.
 */
if (typeof window !== "undefined") {
  throw new Error("src/lib/env.ts must only be imported on the server");
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1).default("./data/mamaisonqc.db"),
  /** Public origin. When unset, it is derived from the request (see src/lib/site-url.ts). */
  SITE_URL: z.string().url().optional(),
  /** MERN Adresses Québec geocoder (CC-BY 4.0). */
  GEOCODER_URL: z
    .string()
    .url()
    .default(
      "https://servicescarto.mrnf.gouv.qc.ca/pes/rest/services/Territoire/Adresse_Geocodage/GeocodeServer",
    ),
  /** When "1", the address search never calls the network (tests, offline demos). */
  GEOCODER_OFFLINE: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  throw new Error(`Invalid environment: ${details}`);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  geocoderOffline: parsed.data.GEOCODER_OFFLINE === "1",
};
