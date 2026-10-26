import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/content";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { messagesFor } from "@/modules/owner/messages";

import { listMortgagePages } from "./mortgage-content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.meta.mortgageIndex.title,
    description: m.meta.mortgageIndex.description,
    alternates: {
      canonical: localePath("/proprietaire/hypotheque", locale),
      languages: {
        "fr-CA": "/proprietaire/hypotheque",
        "en-CA": "/en/proprietaire/hypotheque",
      },
    },
  };
}

export default async function HypothequeIndexPage() {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const labels = m.mortgage;
  const path = (href: string) => localePath(href, locale);
  const pages = listMortgagePages(locale);

  return (
    <div className="container-page py-10 md:py-14">
      <nav aria-label={m.common.breadcrumb} className="text-sm text-muted-fg">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href={path("/")} className="hover:text-primary">
              {m.common.home}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={path("/proprietaire")} className="hover:text-primary">
              {m.common.owners}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-ink">
            {m.common.mortgage}
          </li>
        </ol>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">{labels.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
          {labels.indexTitle}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{labels.indexIntro}</p>
      </header>

      <div className="mt-8">
        <Alert tone="info" title={labels.ratesTitle}>
          {labels.ratesBody}
        </Alert>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link
              href={path(`/proprietaire/hypotheque/${page.slug}`)}
              className="group flex h-full flex-col rounded-card border border-border bg-surface p-5 transition-colors hover:border-primary/40 hover:bg-primary-soft/30"
            >
              <h2 className="font-display text-lg font-bold text-ink">{page.navLabel}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                {page.metaDescription}
              </p>
              <span className="mt-4 inline-flex text-sm font-semibold text-primary">
                {labels.readGuide} →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-card border border-border bg-surface p-6">
        <h2 className="font-display text-xl font-bold text-ink">{labels.ctaTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{labels.ctaBody}</p>
        <div className="mt-4">
          <ButtonLink href={path("/proprietaire/equite")}>{labels.ctaButton}</ButtonLink>
        </div>
      </div>

      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-fg">{labels.disclaimer}</p>
    </div>
  );
}
