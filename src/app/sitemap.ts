import type { MetadataRoute } from "next";
import { eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { propertyUnit, territory } from "@/db/schema";
import { getBaseUrl } from "@/lib/site-url";

/**
 * Sitemap: static routes + every ingested municipality with roll data + content routes
 * exported by the content module (loaded defensively so a build without content still works).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getBaseUrl();
  const now = new Date();

  const staticPaths = [
    "/",
    "/recherche",
    "/evaluation",
    "/explorer",
    "/mon-financement",
    "/marche-immobilier",
    "/pre-marche",
    "/tester-le-marche",
    "/reclamer-ma-page",
    "/proprietaire",
    "/proprietaire/equite",
    "/proprietaire/subventions-renovation",
    "/proprietaire/hypotheque",
    "/proprietaire/hypotheque/renouvellement-hypothecaire",
    "/proprietaire/hypotheque/refinancer-pour-renover",
    "/proprietaire/hypotheque/refinancer-pour-investir",
    "/proprietaire/hypotheque/consolidation-de-dettes",
    "/proprietaire/hypotheque/separation-racheter-la-maison",
    "/proprietaire/hypotheque/vendre-ou-renover",
    "/proprietaire/subventions-renovation/renoclimat",
    "/proprietaire/subventions-renovation/renoclimat-adaptation",
    "/proprietaire/subventions-renovation/logisvert",
    "/proprietaire/subventions-renovation/logisvert-revenu-modeste",
    "/proprietaire/subventions-renovation/maisons-abordables-plus-vertes",
    "/le-brief",
    "/nouvelles",
    "/conseils",
    "/faq",
    "/contact",
    "/donnees",
    "/conditions",
    "/confidentialite",
  ];

  type Entry = MetadataRoute.Sitemap[number];
  const byUrl = new Map<string, Entry>();

  const add = (path: string, entry: Partial<Entry> = {}): void => {
    const url = `${base}${path}`;
    const existing = byUrl.get(url);
    byUrl.set(url, {
      url,
      lastModified: entry.lastModified ?? existing?.lastModified ?? now,
      changeFrequency: entry.changeFrequency ?? existing?.changeFrequency ?? "weekly",
      priority: entry.priority ?? existing?.priority ?? 0.6,
      alternates: {
        languages: {
          "fr-CA": url,
          "en-CA": `${base}/en${path === "/" ? "" : path}`,
        },
      },
    });
  };

  for (const path of staticPaths) {
    add(path, { priority: path === "/" ? 1 : 0.7, changeFrequency: path === "/" ? "daily" : "weekly" });
  }

  try {
    const covered = await db
      .selectDistinct({ municipalityCode: propertyUnit.municipalityCode })
      .from(propertyUnit);
    const codes = covered.map((row) => row.municipalityCode);
    if (codes.length > 0) {
      const municipalities = await db
        .select({ code: territory.codeGeo, slug: territory.slug, parentCode: territory.parentCode })
        .from(territory)
        .where(inArray(territory.codeGeo, codes));
      const regions = await db
        .select({ code: territory.codeGeo, slug: territory.slug })
        .from(territory)
        .where(eq(territory.level, "region"));
      const regionByCode = new Map(regions.map((region) => [region.code, region.slug]));

      for (const region of regions) {
        add(`/marche-immobilier/${region.slug}`, { priority: 0.6 });
      }
      for (const municipality of municipalities) {
        const regionSlug = municipality.parentCode ? regionByCode.get(municipality.parentCode) : null;
        if (!regionSlug) continue;
        add(`/marche-immobilier/${regionSlug}/${municipality.slug}`, { priority: 0.5 });
      }
    }
  } catch (error) {
    console.error("[sitemap] market routes skipped", error);
  }

  try {
    const content = (await import("@/modules/content").catch(() => null)) as
      | { listContentRoutes?: () => Array<{ path: string; lastModified: string; changeFrequency?: string; priority?: number }> }
      | null;
    const contentRoutes = content?.listContentRoutes?.() ?? [];
    for (const route of contentRoutes) {
      add(route.path, {
        lastModified: new Date(route.lastModified),
        changeFrequency: (route.changeFrequency as "weekly" | undefined) ?? "monthly",
        priority: route.priority ?? 0.5,
      });
    }
  } catch (error) {
    console.error("[sitemap] content routes skipped", error);
  }

  return [...byUrl.values()];
}
