import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, Section } from "@/components/ui/content";
import { localePath } from "@/i18n/config";
import { getLocale, getMessages } from "@/i18n/server";
import { messagesFor } from "@/modules/owner/messages";
import { listMortgagePages } from "./hypotheque/mortgage-content";
import { listSubsidyPages } from "./subventions-renovation/subsidy-content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.meta.hub.title,
    description: m.meta.hub.description,
    alternates: {
      canonical: localePath("/proprietaire", locale),
      languages: { "fr-CA": "/proprietaire", "en-CA": "/en/proprietaire" },
    },
  };
}

export default async function ProprietairePage() {
  const locale = await getLocale();
  const chrome = await getMessages();
  const m = messagesFor(locale);
  const path = (href: string) => localePath(href, locale);
  const labels = m.hub;
  const mortgagePages = listMortgagePages(locale);
  const subsidyPages = listSubsidyPages(locale);

  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="container-page grid gap-10 py-14 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">
              {labels.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight font-extrabold text-ink md:text-5xl">
              {labels.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">{labels.intro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href={path("/proprietaire/equite")} size="lg">
                {labels.equity.cta}
              </ButtonLink>
              <ButtonLink href={path("/proprietaire/tableau-de-bord")} variant="secondary" size="lg">
                {labels.dashboard.cta}
              </ButtonLink>
            </div>
          </div>

          <Card className="bg-paper">
            <CardBody className="space-y-4">
              <Badge tone="primary">{labels.equity.eyebrow}</Badge>
              <h2 className="font-display text-xl font-bold text-ink">{labels.equity.title}</h2>
              <p className="text-sm leading-relaxed text-ink-soft">{labels.equity.body}</p>
              <ButtonLink href={path("/proprietaire/equite")} variant="ghost" size="sm">
                {labels.equity.cta} →
              </ButtonLink>
            </CardBody>
          </Card>
        </div>
      </section>

      <Section eyebrow={labels.mortgage.eyebrow} title={labels.mortgage.title} description={labels.mortgage.body}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mortgagePages.map((page) => (
            <Link
              key={page.slug}
              href={path(`/proprietaire/hypotheque/${page.slug}`)}
              className="group rounded-card border border-border bg-surface p-5 transition-colors hover:border-primary/40 hover:bg-primary-soft/30"
            >
              <h3 className="font-display text-base font-bold text-ink">{page.navLabel}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">
                {page.metaDescription}
              </p>
              <span className="mt-3 inline-flex text-sm font-semibold text-primary">
                {m.mortgage.readGuide} →
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <ButtonLink href={path("/proprietaire/hypotheque")} variant="secondary">
            {labels.mortgage.cta}
          </ButtonLink>
        </div>
      </Section>

      <Section
        eyebrow={labels.subsidies.eyebrow}
        title={labels.subsidies.title}
        description={labels.subsidies.body}
        className="bg-surface"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subsidyPages.map((page) => (
            <Link
              key={page.slug}
              href={path(`/proprietaire/subventions-renovation/${page.slug}`)}
              className="group rounded-card border border-border bg-paper p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-base font-bold text-ink">{page.navLabel}</h3>
                <Badge tone={page.status === "open" ? "success" : page.status === "closed" ? "neutral" : "warning"}>
                  {page.status === "open"
                    ? m.subsidies.statusOpen
                    : page.status === "closed"
                      ? m.subsidies.statusClosed
                      : page.status === "variable"
                        ? m.subsidies.statusVariable
                        : m.subsidies.statusUnknown}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">
                {page.summary[0]}
              </p>
              <span className="mt-3 inline-flex text-sm font-semibold text-primary">
                {chrome.common.learnMore} →
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <ButtonLink href={path("/proprietaire/subventions-renovation")} variant="secondary">
            {labels.subsidies.cta}
          </ButtonLink>
        </div>
      </Section>

      <Section eyebrow={labels.assurance.eyebrow} title={labels.assurance.title}>
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card>
            <CardBody className="space-y-3">
              {labels.assurance.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-ink-soft">
                  {paragraph}
                </p>
              ))}
              <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-fg">
                {labels.assurance.note}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-3">
              <h3 className="font-display text-lg font-bold text-ink">{labels.notDoTitle}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{labels.notDoBody}</p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-ink-soft">
                {labels.notDo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <ButtonLink href={path("/faq")} variant="ghost" size="sm">
                {labels.assurance.cta} →
              </ButtonLink>
            </CardBody>
          </Card>
        </div>
      </Section>

      <section className="border-y border-border bg-primary text-white">
        <div className="container-page grid items-center gap-8 py-12 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">
              {labels.dashboard.title}
            </h2>
            <p className="mt-3 max-w-xl text-white/85">{labels.dashboard.body}</p>
          </div>
          <div className="md:justify-self-end">
            <ButtonLink
              href={path("/proprietaire/tableau-de-bord")}
              variant="secondary"
              size="lg"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              {labels.dashboard.cta}
            </ButtonLink>
          </div>
        </div>
      </section>

      <div className="container-page py-10">
        <p className="max-w-3xl text-xs leading-relaxed text-muted-fg">{labels.disclosure}</p>
      </div>
    </>
  );
}
