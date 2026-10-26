import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/content";
import { intlLocale, localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { messagesFor } from "@/modules/content/messages";
import { listDatasets } from "@/modules/content/datasets";
import {
  CC_BY_URL,
  KNOWN_DATASETS,
  SITE_LIMITATIONS,
  describeDataset,
} from "../../../content/data-sources";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.donnees.title,
    description: m.donnees.description,
    alternates: {
      canonical: localePath("/donnees", locale),
      languages: { "fr-CA": "/donnees", "en-CA": "/en/donnees" },
    },
  };
}

function formatDay(iso: string | null, locale: "fr" | "en"): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}


export default async function DonneesPage() {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const rows = await listDatasets();
  const hasRows = rows !== null && rows.length > 0;

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="container-page max-w-3xl py-12 md:py-16">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-accent uppercase">
            <span aria-hidden="true" className="inline-block h-0.5 w-6 bg-accent" />
            {m.donnees.eyebrow}
          </p>
          <h1 className="font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
            {m.donnees.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{m.donnees.description}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-fg">{m.donnees.intro}</p>
        </div>
      </header>

      <div className="container-page max-w-4xl py-10 md:py-14">
        <section aria-labelledby="catalogue-title">
          <h2 id="catalogue-title" className="font-display text-2xl font-bold text-ink">
            {m.donnees.catalogueTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{m.donnees.catalogueIntro}</p>

          {hasRows ? (
            <ul className="mt-6 space-y-4">
              {rows.map((row) => {
                const editorial = describeDataset(row.id);
                return (
                  <li
                    key={row.id}
                    className="rounded-card border border-border bg-surface p-6"
                    data-provenance={row.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="font-display text-lg font-bold text-ink">{row.name}</h3>
                      <Badge tone="primary">{row.license}</Badge>
                    </div>
                    <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                          {m.donnees.labels.publisher}
                        </dt>
                        <dd className="mt-0.5 text-ink-soft">{row.publisher}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                          {m.donnees.labels.licence}
                        </dt>
                        <dd className="mt-0.5">
                          <a
                            href={row.licenseUrl ?? CC_BY_URL}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-primary underline decoration-dotted underline-offset-2"
                          >
                            {row.license}
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                          {m.donnees.labels.source}
                        </dt>
                        <dd className="mt-0.5 break-words">
                          <a
                            href={row.sourceUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-primary underline decoration-dotted underline-offset-2"
                          >
                            {row.sourceUrl}
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                          {m.donnees.labels.fetched}
                        </dt>
                        <dd className="mt-0.5 text-ink-soft">{formatDay(row.fetchedAt, locale)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                          {m.donnees.labels.reference}
                        </dt>
                        <dd className="mt-0.5 text-ink-soft">
                          {row.referenceDate ? formatDay(row.referenceDate, locale) : m.donnees.notSpecified}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                          {m.donnees.labels.rows}
                        </dt>
                        <dd className="tabular mt-0.5 text-ink-soft">
                          {row.rowCount > 0
                            ? m.donnees.rowCount(row.rowCount)
                            : m.donnees.notIngested}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                          {m.donnees.labels.feeds}
                        </p>
                        <p className="mt-0.5 leading-relaxed text-ink-soft">{editorial.feeds}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                          {m.donnees.labels.limitations}
                        </p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 leading-relaxed text-ink-soft">
                          {editorial.limitations.map((limitation) => (
                            <li key={limitation}>{limitation}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-xs text-muted-fg">
                        {m.donnees.labels.identifier} : <code className="tabular">{row.id}</code>
                        {row.checksum ? (
                          <>
                            {" "}
                            · <code className="break-all">{row.checksum.slice(0, 24)}…</code>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="rounded-card border border-dashed border-border-strong bg-surface/70 p-6">
                <Badge tone="warning">{m.donnees.emptyTitle}</Badge>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">{m.donnees.emptyTitle}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{m.donnees.emptyBody}</p>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  {m.donnees.officialPortalsTitle}
                </h3>
                <ul className="mt-3 space-y-3">
                  {KNOWN_DATASETS.map((known) => (
                    <li key={known.id} className="rounded-card border border-border bg-surface p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h4 className="font-display text-base font-bold text-ink">{known.name}</h4>
                        <Badge tone="neutral">{known.license}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-ink-soft">{known.publisher}</p>
                      <p className="mt-2 text-xs text-muted-fg">
                        <a
                          href={known.sourceUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="break-words text-primary underline decoration-dotted underline-offset-2"
                        >
                          {known.sourceUrl}
                        </a>
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{known.feeds}</p>
                      <p className="mt-2 text-xs font-semibold tracking-wide text-muted-fg uppercase">
                        {m.donnees.labels.rows} : {m.donnees.notIngested}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="limits-title" className="mt-12">
          <h2 id="limits-title" className="font-display text-2xl font-bold text-ink">
            {m.donnees.siteLimitationsTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {m.donnees.siteLimitationsIntro}
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
            {SITE_LIMITATIONS.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="method-title" className="mt-12 rounded-card border border-border bg-surface p-6">
          <h2 id="method-title" className="font-display text-2xl font-bold text-ink">
            {m.donnees.methodTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{m.donnees.methodIntro}</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
            {m.donnees.methodSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-muted-fg">{m.donnees.methodNote}</p>
          <Link
            href={localePath("/evaluation", locale)}
            className="mt-4 inline-flex text-sm font-semibold text-primary hover:text-primary-strong"
          >
            {m.donnees.methodCta} →
          </Link>
        </section>

        <section aria-labelledby="attribution-title" className="mt-10">
          <h2 id="attribution-title" className="font-display text-xl font-bold text-ink">
            {m.donnees.attributionTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{m.donnees.attributionBody}</p>
          <p className="mt-3 text-sm">
            <a
              href={CC_BY_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-primary underline decoration-dotted underline-offset-2"
            >
              {m.donnees.licenceLinkLabel}
            </a>
          </p>
        </section>
      </div>
    </>
  );
}
