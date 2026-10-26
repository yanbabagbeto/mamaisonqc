import type { Metadata } from "next";
import Link from "next/link";

import { AddressSearch } from "@/components/search/address-search";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, Section } from "@/components/ui/content";

export const metadata: Metadata = {
  title: "La valeur des propriétés du Québec, avec la source de chaque chiffre",
  description:
    "Estimez la valeur d'une propriété à partir du rôle d'évaluation foncière du Québec et des ventes du Registre foncier. Comparables réels, fourchette, niveau de confiance et provenance affichée.",
  alternates: { canonical: "/" },
};

const INTENTS = [
  {
    href: "/proprietaire",
    title: "Je suis propriétaire",
    body: "Ce que vaut ma maison aujourd'hui, ce que je peux refinancer, et où en est mon hypothèque.",
  },
  {
    href: "/tester-le-marche",
    title: "J'envisage de vendre",
    body: "Sondez l'intérêt des acheteurs avant de publier une annonce, sans engagement.",
  },
  {
    href: "/pre-marche",
    title: "Je cherche une propriété",
    body: "Découvrez des propriétés en préparation de mise en marché, secteur par secteur.",
  },
];

const DIFFERENTIATORS = [
  {
    title: "Des données officielles, pas une boîte noire",
    body: "Chaque valeur part du rôle d'évaluation foncière déposé par la municipalité. Vous voyez la valeur au rôle, sa date de référence et la valeur du rôle antérieur.",
  },
  {
    title: "Les comparables de l'évaluateur",
    body: "Nous comparons votre propriété aux unités de la même unité de voisinage municipale (UMV), même catégorie d'usage et surface comparable — le découpage utilisé par l'évaluateur lui-même.",
  },
  {
    title: "Une fourchette, pas un faux chiffre précis",
    body: "Une estimation seule cache son incertitude. Nous affichons la fourchette et le nombre de comparables : peu de comparables, confiance faible, et c'est dit.",
  },
  {
    title: "La provenance sur chaque écran",
    body: "Source, éditeur, licence et date de mise à jour sont affichés sous les chiffres. Les licences CC-BY 4.0 exigent l'attribution : nous la rendons visible, pas enfouie.",
  },
];

const STEPS = [
  {
    title: "Vous tapez une adresse",
    body: "La recherche s'appuie sur le géocodeur officiel Adresses Québec (MERN).",
  },
  {
    title: "Nous lisons le rôle d'évaluation",
    body: "Valeur de l'immeuble, du terrain et du bâtiment, superficie, année de construction, UMV.",
  },
  {
    title: "Nous calculons une fourchette",
    body: "Estimation robuste par comparables, avec niveau de confiance et provenance affichés.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-32 size-[36rem] rounded-full bg-primary-soft blur-3xl"
        />
        <div className="container-page relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-accent uppercase">
              <span aria-hidden="true" className="inline-block h-0.5 w-6 bg-accent" />
              Évaluation foncière · Québec
            </p>
            <h1 className="font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-ink sm:text-5xl lg:text-[3.6rem]">
              Combien vaut <span className="text-primary">vraiment</span> votre maison?
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              Une estimation appuyée sur le rôle d&apos;évaluation foncière et les statistiques du
              Registre foncier du Québec. Comparables réels, fourchette, confiance — et la source de
              chaque chiffre.
            </p>

            <div className="mt-8 max-w-xl">
              <AddressSearch />
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-fg">
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="size-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Gratuit, sans compte
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="size-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 3 4 6.5V12c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V6.5Z" strokeLinejoin="round" />
                  </svg>
                  Données ouvertes du gouvernement du Québec
                </span>
              </p>
            </div>
          </div>

          {/* Decorative explainer: field names only, no invented numbers. */}
          <div aria-hidden="true" className="relative mx-auto w-full max-w-sm">
            <div className="rotate-1 rounded-card border border-border bg-paper p-5 shadow-[var(--shadow-lift)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-muted-fg uppercase">Fiche type</span>
                <Badge tone="primary">Données sourcées</Badge>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  "Valeur au rôle d'évaluation",
                  "Valeur du rôle antérieur",
                  "Comparables — même UMV",
                  "Fourchette et confiance",
                  "Provenance et licence",
                ].map((label) => (
                  <div key={label} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5">
                    <span className="text-sm font-medium text-ink-soft">{label}</span>
                    <span className="h-2 w-14 rounded-full bg-primary-soft" />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 -rotate-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow-card)]">
              <p className="text-[0.7rem] leading-tight font-semibold text-muted-fg">Registre foncier</p>
              <p className="font-display text-sm font-bold text-ink">Ventes par tranche de prix</p>
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow="Par où commencer" title="Qu'est-ce qui vous amène?" className="pt-14 md:pt-16">
        <div className="grid gap-4 md:grid-cols-3">
          {INTENTS.map((intent) => (
            <Link
              key={intent.href}
              href={intent.href}
              className="group rounded-card border border-border bg-surface p-6 transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
            >
              <h3 className="font-display text-lg font-bold text-ink">{intent.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{intent.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Continuer
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Pourquoi nos chiffres sont différents"
        title="De la transparence, pas une boîte noire"
        description="Une estimation immobilière se juge à sa méthode. Voici exactement ce que MaMaisonQC affiche et ce qu'il refuse de cacher."
        className="bg-surface"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {DIFFERENTIATORS.map((item, index) => (
            <Card key={item.title}>
              <CardBody>
                <span className="tabular text-xs font-bold text-accent">0{index + 1}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
              </CardBody>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <ButtonLink href="/donnees" variant="secondary" size="md">
            Voir toutes les sources de données
          </ButtonLink>
          <p className="text-sm text-muted-fg">
            Rôle d&apos;évaluation (MAMH), Registre foncier, Adresses Québec — licences CC-BY 4.0.
          </p>
        </div>
      </Section>

      <Section eyebrow="Comment ça marche" title="Trois étapes, aucune approximation silencieuse">
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-card border border-border bg-surface p-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <section className="border-y border-border bg-primary text-white">
        <div className="container-page grid items-center gap-8 py-14 md:grid-cols-[1.4fr_1fr] md:py-16">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-white/70 uppercase">Marché immobilier</p>
            <h2 className="mt-3 font-display text-3xl leading-tight font-extrabold md:text-4xl">
              Le marché québécois, région par région
            </h2>
            <p className="mt-4 max-w-xl text-white/85">
              Volume de ventes, tranches de prix, hypothèques inscrites et actes de difficulté
              financière, compilés à partir des statistiques du Registre foncier du Québec.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <ButtonLink href="/marche-immobilier" variant="secondary" size="lg">
              Explorer le marché
            </ButtonLink>
            <ButtonLink
              href="/pre-marche"
              size="lg"
              className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              Voir le pré-marché
            </ButtonLink>
          </div>
        </div>
      </section>

      <Section eyebrow="Le Brief" title="Le marché expliqué, une fois par mois">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardBody className="space-y-4">
              <p className="text-ink-soft">
                Chaque édition part des données publiées : ce qui a bougé dans les ventes, ce que ça
                change pour un renouvellement hypothécaire, et les programmes d&apos;aide en cours.
                Pas de prédiction, pas de titre racoleur.
              </p>
              <ul className="space-y-2 text-sm text-ink-soft">
                <li>• Les chiffres de la dernière période, par région.</li>
                <li>• Les taux et ce qu&apos;ils impliquent pour votre équité.</li>
                <li>• Les subventions à surveiller, avec la source officielle.</li>
              </ul>
              <div className="max-w-md">
                <NewsletterForm source="home" />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-3">
              <h3 className="font-display text-lg font-bold text-ink">Questions fréquentes</h3>
              {[
                { href: "/faq#methode", label: "Comment l'estimation est-elle calculée?" },
                { href: "/faq#gratuit", label: "Est-ce vraiment gratuit?" },
                { href: "/faq#donnees", label: "D'où viennent les données?" },
                {
                  href: "/faq#valeur-municipale",
                  label: "Est-ce la même chose que l'évaluation municipale?",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-ink-soft hover:border-primary/40 hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/faq" className="inline-flex text-sm font-semibold text-primary">
                Toutes les questions →
              </Link>
            </CardBody>
          </Card>
        </div>
      </Section>
    </>
  );
}
