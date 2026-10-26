/**
 * Markdown loader for `content/**\/*.md` (conseils + nouvelles).
 *
 * Design notes:
 * - Reads from `process.cwd()/content`, the reviewed source of truth committed in git.
 * - `gray-matter` parses the YAML header, `marked` renders the body to HTML.
 * - Path traversal is blocked twice: the slug regex refuses `.` and `/`, and the resolved
 *   path must stay inside `content/`.
 * - Invalid metadata throws at build time on purpose: an article without sources must not
 *   ship (PRD AC-18). A bad URL slug, however, returns `null` so the page can 404.
 */
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { marked } from "marked";

import {
  assertContentCategory,
  assertSafeSlug,
  ContentError,
  countWords,
  parseFrontmatter,
  readingMinutes,
  sortArticles,
} from "./frontmatter";
import {
  CONTENT_CATEGORIES,
  type Article,
  type ContentCategory,
} from "./types";

export const CONTENT_DIR = path.join(process.cwd(), "content");

function contentRoot(): string {
  return path.resolve(CONTENT_DIR);
}

function fileLabelFor(category: ContentCategory, fileName: string): string {
  return `content/${category}/${fileName}`;
}

/**
 * Parses one Markdown document. Exported separately from the filesystem loader so the
 * validation rules can be tested on fixtures.
 */
export function parseArticle(
  source: string,
  category: ContentCategory,
  fileLabel: string,
): Article {
  assertContentCategory(category);

  const parsed = matter(source);
  const { bodyEn, ...meta } = parseFrontmatter(parsed.data, fileLabel);

  if (meta.category !== category) {
    throw new ContentError(
      `${fileLabel} : la catégorie « ${meta.category} » ne correspond pas au dossier « ${category} ».`,
    );
  }
  assertSafeSlug(meta.slug);

  const html = marked(parsed.content, { async: false, gfm: true });
  const htmlEn = bodyEn ? marked(bodyEn, { async: false, gfm: true }) : null;
  const wordCount = countWords(html);

  return {
    ...meta,
    html,
    htmlEn,
    wordCount,
    readingMinutes: readingMinutes(wordCount),
    path: `/${category}/${meta.slug}`,
  };
}

/** Resolves `content/<category>/<slug>.md` and proves the result stays inside `content/`. */
export function articlePath(category: string, slug: string): string {
  assertContentCategory(category);
  assertSafeSlug(slug);

  const root = contentRoot();
  const fullPath = path.resolve(root, category, `${slug}.md`);
  if (fullPath !== path.join(root, category, `${slug}.md`) || !fullPath.startsWith(root + path.sep)) {
    throw new ContentError(`Chemin d'article hors du répertoire de contenu : ${slug}`);
  }
  return fullPath;
}

function readArticleFile(fullPath: string, category: ContentCategory): Article {
  const fileName = path.basename(fullPath);
  const expectedSlug = fileName.replace(/\.md$/, "");
  const source = fs.readFileSync(fullPath, "utf8");
  const article = parseArticle(source, category, fileLabelFor(category, fileName));

  if (article.slug !== expectedSlug) {
    throw new ContentError(
      `${fileLabelFor(category, fileName)} : le slug « ${article.slug} » ne correspond pas au nom du fichier.`,
    );
  }
  return article;
}

/** Published articles of one category (or all categories), most recent first. */
export function listArticles(category?: ContentCategory): Article[] {
  const categories: ContentCategory[] = category ? [category] : [...CONTENT_CATEGORIES];
  const articles: Article[] = [];

  for (const current of categories) {
    const dir = path.join(contentRoot(), current);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((file) => file.endsWith(".md"));
    for (const file of files) {
      const article = readArticleFile(path.join(dir, file), current);
      if (!article.draft) articles.push(article);
    }
  }

  return sortArticles(articles);
}

/**
 * One published article, or `null` when it does not exist / the route parameters are invalid.
 * Returning `null` (instead of throwing) lets the page call `notFound()` on hostile URLs.
 */
export function getArticle(category: string, slug: string): Article | null {
  let fullPath: string;
  try {
    fullPath = articlePath(category, slug);
  } catch (error) {
    if (error instanceof ContentError) return null;
    throw error;
  }

  try {
    const article = readArticleFile(fullPath, category as ContentCategory);
    return article.draft ? null : article;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}

/** Slugs of every published article in a category, for `generateStaticParams`. */
export function listArticleSlugs(category: ContentCategory): string[] {
  return listArticles(category).map((article) => article.slug);
}
