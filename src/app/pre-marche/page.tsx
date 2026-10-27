import type { Metadata } from "next";

import { SaveListingButton } from "@/components/buyer/save-listing-button";
import { EmptyStateIllustration, PropertyTypeThumb } from "@/components/illustrations";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/content";
import { formatCad } from "@/shared/format";
import { getCurrentUser } from "@/lib/auth";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { messagesFor } from "@/modules/buyer/messages";
import { listSavedListingIds } from "@/modules/buyer/queries";
import { listPublicListings } from "@/modules/premarket";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  return {
    title: isEn ? "Pre-market — properties before they are listed" : "Pré-marché — des propriétés avant leur mise en marché",
    description: isEn
      ? "Discover Quebec properties being prepared for sale, with the address masked and the owner's asking price. Express your interest directly."
      : "Découvrez des propriétés québécoises en préparation de vente, avec l'adresse masquée et le prix demandé par le propriétaire. Exprimez votre intérêt directement.",
    alternates: {
      canonical: localePath("/pre-marche", locale),
      languages: { "fr-CA": "/pre-marche", "en-CA": "/en/pre-marche" },
    },
  };
}

const COPY = {
  fr: {
    horizon: { "0-3": "D'ici 3 mois", "3-6": "Dans 3 à 6 mois", "6-12": "Dans 6 à 12 mois", "12+": "Dans plus d'un an" },
    eyebrow: "Pré-marché",
    title: "Des propriétés avant qu'elles soient à vendre",
    intro:
      "Un propriétaire qui prépare sa vente publie ici une fiche volontairement masquée : le nom de la rue et la ville, jamais le numéro civique. Vous exprimez un intérêt, il vous répond.",
    emptyTitle: "Aucune propriété en pré-marché pour l'instant",
    emptyBody:
      "Le pré-marché se remplit au fur et à mesure que des propriétaires publient leur projet de vente. Si vous possédez une propriété couverte, vous pouvez publier la vôtre gratuitement.",
    publish: "Publier ma propriété",
    understand: "Comprendre le pré-marché",
    asking: "Prix demandé",
    interests: "Intérêts",
    see: "Voir la fiche et exprimer un intérêt",
    ctaTitle: "Vous vendez bientôt?",
    ctaBody:
      "Publier une fiche de pré-marché ne vous engage à rien et ne rend pas votre adresse publique. Vous décidez à qui vous répondez.",
    ctaButton: "Publier en pré-marché",
  },
  en: {
    horizon: { "0-3": "Within 3 months", "3-6": "In 3 to 6 months", "6-12": "In 6 to 12 months", "12+": "In over a year" },
    eyebrow: "Pre-market",
    title: "Properties before they are listed",
    intro:
      "An owner preparing a sale publishes a deliberately masked listing here: the street name and city, never the civic number. You express interest, the owner answers.",
    emptyTitle: "No pre-market property yet",
    emptyBody:
      "The pre-market fills up as owners publish their selling plans. If you own a covered property, you can publish yours for free.",
    publish: "Publish my property",
    understand: "Understand the pre-market",
    asking: "Asking price",
    interests: "Interests",
    see: "Open the listing and express interest",
    ctaTitle: "Selling soon?",
    ctaBody:
      "Publishing a pre-market listing commits you to nothing and does not make your address public. You decide who gets an answer.",
    ctaButton: "Publish on the pre-market",
  },
} as const;


export default async function PreMarketPage() {
  const [listings, user, locale] = await Promise.all([
    listPublicListings(),
    getCurrentUser(),
    getLocale(),
  ]);
  const t = COPY[locale];
  const savedIds = user ? await listSavedListingIds(user.id) : [];
  const savedLabels = messagesFor(locale).saved;
  const loginHref = `${localePath("/connexion", locale)}?next=${encodeURIComponent(
    localePath("/pre-marche", locale),
  )}`;
  return (
    <div className="container-page py-12 md:py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">{t.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight font-extrabold text-ink">{t.title}</h1>
        <p className="mt-4 text-lg text-ink-soft">{t.intro}</p>
      </header>

      {listings.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<EmptyStateIllustration kind="no-listings" className="h-32 w-auto" />}
            title={t.emptyTitle}
            description={t.emptyBody}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <ButtonLink href={localePath("/pre-marche/publier", locale)}>{t.publish}</ButtonLink>
                <ButtonLink href={localePath("/tester-le-marche", locale)} variant="secondary">
                  {t.understand}
                </ButtonLink>
              </div>
            }
          />
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <li key={listing.id}>
              <Card className="flex h-full flex-col">
                <CardBody className="flex h-full flex-col">
                  <div className="mb-4 overflow-hidden rounded-xl">
                    <PropertyTypeThumb
                      type={thumbnailType(listing.propertyType)}
                      className="h-auto w-full"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold text-ink">{listing.street}</p>
                      <p className="text-sm text-muted-fg">{listing.city}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge tone="primary">{t.horizon[listing.horizon as keyof typeof t.horizon] ?? listing.horizon}</Badge>
                      <SaveListingButton
                        listingId={listing.id}
                        listingLabel={listing.street}
                        isAuthenticated={Boolean(user)}
                        loginHref={loginHref}
                        labels={savedLabels}
                        initialSaved={savedIds.includes(listing.id)}
                        compact
                      />
                    </div>
                  </div>
                  <dl className="mt-4 flex items-end gap-6">
                    <div>
                      <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                        Prix demandé
                      </dt>
                      <dd className="tabular font-display text-lg font-semibold tracking-tight text-ink">
                        {formatCad(listing.askingPriceCents)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                        Intérêts
                      </dt>
                      <dd className="tabular font-display text-lg font-semibold tracking-tight text-primary">
                        {listing.interestCount}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 line-clamp-3 text-sm text-ink-soft">{listing.description}</p>
                  <div className="mt-auto pt-5">
                    <ButtonLink href={`/pre-marche/${listing.id}`} variant="secondary" size="sm">
                      {t.see}
                    </ButtonLink>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-14 rounded-card border border-border bg-surface p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">{t.ctaTitle}</h2>
            <p className="mt-2 text-ink-soft">{t.ctaBody}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <ButtonLink href={localePath("/pre-marche/publier", locale)}>{t.ctaButton}</ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Only the five illustrated types get a thumbnail; anything else falls back to the generic home. */
function thumbnailType(propertyType: string): "unifamiliale" | "plex" | "copropriete" | "terrain" | "commercial" {
  switch (propertyType) {
    case "plex":
      return "plex";
    case "copropriete":
    case "copropriété":
      return "copropriete";
    case "terrain":
      return "terrain";
    case "non-residentiel":
      return "commercial";
    default:
      return "unifamiliale";
  }
}
