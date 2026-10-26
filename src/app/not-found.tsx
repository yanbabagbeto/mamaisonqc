import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { getLocale } from "@/i18n/server";

export default async function NotFound() {
  const locale = await getLocale();
  const isEn = locale === "en";
  return (
    <div className="container-page flex min-h-[60dvh] max-w-xl flex-col justify-center py-16">
      <p className="font-display text-6xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 font-display text-3xl font-extrabold text-ink">
        {isEn ? "This page doesn't exist" : "Cette page n'existe pas"}
      </h1>
      <p className="mt-3 text-ink-soft">
        {isEn
          ? "The address may have changed, or the property is outside our current coverage."
          : "L'adresse a peut-être changé, ou la propriété est hors de notre couverture actuelle."}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={isEn ? "/en" : "/"}>{isEn ? "Back home" : "Retour à l'accueil"}</ButtonLink>
        <ButtonLink href={isEn ? "/en/marche-immobilier" : "/marche-immobilier"} variant="secondary">
          {isEn ? "Browse the market" : "Explorer le marché"}
        </ButtonLink>
      </div>
      <p className="mt-8 text-sm text-muted-fg">
        {isEn ? "Looking for a specific property? " : "Vous cherchez une propriété précise? "}
        <Link
          href={isEn ? "/en/recherche" : "/recherche"}
          className="underline underline-offset-2 hover:text-primary"
        >
          {isEn ? "Search by address" : "Recherchez par adresse"}
        </Link>
        .
      </p>
    </div>
  );
}
