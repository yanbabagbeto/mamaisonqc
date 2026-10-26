import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { Alert, Badge } from "@/components/ui/content";
import { Provenance } from "@/components/ui/provenance";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { messagesFor } from "@/modules/owner/messages";
import type { ProvenanceInfo } from "@/shared/provenance";
import { formatDate } from "@/shared/format";

import { getSubsidyPage, type SubsidyStatus } from "../subsidy-content";

type PageParams = { slug: string };

function statusLabel(status: SubsidyStatus, labels: ReturnType<typeof messagesFor>["subsidies"]): string {
  switch (status) {
    case "open":
      return labels.statusOpen;
    case "closed":
      return labels.statusClosed;
    case "variable":
      return labels.statusVariable;
    default:
      return labels.statusUnknown;
  }
}

function statusTone(status: SubsidyStatus): "success" | "neutral" | "warning" {
  if (status === "open") return "success";
  if (status === "closed") return "neutral";
  return "warning";
}

/** The provenance block needs the programme as a source row, not the product's own dataset. */
function sourceProvenance(
  url: string,
  label: string,
  publisher: string,
  license: string,
): ProvenanceInfo {
  return {
    datasetId: `programme-${url}`,
    name: label,
    publisher,
    license,
    sourceUrl: url,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const page = getSubsidyPage(slug, locale);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: {
      canonical: localePath(`/proprietaire/subventions-renovation/${page.slug}`, locale),
      languages: {
        "fr-CA": `/proprietaire/subventions-renovation/${page.slug}`,
        "en-CA": `/en/proprietaire/subventions-renovation/${page.slug}`,
      },
    },
  };
}

export default async function SubventionPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const m = messagesFor(locale);
  const labels = m.subsidies;
  const page = getSubsidyPage(slug, locale);
  if (!page) {
    notFound();
  }
  const path = (href: string) => localePath(href, locale);
  const primarySource = page.sources[0];

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
          <li>
            <Link href={path("/proprietaire/subventions-renovation")} className="hover:text-primary">
              {m.common.subsidies}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-ink">
            {page.navLabel}
          </li>
        </ol>
      </nav>

      <header className="mt-6 max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">{labels.eyebrow}</p>
          <Badge tone={statusTone(page.status)}>{statusLabel(page.status, labels)}</Badge>
        </div>
        <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
          {page.title}
        </h1>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
              {labels.programLabel}
            </dt>
            <dd className="mt-1 text-ink-soft">{page.programName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
              {labels.publisherLabel}
            </dt>
            <dd className="mt-1 text-ink-soft">{page.publisher}</dd>
          </div>
        </dl>
        {primarySource ? (
          <p className="mt-4 text-xs text-muted-fg">
            {labels.verifiedOn} {formatDate(primarySource.verifiedOn, locale)}
            {primarySource.pageUpdated
              ? ` · ${labels.pageUpdated} ${formatDate(primarySource.pageUpdated, locale)}`
              : ""}
          </p>
        ) : null}
      </header>

      <div className="prose-maison mt-6 max-w-3xl">
        {page.summary.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {page.notForIndividuals ? (
        <div className="mt-6 max-w-3xl">
          <Alert tone="info" title={labels.audienceTitle}>
            {labels.notForIndividuals}
          </Alert>
        </div>
      ) : null}

      {page.amounts.length > 0 ? (
        <section className="mt-10" aria-labelledby="montants">
          <h2 id="montants" className="font-display text-xl font-bold text-ink">
            {labels.amountsTitle}
          </h2>
          <div
            className="mt-3 overflow-x-auto rounded-card border border-border bg-surface"
            role="region"
            aria-label={labels.amountsTitle}
            tabIndex={0}
          >
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="sr-only">{labels.amountsTitle}</caption>
              <thead className="bg-muted text-xs font-semibold tracking-wide text-ink-soft uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    {labels.measureColumn}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    {labels.amountColumn}
                  </th>
                </tr>
              </thead>
              <tbody>
                {page.amounts.map((amount, index) => (
                  <tr key={`${amount.measure}-${index}`} className="border-t border-border align-top">
                    <th scope="row" className="px-4 py-3 font-medium text-ink">
                      {amount.measure}
                      {amount.note ? (
                        <span className="mt-1 block text-xs font-normal text-muted-fg">{amount.note}</span>
                      ) : null}
                    </th>
                    <td className="tabular px-4 py-3 font-semibold text-primary">{amount.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {page.amountsNote ? (
            <p className="mt-3 max-w-3xl text-xs leading-relaxed text-muted-fg">{page.amountsNote}</p>
          ) : null}
          <Provenance
            items={page.sources.map((source) =>
              sourceProvenance(source.url, source.label, source.publisher, labels.officialPage),
            )}
            className="mt-3"
            compact
          />
        </section>
      ) : (
        <div className="mt-8 max-w-3xl">
          <Alert tone="warning" title={labels.unverifiedTitle}>
            {page.amountsNote ?? labels.unverifiedBody}
          </Alert>
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="eligibilite">
          <h2 id="eligibilite" className="font-display text-xl font-bold text-ink">
            {labels.eligibilityTitle}
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
            {page.eligibility.map((rule) => (
              <li key={rule} className="flex gap-2">
                <span aria-hidden="true" className="mt-0.5 text-primary">
                  ✓
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="etapes">
          <h2 id="etapes" className="font-display text-xl font-bold text-ink">
            {labels.stepsTitle}
          </h2>
          <ol className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
            {page.steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {page.deadlines.length > 0 ? (
        <section className="mt-10" aria-labelledby="dates">
          <h2 id="dates" className="font-display text-xl font-bold text-ink">
            {labels.deadlinesTitle}
          </h2>
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
            {page.deadlines.map((deadline) => (
              <li key={deadline}>{deadline}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {page.unverified.length > 0 ? (
        <section className="mt-10 max-w-3xl" aria-labelledby="non-verifie">
          <h2 id="non-verifie" className="font-display text-xl font-bold text-ink">
            {labels.unverifiedTitle}
          </h2>
          <Alert tone="warning">{labels.unverifiedBody}</Alert>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
            {page.unverified.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10 rounded-card border border-border bg-surface p-6" aria-labelledby="sources">
        <h2 id="sources" className="font-display text-xl font-bold text-ink">
          {labels.sourcesTitle}
        </h2>
        <ul className="mt-3 space-y-4">
          {page.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm font-semibold text-primary underline underline-offset-2"
              >
                {source.label}
              </a>
              <p className="mt-1 text-xs text-muted-fg">
                {source.publisher} · {labels.verifiedOn} {formatDate(source.verifiedOn, locale)}
                {source.pageUpdated
                  ? ` · ${labels.pageUpdated} ${formatDate(source.pageUpdated, locale)}`
                  : ""}
              </p>
              <p className="mt-1 break-all text-xs text-muted-fg">{source.url}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 rounded-card border border-border bg-surface p-6">
        <h2 className="font-display text-xl font-bold text-ink">{labels.ctaTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{labels.ctaBody}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink href={path("/proprietaire/equite")}>{labels.ctaButton}</ButtonLink>
          <ButtonLink href={path("/proprietaire/subventions-renovation")} variant="secondary">
            {labels.backToIndex}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
