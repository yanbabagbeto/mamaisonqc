import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, EmptyState, Stat } from "@/components/ui/content";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { messagesFor } from "@/modules/owner/messages";
import { listOwnInterests } from "@/modules/owner/queries";
import { formatCad, formatDate } from "@/shared/format";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.meta.interests.title,
    description: m.meta.interests.description,
    alternates: {
      canonical: localePath("/proprietaire/tableau-de-bord/interets", locale),
      languages: {
        "fr-CA": "/proprietaire/tableau-de-bord/interets",
        "en-CA": "/en/proprietaire/tableau-de-bord/interets",
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function InterestsPage() {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const labels = m.interests;
  const path = (href: string) => localePath(href, locale);

  const user = await getCurrentUser();
  if (!user) {
    const target = localePath("/proprietaire/tableau-de-bord/interets", locale);
    redirect(`${path("/connexion")}?next=${encodeURIComponent(target)}`);
  }

  /*
   * Ownership comes exclusively from the session user id. There is no searchParams and no route
   * parameter in this page: AC-6 is enforced by the query in `listOwnInterests`, which joins
   * `premarket_listing` on `user_id = userId`.
   */
  const interests = await listOwnInterests(user.id);
  const listingCount = new Set(interests.map((interest) => interest.listingId)).size;

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
            <Link href={path("/proprietaire/tableau-de-bord")} className="hover:text-primary">
              {m.common.dashboard}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-ink">
            {m.common.interests}
          </li>
        </ol>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">{labels.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ink md:text-4xl">
          {labels.title}
        </h1>
        <p className="mt-3 text-ink-soft">{labels.intro}</p>
      </header>

      <div className="mt-8 flex flex-wrap gap-4">
        <Card className="min-w-40 flex-1">
          <CardBody>
            <dl>
              <Stat label={labels.totalLabel} value={interests.length} tone="accent" />
            </dl>
          </CardBody>
        </Card>
        <Card className="min-w-40 flex-1">
          <CardBody>
            <dl>
              <Stat label={labels.listingsLabel} value={listingCount} />
            </dl>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8">
        {interests.length === 0 ? (
          <EmptyState
            title={labels.emptyTitle}
            description={labels.emptyBody}
            action={
              <ButtonLink href={path("/proprietaire/tableau-de-bord")} size="sm">
                {labels.emptyCta}
              </ButtonLink>
            }
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {interests.map((interest) => (
              <li key={interest.id}>
                <Card>
                  <CardBody className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-ink">{interest.name}</p>
                      <Badge
                        tone={
                          interest.status === "nouveau"
                            ? "primary"
                            : interest.status === "contacte"
                              ? "success"
                              : "neutral"
                        }
                      >
                        {interest.status === "nouveau"
                          ? labels.statusNew
                          : interest.status === "contacte"
                            ? labels.statusContacted
                            : labels.statusClosed}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-fg">
                      {labels.receivedOn} {formatDate(interest.createdAt, locale)}
                    </p>

                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-muted-fg">{labels.listingLabel}</dt>
                        <dd className="text-ink-soft">
                          {interest.address ?? m.dashboard.unknownAddress}
                          {interest.city ? `, ${interest.city}` : ""} ·{" "}
                          {formatCad(interest.askingPriceCents, locale)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-fg">{labels.emailLabel}</dt>
                        <dd>
                          <a
                            href={`mailto:${interest.email}`}
                            className="font-medium text-primary underline underline-offset-2"
                          >
                            {interest.email}
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-fg">{labels.messageLabel}</dt>
                        <dd className="whitespace-pre-line text-ink-soft">
                          {interest.message?.trim() ? interest.message : labels.noMessage}
                        </dd>
                      </div>
                    </dl>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-xs leading-relaxed text-muted-fg">{labels.contactNote}</p>
        <ButtonLink href={path("/proprietaire/tableau-de-bord")} variant="secondary" size="sm">
          ← {labels.backToDashboard}
        </ButtonLink>
      </div>
    </div>
  );
}
