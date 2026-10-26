import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/content";
import { Provenance } from "@/components/ui/provenance";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { intlLocale, localePath } from "@/i18n/config";
import { getLocale, getMessages } from "@/i18n/server";
import { formatNumber, formatPercent } from "@/shared/format";
import { messagesFor } from "@/modules/content/messages";
import { loadBriefEdition } from "@/modules/content/brief";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.brief.title,
    description: m.brief.description,
    alternates: {
      canonical: localePath("/le-brief", locale),
      languages: { "fr-CA": "/le-brief", "en-CA": "/en/le-brief" },
    },
  };
}

/** "2026-08" → "août 2026" / "August 2026", in the reader's locale. */
function formatPeriod(period: string, locale: "fr" | "en"): string {
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return period;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return new Intl.DateTimeFormat(intlLocale[locale], {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function LeBriefPage() {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const t = await getMessages();
  const edition = await loadBriefEdition();

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="container-page max-w-3xl py-12 md:py-16">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-accent uppercase">
            <span aria-hidden="true" className="inline-block h-0.5 w-6 bg-accent" />
            {m.brief.eyebrow}
          </p>
          <h1 className="font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
            {m.brief.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{m.brief.description}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-fg">{m.brief.intro}</p>
        </div>
      </header>

      <div className="container-page max-w-4xl py-10 md:py-14">
        {edition ? (
          <section aria-labelledby="edition-title">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">
                  {m.brief.latestEdition}
                </p>
                <h2 id="edition-title" className="mt-1 font-display text-2xl font-extrabold text-ink">
                  {formatPeriod(edition.period, locale)}
                </h2>
              </div>
              <Badge tone="primary">
                {m.brief.periodLabel} : {formatPeriod(edition.period, locale)}
              </Badge>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-card border border-border bg-surface p-5">
                <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                  {m.brief.totalSales}
                </dt>
                <dd className="tabular mt-1 font-display text-3xl font-extrabold text-ink">
                  {formatNumber(edition.total)}
                </dd>
              </div>
              <div className="rounded-card border border-border bg-surface p-5">
                <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                  {m.brief.regionsCount}
                </dt>
                <dd className="tabular mt-1 font-display text-3xl font-extrabold text-ink">
                  {formatNumber(edition.regions.length)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">{m.brief.tableCaption}</caption>
                <thead className="border-b border-border bg-muted/60">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold text-ink">
                      {m.brief.regionColumn}
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-ink">
                      {m.brief.salesColumn}
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-ink">
                      {m.brief.shareColumn}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {edition.regions.map((region) => (
                    <tr key={region.regionCode} className="border-b border-border/60 last:border-0">
                      <th scope="row" className="px-4 py-2.5 font-medium text-ink">
                        {region.regionName ?? region.regionCode}
                      </th>
                      <td className="tabular px-4 py-2.5 text-right text-ink-soft">
                        {formatNumber(region.sales)}
                      </td>
                      <td className="tabular px-4 py-2.5 text-right text-muted-fg">
                        {edition.total > 0 ? formatPercent(region.sales / edition.total) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-border bg-muted/40">
                  <tr>
                    <th scope="row" className="px-4 py-3 font-semibold text-ink">
                      {m.brief.totalRow}
                    </th>
                    <td className="tabular px-4 py-3 text-right font-semibold text-ink">
                      {formatNumber(edition.total)}
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>

            <Provenance items={edition.provenance} className="mt-4" />
            <p className="mt-2 text-xs leading-relaxed text-muted-fg">{m.brief.editionNote}</p>

            {edition.archive.length > 0 ? (
              <section aria-labelledby="archive-title" className="mt-10">
                <h2 id="archive-title" className="font-display text-xl font-bold text-ink">
                  {m.brief.archiveTitle}
                </h2>
                <p className="mt-2 text-sm text-ink-soft">{m.brief.archiveIntro}</p>
                <ul className="mt-4 divide-y divide-border rounded-card border border-border bg-surface">
                  {edition.archive.map((entry) => (
                    <li
                      key={entry.period}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-ink">
                        {formatPeriod(entry.period, locale)}
                      </span>
                      <span className="tabular text-ink-soft">
                        {m.brief.archiveSales} : {formatNumber(entry.sales)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <p className="mt-8 text-sm text-muted-fg">{m.brief.noArchive}</p>
            )}
          </section>
        ) : (
          <section
            aria-labelledby="upcoming-title"
            className="rounded-card border border-dashed border-border-strong bg-surface/70 px-6 py-10 text-center"
          >
            <Badge tone="warning">{m.brief.upcomingTitle}</Badge>
            <h2 id="upcoming-title" className="mt-4 font-display text-2xl font-extrabold text-ink">
              {m.brief.upcomingTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
              {m.brief.upcomingBody}
            </p>
            <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-muted-fg">
              {m.brief.upcomingHint}
            </p>
            <Link
              href={localePath("/donnees", locale)}
              className="mt-6 inline-flex font-semibold text-primary underline underline-offset-2 hover:text-primary-strong"
            >
              {m.donnees.title} →
            </Link>
          </section>
        )}

        <section
          aria-labelledby="method-title"
          className="mt-12 rounded-card border border-border bg-surface p-6"
        >
          <h2 id="method-title" className="font-display text-xl font-bold text-ink">
            {m.brief.coverageTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{m.brief.coverageBody}</p>
          <Link
            href={localePath("/conseils/evaluation-municipale-vs-valeur-marche", locale)}
            className="mt-3 inline-flex text-sm font-semibold text-primary hover:text-primary-strong"
          >
            {m.brief.methodologyCta} →
          </Link>
        </section>

        <section
          aria-labelledby="newsletter-title"
          className="mt-10 rounded-card border border-border bg-primary-soft/50 p-6"
        >
          <h2 id="newsletter-title" className="font-display text-xl font-bold text-ink">
            {m.brief.newsletterTitle}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">{m.brief.newsletterBody}</p>
          <div className="mt-4 max-w-md">
            <NewsletterForm source="le-brief" labels={t.newsletter} />
          </div>
        </section>
      </div>
    </>
  );
}
