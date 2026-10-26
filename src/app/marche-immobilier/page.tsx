import type { Metadata } from "next";
import Link from "next/link";

import { RegionScene } from "@/components/illustrations";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";

import { Badge, Section, Stat } from "@/components/ui/content";
import { ButtonLink } from "@/components/ui/button";
import { Provenance } from "@/components/ui/provenance";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { CoverageNotice } from "@/components/market/coverage-notice";
import { MarketPageHeader } from "@/components/market/page-header";
import { priceBandLabel } from "@/components/market/band-label";
import { formatCad, formatMonth, formatNumber } from "@/shared/format";

import { listRegions, provenanceFor } from "@/modules/market";
import { messagesFor } from "@/modules/market/messages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.index.meta.title,
    description: m.index.meta.description,
    alternates: {
      canonical: localePath("/marche-immobilier", locale),
      languages: { "fr-CA": "/marche-immobilier", "en-CA": "/en/marche-immobilier" },
    },
  };
}

export default async function MarcheImmobilierPage() {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const path = (href: string) => localePath(href, locale);

  const regions = await listRegions();
  const statsProvenance = await provenanceFor("market_stats");
  const rollProvenance = await provenanceFor("property_unit");
  const provenance = [...statsProvenance, ...rollProvenance];

  const regionsWithStats = regions.filter((region) => region.hasStats).length;
  const regionsWithRoll = regions.filter((region) => region.hasRoll).length;
  const coveredMunicipalities = regions.reduce(
    (total, region) => total + region.coveredMunicipalities,
    0,
  );
  const unitCount = regions.reduce((total, region) => total + region.unitCount, 0);
  const latest = regions.reduce<string | null>(
    (current, region) =>
      region.latestPeriod !== null && (current === null || region.latestPeriod > current)
        ? region.latestPeriod
        : current,
    null,
  );

  const hasAnyData = regionsWithStats > 0 || regionsWithRoll > 0;

  return (
    <>
      <MarketPageHeader
        crumbs={[{ label: m.common.home, href: path("/") }, { label: m.common.market }]}
        breadcrumbsLabel={m.common.breadcrumbsLabel}
        eyebrow={m.index.eyebrow}
        title={m.index.title}
        lead={m.index.lead}
      >
        {regions.length > 0 && hasAnyData ? (
          <dl className="grid max-w-3xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <Stat label={m.index.summary.regions} value={formatNumber(regions.length, locale)} />
            <Stat
              label={m.index.summary.withStats}
              value={formatNumber(regionsWithStats, locale)}
            />
            <Stat
              label={m.index.summary.municipalities}
              value={formatNumber(coveredMunicipalities, locale)}
              hint={m.index.summary.unitsHint(formatNumber(unitCount, locale))}
            />
            <Stat
              label={m.index.summary.latest}
              value={latest ? formatMonth(latest, locale) : m.common.noValue}
              hint={m.index.summary.latestHint}
            />
          </dl>
        ) : null}
      </MarketPageHeader>

      <Section
        eyebrow={m.index.regionsSection.eyebrow}
        title={m.index.regionsSection.title}
        description={m.index.regionsSection.description}
        className="pt-10 md:pt-14"
      >
        {regions.length === 0 ? (
          <CoverageNotice
            title={m.index.empty.title}
            warningLabel={m.common.coverageWarning}
            infoLabel={m.common.coverageInfo}
            action={
              <ButtonLink href={path("/donnees")} variant="secondary" size="md">
                {m.index.empty.action}
              </ButtonLink>
            }
          >
            <p>{m.index.empty.body1}</p>
            <p>{m.index.empty.body2}</p>
          </CoverageNotice>
        ) : (
          <>
            {regionsWithStats === 0 ? (
              <div className="mb-8">
                <CoverageNotice
                  title={m.index.statsMissing.title}
                  warningLabel={m.common.coverageWarning}
                  infoLabel={m.common.coverageInfo}
                  action={
                    <ButtonLink href={path("/donnees")} variant="secondary" size="md">
                      {m.index.statsMissing.action}
                    </ButtonLink>
                  }
                >
                  <p>{m.index.statsMissing.body}</p>
                </CoverageNotice>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regions.map((region) => (
                <Link
                  key={region.code}
                  href={path(`/marche-immobilier/${region.slug}`)}
                  className="group flex flex-col rounded-card border border-border bg-surface p-5 transition-colors hover:border-primary/40 hover:bg-primary-soft/30 focus-visible:border-primary"
                >
                  <RegionScene code={region.code} className="mb-4 h-auto w-full rounded-xl" />
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-ink group-hover:text-primary">
                      {region.name}
                    </h3>
                    {region.hasStats ? (
                      <Badge tone="primary">{m.common.registre}</Badge>
                    ) : (
                      <Badge tone="neutral">{m.common.pending}</Badge>
                    )}
                  </div>

                  {region.hasStats ? (
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                      <Stat
                        label={m.index.card.sales}
                        value={
                          region.salesCount !== null
                            ? formatNumber(region.salesCount, locale)
                            : m.common.noValue
                        }
                      />
                      <Stat
                        label={m.index.card.mortgages}
                        value={
                          region.mortgageCount !== null
                            ? formatNumber(region.mortgageCount, locale)
                            : m.common.noValue
                        }
                      />
                      <Stat
                        label={m.index.card.difficulties}
                        value={
                          region.difficultyCount !== null
                            ? formatNumber(region.difficultyCount, locale)
                            : m.common.noValue
                        }
                      />
                      <Stat
                        label={m.index.card.medianBand}
                        value={
                          region.salesMedianBand
                            ? priceBandLabel(region.salesMedianBand, locale, m)
                            : m.common.noValue
                        }
                      />
                    </dl>
                  ) : (
                    <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                      {m.index.card.noStats}
                    </p>
                  )}

                  <p className="mt-4 border-t border-border pt-3 text-xs text-muted-fg">
                    {region.hasRoll
                      ? m.index.card.coverage(
                          formatNumber(region.coveredMunicipalities, locale),
                          formatNumber(region.municipalityCount, locale),
                          formatNumber(region.unitCount, locale),
                        )
                      : m.index.card.rollMissing}
                    {region.medianRollValueCents !== null
                      ? m.index.card.medianRoll(formatCad(region.medianRollValueCents, locale))
                      : ""}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </Section>

      <Section
        eyebrow={m.index.method.eyebrow}
        title={m.index.method.title}
        className="bg-surface"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{m.index.method.window.title}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2 text-sm leading-relaxed text-ink-soft">
              <p>{m.index.method.window.body1}</p>
              <p>{m.index.method.window.body2}</p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{m.index.method.median.title}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2 text-sm leading-relaxed text-ink-soft">
              <p>{m.index.method.median.body1}</p>
              <p>{m.index.method.median.body2}</p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{m.index.method.roll.title}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2 text-sm leading-relaxed text-ink-soft">
              <p>{m.index.method.roll.body}</p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{m.index.method.coverage.title}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2 text-sm leading-relaxed text-ink-soft">
              <p>{m.index.method.coverage.body}</p>
            </CardBody>
          </Card>
        </div>

        {provenance.length > 0 ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{m.common.sourceSection}</CardTitle>
            </CardHeader>
            <CardBody>
              <Provenance items={provenance} />
            </CardBody>
          </Card>
        ) : null}
      </Section>
    </>
  );
}
