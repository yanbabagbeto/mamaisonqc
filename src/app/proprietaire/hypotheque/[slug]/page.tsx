import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/content";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { messagesFor } from "@/modules/owner/messages";

import { getMortgagePage } from "../mortgage-content";

type PageParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const page = getMortgagePage(slug, locale);
  if (!page) {
    return {};
  }
  const path = localePath(`/proprietaire/hypotheque/${page.slug}`, locale);
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: {
      canonical: path,
      languages: {
        "fr-CA": `/proprietaire/hypotheque/${page.slug}`,
        "en-CA": `/en/proprietaire/hypotheque/${page.slug}`,
      },
    },
  };
}

export default async function MortgageGuidePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const m = messagesFor(locale);
  const labels = m.mortgage;
  const page = getMortgagePage(slug, locale);
  if (!page) {
    notFound();
  }
  const path = (href: string) => localePath(href, locale);

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
          <li>
            <Link href={path("/proprietaire/hypotheque")} className="hover:text-primary">
              {m.common.mortgage}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-ink">
            {page.navLabel}
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
        <article>
          <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">{labels.eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
            {page.title}
          </h1>
          <div className="prose-maison mt-6">
            {page.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && section.bullets.length > 0 ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <div className="mt-8">
            <Alert tone="warning" title={labels.ratesTitle}>
              {labels.ratesBody}
            </Alert>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-muted-fg">{labels.disclaimer}</p>
        </article>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="font-display text-lg font-bold text-ink">{labels.checklistTitle}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-fg">{labels.checklistIntro}</p>
            <ul className="mt-4 space-y-3">
              {page.checklist.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink-soft">
                  <span aria-hidden="true" className="mt-0.5 text-primary">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-border bg-primary-soft/50 p-5">
            <h2 className="font-display text-lg font-bold text-ink">{labels.ctaTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{labels.ctaBody}</p>
            <div className="mt-4">
              <ButtonLink href={path("/proprietaire/equite")} size="sm">
                {labels.ctaButton}
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="font-display text-lg font-bold text-ink">{labels.relatedTitle}</h2>
            <ul className="mt-3 space-y-2">
              {page.relatedSlugs.flatMap((relatedSlug) => {
                const related = getMortgagePage(relatedSlug, locale);
                if (!related) return [];
                return [
                  <li key={related.slug}>
                    <Link
                      href={path(`/proprietaire/hypotheque/${related.slug}`)}
                      className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                    >
                      {related.navLabel}
                    </Link>
                  </li>,
                ];
              })}
            </ul>
            <Link
              href={path("/proprietaire/hypotheque")}
              className="mt-4 inline-flex text-sm font-semibold text-ink-soft hover:text-primary"
            >
              ← {labels.backToIndex}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
