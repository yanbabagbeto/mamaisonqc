import type { Metadata } from "next";
import Link from "next/link";

import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { listArticles } from "@/modules/content";
import { messagesFor } from "@/modules/content/messages";
import { ArticleCard } from "@/modules/content/view";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.categories.conseils.title,
    description: m.categories.conseils.description,
    alternates: {
      canonical: localePath("/conseils", locale),
      languages: { "fr-CA": "/conseils", "en-CA": "/en/conseils" },
    },
  };
}

export default async function ConseilsIndexPage() {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const category = m.categories.conseils;
  const articles = listArticles("conseils");

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="container-page max-w-3xl py-12 md:py-16">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-accent uppercase">
            <span aria-hidden="true" className="inline-block h-0.5 w-6 bg-accent" />
            {category.eyebrow}
          </p>
          <h1 className="font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
            {category.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{category.description}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-fg">{category.intro}</p>
        </div>
      </header>

      <section className="container-page py-10 md:py-14" aria-labelledby="articles-title">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="articles-title" className="font-display text-xl font-bold text-ink">
            {category.label}
          </h2>
          <Link
            href={localePath("/nouvelles", locale)}
            className="text-sm font-semibold text-primary hover:text-primary-strong"
          >
            {m.categories.nouvelles.label} →
          </Link>
        </div>

        {articles.length === 0 ? (
          <p className="mt-6 rounded-card border border-dashed border-border-strong bg-surface/60 p-6 text-sm text-ink-soft">
            {category.empty}
          </p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard key={article.path} article={article} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
