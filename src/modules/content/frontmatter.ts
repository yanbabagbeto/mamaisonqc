/**
 * Front-matter validation for `content/**\/*.md`.
 *
 * Every factual claim in an article must carry at least one real source (PRD AC-18), so a
 * document without `sources` is invalid rather than silently published. Validation is pure so
 * it can be unit-tested without touching the filesystem.
 */
import { z } from "zod";

import { CONTENT_CATEGORIES, type ArticleMeta, type ContentCategory } from "./types";

/** Slugs are ASCII, lowercase, dash-separated. This rejects `..`, `/`, `\` and accents. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}

/** A slug that survives URL parsing and cannot escape `content/<category>/`. */
export function assertSafeSlug(slug: string): void {
  if (slug.length === 0 || slug.length > 80 || !SLUG_PATTERN.test(slug)) {
    throw new ContentError(
      `Slug invalide « ${slug} » : seuls les caractères a-z, 0-9 et le tiret sont permis.`,
    );
  }
  if (slug.includes("..") || slug.includes("/") || slug.includes("\\")) {
    throw new ContentError(`Slug invalide « ${slug} » : tentative de sortie du répertoire.`);
  }
}

export function assertContentCategory(category: string): asserts category is ContentCategory {
  if (!(CONTENT_CATEGORIES as readonly string[]).includes(category)) {
    throw new ContentError(
      `Catégorie inconnue « ${category} » : valeurs permises ${CONTENT_CATEGORIES.join(", ")}.`,
    );
  }
}

/** `2026-02-30` matches the regex but is not a calendar date: refuse it. */
export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().slice(0, 10) === value;
}

const isoDate = z
  .string()
  .trim()
  .refine(isValidIsoDate, "Date attendue au format AAAA-MM-JJ (date du calendrier valide).");

const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "URL invalide : une adresse https:// vérifiable est requise.");

const sourceSchema = z
  .object({
    label: z.string().trim().min(3, "Le libellé de la source est trop court.").max(160),
    url: httpsUrl,
  })
  .strict();

export const frontmatterSchema = z
  .object({
    title: z.string().trim().min(4, "Titre trop court.").max(120, "Titre trop long (120 max)."),
    slug: z.string().trim().regex(SLUG_PATTERN, "Slug invalide (a-z, 0-9, tirets)."),
    category: z.enum(CONTENT_CATEGORIES, "Catégorie inconnue."),
    publishedAt: isoDate,
    updatedAt: isoDate,
    description: z
      .string()
      .trim()
      .min(40, "Description trop courte (40 caractères minimum).")
      .max(320, "Description trop longue (320 caractères maximum)."),
    sources: z
      .array(sourceSchema)
      .min(1, "Au moins une source vérifiable est requise.")
      .max(10, "Maximum 10 sources par article."),
    draft: z.boolean().default(false),
    // Authored English fields. Optional: when `bodyEn` is absent the page says the article is
    // French-only instead of showing an empty or machine-translated text.
    titleEn: z.string().trim().min(4, "Titre anglais trop court.").max(160).optional(),
    descriptionEn: z
      .string()
      .trim()
      .min(20, "Description anglaise trop courte.")
      .max(400)
      .optional(),
    summaryEn: z.string().trim().min(20).max(700).optional(),
    bodyEn: z.string().trim().min(200, "Corps anglais trop court.").optional(),
  })
  .strict()
  .refine((data) => data.updatedAt >= data.publishedAt, {
    message: "updatedAt doit être postérieur ou égal à publishedAt.",
    path: ["updatedAt"],
  })
  .superRefine((data, ctx) => {
    if (data.bodyEn && !data.titleEn) {
      ctx.addIssue({
        code: "custom",
        path: ["titleEn"],
        message: "Un corps anglais (bodyEn) exige un titre anglais (titleEn).",
      });
    }
    if (data.titleEn && !data.descriptionEn) {
      ctx.addIssue({
        code: "custom",
        path: ["descriptionEn"],
        message: "Un titre anglais (titleEn) exige une description anglaise (descriptionEn).",
      });
    }
  });

export type FrontmatterData = ArticleMeta & { bodyEn?: string };

/**
 * Validates raw YAML data (as returned by `gray-matter`) for a given file.
 * Throws `ContentError` with a French, file-scoped message — the site must never publish
 * an article whose metadata is incomplete.
 */
export function parseFrontmatter(raw: unknown, fileLabel: string): FrontmatterData {
  const result = frontmatterSchema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "(racine)"}: ${issue.message}`)
      .join(" ; ");
    throw new ContentError(`Métadonnées invalides dans ${fileLabel} — ${details}`);
  }
  return result.data;
}

/** Most recent first; ties broken by slug so the order is deterministic. */
export function sortArticles<T extends { publishedAt: string; slug: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.publishedAt !== b.publishedAt) return a.publishedAt < b.publishedAt ? 1 : -1;
    return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
  });
}

/** Strips tags/entities to count words; used for the reading-time estimate and tests. */
export function countWords(html: string): number {
  const text = html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length === 0) return 0;
  return text.split(" ").length;
}

/** ~220 French words per minute, rounded up, never below 1. */
export function readingMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 220));
}
