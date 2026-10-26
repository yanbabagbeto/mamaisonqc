import Link from "next/link";

import type { Locale } from "@/i18n/config";

import { Badge, EmptyState } from "@/components/ui/content";

import type { MunicipalityRollRow } from "@/modules/market";
import type { MarketMessages } from "@/modules/market/messages";

import { formatArea, formatCad, formatNumber } from "@/shared/format";

/**
 * Municipality table of a region page. A municipality with no ingested roll keeps its row and
 * shows a "roll not ingested" badge with em dashes — never a fake zero. Row links always resolve:
 * the municipality page explains its own coverage.
 */
export function MunicipalityTable({
  regionName,
  rows,
  locale,
  labels,
  linkTo,
}: {
  regionName: string;
  rows: MunicipalityRollRow[];
  locale: Locale;
  labels: MarketMessages["components"]["municipalityTable"];
  linkTo: (slug: string) => string;
}) {
  if (rows.length === 0) {
    return <EmptyState title={labels.emptyTitle} description={labels.emptyBody} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-sm">
        <caption className="sr-only">{labels.caption(regionName)}</caption>
        <thead>
          <tr className="border-b border-border text-left">
            <th scope="col" className="py-2 pr-4 font-semibold text-ink-soft">
              {labels.municipality}
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-semibold text-ink-soft">
              {labels.units}
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-semibold text-ink-soft">
              {labels.medianValue}
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-semibold text-ink-soft">
              {labels.medianArea}
            </th>
            <th scope="col" className="py-2 text-right font-semibold text-ink-soft">
              {labels.registre}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.code} className="border-b border-border/60 align-top last:border-0">
              <th scope="row" className="py-2.5 pr-4 text-left font-medium text-ink">
                <Link
                  href={linkTo(row.slug)}
                  className="underline-offset-2 hover:text-primary hover:underline"
                >
                  {row.name}
                </Link>
                {row.covered ? null : (
                  <Badge tone="warning" className="ml-2 align-middle">
                    {labels.rollMissing}
                  </Badge>
                )}
              </th>
              <td className="tabular py-2.5 pr-4 text-right text-ink-soft">
                {row.covered ? formatNumber(row.unitCount, locale) : "—"}
              </td>
              <td className="tabular py-2.5 pr-4 text-right text-ink-soft">
                {row.medianRollValueCents !== null
                  ? formatCad(row.medianRollValueCents, locale)
                  : "—"}
              </td>
              <td className="tabular py-2.5 pr-4 text-right text-ink-soft">
                {row.medianLandAreaM2 !== null ? formatArea(row.medianLandAreaM2, locale) : "—"}
              </td>
              <td className="py-2.5 text-right">
                {row.hasStats ? (
                  <Badge tone="success">{labels.published}</Badge>
                ) : (
                  <Badge tone="neutral">{labels.notPublished}</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
