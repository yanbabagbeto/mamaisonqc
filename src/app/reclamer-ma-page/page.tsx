import type { Metadata } from "next";
import Link from "next/link";

import { ClaimForm } from "@/components/claims/claim-form";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/content";
import { getCurrentUser } from "@/lib/auth";
import { listClaimsFor } from "@/modules/claims";
import { formatDateFr } from "@/shared/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Réclamer la page de ma propriété",
  description:
    "Prenez possession de la page d'évaluation de votre propriété : suivez son marché, publiez en pré-marché et accédez à vos outils propriétaire.",
  alternates: { canonical: "/reclamer-ma-page" },
};

type Props = { searchParams: Promise<{ matricule?: string }> };

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente de validation",
  approved: "Approuvée",
  rejected: "Refusée",
};

export default async function ClaimPage({ searchParams }: Props) {
  const { matricule } = await searchParams;
  const current = await getCurrentUser();
  const claims = current ? await listClaimsFor(current.id) : [];

  return (
    <div className="container-page max-w-3xl py-12 md:py-16">
      <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">Propriétaire</p>
      <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
        Prenez possession de votre page
      </h1>
      <p className="mt-3 text-ink-soft">
        La fiche publique d&apos;une propriété existe déjà, comme le rôle d&apos;évaluation dont elle
        provient. En la réclamant, vous ajoutez vos outils : équité, pré-marché, suivi des intérêts.
      </p>

      <div className="mt-8 space-y-6">
        {!current ? (
          <Card>
            <CardBody className="space-y-4">
              <h2 className="font-display text-xl font-bold text-ink">Créez votre compte d&apos;abord</h2>
              <p className="text-ink-soft">
                Pour réclamer une page, il faut un compte — c&apos;est ce qui empêche quelqu&apos;un
                d&apos;autre de publier en votre nom. Créez-le en 30 secondes.
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink
                  href={
                    matricule
                      ? `/inscription?claim=${encodeURIComponent(matricule)}`
                      : "/inscription"
                  }
                >
                  Créer mon compte
                </ButtonLink>
                <ButtonLink
                  href={matricule ? `/connexion?next=/reclamer-ma-page` : "/connexion"}
                  variant="secondary"
                >
                  J&apos;ai déjà un compte
                </ButtonLink>
              </div>
            </CardBody>
          </Card>
        ) : (
          <>
            <Card>
              <CardBody>
                <h2 className="font-display text-xl font-bold text-ink">Nouvelle demande</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Connecté en tant que {current.name} ({current.email}).
                </p>
                <div className="mt-5">
                  <ClaimForm defaultMatricule={matricule} />
                </div>
              </CardBody>
            </Card>

            <section aria-labelledby="mes-demandes">
              <h2 id="mes-demandes" className="font-display text-xl font-bold text-ink">
                Mes demandes
              </h2>
              {claims.length === 0 ? (
                <p className="mt-3 text-sm text-ink-soft">
                  Aucune demande pour l&apos;instant.{" "}
                  <Link href="/marche-immobilier" className="underline underline-offset-2">
                    Trouvez votre propriété
                  </Link>{" "}
                  pour obtenir son matricule.
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
                          Demande du {formatDateFr(claim.createdAt)}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-ink-soft">
                        {STATUS_LABEL[claim.status] ?? claim.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        <Alert tone="neutral">
          Vos informations personnelles ne sont pas publiées. Une demande approuvée vous donne accès
          aux outils propriétaire de cette fiche — pas à la propriété du terrain.
        </Alert>
      </div>
    </div>
  );
}
