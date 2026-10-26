import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";

import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";

import { BarDistribution } from "@/components/charts/bar-distribution";
import { TrendBars } from "@/components/charts/trend-bars";
import { CoverageNotice } from "@/components/market/coverage-notice";
import { MarketPageHeader } from "@/components/market/page-header";
import { TypeFilter } from "@/components/market/type-filter";
import {
  priceBandLabel,
  PROPERTY_TYPE_VALUES,
  propertyTypeLabel,
  propertyTypeOptions,
  valueBandLabel,
} from "@/components/market/band-label";
import { formatArea, formatCad, formatMonth, formatNumber } from "@/shared/format";
import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  Stat,
} from "@/components/ui/content";
import { ButtonLink } from "@/components/ui/button";
import { Provenance } from "@/components/ui/provenance";

import {
  getMunicipality,
  MARKET_WINDOW_PERIODS,
  provenanceFor,
  resolveMunicipality,
} from "@/modules/market";
import { messagesFor } from "@/modules/market/messages";

export const dynamic = "force-dynamic";

type MunicipalityPageProps = {
  params: Promise<{ region: string; municipalite: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readTypeFilter(
  raw: string | string[] | undefined,
): { requested: string | null; active: string | null } {
  const requested = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null);
  const active =
    requested && (PROPERTY_TYPE_VALUES as readonly string[]).includes(requested) ? requested : null;
  return { requested, active };
}

export async function generateMetadata({
  params,
  searchParams,
}: MunicipalityPageProps): Promise<Metadata> {
  const { municipalite } = await params;
  const locale = await getLocale();
  const m = messagesFor(locale);
  const { active } = readTypeFilter((await searchParams).type);
  const resolved = await resolveMunicipality(municipalite);
  if (!resolved || !resolved.region) {
    return { title: m.notFound.title, robots: { index: false, follow: false } };
  }
  const base = `/marche-immobilier/${resolved.region.slug}/${resolved.municipality.slug}`;
  const canonical = active ? `${base}?type=${active}` : base;
  return {
    title: m.municipality.meta.title(resolved.municipality.name),
    description: m.municipality.meta.description(
      resolved.municipality.name,
      resolved.region.name,
    ),
    alternates: {
      canonical: localePath(canonical, locale),
      languages: { "fr-CA": canonical, "en-CA": `/en${canonical}` },
    },
  };
}

export default async function MunicipalityPage({ params, searchParams }: MunicipalityPageProps) {
  const { region: regionParam, municipalite } = await params;
  const locale = await getLocale();
  const m = messagesFor(locale);
  const path = (href: string) => localePath(href, locale);

  const { requested, active } = readTypeFilter((await searchParams).type);

  const resolved = await resolveMunicipality(municipalite);
  if (!resolved || !resolved.region) notFound();
  const region = resolved.region;

  const basePath = path(`/marche-immobilier/${region.slug}/${resolved.municipality.slug}`);
  if (regionParam !== region.slug) {
    permanentRedirect(active ? `${basePath}?type=${active}` : basePath);
  }
  if (requested && !active) {
    redirect(basePath);
  }

  const detail = await getMunicipality(resolved.municipality.code, active);
  if (!detail) notFound();

  const statsProvenance = detail.hasStats ? await provenanceFor("market_stats") : [];
  const rollProvenance = detail.roll.unitCount > 0 ? await provenanceFor("property_unit") : [];
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

  // The Registre foncier publishes region-level statistics only: fall back to them, explicitly
  // labelled as regional, instead of hiding every figure on a municipality page.
  const statsScope =
    detail.hasStats ? "municipality" : detail.regionStats.hasStats ? "region" : "none";
  const statsSeries = detail.hasStats ? detail.series : detail.regionStats.series;
  const statsTotals = detail.hasStats ? detail.totals : detail.regionStats.totals;
  const statsBands = detail.hasStats ? detail.priceBands : detail.regionStats.priceBands;
  const statsMedianBand = detail.hasStats ? detail.medianPriceBand : detail.regionStats.medianPriceBand;
  const statsName = detail.hasStats ? detail.municipality.name : region.name;
  const statsTitle = detail.hasStats
    ? m.municipality.stats.title
    : m.municipality.regionStatsTitle(region.name);
  const statsNote = detail.hasStats ? null : m.municipality.regionStatsNote(region.name);
  const statsSalesPoints = statsSeries.map((point) => ({
    period: point.period,
    value: point.ventes,
  }));
  const statsBandItems = statsBands.map((band) => ({
    label: priceBandLabel(band, locale, m),
    value: band.count,
  }));
  const valueBandItems = detail.roll.filter.valueBands.map((band) => ({
    label: valueBandLabel(band, locale, m),
    value: band.count,
  }));
  const chartUi = {
    viewValues: m.chartUi.viewValues,
    band: m.chartUi.bandColumn,
    share: m.chartUi.shareColumn,
  };

  const marketPeriodLabel = windowLabel ?? m.window.last12;
  const statsSubtitle = detail.hasStats
    ? m.municipality.stats.subtitle(marketPeriodLabel)
    : m.region.stats.subtitle(marketPeriodLabel);

  return (
    <>
      <MarketPageHeader
        crumbs={[
          { label: m.common.home, href: path("/") },
          { label: m.common.market, href: path("/marche-immobilier") },
          { label: region.name, href: path(`/marche-immobilier/${region.slug}`) },
          { label: detail.municipality.name },
        ]}
        breadcrumbsLabel={m.common.breadcrumbsLabel}
        eyebrow={m.municipality.eyebrow}
        title={detail.municipality.name}
        lead={m.municipality.lead(region.name)}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-fg">
          {periodLine ? (
            <span>
              {periodLine}
              {windowLabel ? ` · ${windowLabel}` : ""}
            </span>
          ) : null}
          {detail.latestPeriod ? (
            <span>{m.window.latest(formatMonth(detail.latestPeriod, locale))}</span>
          ) : null}
          {detail.roll.rollYear ? <span>{m.window.rollYear(detail.roll.rollYear)}</span> : null}
        </div>
      </MarketPageHeader>

      <div className="container-page space-y-10 py-10 md:py-14">
        {statsScope !== "none" ? (
          <section aria-labelledby="stats-municipalite">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2
                  id="stats-municipalite"
                  className="font-display text-2xl font-extrabold text-ink md:text-3xl"
                >
                  {statsTitle}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {statsSubtitle}
                </p>
                {statsNote ? (
                  <p className="mt-2 max-w-2xl rounded-lg border border-border bg-muted px-3 py-2 text-sm text-ink-soft">
                    {statsNote}
                  </p>
                ) : null}
              </div>
              <Badge tone="primary">{m.common.official}</Badge>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
              <Stat
                label={`${m.region.stats.sales} · ${marketPeriodLabel}`}
                value={
                  statsTotals.ventes !== null
                    ? formatNumber(statsTotals.ventes, locale)
                    : m.common.noValue
                }
              />
              <Stat
                label={m.region.stats.mortgages}
                value={
                  statsTotals.hypotheques !== null
                    ? formatNumber(statsTotals.hypotheques, locale)
                    : m.common.noValue
                }
              />
              <Stat
                label={m.region.stats.difficulties}
                value={
                  statsTotals.difficultes !== null
                    ? formatNumber(statsTotals.difficultes, locale)
                    : m.common.noValue
                }
                hint={m.region.stats.difficultiesHint}
              />
              <Stat
                label={m.index.card.medianBand}
                value={
                  statsMedianBand
                    ? priceBandLabel(statsMedianBand, locale, m)
                    : m.common.noValue
                }
              />
            </dl>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{m.charts.salesTitle}</CardTitle>
                </CardHeader>
                <CardBody>
                  {statsSalesPoints.some((point) => point.value !== null) ? (
                    <>
                      <p className="mb-4 text-sm text-ink-soft">{m.charts.salesBody}</p>
                      <TrendBars
                        title={m.charts.salesTitleFor(statsName)}
                        description={m.charts.salesDescFor(statsName, periodLine)}
                        caption={m.charts.salesCaptionFor(statsName)}
                        points={statsSalesPoints}
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
                  {statsBandItems.length > 0 ? (
                    <>
                      <p className="mb-4 text-sm text-ink-soft">{m.charts.bandsBody}</p>
                      <BarDistribution
                        title={m.charts.bandsTitleFor(statsName)}
                        description={m.charts.bandsDescFor(
                          statsName,
                          marketPeriodLabel,
                        )}
                        caption={m.charts.bandsCaptionFor(statsName)}
                        items={statsBandItems}
                        locale={locale}
                        labels={chartUi}
                        valueHeading={m.chartUi.sales}
                      />
                      {statsMedianBand ? (
                        <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-ink-soft">
                          {m.charts.medianBandNote(
                            priceBandLabel(statsMedianBand, locale, m),
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
            title={m.municipality.statsMissing.title}
            warningLabel={m.common.coverageWarning}
            infoLabel={m.common.coverageInfo}
            action={
              <ButtonLink
                href={path(`/marche-immobilier/${region.slug}`)}
                variant="secondary"
                size="md"
              >
                {m.municipality.statsMissing.action(region.name)}
              </ButtonLink>
            }
          >
            <p>{m.municipality.statsMissing.body(detail.municipality.name)}</p>
          </CoverageNotice>
        )}

        {detail.roll.unitCount > 0 ? (
          <section aria-labelledby="inventaire-role">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2
                  id="inventaire-role"
                  className="font-display text-2xl font-extrabold text-ink md:text-3xl"
                >
                  {m.municipality.roll.title}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-ink-soft">
                  {m.municipality.roll.body}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="primary">{m.municipality.roll.badge}</Badge>
                {detail.roll.rollYear ? (
                  <Badge tone="neutral">{m.window.rollYear(detail.roll.rollYear)}</Badge>
                ) : null}
                <Badge tone="neutral">
                  {m.municipality.roll.unitsHint(formatNumber(detail.roll.unitCount, locale))}
                </Badge>
              </div>
            </div>

            <Card className="mt-5">
              <CardHeader>
                <CardTitle>{m.municipality.filter.title}</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3">
                <TypeFilter
                  basePath={basePath}
                  active={active}
                  label={m.municipality.filter.label}
                  options={propertyTypeOptions(m)}
                />
                <p className="text-xs leading-relaxed text-muted-fg">
                  {m.municipality.filter.note}
                </p>
              </CardBody>
            </Card>

            {detail.roll.filter.unitCount === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title={m.municipality.roll.emptyTypeTitle}
                  description={m.municipality.roll.emptyTypeBody}
                  action={
                    <ButtonLink href={basePath} variant="secondary" size="md">
                      {m.municipality.roll.removeFilter}
                    </ButtonLink>
                  }
                />
              </div>
            ) : (
              <>
                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                  <Stat
                    label={m.municipality.roll.unitsLabel}
                    value={formatNumber(detail.roll.filter.unitCount, locale)}
                  />
                  <Stat
                    label={m.municipality.roll.medianValue}
                    value={
                      detail.roll.filter.medianValueCents !== null
                        ? formatCad(detail.roll.filter.medianValueCents, locale)
                        : m.common.noValue
                    }
                  />
                  <Stat
                    label={m.municipality.roll.medianArea}
                    value={
                      detail.roll.filter.medianLandAreaM2 !== null
                        ? formatArea(detail.roll.filter.medianLandAreaM2, locale)
                        : m.common.noValue
                    }
                  />
                </dl>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>{m.municipality.roll.bandsTitle}</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <p className="mb-4 text-sm text-ink-soft">
                        {m.municipality.roll.bandsBody(
                          formatNumber(detail.roll.filter.unitCount, locale),
                        )}
                      </p>
                      <BarDistribution
                        title={m.municipality.roll.bandsChartTitle(detail.municipality.name)}
                        description={m.municipality.roll.bandsChartDesc(
                          detail.municipality.name,
                          formatNumber(detail.roll.filter.unitCount, locale),
                        )}
                        caption={m.municipality.roll.bandsCaption(detail.municipality.name)}
                        items={valueBandItems}
                        locale={locale}
                        labels={chartUi}
                        valueHeading={m.chartUi.units}
                      />
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{m.municipality.roll.tableType}</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[32rem] border-collapse text-sm">
                          <caption className="sr-only">
                            {m.municipality.roll.tableCaption(detail.municipality.name)}
                          </caption>
                          <thead>
                            <tr className="border-b border-border text-left">
                              <th scope="col" className="py-2 pr-4 font-semibold text-ink-soft">
                                {m.municipality.roll.tableType}
                              </th>
                              <th
                                scope="col"
                                className="py-2 pr-4 text-right font-semibold text-ink-soft"
                              >
                                {m.municipality.roll.unitsLabel}
                              </th>
                              <th
                                scope="col"
                                className="py-2 pr-4 text-right font-semibold text-ink-soft"
                              >
                                {m.municipality.roll.medianValue}
                              </th>
                              <th
                                scope="col"
                                className="py-2 text-right font-semibold text-ink-soft"
                              >
                                {m.municipality.roll.medianArea}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.roll.byType.map((row) => (
                              <tr
                                key={row.propertyType}
                                className="border-b border-border/60 last:border-0"
                              >
                                <th
                                  scope="row"
                                  className="py-2 pr-4 text-left font-medium text-ink"
                                >
                                  {propertyTypeLabel(row.propertyType, m)}
                                </th>
                                <td className="tabular py-2 pr-4 text-right text-ink-soft">
                                  {formatNumber(row.count, locale)}
                                </td>
                                <td className="tabular py-2 pr-4 text-right text-ink-soft">
                                  {row.medianValueCents !== null
                                    ? formatCad(row.medianValueCents, locale)
                                    : m.common.noValue}
                                </td>
                                <td className="tabular py-2 text-right text-ink-soft">
                                  {row.medianLandAreaM2 !== null
                                    ? formatArea(row.medianLandAreaM2, locale)
                                    : m.common.noValue}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-muted-fg">
                        {m.municipality.roll.ratioNote}
                      </p>
                    </CardBody>
                  </Card>
                </div>
              </>
            )}
          </section>
        ) : (
          <CoverageNotice
            title={m.municipality.roll.notCoveredTitle}
            warningLabel={m.common.coverageWarning}
            infoLabel={m.common.coverageInfo}
            action={
              <ButtonLink href={path("/donnees")} variant="secondary" size="sm">
                {m.municipality.roll.notCoveredAction}
              </ButtonLink>
            }
          >
            <p>{m.municipality.roll.notCoveredBody}</p>
          </CoverageNotice>
        )}

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
          <ButtonLink
            href={path(`/marche-immobilier/${region.slug}`)}
            variant="secondary"
            size="md"
          >
            {m.municipality.backToRegion(region.name)}
          </ButtonLink>
          <ButtonLink href={path("/marche-immobilier")} variant="ghost" size="md">
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
