/**
 * French dictionary. The shape of this object is the contract: `en.ts` must satisfy
 * `Dictionary`, so a missing translation is a type error rather than a silent fallback.
 */
export const fr = {
  meta: {
    siteName: "MaMaisonQC",
    tagline: "La valeur des propriétés du Québec, données officielles",
  },
  nav: {
    label: "Navigation principale",
    owners: "Propriétaires",
    buyers: "Acheteurs",
    market: "Marché immobilier",
    brief: "Le Brief",
    explore: "Explorer",
    financing: "Mon financement",
    faq: "FAQ",
    login: "Se connecter",
    account: "Mon compte",
    dashboard: "Tableau de bord",
    logout: "Se déconnecter",
    cta: "Valeur de ma maison",
    menu: "Ouvrir le menu",
    skip: "Aller au contenu",
  },
  localeSwitcher: {
    label: "Langue",
    fr: "Français",
    en: "English",
  },
  footer: {
    description:
      "La valeur des propriétés du Québec, calculée à partir des données officielles d'évaluation foncière et du Registre foncier — avec la provenance de chaque chiffre.",
    owners: "Propriétaires",
    market: "Marché",
    resources: "Ressources",
    about: "MaMaisonQC",
    ownerLinks: {
      hub: "Hub propriétaire",
      equity: "Calculer mon équité",
      renewal: "Renouvellement hypothécaire",
      subsidies: "Subventions rénovation",
    },
    marketLinks: {
      regions: "Marché par région",
      premarket: "Pré-marché",
      testMarket: "Tester le marché",
      claim: "Réclamer ma page",
      explorer: "Explorer le pré-marché",
      financing: "Mon financement",
      interests: "Mes intérêts",
      settings: "Paramètres",
    },
    resourceLinks: {
      brief: "Le Brief",
      news: "Nouvelles",
      advice: "Conseils",
      data: "Données et sources",
    },
    aboutLinks: {
      explore: "Explorer",
    financing: "Mon financement",
    faq: "FAQ",
      contact: "Contact",
      terms: "Conditions d'utilisation",
      privacy: "Confidentialité",
    },
    attribution:
      "Données : Rôle d'évaluation foncière du Québec (MAMH, CC-BY 4.0) · Statistiques du Registre foncier du Québec (CC-BY 4.0) · Adresses Québec (MERN, CC-BY 4.0). Les estimations MaMaisonQC sont des valeurs indicatives, pas des évaluations agréées ni des avis d'un évaluateur agréé.",
    copyright: "Tous droits réservés.",
    terms: "Conditions",
    privacy: "Confidentialité",
  },
  newsletter: {
    title: "Recevez Le Brief",
    placeholder: "vous@exemple.ca",
    submit: "S'abonner",
    submitting: "Inscription…",
    hint: "Une édition par mois. Désinscription en un clic.",
    success: "C'est noté. Vous recevrez Le Brief dès la prochaine édition.",
    errorEmpty: "Entrez une adresse courriel.",
    errorGeneric: "Inscription impossible pour le moment.",
    errorNetwork: "Réseau indisponible. Réessayez dans un instant.",
  },
  consent: {
    title: "Respect de votre vie privée",
    body:
      "Nous mesurons l'usage du site avec nos propres outils, sans publicité ni traqueur tiers. Vous pouvez refuser : le site fonctionne exactement pareil.",
    policy: "Politique de confidentialité",
    accept: "Accepter",
    refuse: "Refuser",
  },
  search: {
    label: "Adresse de la propriété",
    placeholder: "Entrez une adresse au Québec",
    /** singular|plural, with {count} interpolated client-side (functions cannot cross RSC→client). */
    results: "{count} adresse trouvée|{count} adresses trouvées",
    searching: "Recherche en cours",
    suggestions: "Adresses suggérées",
    available: "fiche disponible",
    notFound: "Aucune adresse trouvée. Vérifiez le numéro civique et la municipalité.",
    unavailable: "Recherche d'adresse indisponible. Réessayez dans un instant.",
  },
  common: {
    free: "Gratuit, sans compte",
    officialData: "Données ouvertes du gouvernement du Québec",
    learnMore: "En savoir plus",
    continue: "Continuer",
    seeAll: "Tout voir",
    back: "Retour",
    loading: "Chargement…",
    error: "Une erreur est survenue.",
  },
  home: {
    heroEyebrow: "Évaluation foncière · Québec",
    heroTitleBefore: "Combien vaut",
    heroTitleHighlight: "vraiment",
    heroTitleAfter: "votre maison?",
    heroBody:
      "Une estimation appuyée sur le rôle d'évaluation foncière et les statistiques du Registre foncier du Québec. Comparables réels, fourchette, confiance — et la source de chaque chiffre.",
    cardLabel: "Fiche type",
    cardBadge: "Données sourcées",
    cardRows: [
      "Valeur au rôle d'évaluation",
      "Valeur du rôle antérieur",
      "Comparables — même UMV",
      "Fourchette et confiance",
      "Provenance et licence",
    ],
    cardFootnoteSource: "Registre foncier",
    cardFootnote: "Ventes par tranche de prix",
    intentsEyebrow: "Par où commencer",
    intentsTitle: "Qu'est-ce qui vous amène?",
    intents: [
      {
        title: "Je suis propriétaire",
        body: "Ce que vaut ma maison aujourd'hui, ce que je peux refinancer, et où en est mon hypothèque.",
      },
      {
        title: "J'envisage de vendre",
        body: "Sondez l'intérêt des acheteurs avant de publier une annonce, sans engagement.",
      },
      {
        title: "Je cherche une propriété",
        body: "Découvrez des propriétés en préparation de mise en marché, secteur par secteur.",
      },
    ],
    whyEyebrow: "Pourquoi nos chiffres sont différents",
    whyTitle: "De la transparence, pas une boîte noire",
    whyBody:
      "Une estimation immobilière se juge à sa méthode. Voici exactement ce que MaMaisonQC affiche et ce qu'il refuse de cacher.",
    why: [
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
    ],
    whyCta: "Voir toutes les sources de données",
    whyNote: "Rôle d'évaluation (MAMH), Registre foncier, Adresses Québec — licences CC-BY 4.0.",
    howEyebrow: "Comment ça marche",
    howTitle: "Trois étapes, aucune approximation silencieuse",
    how: [
      { title: "Vous tapez une adresse", body: "La recherche s'appuie sur le géocodeur officiel Adresses Québec (MERN)." },
      {
        title: "Nous lisons le rôle d'évaluation",
        body: "Valeur de l'immeuble, du terrain et du bâtiment, superficie, année de construction, UMV.",
      },
      {
        title: "Nous calculons une fourchette",
        body: "Estimation robuste par comparables, avec niveau de confiance et provenance affichés.",
      },
    ],
    marketEyebrow: "Marché immobilier",
    marketTitle: "Le marché québécois, région par région",
    marketBody:
      "Volume de ventes, tranches de prix, hypothèques inscrites et actes de difficulté financière, compilés à partir des statistiques du Registre foncier du Québec.",
    marketCta: "Explorer le marché",
    premarketCta: "Voir le pré-marché",
    briefEyebrow: "Le Brief",
    briefTitle: "Le marché expliqué, une fois par mois",
    briefBody:
      "Chaque édition part des données publiées : ce qui a bougé dans les ventes, ce que ça change pour un renouvellement hypothécaire, et les programmes d'aide en cours. Pas de prédiction, pas de titre racoleur.",
    briefBullets: [
      "Les chiffres de la dernière période, par région.",
      "Les taux et ce qu'ils impliquent pour votre équité.",
      "Les subventions à surveiller, avec la source officielle.",
    ],
    faqTitle: "Questions fréquentes",
    faqLinks: [
      "Comment l'estimation est-elle calculée?",
      "Est-ce vraiment gratuit?",
      "D'où viennent les données?",
      "Est-ce la même chose que l'évaluation municipale?",
    ],
    faqAll: "Toutes les questions",
  },
} as const;

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : T extends (...args: infer A) => infer R
      ? (...args: A) => R
      : T extends object
        ? { readonly [K in keyof T]: Widen<T[K]> }
        : T;

/** The contract: only the shape and the argument types are shared, never the literals. */
export type Dictionary = Widen<typeof fr>;
