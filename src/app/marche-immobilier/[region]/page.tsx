import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";

import { BarDistribution } from "@/components/charts/bar-distribution";
import { TrendBars } from "@/components/charts/trend-bars";
import { CoverageNotice } from "@/components/market/coverage-notice";
import { MarketPageHeader } from "@/components/market/page-header";
import { MunicipalityTable } from "@/components/market/municipality-table";
import { priceBandLabel } from "@/components/market/band-label";
import { formatArea, formatCad, formatMonth, formatNumber } from "@/shared/format";
import { Alert, Badge, Card, CardBody, CardHeader, CardTitle, Stat } from "@/components/ui/content";
import { ButtonLink } from "@/components/ui/button";
import { Provenance } from "@/components/ui/provenance";

import {
  getRegion,
  MARKET_WINDOW_PERIODS,
  provenanceFor,
  resolveRegion,
} from "@/modules/market";
import { messagesFor } from "@/modules/market/messages";

export const dynamic = "force-dynamic";

type RegionPageProps = { params: Promise<{ region: string }> };

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { region: regionParam } = await params;
  const locale = await getLocale();
  const m = messagesFor(locale);
  const region = await resolveRegion(regionParam);
  if (!region) {
    return { title: m.notFound.title, robots: { index: false, follow: false } };
  }
  const canonical = `/marche-immobilier/${region.slug}`;
  return {
    title: m.region.meta.title(region.name),
    description: m.region.meta.description(region.name),
    alternates: {
      canonical: localePath(canonical, locale),
      languages: { "fr-CA": canonical, "en-CA": `/en${canonical}` },
    },
  };
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { region: regionParam } = await params;
  const locale = await getLocale();
  const m = messagesFor(locale);
  const path = (href: string) => localePath(href, locale);

  const detail = await getRegion(regionParam);
  if (!detail) notFound();

  const canonicalPath = `/marche-immobilier/${detail.region.slug}`;
  if (regionParam !== detail.region.slug) {
    permanentRedirect(localePath(canonicalPath, locale));
  }

  const statsProvenance = await provenanceFor("market_stats");
  const rollProvenance = detail.coverage.unitCount > 0 ? await provenanceFor("property_unit") : [];
  const provenance = [...statsProvenance, ...rollProvenance];

  const firstPeriod = detail.window[0];
  const lastPeriod = detail.window.at(-1);
  const windowLabel =
    detail.window.length === 0
      ? null
      : detail.window.length === MARKET_WINDOW_PERIODS
        ? m.window.last12
        : m.window.published(detail.window.length);
  const periodLine =
    firstPeriod && lastPeriod
      ? m.window.covered(formatMonth(firstPeriod, locale), formatMonth(lastPeriod, locale))
      : null;

  const stats = detail.totals;
  const salesPoints = detail.series.map((point) => ({ period: point.period, value: point.ventes }));
  const bandItems = detail.priceBands.map((band) => ({
    label: priceBandLabel(band, locale, m),
    value: band.count,
  }));
  const hasSales = stats.ventes !== null;
  const chartUi = {
    viewValues: m.chartUi.viewValues,
    band: m.chartUi.bandColumn,
    share: m.chartUi.shareColumn,
  };

  return (
    <>
      <MarketPageHeader
        crumbs={[
          { label: m.common.home, href: path("/") },
          { label: m.common.market, href: path("/marche-immobilier") },
          { label: detail.region.name },
        ]}
        breadcrumbsLabel={m.common.breadcrumbsLabel}
        eyebrow={m.region.eyebrow}
        title={detail.region.name}
        lead={m.region.lead}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-fg">
          {periodLine ? (
            <span>
              {periodLine}
              {windowLabel ? ` · ${windowLabel}` : ""}
            </span>
          ) : null}
          {detail.latestPeriod ? <span>{m.window.latest(formatMonth(detail.latestPeriod, locale))}</span> : null}
          {detail.coverage.rollYear ? <span>{m.window.rollYear(detail.coverage.rollYear)}</span> : null}
        </div>
      </MarketPageHeader>

      <div className="container-page space-y-10 py-10 md:py-14">
        {detail.hasStats ? (
          <section aria-labelledby="stats-region">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2
                  id="stats-region"
                  className="font-display text-2xl font-extrabold text-ink md:text-3xl"
                >
                  {m.region.stats.title}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {m.region.stats.subtitle(windowLabel ?? m.window.last12)}
                </p>
              </div>
              <Badge tone="primary">{m.common.official}</Badge>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
              <Stat
                label={`${m.region.stats.sales} · ${windowLabel ?? m.window.last12}`}
                value={stats.ventes !== null ? formatNumber(stats.ventes, locale) : m.common.noValue}
              />
              <Stat
                label={m.region.stats.mortgages}
                value={
                  stats.hypotheques !== null
                    ? formatNumber(stats.hypotheques, locale)
                    : m.common.noValue
                }
              />
              <Stat
                label={m.region.stats.difficulties}
                value={
                  stats.difficultes !== null
                    ? formatNumber(stats.difficultes, locale)
                    : m.common.noValue
                }
                hint={m.region.stats.difficultiesHint}
              />
              <Stat
                label={m.region.stats.municipalities}
                value={`${formatNumber(detail.coverage.coveredMunicipalities, locale)} / ${formatNumber(detail.coverage.municipalityCount, locale)}`}
                hint={m.region.stats.municipalitiesHint}
              />
              <Stat
                label={m.region.stats.medianRoll}
                value={
                  detail.coverage.medianRollValueCents !== null
                    ? formatCad(detail.coverage.medianRollValueCents, locale)
                    : m.common.noValue
                }
                hint={
                  detail.coverage.medianLandAreaM2 !== null
                    ? m.region.stats.medianLandHint(
                        formatArea(detail.coverage.medianLandAreaM2, locale),
                      )
                    : m.region.stats.medianRollHint
                }
              />
            </dl>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{m.charts.salesTitle}</CardTitle>
                </CardHeader>
                <CardBody>
                  {hasSales && salesPoints.length > 0 ? (
                    <>
                      <p className="mb-4 text-sm text-ink-soft">{m.charts.salesBody}</p>
                      <TrendBars
                        title={m.charts.salesTitleFor(detail.region.name)}
                        description={m.charts.salesDescFor(detail.region.name, periodLine)}
                        caption={m.charts.salesCaptionFor(detail.region.name)}
                        points={salesPoints}
                        locale={locale}
                        labels={{
                          viewValues: m.chartUi.viewValues,
                          period: m.chartUi.periodColumn,
                        }}
                        heading={m.chartUi.sales}
                      />
                    </>
                  ) : (
                    <Alert tone="info" title={m.charts.salesEmptyTitle}>
                      <p>{m.charts.salesEmptyBody}</p>
                    </Alert>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{m.charts.bandsTitle}</CardTitle>
                </CardHeader>
                <CardBody>
                  {bandItems.length > 0 ? (
                    <>
                      <p className="mb-4 text-sm text-ink-soft">{m.charts.bandsBody}</p>
                      <BarDistribution
                        title={m.charts.bandsTitleFor(detail.region.name)}
                        description={m.charts.bandsDescFor(
                          detail.region.name,
                          windowLabel ?? m.window.last12,
                        )}
                        caption={m.charts.bandsCaptionFor(detail.region.name)}
                        items={bandItems}
                        locale={locale}
                        labels={chartUi}
                        valueHeading={m.chartUi.sales}
                      />
                      {detail.medianPriceBand ? (
                        <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-ink-soft">
                          {m.charts.medianBandNote(
                            priceBandLabel(detail.medianPriceBand, locale, m),
                          )}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <Alert tone="info" title={m.charts.bandsEmptyTitle}>
                      <p>{m.charts.bandsEmptyBody}</p>
                    </Alert>
                  )}
                </CardBody>
              </Card>
            </div>
          </section>
        ) : (
          <CoverageNotice
            title={m.region.statsMissing.title}
            warningLabel={m.common.coverageWarning}
            infoLabel={m.common.coverageInfo}
            action={
              <ButtonLink href={path("/donnees")} variant="secondary" size="md">
                {m.region.statsMissing.action}
              </ButtonLink>
            }
          >
            <p>{m.region.statsMissing.body(detail.region.name)}</p>
          </CoverageNotice>
        )}

        <section aria-labelledby="municipalites-region">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="municipalites-region"
                className="font-display text-2xl font-extrabold text-ink md:text-3xl"
              >
                {m.region.municipalities.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-ink-soft">
                {m.region.municipalities.body}
              </p>
            </div>
            {detail.coverage.municipalitiesWithStats === 0 && detail.municipalities.length > 0 ? (
              <Badge tone="neutral">{m.region.municipalities.badgeNoStats}</Badge>
            ) : null}
          </div>

          <div className="mt-5">
            <MunicipalityTable
              regionName={detail.region.name}
              rows={detail.municipalities}
              locale={locale}
              labels={m.components.municipalityTable}
              linkTo={(slug) => path(`/marche-immobilier/${detail.region.slug}/${slug}`)}
            />
          </div>

          {detail.coverage.unitCount === 0 ? (
            <div className="mt-6">
              <CoverageNotice
                title={m.region.municipalities.rollMissingTitle}
                warningLabel={m.common.coverageWarning}
                infoLabel={m.common.coverageInfo}
                tone="info"
                action={
                  <ButtonLink href={path("/donnees")} variant="secondary" size="sm">
                    {m.region.municipalities.rollMissingAction}
                  </ButtonLink>
                }
              >
                <p>{m.region.municipalities.rollMissingBody}</p>
              </CoverageNotice>
            </div>
          ) : (
            <p className="mt-4 text-xs leading-relaxed text-muted-fg">
              {m.region.municipalities.footnote(
                formatNumber(detail.coverage.unitCount, locale),
                detail.coverage.medianLandAreaM2 !== null
                  ? formatArea(detail.coverage.medianLandAreaM2, locale)
                  : null,
              )}
            </p>
          )}
        </section>

        {provenance.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{m.common.sourceSection}</CardTitle>
            </CardHeader>
            <CardBody>
              <Provenance items={provenance} />
            </CardBody>
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <ButtonLink href={path("/marche-immobilier")} variant="secondary" size="md">
            {m.common.backToRegions}
          </ButtonLink>
          <ButtonLink href={path("/donnees")} variant="ghost" size="md">
            {m.common.dataAndLicences}
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
