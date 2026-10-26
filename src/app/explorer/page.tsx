import type { Metadata } from "next";
import Link from "next/link";

import { ExplorerMap } from "@/components/map/explorer-map";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Badge, EmptyState } from "@/components/ui/content";
import { Field, Select } from "@/components/ui/field";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import {
  EXPLORER_HORIZONS,
  EXPLORER_TYPES,
  filterListings,
  groupByCity,
  parseExplorerFilters,
  sortForList,
  splitLocated,
} from "@/modules/buyer/filters";
import { horizonLabel, messagesFor, propertyTypeLabel } from "@/modules/buyer/messages";
import {
  listExplorerListings,
  listRegionOptions,
  loadRegionByMunicipality,
} from "@/modules/buyer/queries";
import { countMessage, interpolate } from "@/modules/buyer/format-message";
import { formatCad } from "@/shared/format";

type ExplorerPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = messagesFor(locale);
  return {
    title: messages.meta.explorer.title,
    description: messages.meta.explorer.description,
    alternates: {
      canonical: localePath("/explorer", locale),
      languages: { "fr-CA": "/explorer", "en-CA": "/en/explorer" },
    },
  };
}

/**
 * Pre-market explorer. The map only receives listings with real roll coordinates; the same
 * results are always available as a table and the unlocated ones are grouped by city. Filters are
 * a plain GET form, so the whole page works without JavaScript (the map is progressive enhancement).
 */
export default async function ExplorerPage({ searchParams }: ExplorerPageProps) {
  const locale = await getLocale();
  const messages = messagesFor(locale);
  const path = (href: string) => localePath(href, locale);
  const params = await searchParams;
  const filters = parseExplorerFilters(params);

  const [listings, regions, regionByMunicipality] = await Promise.all([
    listExplorerListings(),
    listRegionOptions(),
    loadRegionByMunicipality(),
  ]);

  const filtered = filterListings(listings, filters, regionByMunicipality);
  const sorted = sortForList(filtered);
  const { located, unlocated } = splitLocated(filtered);
  const cityGroups = groupByCity(unlocated);
  const hasFilters = Boolean(filters.propertyType || filters.horizon || filters.regionCode);

  return (
    <div className="container-page py-10 md:py-14">
      <header className="max-w-3xl">
        <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">
          {messages.explorer.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold tracking-tight text-ink md:text-4xl">
          {messages.explorer.title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">{messages.explorer.intro}</p>
      </header>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{messages.explorer.filtersTitle}</CardTitle>
        </CardHeader>
        <CardBody>
          <form
            action={path("/explorer")}
            method="get"
            className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
          >
            <Field label={messages.explorer.typeLabel} htmlFor="filter-type">
              <Select id="filter-type" name="type" defaultValue={filters.propertyType ?? ""}>
                <option value="">{messages.explorer.allTypes}</option>
                {EXPLORER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {propertyTypeLabel(messages, type)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={messages.explorer.horizonLabel} htmlFor="filter-horizon">
              <Select id="filter-horizon" name="horizon" defaultValue={filters.horizon ?? ""}>
                <option value="">{messages.explorer.allHorizons}</option>
                {EXPLORER_HORIZONS.map((horizon) => (
                  <option key={horizon} value={horizon}>
                    {horizonLabel(messages, horizon)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={messages.explorer.regionLabel} htmlFor="filter-region">
              <Select id="filter-region" name="region" defaultValue={filters.regionCode ?? ""}>
                <option value="">{messages.explorer.allRegions}</option>
                {regions.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit">{messages.explorer.apply}</Button>
          </form>
          {hasFilters ? (
            <p className="mt-3">
              <Link
                href={path("/explorer")}
                className="text-sm font-semibold text-primary underline decoration-dotted underline-offset-2"
              >
                {messages.explorer.reset}
              </Link>
            </p>
          ) : null}
        </CardBody>
      </Card>

      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-ink">
          {countMessage(filtered.length, {
            one: messages.explorer.resultsCountOne,
            many: messages.explorer.resultsCountMany,
          })}
        </h2>
        <p className="text-xs text-muted-fg">{messages.explorer.privacyNote}</p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={messages.explorer.emptyTitle}
            description={messages.explorer.emptyBody}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <ButtonLink href={path("/pre-marche")}>{messages.explorer.emptyCta}</ButtonLink>
                {hasFilters ? (
                  <ButtonLink href={path("/explorer")} variant="secondary">
                    {messages.explorer.resetCta}
                  </ButtonLink>
                ) : null}
              </div>
            }
          />
        </div>
      ) : (
        <>
          {located.length > 0 ? (
            <Card className="mt-6">
              <CardHeader className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>{messages.explorer.mapTitle}</CardTitle>
                <p className="text-xs text-muted-fg">
                  {interpolate(
                    filtered.length === 1
                      ? messages.explorer.mapCaptionOne
                      : messages.explorer.mapCaptionMany,
                    { located: located.length, total: filtered.length },
                  )}
                </p>
              </CardHeader>
              <CardBody>
                <ExplorerMap listings={located} messages={messages} locale={locale} />
              </CardBody>
            </Card>
          ) : (
            <div className="mt-6">
              <Alert tone="warning" title={messages.explorer.mapNoCoordsTitle}>
                {messages.explorer.mapNoCoordsBody}
              </Alert>
            </div>
          )}

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{messages.explorer.listTitle}</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[44rem] border-collapse text-sm">
                  <caption className="sr-only">{messages.explorer.tableCaption}</caption>
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-semibold tracking-wide text-muted-fg uppercase">
                      <th scope="col" className="py-2 pr-4">
                        {messages.explorer.tableStreet}
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        {messages.explorer.tableCity}
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        {messages.explorer.tableType}
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        {messages.explorer.tableHorizon}
                      </th>
                      <th scope="col" className="py-2 text-right">
                        {messages.explorer.tablePrice}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((listing) => (
                      <tr key={listing.id} className="border-b border-border/70 last:border-0">
                        <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">
                          <Link
                            href={path(`/pre-marche/${listing.id}`)}
                            className="underline decoration-dotted underline-offset-2 hover:text-primary"
                          >
                            {listing.street || "—"}
                          </Link>
                        </th>
                        <td className="py-3 pr-4 text-ink-soft">{listing.city || "—"}</td>
                        <td className="py-3 pr-4 text-ink-soft">
                          {propertyTypeLabel(messages, listing.propertyType)}
                        </td>
                        <td className="py-3 pr-4 text-ink-soft">
                          {horizonLabel(messages, listing.horizon)}
                        </td>
                        <td className="tabular py-3 text-right font-semibold text-ink">
                          {formatCad(listing.askingPriceCents, locale)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {unlocated.length > 0 ? (
            <section className="mt-8" aria-labelledby="unlocated-title">
              <h2 id="unlocated-title" className="font-display text-2xl font-bold text-ink">
                {messages.explorer.unlocatedTitle}
              </h2>
              <p className="mt-1 text-sm text-muted-fg">{messages.explorer.unlocatedBody}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {cityGroups.map((group) => (
                  <Card key={group.city}>
                    <CardHeader className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle>{group.city || "—"}</CardTitle>
                      <Badge tone="neutral">
                        {countMessage(group.listings.length, {
                          one: messages.explorer.cityCountOne,
                          many: messages.explorer.cityCountMany,
                        })}
                      </Badge>
                    </CardHeader>
                    <CardBody>
                      <ul className="space-y-2">
                        {group.listings.map((listing) => (
                          <li
                            key={listing.id}
                            className="flex flex-wrap items-center justify-between gap-2 text-sm"
                          >
                            <Link
                              href={path(`/pre-marche/${listing.id}`)}
                              className="font-medium text-primary underline decoration-dotted underline-offset-2"
                            >
                              {listing.street || "—"}
                            </Link>
                            <span className="tabular text-ink-soft">
                              {formatCad(listing.askingPriceCents, locale)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
