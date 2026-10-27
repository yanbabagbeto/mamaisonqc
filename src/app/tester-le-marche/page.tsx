import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Section } from "@/components/ui/content";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  return {
    title: isEn ? "Test the market before selling" : "Tester le marché avant de vendre",
    description: isEn
      ? "Gauge real buyer interest before listing publicly: free pre-market, masked address, no commitment to sell."
      : "Sondez l'intérêt réel des acheteurs avant de publier une annonce : pré-marché gratuit, adresse masquée, aucun engagement de vendre.",
    alternates: {
      canonical: localePath("/tester-le-marche", locale),
      languages: { "fr-CA": "/tester-le-marche", "en-CA": "/en/tester-le-marche" },
    },
  };
}

const COPY = {
  fr: {
    eyebrow: "Gratuit · sans abonnement",
    title: "Tester le marché avant de vendre",
    intro:
      "Une annonce officielle vous engage dans un processus public. Le pré-marché fait l'inverse : il mesure l'intérêt réel avant que vous ayez à décider quoi que ce soit.",
    publish: "Publier en pré-marché",
    claimFirst: "Réclamer ma page d'abord",
    panelTitle: "Ce que le pré-marché n'est pas",
    panel: [
      "Ce n'est pas une inscription Centris ni une annonce publique complète.",
      "Ce n'est pas une évaluation au sens d'un évaluateur agréé.",
      "Ce n'est pas un engagement de vendre, ni une exclusivité.",
      "Votre adresse civique n'est jamais publiée.",
    ],
    howEyebrow: "Comment ça marche",
    howTitle: "Quatre étapes, aucune surprise",
    steps: [
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
    ],
    ctaTitle: "Prêt à mesurer l'intérêt?",
    ctaBody: "Gratuit. Aucune carte de crédit. Vous pouvez retirer la fiche en un clic.",
    ctaButton: "Commencer",
  },
  en: {
    eyebrow: "Free · no subscription",
    title: "Test the market before selling",
    intro:
      "A public listing puts you into a public process. The pre-market does the opposite: it measures real interest before you have to decide anything.",
    publish: "Publish on the pre-market",
    claimFirst: "Claim my page first",
    panelTitle: "What the pre-market is not",
    panel: [
      "It is not a Centris listing, nor a complete public ad.",
      "It is not an appraisal in the sense of a licensed appraiser.",
      "It is not a commitment to sell, nor an exclusivity.",
      "Your civic number is never published.",
    ],
    howEyebrow: "How it works",
    howTitle: "Four steps, no surprises",
    steps: [
      {
        title: "Claim your property page",
        body: "We verify the property is yours (a request, an approval). Until then, nobody publishes anything in your name.",
      },
      {
        title: "Publish a pre-market listing",
        body: "Street name, city, type, area, asking price and a description. The civic number stays masked on the public listing.",
      },
      {
        title: "Receive qualified interest",
        body: "Interested buyers leave a name and email. You see who answered and decide who to talk to.",
      },
      {
        title: "Decide, with no pressure",
        body: "If the interest does not convince you, you take the listing down. No fees, no exclusivity, no obligation to sell.",
      },
    ],
    ctaTitle: "Ready to measure interest?",
    ctaBody: "Free. No credit card. You can take the listing down in one click.",
    ctaButton: "Get started",
  },
} as const;

export default async function TestMarketPage() {
  const locale = await getLocale();
  const t = COPY[locale];
  const path = (href: string) => localePath(href, locale);

  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="container-page grid gap-10 py-14 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">{t.eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl leading-[1.08] font-extrabold text-ink md:text-5xl">
              {t.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">{t.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={path("/pre-marche/publier")} size="lg">
                {t.publish}
              </ButtonLink>
              <ButtonLink href={path("/reclamer-ma-page")} variant="secondary" size="lg">
                {t.claimFirst}
              </ButtonLink>
            </div>
          </div>
          <Card className="bg-paper">
            <CardBody className="space-y-3">
              <p className="font-display text-lg font-bold text-ink">{t.panelTitle}</p>
              <ul className="space-y-2 text-sm text-ink-soft">
                {t.panel.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </section>

      <Section eyebrow={t.howEyebrow} title={t.howTitle}>
        <ol className="grid gap-4 md:grid-cols-2">
          {t.steps.map((step, index) => (
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
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">{t.ctaTitle}</h2>
            <p className="mt-2 text-white/80">{t.ctaBody}</p>
          </div>
          <ButtonLink href={path("/pre-marche/publier")} variant="secondary" size="lg">
            {t.ctaButton}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
