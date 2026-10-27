import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/content";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getBaseUrl } from "@/lib/site-url";
import { messagesFor } from "@/modules/content/messages";
import { FAQ_ITEMS, FAQ_ITEMS_EN } from "../../../content/faq";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.faq.title,
    description: m.faq.description,
    alternates: {
      canonical: localePath("/faq", locale),
      languages: { "fr-CA": "/faq", "en-CA": "/en/faq" },
    },
  };
}

export default async function FaqPage() {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const items = locale === "en" ? FAQ_ITEMS_EN : FAQ_ITEMS;

  // Only the visible questions/answers are emitted: the structured data must match the page.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale === "en" ? "en-CA" : "fr-CA",
    url: new URL(localePath("/faq", locale), await getBaseUrl()).toString(),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <header className="border-b border-border bg-surface">
        <div className="container-page max-w-3xl py-12 md:py-16">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-accent uppercase">
            <span aria-hidden="true" className="inline-block h-0.5 w-6 bg-accent" />
            {m.faq.eyebrow}
          </p>
          <h1 className="font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
            {m.faq.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{m.faq.description}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-fg">{m.faq.intro}</p>
        </div>
      </header>

      <div className="container-page max-w-3xl py-10 md:py-14">
        <nav aria-label={m.faq.anchorLabel} className="rounded-card border border-border bg-surface p-4">
          <h2 className="text-xs font-bold tracking-[0.14em] text-muted-fg uppercase">
            {m.faq.anchorLabel}
          </h2>
          <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`${localePath("/faq", locale)}#${item.id}`}
                  className="text-sm text-primary underline-offset-2 hover:underline"
                >
                  {item.question}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-4 text-xs leading-relaxed text-muted-fg">{m.faq.detailsHint}</p>

        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <details
              key={item.id}
              id={item.id}
              className="group scroll-mt-24 rounded-card border border-border bg-surface open:border-primary/30"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 font-display text-base font-bold text-ink [&::-webkit-details-marker]:hidden">
                <h2 className="font-display text-base font-bold text-ink">{item.question}</h2>
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-lg leading-none text-muted-fg transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-ink-soft">
                <p>{item.answer}</p>
                {item.links && item.links.length > 0 ? (
                  <ul className="mt-3 space-y-1">
                    {item.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={localePath(link.href, locale)}
                          className="font-semibold text-primary underline-offset-2 hover:underline"
                        >
                          {link.label} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </details>
          ))}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted-fg">{m.faq.structuredNote}</p>

        <section
          aria-labelledby="faq-contact-title"
          className="mt-10 rounded-card border border-border bg-primary-soft/50 p-6"
        >
          <h2 id="faq-contact-title" className="font-display text-xl font-bold text-ink">
            {m.faq.contactTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{m.faq.contactBody}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={localePath("/contact", locale)}
              className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-strong"
            >
              {m.faq.contactCta}
            </Link>
            <Badge tone="neutral">{m.contact.officialChannelTitle}</Badge>
          </div>
        </section>
      </div>
    </>
  );
}
