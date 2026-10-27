import type { Locale } from "@/i18n/config";

/**
 * Bilingual copy for the address-search screen (`/recherche`). Structure is the contract:
 * `en` is typed as `typeof fr`, so a missing key is a compile error. Addresses and municipality
 * names returned by the geocoder are data and are never translated.
 */
export const fr = {
  meta: {
    title: "Rechercher une adresse au Québec",
    description:
      "Recherchez une adresse avec le géocodeur officiel Adresses Québec, puis ouvrez sa fiche d'évaluation foncière si elle est couverte par le rôle ingéré.",
  },
  eyebrow: "Recherche d'adresse",
  title: "Trouver la fiche d'une propriété",
  intro:
    "La recherche utilise le géocodeur officiel Adresses Québec. Nous affichons la fiche d'évaluation seulement lorsque l'adresse correspond à une unité du rôle ingéré.",
  form: {
    label: "Adresse de la propriété",
    hint: (minimum: number, maximum: number) =>
      `Numéro civique et rue, de ${minimum} à ${maximum} caractères.`,
    placeholder: "Ex. : 1234 rue Sainte-Catherine, Montréal",
    submit: "Rechercher",
    invalid: "Vérifiez l'adresse : elle doit contenir entre 3 et 120 caractères.",
    promptTitle: "Cherchez une adresse",
    promptBody: (minimum: number) =>
      `Entrez un numéro civique et une rue (au moins ${minimum} caractères) pour afficher les adresses correspondantes.`,
  },
  results: {
    count: (count: number) =>
      `${count} adresse${count > 1 ? "s" : ""} trouvée${count > 1 ? "s" : ""}`,
    noneTitle: "Aucune adresse trouvée",
    available: "Fiche disponible",
    unavailable: "Fiche non disponible",
    availableLink: "Voir la fiche d'évaluation →",
    unavailableNote:
      "Cette adresse est valide, mais son unité d'évaluation ne fait pas partie de l'échantillon de rôles ingéré pour l'instant. Toutes les municipalités ne sont pas encore couvertes, et l'échantillon est volontairement partiel — jamais comblé par une estimation inventée.",
    marketLink: "Voir le marché de {city} →",
    errorTitle: "Recherche indisponible",
    unavailableError:
      "Recherche d'adresse indisponible. Réessayez dans un instant ou explorez le marché par région.",
  },
  empty: {
    title: "Adresse introuvable",
    description:
      "Vérifiez le numéro civique et la municipalité, puis réessayez. Si l'adresse existe mais que sa fiche n'est pas encore couverte, vous pouvez explorer le marché par région.",
    marketCta: "Explorer le marché par région",
    retryCta: "Réessayer",
  },
  provenance: {
    geocoderName: "Adresses Québec (géocodeur)",
  },
  loading: "Recherche d'adresse en cours",
};

export type SearchMessages = typeof fr;

export const en: SearchMessages = {
  meta: {
    title: "Search for an address in Quebec",
    description:
      "Search an address with the official Adresses Québec geocoder, then open its assessment-roll record if it is covered by the ingested roll.",
  },
  eyebrow: "Address search",
  title: "Find a property's record",
  intro:
    "The search uses the official Adresses Québec geocoder. We only show an assessment record when the address matches a unit in the ingested roll.",
  form: {
    label: "Property address",
    hint: (minimum: number, maximum: number) =>
      `Civic number and street, from ${minimum} to ${maximum} characters.`,
    placeholder: "e.g. 1234 rue Sainte-Catherine, Montréal",
    submit: "Search",
    invalid: "Check the address: it must contain between 3 and 120 characters.",
    promptTitle: "Search for an address",
    promptBody: (minimum: number) =>
      `Enter a civic number and a street (at least ${minimum} characters) to list matching addresses.`,
  },
  results: {
    count: (count: number) => `${count} address${count === 1 ? "" : "es"} found`,
    noneTitle: "No address found",
    available: "Record available",
    unavailable: "Record unavailable",
    availableLink: "Open the property record →",
    unavailableNote:
      "This address is valid, but its assessment unit is not part of the ingested roll sample yet. Coverage is partial on purpose, and we never fill the gap with an invented estimate.",
    marketLink: "See the {city} market →",
    errorTitle: "Search unavailable",
    unavailableError:
      "Address search is unavailable. Try again in a moment or explore the market by region.",
  },
  empty: {
    title: "Address not found",
    description:
      "Check the civic number and the municipality, then try again. If the address exists but its record is not covered yet, you can explore the market by region.",
    marketCta: "Explore the market by region",
    retryCta: "Try again",
  },
  provenance: {
    geocoderName: "Adresses Québec (geocoder)",
  },
  loading: "Searching addresses",
};

export function messagesFor(locale: Locale): SearchMessages {
  return locale === "en" ? en : fr;
}
