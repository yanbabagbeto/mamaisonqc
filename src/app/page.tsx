import type { Metadata } from "next";
import Link from "next/link";

import {
  FeatureIllustration,
  HeroHouseScene,
  type FeatureKind,
} from "@/components/illustrations";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { AddressSearch } from "@/components/search/address-search";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, Section } from "@/components/ui/content";
import { localePath } from "@/i18n/config";
import { getLocale, getMessages } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  return {
    title: isEn
      ? "Quebec property values, with the source of every figure"
      : "La valeur des propriétés du Québec, avec la source de chaque chiffre",
    description: isEn
      ? "Estimate a property's value from the Quebec assessment roll and Registre foncier sales. Real comparables, a range, a confidence level and displayed provenance."
      : "Estimez la valeur d'une propriété à partir du rôle d'évaluation foncière du Québec et des ventes du Registre foncier. Comparables réels, fourchette, niveau de confiance et provenance affichée.",
    alternates: {
      canonical: localePath("/", locale),
      languages: { "fr-CA": "/", "en-CA": "/en" },
    },
  };
}

const INTENT_HREFS = ["/proprietaire", "/tester-le-marche", "/pre-marche"] as const;
const INTENT_ILLUSTRATIONS: FeatureKind[] = ["hypotheque", "vendre", "acheter"];
const WHY_VISUAL = ["01", "02", "03", "04"];
const FAQ_ANCHORS = ["#methode", "#gratuit", "#donnees", "#valeur-municipale"];

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getMessages();
  const path = (href: string) => localePath(href, locale);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-32 size-[36rem] rounded-full bg-primary-soft blur-3xl"
        />
        <div className="container-page relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-accent uppercase">
              <span aria-hidden="true" className="inline-block h-0.5 w-6 bg-accent" />
              {t.home.heroEyebrow}
            </p>
            <h1 className="font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-ink sm:text-5xl lg:text-[3.6rem]">
              {t.home.heroTitleBefore} <span className="text-primary">{t.home.heroTitleHighlight}</span>{" "}
              {t.home.heroTitleAfter}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">{t.home.heroBody}</p>

            <div className="mt-8 max-w-xl">
              <AddressSearch labels={t.search} />
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-fg">
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="size-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t.common.free}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="size-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 3 4 6.5V12c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V6.5Z" strokeLinejoin="round" />
                  </svg>
                  {t.common.officialData}
                </span>
              </p>
            </div>
          </div>

          {/* Original artwork (docs/IMAGES.md): house scene + a compact, text-only data card. */}
          <div className="relative mx-auto w-full max-w-lg pb-16">
            <div
              aria-hidden="true"
              className="overflow-hidden rounded-card border border-border bg-paper shadow-[var(--shadow-lift)]"
            >
              <HeroHouseScene className="h-auto w-full" />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-x-4 bottom-0 rounded-xl border border-border bg-surface/95 px-4 py-3 shadow-[var(--shadow-card)] backdrop-blur-sm md:inset-x-8"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.68rem] font-bold tracking-wider text-muted-fg uppercase">
                  {t.home.cardLabel}
                </span>
                <Badge tone="primary">{t.home.cardBadge}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {t.home.cardRows.slice(0, 3).map((label) => (
                  <span
                    key={label}
                    className="rounded-md bg-muted px-2 py-1 text-[0.65rem] leading-snug font-medium text-ink-soft"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow={t.home.intentsEyebrow} title={t.home.intentsTitle} className="pt-14 md:pt-16">
        <div className="grid gap-4 md:grid-cols-3">
          {t.home.intents.map((intent, index) => (
            <Link
              key={intent.title}
              href={path(INTENT_HREFS[index] ?? "/")}
              className="group rounded-card border border-border bg-surface p-6 transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
            >
              <FeatureIllustration kind={INTENT_ILLUSTRATIONS[index] ?? "acheter"} className="size-14" />
              <h3 className="mt-3 font-display text-lg font-bold text-ink">{intent.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{intent.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {t.common.continue}
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        eyebrow={t.home.whyEyebrow}
        title={t.home.whyTitle}
        description={t.home.whyBody}
        className="bg-surface"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {t.home.why.map((item, index) => (
            <Card key={item.title}>
              <CardBody>
                <span className="tabular text-xs font-bold text-accent">{WHY_VISUAL[index]}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
              </CardBody>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <ButtonLink href={path("/donnees")} variant="secondary" size="md">
            {t.home.whyCta}
          </ButtonLink>
          <p className="text-sm text-muted-fg">{t.home.whyNote}</p>
        </div>
      </Section>

      <Section eyebrow={t.home.howEyebrow} title={t.home.howTitle}>
        <ol className="grid gap-4 md:grid-cols-3">
          {t.home.how.map((step, index) => (
            <li key={step.title} className="rounded-card border border-border bg-surface p-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <section className="border-y border-border bg-primary text-white">
        <div className="container-page grid items-center gap-8 py-14 md:grid-cols-[1.4fr_1fr] md:py-16">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-white/70 uppercase">
              {t.home.marketEyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight font-extrabold md:text-4xl">
              {t.home.marketTitle}
            </h2>
            <p className="mt-4 max-w-xl text-white/85">{t.home.marketBody}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <ButtonLink href={path("/marche-immobilier")} variant="secondary" size="lg">
              {t.home.marketCta}
            </ButtonLink>
            <ButtonLink
              href={path("/pre-marche")}
              size="lg"
              className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              {t.home.premarketCta}
            </ButtonLink>
          </div>
        </div>
      </section>

      <Section eyebrow={t.home.briefEyebrow} title={t.home.briefTitle}>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardBody className="space-y-4">
              <p className="text-ink-soft">{t.home.briefBody}</p>
              <ul className="space-y-2 text-sm text-ink-soft">
                {t.home.briefBullets.map((bullet) => (
                  <li key={bullet}>• {bullet}</li>
                ))}
              </ul>
              <div className="max-w-md">
                <NewsletterForm source="home" labels={t.newsletter} />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-3">
              <h3 className="font-display text-lg font-bold text-ink">{t.home.faqTitle}</h3>
              {t.home.faqLinks.map((label, index) => (
                <Link
                  key={label}
                  href={`${path("/faq")}${FAQ_ANCHORS[index] ?? ""}`}
                  className="block rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-ink-soft hover:border-primary/40 hover:text-primary"
                >
                  {label}
                </Link>
              ))}
              <Link href={path("/faq")} className="inline-flex text-sm font-semibold text-primary">
                {t.home.faqAll} →
              </Link>
            </CardBody>
          </Card>
        </div>
      </Section>
    </>
  );
}
