import type { Metadata } from "next";

import { AddressSearch } from "@/components/search/address-search";
import { ButtonLink } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import { getLocale, getMessages } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  return {
    title: isEn ? "Property valuation in Quebec" : "Évaluation d'une propriété au Québec",
    description: isEn
      ? "Search an address to see its assessment roll value, comparables and confidence range, with sources."
      : "Recherchez une adresse pour voir sa valeur au rôle, ses comparables et sa fourchette de confiance, avec les sources.",
    alternates: {
      canonical: localePath("/evaluation", locale),
      languages: {
        "fr-CA": "/evaluation",
        "en-CA": "/en/evaluation",
      },
    },
  };
}

/**
 * Entry point for valuation: the reference product links `/evaluation` from several pages, so the
 * route must exist instead of 404ing. It is the search surface, not a duplicate of the property page.
 */
export default async function EvaluationIndexPage() {
  const locale = await getLocale();
  const t = await getMessages();
  const isEn = locale === "en";
  const path = (href: string) => localePath(href, locale);

  return (
    <div className="container-page max-w-3xl py-14 md:py-20">
      <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">
        {isEn ? "Valuation" : "Évaluation"}
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight font-extrabold text-ink">
        {isEn ? "What is a property worth?" : "Combien vaut une propriété?"}
      </h1>
      <p className="mt-4 text-lg text-ink-soft">
        {isEn
          ? "Search an address to open its record: assessment roll value, the assessor's comparables, a confidence range, and the source of every figure."
          : "Recherchez une adresse pour ouvrir sa fiche : valeur au rôle, comparables de l'évaluateur, fourchette de confiance et source de chaque chiffre."}
      </p>

      <div className="mt-8 max-w-xl">
        <AddressSearch labels={t.search} autoFocus />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href={path("/marche-immobilier")} variant="secondary">
          {isEn ? "Browse the market by region" : "Explorer le marché par région"}
        </ButtonLink>
        <ButtonLink href={path("/proprietaire/equite")} variant="ghost">
          {isEn ? "Calculate my equity" : "Calculer mon équité"}
        </ButtonLink>
      </div>

      <p className="mt-10 text-sm text-muted-fg">
        {isEn
          ? "Coverage is partial in v1: only municipalities whose assessment roll has been ingested have a property record. Other addresses fall back to the regional market pages."
          : "La couverture est partielle en v1 : seules les municipalités dont le rôle d'évaluation a été ingéré ont une fiche. Les autres adresses renvoient vers les pages de marché régional."}
      </p>
    </div>
  );
}
