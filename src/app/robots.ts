import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.SITE_URL.replace(/\/$/, "");
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
    host: base,
  };
}
