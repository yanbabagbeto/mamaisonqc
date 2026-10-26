import type { Metadata } from "next";
import Link from "next/link";

import { EquityCalculator } from "@/components/owner/equity-calculator";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/content";
import { Provenance } from "@/components/ui/provenance";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { initialEquityState } from "@/modules/owner/equity";
import { fill, messagesFor } from "@/modules/owner/messages";
import { centsToInputValue } from "@/modules/owner/money-input";
import { findUnitByMatricule, getRollProvenance } from "@/modules/owner/queries";
import type { ProvenanceInfo } from "@/shared/provenance";
import { formatCad, formatDate } from "@/shared/format";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.meta.equity.title,
    description: m.meta.equity.description,
    alternates: {
      canonical: localePath("/proprietaire/equite", locale),
      languages: {
        "fr-CA": "/proprietaire/equite",
        "en-CA": "/en/proprietaire/equite",
      },
    },
  };
}

export default async function EquitePage({
  searchParams,
}: {
  searchParams: Promise<{ matricule?: string | string[] }>;
}) {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const labels = m.equity;
  const path = (href: string) => localePath(href, locale);

  const params = await searchParams;
  const matricule = typeof params.matricule === "string" ? params.matricule.trim().slice(0, 64) : "";

  let unit: Awaited<ReturnType<typeof findUnitByMatricule>> = null;
  let provenance: ProvenanceInfo | null = null;
  if (matricule) {
    try {
      unit = await findUnitByMatricule(matricule);
      if (unit) {
        provenance = await getRollProvenance(unit.datasetId);
      }
    } catch {
      // Empty or unavailable database: the manual calculator still works.
      unit = null;
      provenance = null;
    }
  }

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
            {m.common.equity}
          </li>
        </ol>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">{labels.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
          {labels.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{labels.intro}</p>
      </header>

      <div className="mt-8 space-y-4">
        {unit ? (
          <Alert tone="primary" title={labels.prefill.title}>
            <p className="font-medium text-ink">
              {unit.address ?? labels.prefill.noAddress}
              {unit.city ? `, ${unit.city}` : ""}
              {unit.marketRefDate
                ? ` (${formatDate(unit.marketRefDate, locale)})`
                : ""}
            </p>
            <p className="mt-1">
              {fill(labels.prefill.body, {
                value: formatCad(unit.valueTotalCents, locale),
                year: unit.rollYear,
              })}{" "}
              <Link
                href={path(`/evaluation/${encodeURIComponent(unit.matricule)}`)}
                className="underline underline-offset-2"
              >
                {labels.prefill.sheetLink}
              </Link>
            </p>
            {provenance ? <Provenance items={[provenance]} className="mt-2" compact /> : null}
          </Alert>
        ) : null}

        {matricule && !unit ? (
          <Alert tone="warning" title={labels.notFoundTitle}>
            {labels.notFoundBody}
          </Alert>
        ) : null}
      </div>

      <div className="mt-8">
        <h2 className="sr-only">{labels.calculator.sectionTitle}</h2>
        <EquityCalculator
          initialState={initialEquityState({
            value: unit ? centsToInputValue(unit.valueTotalCents, locale) : "",
          })}
          labels={labels.calculator}
          locale={locale}
          refinanceHref={path("/proprietaire/hypotheque/refinancer-pour-renover")}
        />
      </div>

      <section className="mt-14 grid gap-4 md:grid-cols-3" aria-labelledby="methode-equite">
        <h2 id="methode-equite" className="sr-only">
          {labels.methodTitle}
        </h2>
        {labels.method.map((item) => (
          <div key={item.title} className="rounded-card border border-border bg-surface p-5">
            <h3 className="font-display text-base font-bold text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 rounded-card border border-border bg-surface p-6 md:p-8">
        <h2 className="font-display text-xl font-bold text-ink">{labels.nextTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">{labels.nextBody}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href={path("/proprietaire/hypotheque")} variant="secondary">
            {labels.nextMortgageCta}
          </ButtonLink>
          <ButtonLink href={path("/proprietaire/subventions-renovation")} variant="ghost">
            {labels.nextSubsidiesCta}
          </ButtonLink>
        </div>
      </section>

      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-fg">{labels.disclaimer}</p>
    </div>
  );
}
