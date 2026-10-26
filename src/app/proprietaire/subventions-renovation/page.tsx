import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Alert, Badge } from "@/components/ui/content";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { messagesFor } from "@/modules/owner/messages";
import { formatDate } from "@/shared/format";

import { listSubsidyPages, type SubsidyPage, type SubsidyStatus } from "./subsidy-content";

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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.meta.subsidiesIndex.title,
    description: m.meta.subsidiesIndex.description,
    alternates: {
      canonical: localePath("/proprietaire/subventions-renovation", locale),
      languages: {
        "fr-CA": "/proprietaire/subventions-renovation",
        "en-CA": "/en/proprietaire/subventions-renovation",
      },
    },
  };
}

export default async function SubventionsIndexPage() {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const labels = m.subsidies;
  const path = (href: string) => localePath(href, locale);
  const pages: SubsidyPage[] = listSubsidyPages(locale);

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
            {m.common.subsidies}
          </li>
        </ol>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">{labels.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
          {labels.indexTitle}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{labels.indexIntro}</p>
      </header>

      <div className="mt-8">
        <Alert tone="warning" title={labels.disclaimerTitle}>
          {labels.disclaimerBody}
        </Alert>
      </div>

      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {pages.map((page) => {
          const verified = page.sources[0]?.verifiedOn;
          return (
            <li key={page.slug}>
              <Link
                href={path(`/proprietaire/subventions-renovation/${page.slug}`)}
                className="flex h-full flex-col rounded-card border border-border bg-surface p-5 transition-colors hover:border-primary/40 hover:bg-primary-soft/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-bold text-ink">{page.navLabel}</h2>
                  <Badge tone={statusTone(page.status)}>{statusLabel(page.status, labels)}</Badge>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{page.summary[0]}</p>
                <p className="mt-4 text-xs text-muted-fg">
                  {page.publisher}
                  {verified ? ` · ${labels.verifiedOn} ${formatDate(verified, locale)}` : null}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 rounded-card border border-border bg-surface p-6">
        <h2 className="font-display text-xl font-bold text-ink">{labels.ctaTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{labels.ctaBody}</p>
        <div className="mt-4">
          <ButtonLink href={path("/proprietaire/equite")}>{labels.ctaButton}</ButtonLink>
        </div>
      </div>
    </div>
  );
}
