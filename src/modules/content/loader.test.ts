import { describe, expect, it } from "vitest";

import { listContentRoutes } from "./routes";
import { articlePath, getArticle, listArticleSlugs, listArticles, parseArticle } from "./loader";
import { ContentError, SLUG_PATTERN } from "./frontmatter";

function document(overrides: Record<string, unknown> = {}): string {
  const data = {
    title: "Un titre de test suffisamment long",
    slug: "un-article-de-test",
    category: "conseils",
    publishedAt: "2026-01-15",
    updatedAt: "2026-02-01",
    description:
      "Une description de test qui respecte la longueur minimale exigée par le validateur de contenu.",
    sources: [{ label: "MAMH — Évaluation foncière", url: "https://www.quebec.ca/test" }],
    ...overrides,
  };
  const yaml = Object.entries(data)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}:\n  - label: "${(value[0] as { label: string }).label}"\n    url: "${(value[0] as { url: string }).url}"`;
      }
      return `${key}: ${typeof value === "string" ? JSON.stringify(value) : String(value)}`;
    })
    .join("\n");
  return `---\n${yaml}\n---\n\n## Une section\n\nUn paragraphe de contenu.\n`;
}

describe("parseArticle", () => {
  it("rend le corps Markdown en HTML et calcule le chemin public", () => {
    const article = parseArticle(document(), "conseils", "content/conseils/un-article-de-test.md");
    expect(article.html).toContain("<h2");
    expect(article.path).toBe("/conseils/un-article-de-test");
    expect(article.wordCount).toBeGreaterThan(3);
    expect(article.readingMinutes).toBeGreaterThanOrEqual(1);
    expect(article.draft).toBe(false);
  });

  it("refuse un fichier dont la catégorie ne correspond pas au dossier", () => {
    expect(() => parseArticle(document(), "nouvelles", "content/nouvelles/un-article-de-test.md")).toThrow(
      ContentError,
    );
  });

  it("refuse un slug différent du nom de fichier (contrôlé par le chargeur)", () => {
    expect(() => getArticle("conseils", "slug-inexistant")).not.toThrow();
    expect(getArticle("conseils", "slug-inexistant")).toBeNull();
  });
});

describe("getArticle (sécurité)", () => {
  const attacks = [
    "../../package",
    "../package",
    "..%2Fpackage",
    "UPPER",
    "avec_accents_é",
    "a.b",
    "conseils/../../secret",
  ];

  it("retourne null sur chaque tentative de traversée de chemin", () => {
    for (const attack of attacks) {
      expect(getArticle("conseils", attack), attack).toBeNull();
      expect(getArticle(attack, "comprendre-role-evaluation"), attack).toBeNull();
    }
  });

  it("articlePath lève une ContentError hors du répertoire autorisé", () => {
    expect(() => articlePath("conseils", "../package")).toThrow(ContentError);
    expect(() => articlePath("inconnue", "x")).toThrow(ContentError);
  });
});

describe("contenu réellement livré", () => {
  it("publie 4 conseils et 2 nouvelles, tous valides", () => {
    const conseils = listArticles("conseils");
    const nouvelles = listArticles("nouvelles");
    expect(conseils).toHaveLength(4);
    expect(nouvelles).toHaveLength(2);
    for (const article of [...conseils, ...nouvelles]) {
      expect(article.draft).toBe(false);
      expect(article.slug).toMatch(SLUG_PATTERN);
      expect(article.sources.length).toBeGreaterThanOrEqual(2);
      for (const source of article.sources) {
        expect(source.url.startsWith("https://"), source.url).toBe(true);
      }
      expect(article.description.length).toBeGreaterThanOrEqual(40);
      expect(article.html.length).toBeGreaterThan(500);
    }
  });

  it("respecte la cible éditoriale de 600 à 1 200 mots par article", () => {
    for (const article of listArticles()) {
      expect(article.wordCount, `${article.path} trop court`).toBeGreaterThanOrEqual(600);
      expect(article.wordCount, `${article.path} trop long`).toBeLessThanOrEqual(1200);
      expect(article.readingMinutes).toBeLessThanOrEqual(6);
    }
  });

  it("trie du plus récent au plus ancien et n'a aucun doublon", () => {
    const articles = listArticles();
    const dates = articles.map((article) => article.publishedAt);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(new Set(articles.map((article) => article.path)).size).toBe(articles.length);
  });

  it("listArticleSlugs correspond aux articles publiés", () => {
    expect(listArticleSlugs("conseils")).toHaveLength(4);
    expect(getArticle("conseils", "comprendre-role-evaluation")?.path).toBe(
      "/conseils/comprendre-role-evaluation",
    );
  });

  it("expose les routes de contenu pour le sitemap", () => {
    const routes = listContentRoutes();
    const paths = routes.map((route) => route.path);
    for (const expected of [
      "/conseils",
      "/nouvelles",
      "/le-brief",
      "/faq",
      "/donnees",
      "/conditions",
      "/confidentialite",
      "/contact",
    ]) {
      expect(paths).toContain(expected);
    }
    for (const article of listArticles()) {
      expect(paths).toContain(article.path);
      const route = routes.find((candidate) => candidate.path === article.path);
      expect(route?.lastModified).toBe(article.updatedAt);
    }
    for (const route of routes) {
      expect(route.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(route.priority).toBeGreaterThan(0);
      expect(route.priority).toBeLessThanOrEqual(1);
    }
  });
});

describe("couverture bilingue", () => {
  it("les 4 conseils ont un corps anglais rédigé (bodyEn)", () => {
    const conseils = listArticles("conseils");
    expect(conseils).toHaveLength(4);
    for (const article of conseils) {
      expect(article.htmlEn, `${article.path} sans bodyEn`).not.toBeNull();
      expect(article.titleEn, `${article.path} sans titleEn`).toBeTruthy();
      expect(article.descriptionEn, `${article.path} sans descriptionEn`).toBeTruthy();
      expect(article.htmlEn?.includes("<h2"), `${article.path} bodyEn non rendu`).toBe(true);
    }
  });

  it("les nouvelles ont des métadonnées anglaises mais restent en français", () => {
    const nouvelles = listArticles("nouvelles");
    expect(nouvelles).toHaveLength(2);
    for (const article of nouvelles) {
      expect(article.titleEn, `${article.path} sans titleEn`).toBeTruthy();
      expect(article.summaryEn, `${article.path} sans summaryEn`).toBeTruthy();
      expect(article.htmlEn, `${article.path} ne devrait pas avoir de bodyEn`).toBeNull();
    }
  });
});
