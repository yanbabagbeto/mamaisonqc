import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SaveListingButton } from "@/components/buyer/save-listing-button";
import { InterestForm } from "@/components/premarket/interest-form";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/content";
import { getPublicListing } from "@/modules/premarket";
import { getCurrentUser } from "@/lib/auth";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { messagesFor } from "@/modules/buyer/messages";
import { listSavedListingIds } from "@/modules/buyer/queries";
import { formatArea, formatCad, formatDateFr } from "@/shared/format";

export const dynamic = "force-dynamic";

const HORIZON_LABEL: Record<string, string> = {
  "0-3": "D'ici 3 mois",
  "3-6": "Dans 3 à 6 mois",
  "6-12": "Dans 6 à 12 mois",
  "12+": "Dans plus d'un an",
};

const TYPE_LABEL: Record<string, string> = {
  unifamiliale: "Unifamiliale",
  copropriete: "Copropriété",
  plex: "Plex",
  terrain: "Terrain",
  "non-residentiel": "Non résidentiel",
  autre: "Autre",
};

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getPublicListing(id);
  if (!listing) {
    return { title: "Propriété introuvable" };
  }
  return {
    title: `Pré-marché — ${listing.street}, ${listing.city}`,
    description: `${TYPE_LABEL[listing.propertyType] ?? listing.propertyType} en pré-marché à ${listing.city}. Prix demandé ${formatCad(
      listing.askingPriceCents,
    )}. Adresse exacte masquée.`,
    robots: { index: false, follow: true },
  };
}

export default async function PreMarketDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await getPublicListing(id);
  if (!listing) notFound();

  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const savedIds = user ? await listSavedListingIds(user.id) : [];
  const loginHref = `${localePath("/connexion", locale)}?next=${encodeURIComponent(
    localePath(`/pre-marche/${listing.id}`, locale),
  )}`;

  return (
    <div className="container-page py-12 md:py-16">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted-fg">
        <Link href="/pre-marche" className="underline-offset-2 hover:text-primary hover:underline">
          Pré-marché
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">
          {listing.street}, {listing.city}
        </span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent">Pré-marché</Badge>
            <Badge>{HORIZON_LABEL[listing.horizon] ?? listing.horizon}</Badge>
            <Badge tone="neutral">{TYPE_LABEL[listing.propertyType] ?? listing.propertyType}</Badge>
          </div>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
              {listing.street}, {listing.city}
            </h1>
            <SaveListingButton
              listingId={listing.id}
              listingLabel={listing.street}
              isAuthenticated={Boolean(user)}
              loginHref={loginHref}
              labels={messagesFor(locale).saved}
              initialSaved={savedIds.includes(listing.id)}
            />
          </div>
          <p className="mt-2 text-sm text-muted-fg">
            Publié le {formatDateFr(listing.createdAt)} · Adresse exacte masquée à la demande du
            propriétaire.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-6 rounded-card border border-border bg-surface p-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                Prix demandé
              </dt>
              <dd className="tabular mt-1 font-display text-2xl font-extrabold text-ink">
                {formatCad(listing.askingPriceCents)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">Terrain</dt>
              <dd className="tabular mt-1 font-display text-2xl font-extrabold text-ink">
                {formatArea(listing.landAreaM2)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                Intérêts exprimés
              </dt>
              <dd className="tabular mt-1 font-display text-2xl font-extrabold text-primary">
                {listing.interestCount}
              </dd>
            </div>
          </dl>

          <section className="mt-8">
            <h2 className="font-display text-xl font-bold text-ink">La propriété</h2>
            <p className="mt-3 whitespace-pre-line text-ink-soft">{listing.description}</p>
          </section>

          <p className="mt-8 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-ink-soft">
            Le prix affiché est celui demandé par le propriétaire, pas une évaluation MaMaisonQC. Pour
            situer cette propriété dans son marché, consultez la fiche d&apos;évaluation de la rue ou la
            page de la municipalité.
          </p>
        </div>

        <aside>
          <Card>
            <CardBody>
              <h2 className="font-display text-xl font-bold text-ink">Je suis intéressé</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Votre nom et votre courriel sont transmis au propriétaire uniquement. Aucune création de
                compte.
              </p>
              <div className="mt-5">
                <InterestForm listingId={listing.id} />
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
