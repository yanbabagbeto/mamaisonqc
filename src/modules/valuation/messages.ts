import type { Locale } from "@/i18n/config";

import type { Confidence } from "./types";

/**
 * Bilingual copy for the valuation screen (`/evaluation/[matricule]`) and its components.
 * `fr` and `en` must stay structurally identical: `en` is typed as `typeof fr`, so a missing
 * key or a wrong function arity is a compile error. Addresses, municipality names and roll
 * values come from the database and are never translated — only the interface is.
 */
export const fr = {
  meta: {
    notFoundTitle: "Fiche introuvable",
    titleSuffix: "valeur au rôle et estimation",
    descriptionLead: (value: string) => `Valeur au rôle d'évaluation : ${value}.`,
    descriptionReference: (date: string) => ` Données au ${date}.`,
    descriptionTail:
      " Estimation MaMaisonQC par comparables, avec fourchette, niveau de confiance et provenance des données.",
  },
  breadcrumb: {
    label: "Fil d'Ariane",
    home: "Accueil",
    search: "Recherche",
    geographicCode: (code: string) => `Code géographique ${code}`,
  },
  header: {
    rollBadge: (year: number) => `Rôle ${year}`,
    umvBadge: (umv: string) => `UMV ${umv}`,
    locationLine: (place: string, matricule: string) => `${place} · Matricule ${matricule}`,
    equityCta: "Voir mes options de financement",
    claimCta: "Réclamer cette page",
  },
  roll: {
    title: "Valeur au rôle",
    description: "Valeurs inscrites au rôle par la municipalité, à la date de référence ci-dessous.",
    total: "Valeur totale",
    totalHint: "Terrain et bâtiment, au rôle",
    land: "Valeur du terrain",
    building: "Valeur du bâtiment",
    prior: "Rôle antérieur",
    priorMissing: "Non inscrit au rôle",
    priorHint: "Valeur au rôle précédent",
    rollYearLine: (year: number) => `Année du rôle : ${year}`,
    marketRefLine: (date: string) => `Date de référence du marché : ${date}`,
  },
  estimate: {
    title: "Estimation MaMaisonQC",
    badge: "Méthode par comparables",
    value: "Estimation",
    basisNote: "Estimation indicative calculée sur des valeurs au rôle, non un prix de vente.",
    rollBasis: (date: string) => `Valeurs au rôle arrêtées au ${date}.`,
    valueHint: "Médiane pondérée, ajustée selon la superficie du terrain",
    range: "Fourchette",
    rangeHint: "25e et 75e centile des comparables",
    comparablesCount: "Comparables retenus",
    comparablesCountHint: "Unités ayant servi au calcul",
    countSentence: (count: number) =>
      `${count} unité${count > 1 ? "s" : ""} comparable${count > 1 ? "s" : ""} retenue${
        count > 1 ? "s" : ""
      } pour le calcul.`,
    methodTitle: "Méthode.",
    method: (count: number) =>
      `Médiane pondérée des valeurs au rôle de ${count} unités comparables de la même municipalité (même unité de voisinage et même code d'utilisation lorsque disponibles), ajustée selon la superficie du terrain : rapport des superficies élevé à l'exposant 0,25, plafonné à ±15 %. La fourchette correspond au 25e et au 75e centile des comparables.`,
    confidenceTitle: "Confiance.",
    confidenceRule:
      "Élevée à partir de 8 comparables et d'un coefficient de variation sous 25 %, moyenne à partir de 4 comparables, faible autrement. Il s'agit d'une estimation MaMaisonQC calculée sur les valeurs officielles du rôle — pas d'une évaluation municipale.",
    insufficientTitle: "Données insuffisantes pour estimer",
    insufficientNone:
      "Le rôle ingéré ne contient aucune unité comparable pour ce secteur.",
    insufficientSome: (count: number) =>
      `Nous avons trouvé ${count} unité${count > 1 ? "s" : ""} comparable${
        count > 1 ? "s" : ""
      } pour cette propriété.`,
    insufficientThreshold: (minimum: number) =>
      `Il en faut au moins ${minimum} pour produire une fourchette fiable.`,
    insufficientDispersed:
      "Les valeurs des comparables sont trop dispersées pour produire une estimation fiable (rapport P75/P25 supérieur à 4 ou variation supérieure à 75 %). L'estimation MaMaisonQC est masquée.",
    insufficientImplausible:
      "L'estimation calculée s'écarterait de plus de 60 % de la valeur au rôle officielle. Elle est masquée : les comparables élargis ne sont pas assez proches de cette propriété pour défendre un tel écart.",
    insufficientHidden: "L'estimation MaMaisonQC est masquée pour cette fiche.",
    insufficientReason:
      "Sous ce seuil, une estimation donnerait une fausse précision. La valeur au rôle officielle reste affichée plus haut, avec sa source et sa date de référence.",
  },
  comparables: {
    title: "Comparables",
    description: (count: number) =>
      `${count} unité${count > 1 ? "s" : ""} comparable${count > 1 ? "s" : ""} retenue${
        count > 1 ? "s" : ""
      } pour le calcul.`,
    emptyDescription: "Aucune unité comparable retenue pour cette propriété.",
    cardTitle: "Unités retenues",
    emptyTitle: "Aucun comparable dans le rôle ingéré",
    emptyBody:
      "Le rôle ingéré ne contient aucune unité du même secteur et du même usage que cette propriété. La valeur au rôle officielle demeure affichée plus haut.",
    footnote:
      "Les valeurs de cette table sont les valeurs au rôle d'évaluation, et non des prix de vente. Chaque adresse ouvre sa propre fiche.",
    widenedTier:
      "Comparables élargis : l'unité de voisinage ne contenait pas assez d'unités comparables, la recherche a été élargie à la municipalité (même catégorie d'usage).",
    table: {
      caption:
        "Comparables retenus pour l'estimation : adresse, type d'usage, superficie du terrain et valeur au rôle d'évaluation. Chaque adresse ouvre sa propre fiche.",
      address: "Adresse",
      type: "Type",
      land: "Terrain",
      value: "Valeur au rôle",
    },
  },
  sidebar: {
    sourceTitle: "Source des données",
    sourceMissingTitle: "Source non enregistrée",
    sourceMissingBody:
      "La fiche de source de ce jeu de données n'est pas enregistrée dans la base. La valeur affichée provient tout de même du rôle officiel.",
    estimateNote:
      "L'estimation MaMaisonQC est calculée à partir de ces valeurs au rôle. Ce n'est pas une évaluation municipale ni une évaluation d'un évaluateur agréé.",
    sourceLink: "Consulter la source d'origine du rôle",
    claimTitle: "Cette fiche vous concerne?",
    claimBody:
      "Réclamez la fiche de votre propriété pour suivre sa valeur et accéder aux outils propriétaire. La réclamation est vérifiée avant d'être approuvée.",
    claimLink: "Réclamer cette page",
    equityCta: "Voir mes options de financement",
    disclaimer:
      "MaMaisonQC n'est pas un évaluateur agréé et n'est affilié à aucune municipalité. Les seules données officielles de cette page sont les valeurs au rôle et leur date de référence.",
  },
  detail: {
    trigger: "Voir plus de détails",
    title: "Fiche du rôle d'évaluation",
    intro:
      "Le détail de ce qui est inscrit au rôle pour cette unité d'évaluation, présenté tel quel.",
    close: "Fermer",
    sections: {
      identification: "Identification",
      characteristics: "Caractéristiques",
      values: "Valeurs inscrites au rôle",
    },
    rows: {
      address: "Adresse",
      municipality: "Municipalité",
      matricule: "Matricule",
      umv: "Unité de voisinage",
      use: "Utilisation prédominante",
      type: "Type de propriété",
      landArea: "Superficie du terrain",
      frontage: "Mesure frontale",
      yearBuilt: "Année de construction",
      floors: "Nombre d'étages",
      landValue: "Valeur du terrain",
      buildingValue: "Valeur du bâtiment",
      totalValue: "Valeur totale",
      priorValue: "Valeur au rôle antérieur",
      change: "Variation depuis le rôle antérieur",
      rollYear: "Année du rôle",
      refDate: "Date de référence du marché",
    },
    notAvailable: "Non inscrit",
    note:
      "Ces renseignements reproduisent la fiche d'évaluation foncière déposée par la municipalité. Ils ne constituent pas une évaluation marchande.",
  },
  confidence: {
    faible: "Confiance faible",
    moyenne: "Confiance moyenne",
    elevee: "Confiance élevée",
  } satisfies Record<Confidence, string>,
  propertyTypes: {
    unifamiliale: "Unifamiliale",
    copropriete: "Copropriété",
    plex: "Plex",
    terrain: "Terrain",
    "non-residentiel": "Non résidentiel",
    autre: "Autre",
  },
  addressFallback: "Adresse non inscrite au rôle",
  error: {
    eyebrow: "Fiche d'évaluation",
    title: "Impossible d'afficher cette fiche",
    message:
      "Les données de cette fiche n'ont pas pu être chargées. Aucune valeur n'est affichée pour éviter de présenter un chiffre non vérifié.",
    errorTitle: "Une erreur est survenue",
    retry: "Réessayer",
    home: "Retour à l'accueil",
    note: "Si le problème persiste, revenez plus tard : le rôle d'évaluation est mis à jour périodiquement.",
  },
  notFound: {
    title: "Fiche introuvable",
    description:
      "Ce matricule n'existe pas dans le rôle d'évaluation ingéré, ou sa municipalité n'est pas encore couverte. Vérifiez l'adresse avec la recherche : une adresse peut exister sans que sa fiche soit disponible.",
    searchCta: "Rechercher une adresse",
    marketCta: "Explorer le marché par région",
  },
  loading: "Chargement de la fiche d'évaluation",
};

export type EvaluationMessages = typeof fr;

export const en: EvaluationMessages = {
  meta: {
    notFoundTitle: "Record not found",
    titleSuffix: "assessment value and estimate",
    descriptionLead: (value: string) => `Assessment roll value: ${value}.`,
    descriptionReference: (date: string) => ` Data as of ${date}.`,
    descriptionTail:
      " A MaMaisonQC comparables estimate, with its range, confidence level and data provenance.",
  },
  breadcrumb: {
    label: "Breadcrumb",
    home: "Home",
    search: "Search",
    geographicCode: (code: string) => `Geographic code ${code}`,
  },
  header: {
    rollBadge: (year: number) => `Roll ${year}`,
    umvBadge: (umv: string) => `UMV ${umv}`,
    locationLine: (place: string, matricule: string) => `${place} · Matricule ${matricule}`,
    equityCta: "See my financing options",
    claimCta: "Claim this page",
  },
  roll: {
    title: "Assessment roll value",
    description: "Values recorded on the roll by the municipality, at the reference date below.",
    total: "Total value",
    totalHint: "Land and building, as assessed",
    land: "Land value",
    building: "Building value",
    prior: "Previous roll",
    priorMissing: "Not recorded in the roll",
    priorHint: "Value on the previous roll",
    rollYearLine: (year: number) => `Roll year: ${year}`,
    marketRefLine: (date: string) => `Market reference date: ${date}`,
  },
  estimate: {
    title: "MaMaisonQC estimate",
    badge: "Comparables method",
    value: "Estimate",
    basisNote: "Indicative estimate computed from assessment roll values, not a sale price.",
    rollBasis: (date: string) => `Assessment values as of ${date}.`,
    valueHint: "Weighted median, adjusted for land area",
    range: "Range",
    rangeHint: "25th and 75th percentile of the comparables",
    comparablesCount: "Comparables used",
    comparablesCountHint: "Units used in the calculation",
    countSentence: (count: number) =>
      `${count} comparable unit${count === 1 ? "" : "s"} used in the calculation.`,
    methodTitle: "Method.",
    method: (count: number) =>
      `Weighted median of the assessment values of ${count} comparable units in the same municipality (same neighbourhood unit and same use code where available), adjusted for land area: area ratio raised to the power of 0.25, capped at ±15%. The range is the 25th to 75th percentile of the comparables.`,
    confidenceTitle: "Confidence.",
    confidenceRule:
      "High from 8 comparables with a coefficient of variation under 25%, medium from 4 comparables, low otherwise. This is a MaMaisonQC estimate computed from official roll values — not a municipal assessment.",
    insufficientTitle: "Not enough data to estimate",
    insufficientNone: "The ingested roll contains no comparable unit for this area.",
    insufficientSome: (count: number) =>
      `We found ${count} comparable unit${count === 1 ? "" : "s"} for this property.`,
    insufficientThreshold: (minimum: number) =>
      `At least ${minimum} are required to produce a reliable range.`,
    insufficientDispersed:
      "Comparable values are too dispersed to produce a reliable estimate (P75/P25 ratio above 4 or variation above 75%). The MaMaisonQC estimate is hidden.",
    insufficientImplausible:
      "The computed estimate would differ from the official roll value by more than 60%. It is hidden: the widened comparables are not close enough to this property to defend such a gap.",
    insufficientHidden: "The MaMaisonQC estimate is hidden for this record.",
    insufficientReason:
      "Below that threshold an estimate would imply false precision. The official roll value remains displayed above, with its source and reference date.",
  },
  comparables: {
    title: "Comparables",
    description: (count: number) =>
      `${count} comparable unit${count === 1 ? "" : "s"} used in the calculation.`,
    emptyDescription: "No comparable unit was selected for this property.",
    cardTitle: "Selected units",
    emptyTitle: "No comparable in the ingested roll",
    emptyBody:
      "The ingested roll contains no unit in the same area and with the same use as this property. The official roll value remains displayed above.",
    footnote:
      "The values in this table are assessment roll values, not sale prices. Each address opens its own record.",
    widenedTier:
      "Widened comparables: the assessment neighbourhood unit did not contain enough comparable units, so the search was widened to the municipality (same use category).",
    table: {
      caption:
        "Comparables selected for the estimate: address, use type, land area and assessment roll value. Each address opens its own record.",
      address: "Address",
      type: "Type",
      land: "Land",
      value: "Roll value",
    },
  },
  sidebar: {
    sourceTitle: "Data source",
    sourceMissingTitle: "Source not recorded",
    sourceMissingBody:
      "This dataset's source record is not stored in the database. The displayed value still comes from the official roll.",
    estimateNote:
      "The MaMaisonQC estimate is computed from these roll values. It is neither a municipal assessment nor a licensed appraiser's opinion.",
    sourceLink: "Open the roll's original source",
    claimTitle: "Is this record yours?",
    claimBody:
      "Claim your property's record to follow its value and access the owner tools. Claims are reviewed before approval.",
    claimLink: "Claim this page",
    equityCta: "See my financing options",
    disclaimer:
      "MaMaisonQC is not a licensed appraiser and is not affiliated with any municipality. The only official data on this page are the roll values and their reference date.",
  },
  detail: {
    trigger: "See more details",
    title: "Assessment roll record",
    intro: "Everything the roll records for this assessment unit, presented as-is.",
    close: "Close",
    sections: {
      identification: "Identification",
      characteristics: "Characteristics",
      values: "Values recorded on the roll",
    },
    rows: {
      address: "Address",
      municipality: "Municipality",
      matricule: "Roll number",
      umv: "Neighbourhood unit",
      use: "Predominant use",
      type: "Property type",
      landArea: "Land area",
      frontage: "Frontage",
      yearBuilt: "Year built",
      floors: "Number of floors",
      landValue: "Land value",
      buildingValue: "Building value",
      totalValue: "Total value",
      priorValue: "Prior roll value",
      change: "Change since prior roll",
      rollYear: "Roll year",
      refDate: "Market reference date",
    },
    notAvailable: "Not recorded",
    note:
      "This information reproduces the assessment roll filed by the municipality. It is not a market valuation.",
  },
  confidence: {
    faible: "Low confidence",
    moyenne: "Medium confidence",
    elevee: "High confidence",
  },
  propertyTypes: {
    unifamiliale: "Single-family",
    copropriete: "Condominium",
    plex: "Plex",
    terrain: "Land",
    "non-residentiel": "Non-residential",
    autre: "Other",
  },
  addressFallback: "Address not recorded in the roll",
  error: {
    eyebrow: "Property record",
    title: "This record cannot be displayed",
    message:
      "The data for this record could not be loaded. No value is shown, so that no unverified figure is presented.",
    errorTitle: "An error occurred",
    retry: "Try again",
    home: "Back to home",
    note: "If the problem persists, come back later: the assessment roll is updated periodically.",
  },
  notFound: {
    title: "Record not found",
    description:
      "This matricule does not exist in the ingested assessment roll, or its municipality is not covered yet. Check the address with the search: an address can exist without its record being available.",
    searchCta: "Search an address",
    marketCta: "Explore the market by region",
  },
  loading: "Loading the property record",
};

export function messagesFor(locale: Locale): EvaluationMessages {
  return locale === "en" ? en : fr;
}

export function propertyTypeLabel(messages: EvaluationMessages, type: string): string {
  const labels: Record<string, string> = messages.propertyTypes;
  return labels[type] ?? messages.propertyTypes.autre;
}
