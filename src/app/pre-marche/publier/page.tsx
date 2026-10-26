import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PublishForm } from "@/components/premarket/publish-form";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/content";
import { getCurrentUser } from "@/lib/auth";
import { listClaimsFor } from "@/modules/claims";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Publier une propriété en pré-marché",
  description: "Publiez gratuitement votre projet de vente en pré-marché, avec l'adresse masquée.",
  robots: { index: false, follow: false },
};

export default async function PublishPage() {
  const current = await getCurrentUser();
  if (!current) {
    redirect("/connexion?next=/pre-marche/publier");
  }

  const claims = await listClaimsFor(current.id);
  const approved = claims.filter((claim) => claim.status === "approved");

  return (
    <div className="container-page max-w-3xl py-12 md:py-16">
      <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">Pré-marché</p>
      <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
        Publier ma propriété
      </h1>
      <p className="mt-3 text-ink-soft">
        Votre fiche montrera le nom de la rue et la ville, jamais le numéro civique. Vous pouvez la
        retirer en tout temps depuis votre tableau de bord.
      </p>

      <div className="mt-8">
        {approved.length === 0 ? (
          <EmptyState
            title="Aucune propriété réclamée et approuvée"
            description="Pour publier, votre page de propriété doit d'abord être réclamée puis approuvée. C'est notre garde-fou : personne ne peut publier une fiche pour la maison de quelqu'un d'autre."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <ButtonLink href="/reclamer-ma-page">Réclamer ma page</ButtonLink>
                <ButtonLink href="/faq" variant="secondary">
                  Comment ça marche?
                </ButtonLink>
              </div>
            }
          />
        ) : (
          <Card>
            <CardBody>
              <PublishForm
                claims={approved.map((claim) => ({
                  matricule: claim.matricule,
                  address: claim.address,
                  municipalityCode: claim.municipalityCode,
                }))}
              />
            </CardBody>
          </Card>
        )}
      </div>

      <p className="mt-8 text-sm text-muted-fg">
        Besoin d&apos;aide?{" "}
        <Link href="/faq" className="underline underline-offset-2 hover:text-primary">
          Consultez la FAQ
        </Link>
        .
      </p>
    </div>
  );
}
