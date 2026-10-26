import type { Metadata } from "next";
import Link from "next/link";

import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { messagesFor } from "@/modules/content/messages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.conditions.title,
    description: m.conditions.description,
    alternates: {
      canonical: localePath("/conditions", locale),
      languages: { "fr-CA": "/conditions", "en-CA": "/en/conditions" },
    },
  };
}

export default async function ConditionsPage() {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const page = m.conditions;

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="container-page max-w-3xl py-12 md:py-16">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-accent uppercase">
            <span aria-hidden="true" className="inline-block h-0.5 w-6 bg-accent" />
            {page.eyebrow}
          </p>
          <h1 className="font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
            {page.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{page.description}</p>
          <p className="mt-3 text-xs font-semibold tracking-wide text-muted-fg uppercase">
            {page.updatedLabel} : {page.updatedAt}
          </p>
        </div>
      </header>

      <div className="container-page max-w-3xl py-10 md:py-14">
        <p className="text-sm leading-relaxed text-ink-soft">{page.intro}</p>

        <nav aria-label={page.title} className="mt-6 rounded-card border border-border bg-surface p-4">
          <ol className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {page.sections.map((section, index) => (
              <li key={section.heading}>
                <a
                  href={`#section-${index + 1}`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {page.sections.map((section, index) => (
          <section key={section.heading} id={`section-${index + 1}`} className="mt-8 scroll-mt-24">
            <h2 className="font-display text-xl font-bold text-ink">{section.heading}</h2>
            <div className="prose-maison mt-2 text-sm">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {"links" in section && section.links ? (
                <ul className="mt-2 space-y-1">
                  {section.links.map((link) =>
                    link.href.startsWith("https://") ? (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-semibold text-primary underline-offset-2 hover:underline"
                        >
                          {link.label} ↗
                        </a>
                      </li>
                    ) : (
                      <li key={link.href}>
                        <Link
                          href={localePath(link.href, locale)}
                          className="font-semibold text-primary underline-offset-2 hover:underline"
                        >
                          {link.label} →
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
