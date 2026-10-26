/**
 * Content types. Article metadata comes from validated front-matter in `content/**\/*.md`;
 * the HTML body is rendered once by the loader (see `loader.ts`).
 */

export const CONTENT_CATEGORIES = ["conseils", "nouvelles"] as const;

export type ContentCategory = (typeof CONTENT_CATEGORIES)[number];

/** A source that backs a factual claim in an article. Never optional: see PRD AC-18. */
export type ContentSource = {
  label: string;
  url: string;
};

export type ArticleMeta = {
  title: string;
  slug: string;
  category: ContentCategory;
  /** ISO calendar date, `YYYY-MM-DD`. */
  publishedAt: string;
  /** ISO calendar date of the last substantive edit, `YYYY-MM-DD`. */
  updatedAt: string;
  description: string;
  sources: ContentSource[];
  draft: boolean;
  /** Optional authored English metadata (never machine-translated). */
  titleEn?: string;
  descriptionEn?: string;
  summaryEn?: string;
};

export type Article = ArticleMeta & {
  /** Rendered HTML body, produced by `marked` from the reviewed Markdown file. */
  html: string;
  /** Rendered English body from the optional `bodyEn` front-matter field; null when absent. */
  htmlEn: string | null;
  wordCount: number;
  readingMinutes: number;
  /** Public path, e.g. `/conseils/comprendre-role-evaluation`. */
  path: string;
};

/** Shape the Lead merges into `src/app/sitemap.ts` (PRD AC-10). */
export type ContentRoute = {
  path: string;
  /** ISO date-time string (or `YYYY-MM-DD`, which Next normalises as UTC midnight). */
  lastModified: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
};
