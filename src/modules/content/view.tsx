/** Presentational pieces shared by the conseils / nouvelles routes. Server components only. */
import Link from "next/link";

import { Badge } from "@/components/ui/content";
import { htmlLang, intlLocale, localePath, type Locale } from "@/i18n/config";

import { messagesFor } from "./messages";
import type { Article } from "./types";

/** Formats an ISO date in the reader's locale, not the server's. */
export function formatArticleDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * French is the source of truth. English is only served when the author wrote `titleEn` and
 * `bodyEn`; otherwise the French body renders with an explicit notice (no silent translation).
 */
export function localizedArticle(article: Article, locale: Locale) {
  const englishMeta = locale === "en" && article.titleEn !== undefined;
  const englishBody = locale === "en" && article.htmlEn !== null;
  return {
    title: englishMeta ? (article.titleEn as string) : article.title,
    description: englishMeta
      ? (article.descriptionEn ?? article.description)
      : article.description,
    html: englishBody ? (article.htmlEn as string) : article.html,
    translated: englishBody,
    bodyLang: englishBody ? htmlLang.en : htmlLang.fr,
    englishSummary: locale === "en" && !englishBody ? (article.summaryEn ?? null) : null,
  };
}

function articleUrl(article: Article, siteUrl: string, locale: Locale): string {
  return new URL(localePath(article.path, locale), siteUrl).toString();
}

/** Only fields we can actually assert are emitted; sources become `citation` entries. */
export function articleJsonLd(article: Article, siteUrl: string, locale: Locale) {
  const localized = localizedArticle(article, locale);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: localized.title,
    description: localized.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: localized.bodyLang,
    url: articleUrl(article, siteUrl, locale),
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl(article, siteUrl, locale) },
    author: { "@type": "Organization", name: "MaMaisonQC" },
    publisher: { "@type": "Organization", name: "MaMaisonQC" },
    citation: article.sources.map((source) => source.url),
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Escape `<` so a source title can never close the script tag (Next.js JSON-LD guidance).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function ArticleHeader({ article, locale }: { article: Article; locale: Locale }) {
  const m = messagesFor(locale);
  const localized = localizedArticle(article, locale);
  const category = m.categories[article.category];

  return (
    <header className="border-b border-border bg-surface">
      <div className="container-page max-w-3xl py-10 md:py-14">
        <nav aria-label={m.common.breadcrumb} className="mb-6 text-sm text-muted-fg">
          <Link href={localePath("/", locale)} className="hover:text-primary">
            {m.common.home}
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href={localePath(`/${article.category}`, locale)} className="hover:text-primary">
            {category.label}
          </Link>
        </nav>

        <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-accent uppercase">
          <span aria-hidden="true" className="inline-block h-0.5 w-6 bg-accent" />
          {category.label}
        </p>
        <h1 className="font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
          {localized.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{localized.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-fg">
          <time dateTime={article.publishedAt}>
            {m.common.published(formatArticleDate(article.publishedAt, locale))}
          </time>
          {article.updatedAt !== article.publishedAt ? (
            <time dateTime={article.updatedAt}>
              {m.common.updated(formatArticleDate(article.updatedAt, locale))}
            </time>
          ) : null}
          <span>{m.common.readingTime(article.readingMinutes)}</span>
          <Badge tone="neutral">{m.common.sourceCount(article.sources.length)}</Badge>
          {!localized.translated && locale === "en" ? (
            <Badge tone="warning">{m.common.frenchOnlyBadge}</Badge>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function ArticleBody({ article, locale }: { article: Article; locale: Locale }) {
  const m = messagesFor(locale);
  const localized = localizedArticle(article, locale);

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      {!localized.translated && locale === "en" ? (
        <aside
          className="mb-8 rounded-card border border-warning/30 bg-[#fdf3e4] p-5"
          aria-labelledby="french-only-title"
        >
          <p id="french-only-title" className="font-display text-base font-bold text-ink">
            {m.common.frenchOnlyTitle}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{m.common.frenchOnlyBody}</p>
          {localized.englishSummary ? (
            <p className="mt-3 border-t border-warning/20 pt-3 text-sm leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">{article.title} — </span>
              {localized.englishSummary}
            </p>
          ) : null}
        </aside>
      ) : null}

      <div
        className="prose-maison"
        lang={localized.bodyLang}
        dangerouslySetInnerHTML={{ __html: localized.html }}
      />

      <section
        aria-labelledby="sources"
        className="mt-12 rounded-card border border-border bg-surface p-6"
      >
        <h2 id="sources" className="font-display text-lg font-bold text-ink">
          {m.common.sourcesTitle}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">{m.common.sourcesBody}</p>
        <ul className="mt-4 space-y-2">
          {article.sources.map((source) => (
            <li key={source.url} className="text-sm">
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-primary underline decoration-dotted underline-offset-2 hover:text-primary-strong"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-relaxed text-muted-fg">
        {m.common.disclaimer}{" "}
        <Link
          href={localePath("/conditions", locale)}
          className="underline underline-offset-2 hover:text-primary"
        >
          {m.common.termsLink}
        </Link>
        .
      </p>
    </div>
  );
}

export function ArticleCard({ article, locale }: { article: Article; locale: Locale }) {
  const m = messagesFor(locale);
  const localized = localizedArticle(article, locale);

  return (
    <article className="flex h-full flex-col rounded-card border border-border bg-surface p-6 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between gap-3">
        <Badge tone={article.category === "conseils" ? "primary" : "accent"}>
          {m.categories[article.category].label}
        </Badge>
        <time dateTime={article.publishedAt} className="text-xs text-muted-fg">
          {formatArticleDate(article.publishedAt, locale)}
        </time>
      </div>
      <h2 className="mt-4 font-display text-xl leading-snug font-bold text-ink">
        <Link href={localePath(article.path, locale)} className="hover:text-primary">
          {localized.title}
        </Link>
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{localized.description}</p>
      <div className="mt-4 flex items-center gap-3 text-xs text-muted-fg">
        <span>{m.common.readingTime(article.readingMinutes)}</span>
        <span aria-hidden="true">·</span>
        <span>{m.common.sourceCount(article.sources.length)}</span>
      </div>
    </article>
  );
}
