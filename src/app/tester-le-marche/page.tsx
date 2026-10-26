import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Section } from "@/components/ui/content";

export const metadata: Metadata = {
  title: "Tester le marché avant de vendre",
  description:
    "Sondez l'intérêt réel des acheteurs avant de publier une annonce : pré-marché gratuit, adresse masquée, aucun engagement de vendre.",
  alternates: { canonical: "/tester-le-marche" },
};

const STEPS = [
  {
    title: "Réclamez votre page de propriété",
    body: "Nous vérifions que la propriété est la vôtre (une demande, une approbation). Tant que ce n'est pas fait, personne ne publie rien en votre nom.",
  },
  {
    title: "Publiez une fiche en pré-marché",
    body: "Nom de rue, ville, type, superficie, prix demandé et une description. Le numéro civique reste masqué sur la fiche publique.",
  },
  {
    title: "Recevez des intérêts qualifiés",
    body: "Les acheteurs intéressés laissent nom et courriel. Vous voyez qui a répondu, et vous décidez à qui parler.",
  },
  {
    title: "Décidez, sans pression",
    body: "Si le volume d'intérêts ne vous convainc pas, vous retirez la fiche. Aucun frais, aucune exclusivité, aucune obligation de vendre.",
  },
];

export default function TestMarketPage() {
  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="container-page grid gap-10 py-14 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">
              Gratuit · sans abonnement
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1.08] font-extrabold text-ink md:text-5xl">
              Tester le marché avant de vendre
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              Une annonce officielle vous engage dans un processus public. Le pré-marché fait
              l&apos;inverse : il mesure l&apos;intérêt réel avant que vous ayez à décider quoi que ce
              soit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/pre-marche/publier" size="lg">
                Publier en pré-marché
              </ButtonLink>
              <ButtonLink href="/reclamer-ma-page" variant="secondary" size="lg">
                Réclamer ma page d&apos;abord
              </ButtonLink>
            </div>
          </div>
          <Card className="bg-paper">
            <CardBody className="space-y-3">
              <p className="font-display text-lg font-bold text-ink">Ce que le pré-marché n&apos;est pas</p>
              <ul className="space-y-2 text-sm text-ink-soft">
                <li>• Ce n&apos;est pas une inscription Centris ni une annonce publique complète.</li>
                <li>• Ce n&apos;est pas une évaluation au sens d&apos;un évaluateur agréé.</li>
                <li>• Ce n&apos;est pas un engagement de vendre, ni une exclusivité.</li>
                <li>• Votre adresse civique n&apos;est jamais publiée.</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </section>

      <Section eyebrow="Comment ça marche" title="Quatre étapes, aucune surprise">
        <ol className="grid gap-4 md:grid-cols-2">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-card border border-border bg-surface p-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-white">
                {index + 1}
              </span>
              <h2 className="mt-3 font-display text-lg font-bold text-ink">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <section className="border-y border-border bg-primary text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-6 py-12">
          <div>
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">
              Prêt à mesurer l&apos;intérêt?
            </h2>
            <p className="mt-2 text-white/80">
              Gratuit. Aucune carte de crédit. Vous pouvez retirer la fiche en un clic.
            </p>
          </div>
          <ButtonLink href="/pre-marche/publier" variant="secondary" size="lg">
            Commencer
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
