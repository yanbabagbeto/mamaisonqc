import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SaveListingButton } from "@/components/buyer/save-listing-button";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/content";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { countMessage, interpolate } from "@/modules/buyer/format-message";
import { horizonLabel, messagesFor, propertyTypeLabel } from "@/modules/buyer/messages";
import { listBuyerInterests, listSavedListings } from "@/modules/buyer/queries";
import { formatCad, formatDateFr } from "@/shared/format";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = messagesFor(locale);
  return {
    title: messages.meta.interests.title,
    description: messages.meta.interests.description,
    alternates: {
      canonical: localePath("/mes-interets", locale),
      languages: { "fr-CA": "/mes-interets", "en-CA": "/en/mes-interets" },
    },
    robots: { index: false, follow: true },
  };
}

const INTEREST_TONES: Record<string, "neutral" | "info" | "success"> = {
  nouveau: "info",
  contacte: "success",
  clos: "neutral",
};

/**
 * Buyer's own saved listings and interest requests. Both reads take the user id (or the session
 * email for interests) from the validated session, never from a query parameter (PRD AC-6).
 */
export default async function MesInteretsPage() {
  const locale = await getLocale();
  const messages = messagesFor(locale);
  const path = (href: string) => localePath(href, locale);
  const user = await getCurrentUser();

  if (!user) {
    // Same contract as the owner pages: a protected page never renders for an anonymous
    // visitor, it redirects with a safe `next` so the login can come back here.
    redirect(`${path("/mes-interets")}?next=${encodeURIComponent(path("/mes-interets"))}`);
  }

  const [saved, interests] = await Promise.all([
    listSavedListings(user.id),
    listBuyerInterests(user.email),
  ]);

  return (
    <div className="container-page py-10 md:py-14">
      <header className="max-w-3xl">
        <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">
          {messages.interests.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold tracking-tight text-ink md:text-4xl">
          {messages.interests.title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">{messages.interests.intro}</p>
      </header>

      <section className="mt-10" aria-labelledby="saved-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="saved-title" className="font-display text-2xl font-bold text-ink">
            {messages.interests.savedTitle}
          </h2>
          <p className="text-sm text-muted-fg">
            {countMessage(saved.length, {
              one: messages.interests.savedCountOne,
              many: messages.interests.savedCountMany,
            })}
          </p>
        </div>
        <p className="mt-1 text-sm text-ink-soft">{messages.interests.savedIntro}</p>

        <Card className="mt-4">
          <CardBody>
            {saved.length === 0 ? (
              <EmptyState
                title={messages.interests.savedEmptyTitle}
                description={messages.interests.savedEmptyBody}
                action={
                  <ButtonLink href={path("/explorer")}>{messages.interests.savedEmptyCta}</ButtonLink>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[52rem] border-collapse text-sm">
                  <caption className="sr-only">{messages.interests.savedTitle}</caption>
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-semibold tracking-wide text-muted-fg uppercase">
                      <th scope="col" className="py-2 pr-4">
                        {messages.interests.savedColumns.street}
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        {messages.interests.savedColumns.city}
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        {messages.interests.savedColumns.type}
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        {messages.interests.savedColumns.horizon}
                      </th>
                      <th scope="col" className="py-2 pr-4 text-right">
                        {messages.interests.savedColumns.price}
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        {messages.interests.savedColumns.savedOn}
                      </th>
                      <th scope="col" className="py-2">
                        {messages.interests.savedColumns.action}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {saved.map((listing) => (
                      <tr key={listing.savedId} className="border-b border-border/70 last:border-0">
                        <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">
                          <Link
                            href={path(`/pre-marche/${listing.listingId}`)}
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
                        <td className="tabular py-3 pr-4 text-right font-semibold text-ink">
                          {formatCad(listing.askingPriceCents, locale)}
                        </td>
                        <td className="py-3 pr-4 text-ink-soft">
                          {formatDateFr(listing.savedAt, locale)}
                        </td>
                        <td className="py-3">
                          <SaveListingButton
                            listingId={listing.listingId}
                            listingLabel={listing.street || "—"}
                            isAuthenticated
                            loginHref={`${path("/connexion")}?next=${encodeURIComponent(
                              path("/mes-interets"),
                            )}`}
                            labels={messages.saved}
                            initialSaved
                            refreshOnChange
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      <section className="mt-10" aria-labelledby="interests-title">
        <h2 id="interests-title" className="font-display text-2xl font-bold text-ink">
          {messages.interests.interestsTitle}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">{messages.interests.interestsIntro}</p>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{user.email}</CardTitle>
          </CardHeader>
          <CardBody>
            {interests.length === 0 ? (
              <EmptyState
                title={messages.interests.interestsEmptyTitle}
                description={messages.interests.interestsEmptyBody}
                action={
                  <ButtonLink href={path("/pre-marche")} variant="secondary">
                    {messages.interests.interestsEmptyCta}
                  </ButtonLink>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[44rem] border-collapse text-sm">
                  <caption className="sr-only">{messages.interests.interestsTitle}</caption>
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-semibold tracking-wide text-muted-fg uppercase">
                      <th scope="col" className="py-2 pr-4">
                        {messages.interests.interestColumns.listing}
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        {messages.interests.interestColumns.message}
                      </th>
                      <th scope="col" className="py-2 pr-4">
                        {messages.interests.interestColumns.sentOn}
                      </th>
                      <th scope="col" className="py-2">
                        {messages.interests.interestColumns.status}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {interests.map((interest) => {
                      const statusLabel =
                        messages.interests.interestStatus[
                          interest.status as keyof typeof messages.interests.interestStatus
                        ] ?? interest.status;
                      return (
                        <tr key={interest.id} className="border-b border-border/70 last:border-0">
                          <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">
                            <Link
                              href={path(`/pre-marche/${interest.listingId}`)}
                              className="underline decoration-dotted underline-offset-2 hover:text-primary"
                            >
                              {interest.street || "—"}
                              {interest.city ? `, ${interest.city}` : ""}
                            </Link>
                            <span className="mt-0.5 block text-xs font-normal text-muted-fg">
                              {interpolate(messages.interests.reference, {
                                id: interest.id.slice(0, 8),
                              })}
                            </span>
                          </th>
                          <td className="max-w-[22rem] py-3 pr-4 text-ink-soft">
                            {interest.message?.trim() ? interest.message : messages.interests.noMessage}
                          </td>
                          <td className="py-3 pr-4 text-ink-soft">
                            {formatDateFr(interest.createdAt, locale)}
                          </td>
                          <td className="py-3">
                            <Badge tone={INTEREST_TONES[interest.status] ?? "neutral"}>
                              {statusLabel}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
