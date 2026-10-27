import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { messagesFor } from "@/modules/content/messages";
import { ContactForm } from "./contact-form";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.contact.title,
    description: m.contact.description,
    alternates: {
      canonical: localePath("/contact", locale),
      languages: { "fr-CA": "/contact", "en-CA": "/en/contact" },
    },
  };
}

export default async function ContactPage() {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const page = m.contact;

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
        </div>
      </header>

      <div className="container-page grid max-w-5xl gap-8 py-10 md:py-14 lg:grid-cols-[1.2fr_0.8fr]">
        <section aria-labelledby="contact-form-title" className="rounded-card border border-border bg-surface p-6">
          <h2 id="contact-form-title" className="font-display text-2xl font-bold text-ink">
            {page.form.legend}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{page.intro}</p>
          <div className="mt-6">
            <ContactForm labels={page.form} />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-fg">
            {page.privacyNote}{" "}
            <Link
              href={localePath("/confidentialite", locale)}
              className="underline underline-offset-2 hover:text-primary"
            >
              {page.privacyCta}
            </Link>
            .
          </p>
        </section>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{page.officialChannelTitle}</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-sm leading-relaxed text-ink-soft">{page.officialChannelBody}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{page.responseTitle}</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-sm leading-relaxed text-ink-soft">{page.responseBody}</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-sm leading-relaxed text-ink-soft">{page.privacyNote}</p>
              <Link
                href={localePath("/faq", locale)}
                className="mt-3 inline-flex text-sm font-semibold text-primary hover:text-primary-strong"
              >
                {page.faqCta} →
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
