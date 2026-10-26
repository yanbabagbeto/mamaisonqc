/**
 * Route inventory for the Lead's `src/app/sitemap.ts` (PRD AC-10).
 * Every published article is included with its real `updatedAt` date, plus the fixed
 * editorial pages. `lastModified` is an ISO date so Next can serialise it without guessing.
 */
import { listArticles } from "./loader";
import type { ContentRoute } from "./types";

/** Last editorial review of the legal/trust pages below (ISO date). */
export const CONTENT_REVIEWED_AT = "2026-10-26";

const STATIC_ROUTES: ContentRoute[] = [
  { path: "/conseils", lastModified: CONTENT_REVIEWED_AT, changeFrequency: "weekly", priority: 0.8 },
  { path: "/nouvelles", lastModified: CONTENT_REVIEWED_AT, changeFrequency: "weekly", priority: 0.8 },
  { path: "/le-brief", lastModified: CONTENT_REVIEWED_AT, changeFrequency: "daily", priority: 0.9 },
  { path: "/faq", lastModified: CONTENT_REVIEWED_AT, changeFrequency: "monthly", priority: 0.7 },
  { path: "/donnees", lastModified: CONTENT_REVIEWED_AT, changeFrequency: "monthly", priority: 0.7 },
  { path: "/conditions", lastModified: CONTENT_REVIEWED_AT, changeFrequency: "yearly", priority: 0.3 },
  {
    path: "/confidentialite",
    lastModified: CONTENT_REVIEWED_AT,
    changeFrequency: "yearly",
    priority: 0.3,
  },
  { path: "/contact", lastModified: CONTENT_REVIEWED_AT, changeFrequency: "yearly", priority: 0.4 },
];

export function listContentRoutes(): ContentRoute[] {
  const articleRoutes: ContentRoute[] = listArticles().map((article) => ({
    path: article.path,
    lastModified: article.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...STATIC_ROUTES, ...articleRoutes].sort((a, b) => (a.path < b.path ? -1 : 1));
}
