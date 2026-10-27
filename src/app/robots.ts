import type { MetadataRoute } from "next";

import { getBaseUrl } from "@/lib/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private or account-scoped surfaces must never be indexed.
        disallow: ["/admin", "/api/", "/connexion", "/inscription", "/proprietaire/tableau-de-bord", "/pre-marche/publier"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
