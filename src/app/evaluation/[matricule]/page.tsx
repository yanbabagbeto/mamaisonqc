import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ComparablesTable } from "@/components/valuation/comparables-table";
import { RollDetailDialog } from "@/components/valuation/roll-detail-dialog";
import { EstimateSection } from "@/components/valuation/estimate-section";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState, Stat } from "@/components/ui/content";
import { localePath, type Locale } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getEvaluationPageData } from "@/modules/valuation/data";
import { buildRollDetailSections } from "@/modules/valuation/detail-sections";
import { formatAddress } from "@/modules/valuation/labels";
import { messagesFor, propertyTypeLabel } from "@/modules/valuation/messages";
import { formatCad, formatDateFr } from "@/shared/format";

type EvaluationPageProps = {
  params: Promise<{ matricule: string }>;
};

function equityHref(matricule: string, locale: Locale) {
  return `${localePath("/proprietaire/equite", locale)}?matricule=${encodeURIComponent(matricule)}`;
}

function claimHref(matricule: string, locale: Locale) {
  return `${localePath("/reclamer-ma-page", locale)}?matricule=${encodeURIComponent(matricule)}`;
}

export async function generateMetadata({ params }: EvaluationPageProps): Promise<Metadata> {
  const { matricule } = await params;
  const [data, locale] = await Promise.all([getEvaluationPageData(matricule), getLocale()]);
  const messages = messagesFor(locale);
  const requestedPath = `/evaluation/${encodeURIComponent(matricule.trim())}`;

  if (!data) {
    return {
      title: messages.meta.notFoundTitle,
      robots: { index: false, follow: false },
      alternates: { canonical: localePath(requestedPath, locale) },
    };
  }

  const address = formatAddress(data.unit, messages.addressFallback);
  const city = data.municipality?.name;
  const path = `/evaluation/${encodeURIComponent(data.unit.matricule)}`;
  const referenceDate = data.unit.marketRefDate
    ? messages.meta.descriptionReference(formatDateFr(data.unit.marketRefDate, locale))
    : "";

  return {
    title: `${address}${city ? `, ${city}` : ""} — ${messages.meta.titleSuffix}`,
    description:
      messages.meta.descriptionLead(formatCad(data.unit.valueTotalCents, locale)) +
      referenceDate +
      messages.meta.descriptionTail,
    alternates: {
      canonical: localePath(path, locale),
      languages: { "fr-CA": path, "en-CA": localePath(path, "en") },
    },
  };
}

export default async function EvaluationPage({ params }: EvaluationPageProps) {
  const { matricule } = await params;
  const [data, locale] = await Promise.all([getEvaluationPageData(matricule), getLocale()]);
  if (!data) notFound();

  const messages = messagesFor(locale);
  const { unit, municipality, valuation } = data;
  const address = formatAddress(unit, messages.addressFallback);
  const city = municipality?.name ?? null;
  const place = city ?? messages.breadcrumb.geographicCode(unit.municipalityCode);
  const hasComparables = valuation.comparablesCount > 0;
  const priorValue =
    unit.valuePriorCents !== null && unit.valuePriorCents > 0 ? unit.valuePriorCents : null;

  const detailSections = buildRollDetailSections(unit, municipality?.name ?? null, messages, locale);

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="container-page py-8 md:py-12">
          <nav aria-label={messages.breadcrumb.label}>
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-fg">
              <li>
                <Link
                  href={localePath("/", locale)}
                  className="hover:text-primary hover:underline"
                >
                  {messages.breadcrumb.home}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={localePath("/recherche", locale)}
                  className="hover:text-primary hover:underline"
                >
                  {messages.breadcrumb.search}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>{place}</li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-ink">
                {address}
              </li>
            </ol>
          </nav>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <Badge tone="primary">{messages.header.rollBadge(unit.rollYear)}</Badge>
                <Badge tone="neutral">{propertyTypeLabel(messages, unit.propertyType)}</Badge>
                {unit.umv ? <Badge tone="info">{messages.header.umvBadge(unit.umv)}</Badge> : null}
              </div>
              <h1 className="mt-4 font-display text-3xl leading-tight font-extrabold tracking-tight text-ink sm:text-4xl md:text-[2.75rem]">
                {address}
              </h1>
              <p className="mt-2 text-lg text-ink-soft">
                {messages.header.locationLine(place, unit.matricule)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={equityHref(unit.matricule, locale)}>
                {messages.header.equityCta}
              </ButtonLink>
              <ButtonLink href={claimHref(unit.matricule, locale)} variant="secondary">
                {messages.header.claimCta}
              </ButtonLink>
            </div>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.55fr_0.75fr] lg:items-start">
        {/* min-w-0: without it the comparables table's min-width blows the grid column past the viewport. */}
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="valeur-au-role">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="valeur-au-role" className="font-display text-2xl font-bold text-ink">
                  {messages.roll.title}
                </h2>
                <p className="mt-1 text-sm text-muted-fg">{messages.roll.description}</p>
              </div>
              <RollDetailDialog
                triggerLabel={messages.detail.trigger}
                title={messages.detail.title}
                intro={messages.detail.intro}
                closeLabel={messages.detail.close}
                sections={detailSections}
                note={messages.detail.note}
              />
            </div>
            <Card className="mt-4">
              <CardBody>
                <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat
                    label={messages.roll.total}
                    value={formatCad(unit.valueTotalCents, locale)}
                    tone="accent"
                    size="lg"
                    hint={messages.roll.totalHint}
                  />
                  <Stat label={messages.roll.land} value={formatCad(unit.valueLandCents, locale)} />
                  <Stat label={messages.roll.building} value={formatCad(unit.valueBuildingCents, locale)} />
                  <Stat
                    label={messages.roll.prior}
                    value={priorValue === null ? "—" : formatCad(priorValue, locale)}
                    hint={priorValue === null ? messages.roll.priorMissing : messages.roll.priorHint}
                  />
                </dl>
                <p className="mt-6 border-t border-border pt-4 text-sm text-ink-soft">
                  {messages.roll.rollYearLine(unit.rollYear)}
                  {" · "}
                  {messages.roll.marketRefLine(formatDateFr(unit.marketRefDate, locale))}
                </p>
              </CardBody>
            </Card>
          </section>

          <EstimateSection valuation={valuation} messages={messages} locale={locale} />

          <section aria-labelledby="comparables">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="comparables" className="font-display text-2xl font-bold text-ink">
                  {messages.comparables.title}
                </h2>
                <p className="mt-1 text-sm text-muted-fg">
                  {hasComparables
                    ? messages.comparables.description(valuation.comparablesCount)
                    : messages.comparables.emptyDescription}
                </p>
              </div>
            </div>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{messages.comparables.cardTitle}</CardTitle>
              </CardHeader>
              <CardBody>
                {hasComparables ? (
                  <>
                    <ComparablesTable
                      comparables={valuation.comparables}
                      messages={messages}
                      locale={locale}
                    />
                    {valuation.comparablesTier !== null &&
                    valuation.comparablesTier !== "umv-cubf-area" ? (
                      <p
                        className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-xs leading-relaxed text-ink-soft"
                        data-comparables-tier={valuation.comparablesTier}
                      >
                        {messages.comparables.widenedTier}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <EmptyState
                    title={messages.comparables.emptyTitle}
                    description={messages.comparables.emptyBody}
                  />
                )}
                <p className="mt-4 text-xs leading-relaxed text-muted-fg">
                  {messages.comparables.footnote}
                </p>
              </CardBody>
            </Card>
          </section>
        </div>

        <aside className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{messages.sidebar.claimTitle}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-sm leading-relaxed text-ink-soft">{messages.sidebar.claimBody}</p>
              <Link
                href={claimHref(unit.matricule, locale)}
                className="inline-flex text-sm font-semibold text-primary underline decoration-dotted underline-offset-2"
              >
                {messages.sidebar.claimLink}
              </Link>
              <div className="pt-2">
                <ButtonLink
                  href={equityHref(unit.matricule, locale)}
                  variant="secondary"
                  className="w-full"
                >
                  {messages.sidebar.equityCta}
                </ButtonLink>
              </div>
            </CardBody>
          </Card>

          <p className="text-xs leading-relaxed text-muted-fg">{messages.sidebar.disclaimer}</p>
        </aside>
      </div>
    </>
  );
}
