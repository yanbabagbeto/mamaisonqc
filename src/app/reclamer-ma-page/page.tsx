import type { Metadata } from "next";
import Link from "next/link";

import { ClaimForm } from "@/components/claims/claim-form";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/content";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { claimsMessagesFor, fillClaim, claimStatusLabel } from "@/modules/claims/messages";
import { listClaimsFor } from "@/modules/claims";
import { formatDateFr } from "@/shared/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = claimsMessagesFor(locale);
  return {
    title: m.meta.title,
    description: m.meta.description,
    alternates: {
      canonical: localePath("/reclamer-ma-page", locale),
      languages: { "fr-CA": "/reclamer-ma-page", "en-CA": "/en/reclamer-ma-page" },
    },
  };
}

type Props = { searchParams: Promise<{ matricule?: string }> };

export default async function ClaimPage({ searchParams }: Props) {
  const [locale, params] = await Promise.all([getLocale(), searchParams]);
  const m = claimsMessagesFor(locale);
  const path = (href: string) => localePath(href, locale);
  const { matricule } = params;
  const current = await getCurrentUser();
  const claims = current ? await listClaimsFor(current.id) : [];

  return (
    <div className="container-page max-w-3xl py-12 md:py-16">
      <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">{m.page.eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
        {m.page.title}
      </h1>
      <p className="mt-3 text-ink-soft">{m.page.intro}</p>

      <section className="mt-6 rounded-card border border-border bg-surface p-5">
        <h2 className="font-display text-lg font-bold text-ink">{m.page.stepsTitle}</h2>
        <ol className="mt-3 space-y-2 text-sm text-ink-soft">
          {m.page.steps.map((step, index) => (
            <li key={step} className="flex gap-2">
              <span className="font-display font-bold text-primary">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <Link href={path("/recherche")} className="mt-4 inline-flex text-sm font-semibold text-primary">
          {m.page.searchCta} →
        </Link>
      </section>

      <div className="mt-8 space-y-6">
        {!current ? (
          <Card>
            <CardBody className="space-y-4">
              <h2 className="font-display text-xl font-bold text-ink">{m.page.createTitle}</h2>
              <p className="text-ink-soft">{m.page.createBody}</p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink
                  href={
                    matricule
                      ? `/inscription?claim=${encodeURIComponent(matricule)}`
                      : "/inscription"
                  }
                >
                  {m.page.createCta}
                </ButtonLink>
                <ButtonLink
                  href={matricule ? `/connexion?next=/reclamer-ma-page` : "/connexion"}
                  variant="secondary"
                >
                  {m.page.loginCta}
                </ButtonLink>
              </div>
            </CardBody>
          </Card>
        ) : (
          <>
            <Card>
              <CardBody>
                <h2 className="font-display text-xl font-bold text-ink">{m.page.newRequestTitle}</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  {fillClaim(m.page.signedInAs, { name: current.name, email: current.email })}
                </p>
                <div className="mt-5">
                  <ClaimForm
                    defaultMatricule={matricule}
                    labels={{ ...m.page.form, status: m.page.status }}
                  />
                </div>
              </CardBody>
            </Card>

            <section aria-labelledby="mes-demandes">
              <h2 id="mes-demandes" className="font-display text-xl font-bold text-ink">
                {m.page.myRequestsTitle}
              </h2>
              {claims.length === 0 ? (
                <p className="mt-3 text-sm text-ink-soft">
                  {m.page.noRequests}{" "}
                  <Link href={path("/recherche")} className="underline underline-offset-2">
                    {m.page.findProperty}
                  </Link>
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {claims.map((claim) => (
                    <li
                      key={claim.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {claim.address ?? claim.matricule}
                        </p>
                        <p className="text-xs text-muted-fg">
                          {fillClaim(m.page.requestedOn, { date: formatDateFr(claim.createdAt, locale) })}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-ink-soft">
                        {claimStatusLabel(m.page.status, claim.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        <Alert tone="neutral">{m.page.privacy}</Alert>
      </div>
    </div>
  );
}
