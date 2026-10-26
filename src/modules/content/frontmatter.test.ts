import { describe, expect, it } from "vitest";

import {
  assertSafeSlug,
  ContentError,
  countWords,
  isValidIsoDate,
  parseFrontmatter,
  readingMinutes,
  sortArticles,
} from "./frontmatter";

const valid = {
  title: "Comprendre le rôle d'évaluation",
  slug: "comprendre-role-evaluation",
  category: "conseils",
  publishedAt: "2026-10-26",
  updatedAt: "2026-10-26",
  description:
    "Ce que le rôle d'évaluation municipal mesure vraiment, comment il est produit et pourquoi il ne suit pas le marché au jour le jour.",
  sources: [{ label: "MAMH — Évaluation foncière municipale", url: "https://www.quebec.ca/x" }],
};

function reason(fn: () => unknown): string {
  try {
    fn();
  } catch (error) {
    if (error instanceof ContentError) return error.message;
    throw error;
  }
  throw new Error("Aucune erreur levée");
}

describe("parseFrontmatter", () => {
  it("accepte des métadonnées complètes et ajoute draft=false par défaut", () => {
    const meta = parseFrontmatter(valid, "content/conseils/test.md");
    expect(meta.slug).toBe("comprendre-role-evaluation");
    expect(meta.draft).toBe(false);
    expect(meta.sources).toHaveLength(1);
  });

  it("refuse un titre manquant", () => {
    const withoutTitle: Record<string, unknown> = { ...valid };
    delete withoutTitle.title;
    expect(reason(() => parseFrontmatter(withoutTitle, "content/conseils/test.md"))).toContain("title");
  });

  it("refuse une description trop courte", () => {
    expect(
      reason(() => parseFrontmatter({ ...valid, description: "Trop court." }, "a.md")),
    ).toContain("Description trop courte");
  });

  it("refuse l'absence de sources", () => {
    expect(reason(() => parseFrontmatter({ ...valid, sources: [] }, "a.md"))).toContain(
      "Au moins une source",
    );
  });

  it("refuse une source en http non sécurisé", () => {
    expect(
      reason(() =>
        parseFrontmatter(
          { ...valid, sources: [{ label: "Source non sécurisée", url: "http://exemple.ca" }] },
          "a.md",
        ),
      ),
    ).toContain("https");
  });

  it("refuse une date inexistante au calendrier", () => {
    expect(reason(() => parseFrontmatter({ ...valid, publishedAt: "2026-02-30" }, "a.md"))).toContain(
      "Date attendue",
    );
  });

  it("refuse une mise à jour antérieure à la publication", () => {
    expect(
      reason(() => parseFrontmatter({ ...valid, updatedAt: "2026-10-25" }, "a.md")),
    ).toContain("updatedAt");
  });

  it("refuse un slug avec majuscules, accents ou traversée de chemin", () => {
    for (const slug of ["Comprendre", "comprendre-évaluation", "../secret", "a/b", "", ".."]) {
      expect(
        reason(() => parseFrontmatter({ ...valid, slug }, "a.md")),
        `slug ${JSON.stringify(slug)}`,
      ).toContain("Slug invalide");
    }
  });

  it("refuse une catégorie inconnue", () => {
    expect(reason(() => parseFrontmatter({ ...valid, category: "blogue" }, "a.md"))).toContain(
      "Catégorie",
    );
  });
});

describe("assertSafeSlug", () => {
  it("accepte les slugs kebab-case", () => {
    expect(() => assertSafeSlug("vendre-printemps-ou-automne")).not.toThrow();
    expect(() => assertSafeSlug("a1")).not.toThrow();
  });

  it("rejette toute tentative de sortie du répertoire", () => {
    for (const slug of ["..", "../..", "../../etc/passwd", "a\\b", ".env", "a.b"]) {
      expect(() => assertSafeSlug(slug)).toThrow(ContentError);
    }
  });
});

describe("dates", () => {
  it("valide uniquement une vraie date AAAA-MM-JJ", () => {
    expect(isValidIsoDate("2026-10-26")).toBe(true);
    expect(isValidIsoDate("2026-13-01")).toBe(false);
    expect(isValidIsoDate("2026-2-1")).toBe(false);
    expect(isValidIsoDate("26-10-2026")).toBe(false);
  });
});

describe("sortArticles", () => {
  it("trie du plus récent au plus ancien puis par slug", () => {
    const sorted = sortArticles([
      { slug: "b", publishedAt: "2026-01-01" },
      { slug: "a", publishedAt: "2026-01-01" },
      { slug: "c", publishedAt: "2026-05-01" },
    ]);
    expect(sorted.map((item) => item.slug)).toEqual(["c", "a", "b"]);
  });
});

describe("countWords / readingMinutes", () => {
  it("ignore le balisage et les entités", () => {
    expect(countWords("<p>Bonjour&nbsp;le <strong>Québec</strong></p>")).toBe(3);
    expect(countWords("<script>ignoré</script>")).toBe(0);
  });

  it("arrondit au minimum une minute", () => {
    expect(readingMinutes(0)).toBe(1);
    expect(readingMinutes(221)).toBe(2);
  });
});
