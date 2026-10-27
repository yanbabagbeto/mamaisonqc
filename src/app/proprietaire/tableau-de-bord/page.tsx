import type { Metadata } from "next";
import Link from "next/link";
import { StripQueryParam } from "@/components/layout/strip-query-param";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/deconnexion/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Alert, Badge, EmptyState, Stat } from "@/components/ui/content";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { fill, messagesFor } from "@/modules/owner/messages";
import {
  listOwnClaims,
  listOwnListings,
  type OwnerClaimRow,
  type OwnerListingRow,
} from "@/modules/owner/queries";
import { formatCad, formatDate } from "@/shared/format";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.meta.dashboard.title,
    description: m.meta.dashboard.description,
    alternates: {
      canonical: localePath("/proprietaire/tableau-de-bord", locale),
      languages: {
        "fr-CA": "/proprietaire/tableau-de-bord",
        "en-CA": "/en/proprietaire/tableau-de-bord",
      },
    },
    robots: { index: false, follow: false },
  };
}

function claimStatusLabel(claim: OwnerClaimRow, labels: ReturnType<typeof messagesFor>["dashboard"]) {
  return claim.status === "approved"
    ? labels.statusApproved
    : claim.status === "rejected"
      ? labels.statusRejected
      : labels.statusPending;
}

function claimTone(claim: OwnerClaimRow): "success" | "warning" | "danger" {
  if (claim.status === "approved") return "success";
  if (claim.status === "rejected") return "danger";
  return "warning";
}

function listingStatusLabel(
  listing: OwnerListingRow,
  labels: ReturnType<typeof messagesFor>["dashboard"],
) {
  if (listing.status === "pause") return labels.listingStatusPaused;
  if (listing.status === "retire") return labels.listingStatusRetired;
  return labels.listingStatusActive;
}

function listingVisibilityLabel(
  listing: OwnerListingRow,
  labels: ReturnType<typeof messagesFor>["dashboard"],
) {
  return listing.visibility === "prive" ? labels.visibilityPrivate : labels.visibilityVerified;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenue?: string | string[]; reclamation?: string | string[] }>;
}) {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const labels = m.dashboard;
  const path = (href: string) => localePath(href, locale);

  const user = await getCurrentUser();
  if (!user) {
    const target = localePath("/proprietaire/tableau-de-bord", locale);
    redirect(`${path("/connexion")}?next=${encodeURIComponent(target)}`);
  }

  const [claims, listings] = await Promise.all([
    listOwnClaims(user.id),
    listOwnListings(user.id),
  ]);

  const params = await searchParams;
  const justSignedUp = params.bienvenue === "1";
  const claimOutcome = typeof params.reclamation === "string" ? params.reclamation : null;

  const approved = claims.filter((claim) => claim.status === "approved");
  const pending = claims.filter((claim) => claim.status === "pending");
  const rejected = claims.filter((claim) => claim.status === "rejected");
  const totalInterests = listings.reduce((sum, listing) => sum + listing.interestCount, 0);

  return (
    <>
      <StripQueryParam param="bienvenue" />
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
            {labels.title}
          </li>
        </ol>
      </nav>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">{labels.eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ink md:text-4xl">
            {labels.title}
          </h1>
          <p className="mt-2 text-ink-soft">{fill(labels.greeting, { name: user.name })}</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="secondary" size="sm">
            {m.common.logout}
          </Button>
        </form>
      </header>

      <div className="mt-6 space-y-4">
        {justSignedUp ? (
          <Alert tone="success" title={labels.welcomeTitle}>
            {labels.welcomeBody}
          </Alert>
        ) : null}
        {claimOutcome === "demandee" ? (
          <Alert tone="success" title={labels.claimRequestedTitle}>
            {labels.claimRequestedBody}
          </Alert>
        ) : null}
        {claimOutcome === "introuvable" ? (
          <Alert tone="warning" title={labels.claimNotFoundTitle}>
            {labels.claimNotFoundBody}
          </Alert>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <dl>
              <Stat label={labels.claimsTitle} value={claims.length} />
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <dl>
              <Stat label={labels.listingsTitle} value={listings.length} />
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <dl>
              <Stat label={m.common.interests} value={totalInterests} tone="accent" />
            </dl>
          </CardBody>
        </Card>
      </div>

      <section className="mt-10" aria-labelledby="reclamations">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="reclamations" className="font-display text-2xl font-bold text-ink">
              {labels.claimsTitle}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-ink-soft">{labels.claimsIntro}</p>
          </div>
        </div>

        {claims.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title={labels.noClaimsTitle}
              description={labels.noClaimsBody}
              action={
                <ButtonLink href={path("/recherche")} size="sm">
                  {labels.findProperty}
                </ButtonLink>
              }
            />
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {[
              { key: "approved", title: labels.approvedTitle, rows: approved },
              { key: "pending", title: labels.pendingTitle, rows: pending },
              { key: "rejected", title: labels.rejectedTitle, rows: rejected },
            ]
              .filter((group) => group.rows.length > 0)
              .map((group) => (
                <div key={group.key}>
                  <h3 className="font-display text-lg font-bold text-ink">{group.title}</h3>
                  <ul className="mt-2 grid gap-3 md:grid-cols-2">
                    {group.rows.map((claim) => (
                      <li key={claim.id}>
                        <Card>
                          <CardBody className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-semibold text-ink">
                                {claim.address ?? labels.unknownAddress}
                                {claim.city ? `, ${claim.city}` : ""}
                              </p>
                              <Badge tone={claimTone(claim)}>{claimStatusLabel(claim, labels)}</Badge>
                            </div>
                            <p className="text-xs text-muted-fg">
                              {labels.requestedOn} {formatDate(claim.createdAt, locale)}
                              {claim.decidedAt
                                ? ` · ${labels.decidedOn} ${formatDate(claim.decidedAt, locale)}`
                                : ""}
                            </p>
                            {claim.status === "approved" ? (
                              <Link
                                href={path(`/evaluation/${encodeURIComponent(claim.matricule)}`)}
                                className="inline-flex text-sm font-semibold text-primary underline-offset-2 hover:underline"
                              >
                                {labels.viewSheet} →
                              </Link>
                            ) : null}
                          </CardBody>
                        </Card>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </section>

      <section className="mt-10" aria-labelledby="pre-marches">
        <h2 id="pre-marches" className="font-display text-2xl font-bold text-ink">
          {labels.listingsTitle}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">{labels.listingsIntro}</p>

        {listings.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title={labels.noListingsTitle}
              description={labels.noListingsBody}
              action={
                <ButtonLink href={path("/pre-marche")} size="sm">
                  {labels.viewMarket}
                </ButtonLink>
              }
            />
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {listings.map((listing) => (
              <li key={listing.id}>
                <Card>
                  <CardBody className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-ink">
                        {listing.address ?? labels.unknownAddress}
                        {listing.city ? `, ${listing.city}` : ""}
                      </p>
                      <Badge tone={listing.status === "actif" ? "success" : "neutral"}>
                        {listingStatusLabel(listing, labels)}
                      </Badge>
                    </div>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-muted-fg">{labels.listingAsking}</dt>
                        <dd className="tabular font-semibold text-ink">
                          {formatCad(listing.askingPriceCents, locale)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-fg">{labels.listingHorizon}</dt>
                        <dd className="text-ink-soft">{listing.horizon}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-fg">{labels.listingVisibility}</dt>
                        <dd className="text-ink-soft">{listingVisibilityLabel(listing, labels)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-fg">{labels.listingCreated}</dt>
                        <dd className="text-ink-soft">{formatDate(listing.createdAt, locale)}</dd>
                      </div>
                    </dl>
                    <Link
                      href={path("/proprietaire/tableau-de-bord/interets")}
                      className="inline-flex text-sm font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      {fill(
                        listing.interestCount === 1
                          ? labels.interestsCount
                          : labels.interestsCountPlural,
                        { count: listing.interestCount },
                      )}{" "}
                      · {labels.viewInterests} →
                    </Link>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="font-display text-lg font-bold text-ink">{labels.securityTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{labels.securityBody}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="font-display text-lg font-bold text-ink">{labels.signOutTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{labels.signOutBody}</p>
            <form action={signOutAction} className="mt-4">
              <Button type="submit" variant="secondary" size="sm">
                {m.common.logout}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
    </>
  );
}
