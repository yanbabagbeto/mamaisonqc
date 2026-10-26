/**
 * Market-hub dictionary, French and English.
 *
 * Each page/component of `src/app/marche-immobilier` and `src/components/market` renders from
 * these strings: no display text is hardcoded in the routes. Territory names (regions,
 * municipalities) are official French proper nouns and are never translated — only labels,
 * headings, captions and notices are.
 *
 * `en` must satisfy `MarketMessages` exactly: a missing translation is a type error.
 */
import type { Locale } from "@/i18n/config";

const fr = {
  common: {
    home: "Accueil",
    market: "Marché immobilier",
    breadcrumbsLabel: "Fil d’Ariane",
    coverageWarning: "Couverture incomplète",
    coverageInfo: "À savoir",
    official: "Données officielles",
    registre: "Registre foncier",
    pending: "Données à venir",
    sourceSection: "Sources et licences",
    dataAndLicences: "Données et licences",
    backToRegions: "Toutes les régions",
    backToMarket: "Retour au marché",
    retry: "Réessayer",
    noValue: "—",
  },
  window: {
    last12: "12 dernières périodes publiées",
    published: (count: number) => `${count} périodes publiées`,
    covered: (first: string, last: string) => `Période couverte : du ${first} au ${last}`,
    latest: (period: string) => `Dernière période : ${period}`,
    rollYear: (year: number) => `Rôle ${year}`,
  },
  chartUi: {
    viewValues: "Voir les valeurs",
    bandColumn: "Tranche",
    shareColumn: "Part",
    periodColumn: "Période",
    sales: "Ventes",
    units: "Unités",
  },
  bands: {
    range: (min: string, max: string) => `${min} à ${max}`,
    lessThan: (max: string) => `Moins de ${max}`,
    andUp: (min: string) => `${min} et plus`,
  },
  propertyTypes: {
    unifamiliale: "Unifamiliale",
    copropriete: "Copropriété",
    plex: "Plex",
    terrain: "Terrain",
    nonResidentiel: "Non résidentiel",
    autre: "Autre",
    all: "Tous les types",
  },
  index: {
    meta: {
      title: "Marché immobilier au Québec, région par région",
      description:
        "Ventes, inscriptions hypothécaires et actes de difficulté financière du Registre foncier, région par région, avec la couverture du rôle d’évaluation foncière et la provenance de chaque chiffre.",
    },
    eyebrow: "Données officielles · Registre foncier",
    title: "Le marché immobilier du Québec, région par région",
    lead: "Ventes, inscriptions hypothécaires et actes de difficulté financière compilés à partir des statistiques du Registre foncier du Québec, complétés par le rôle d’évaluation foncière lorsque celui-ci est ingéré. Aucun chiffre n’est affiché sans sa source.",
    regionsSection: {
      eyebrow: "Régions administratives",
      title: "Choisir une région",
      description:
        "Chaque région mène à ses statistiques de marché et à la liste de ses municipalités couvertes par le rôle d’évaluation.",
    },
    summary: {
      regions: "Régions listées",
      withStats: "Régions avec statistiques",
      municipalities: "Municipalités avec rôle",
      unitsHint: (count: string) => `${count} unités ingérées`,
      latest: "Période la plus récente",
      latestHint: "Registre foncier",
    },
    empty: {
      title: "Aucune donnée de marché n’est encore chargée",
      body1:
        "Le registre des territoires, les statistiques du Registre foncier et le rôle d’évaluation foncière ne sont pas encore ingérés dans cette instance. Cette page affichera les régions administratives, leurs ventes par tranche de prix et leurs municipalités couvertes dès que la base sera chargée.",
      body2:
        "Aucune estimation n’est affichée en attendant : un chiffre absent reste absent, il n’est jamais remplacé par un zéro.",
      action: "Voir les sources de données",
    },
    statsMissing: {
      title: "Les statistiques du Registre foncier ne sont pas encore chargées",
      body: "Les territoires sont connus, mais aucune statistique de ventes, d’hypothèques ni de difficultés financières n’est disponible pour le moment. Les cartes ci-dessous n’affichent donc aucun montant.",
      action: "Voir les sources de données",
    },
    card: {
      sales: "Ventes · 12 périodes",
      mortgages: "Inscriptions hypothécaires",
      difficulties: "Actes de difficulté",
      medianBand: "Tranche médiane des ventes",
      noStats:
        "Aucune statistique publiée pour cette région. La page régionale ouvrira sur l’état de couverture, sans chiffres inventés.",
      coverage: (covered: string, total: string, units: string) =>
        `${covered} municipalité(s) avec rôle ingéré sur ${total} · ${units} unités`,
      rollMissing: "Rôle d’évaluation non ingéré pour cette région",
      medianRoll: (value: string) => ` · valeur médiane au rôle : ${value}`,
    },
    method: {
      eyebrow: "Méthode",
      title: "Comment lire ces chiffres",
      window: {
        title: "Fenêtre de 12 périodes",
        body1:
          "Les totaux de ventes, d’inscriptions hypothécaires et d’actes de difficulté financière couvrent les 12 dernières périodes mensuelles publiées par le Registre foncier. La période la plus récente est affichée sur chaque page.",
        body2:
          "Une période non publiée reste vide : elle n’est jamais comptée comme zéro dans les graphiques ni dans les tableaux.",
      },
      median: {
        title: "Une tranche médiane, pas un prix moyen",
        body1:
          "La tranche médiane des ventes est la tranche de prix où se situe la 50e vente de la fenêtre. C’est un fait calculé sur les tranches publiées par le Registre foncier, pas un prix moyen.",
        body2:
          "Aucun prix n’est estimé à partir des tranches : nous ne dérivons ni moyenne ni prix médian de ces bornes.",
      },
      roll: {
        title: "Valeurs au rôle : médianes des unités ingérées",
        body: "Les valeurs médianes au rôle portent sur les unités réellement ingérées pour une municipalité, pas sur l’ensemble du territoire. La médiane est calculée sur les valeurs exactes; quand le nombre d’unités est pair, elle interpole entre les deux valeurs centrales.",
      },
      coverage: {
        title: "Couverture explicite",
        body: "Une municipalité sans rôle ingéré affiche la mention « rôle non ingéré » et des tirets. Une région sans statistiques affiche une note de couverture. Cette page ne remplit jamais un trou avec un zéro.",
      },
    },
  },
  region: {
    meta: {
      title: (name: string) => `${name} — marché immobilier et rôle d’évaluation`,
      description: (name: string) =>
        `Ventes par tranche de prix, inscriptions hypothécaires et actes de difficulté financière pour la région ${name}, et inventaire du rôle d’évaluation foncière des municipalités couvertes.`,
    },
    eyebrow: "Région administrative",
    lead: "Ventes et financement inscrits au Registre foncier du Québec, et inventaire du rôle d’évaluation foncière des municipalités couvertes.",
    stats: {
      title: "Statistiques du Registre foncier",
      subtitle: (window: string) => `${window} · sommes des lignes publiées pour la région.`,
      sales: "Ventes",
      mortgages: "Inscriptions hypothécaires",
      difficulties: "Actes de difficulté",
      difficultiesHint: "Actes de difficulté financière",
      municipalities: "Municipalités avec rôle",
      municipalitiesHint: "Unités du rôle ingérées",
      medianRoll: "Valeur médiane au rôle",
      medianLandHint: (area: string) => `Terrain médian : ${area}`,
      medianRollHint: "Unités ingérées seulement",
    },
    statsMissing: {
      title: "Statistiques du Registre foncier non publiées pour cette région",
      body: (name: string) =>
        `Les ventes, inscriptions hypothécaires et actes de difficulté financière ne sont pas encore chargés pour ${name}. Nous n’affichons aucun total à zéro : la page sera complétée dès que la source officielle sera ingérée.`,
      action: "Voir les sources de données",
    },
    municipalities: {
      title: "Municipalités",
      body: "Chaque municipalité mène à son marché et, quand il est ingéré, à l’inventaire du rôle d’évaluation foncière.",
      badgeNoStats: "Statistiques municipales non publiées",
      rollMissingTitle: "Rôle d’évaluation non ingéré pour cette région",
      rollMissingBody:
        "Les statistiques du Registre foncier ci-dessus restent valides. En revanche, aucune unité du rôle d’évaluation n’est chargée pour les municipalités de cette région : aucune valeur médiane ni superficie n’est affichée.",
      rollMissingAction: "Comprendre la couverture",
      footnote: (units: string, area: string | null) =>
        `Valeur médiane au rôle calculée sur les unités réellement ingérées de la région (${units} unités)${area ? `, terrain médian de ${area}` : ""}. La médiane interpole entre les deux valeurs centrales quand le nombre d’unités est pair.`,
    },
  },
  municipality: {
    meta: {
      title: (name: string) => `${name} — marché immobilier et rôle d’évaluation`,
      description: (name: string, region: string) =>
        `Marché immobilier et inventaire du rôle d’évaluation foncière de ${name} (${region}) : ventes par tranche de prix, statistiques du Registre foncier et valeurs médianes au rôle.`,
    },
    eyebrow: "Municipalité",
    lead: (region: string) =>
      `Marché immobilier et inventaire du rôle d’évaluation foncière — ${region}.`,
    filter: {
      label: "Filtrer l’inventaire par type de propriété",
      title: "Type de propriété",
      note: "Le filtre s’applique aux valeurs et aux superficies du rôle. Les statistiques du Registre foncier ne sont pas ventilées par type de propriété.",
    },
    roll: {
      title: "Inventaire du rôle d’évaluation",
      body: "Unités du rôle d’évaluation foncière ingérées pour cette municipalité, par type de propriété.",
      badge: "Rôle d’évaluation",
      unitsHint: (count: string) => `${count} unités ingérées`,
      unitsLabel: "Unités",
      medianValue: "Valeur médiane",
      medianArea: "Terrain médian",
      bandsTitle: "Valeurs au rôle par tranche",
      bandsBody: (count: string) =>
        `Répartition de ${count} unités. Tranches construites à partir des valeurs réelles du rôle, bornes arrondies à 10 000 $ et affichées telles quelles.`,
      bandsChartTitle: (name: string) => `Valeurs au rôle par tranche — ${name}`,
      bandsChartDesc: (name: string, count: string) =>
        `Répartition des valeurs au rôle de ${count} unités ingérées pour ${name}, par tranche construite à partir des valeurs réelles.`,
      bandsCaption: (name: string) => `Valeurs au rôle par tranche, ${name}`,
      tableCaption: (name: string) =>
        `Inventaire du rôle d’évaluation de ${name} par type de propriété.`,
      tableType: "Type de propriété",
      ratioNote:
        "Valeur médiane au rôle : médiane des valeurs de l’immeuble (RL0404A) des unités ingérées. La médiane interpole entre les deux valeurs centrales quand le nombre d’unités est pair.",
      emptyTypeTitle: "Aucune unité de ce type",
      emptyTypeBody:
        "Le rôle ingéré ne contient aucune unité de ce type pour cette municipalité. Retirez le filtre pour voir l’inventaire complet.",
      removeFilter: "Retirer le filtre",
      notCoveredTitle: "Rôle non ingéré pour ce territoire",
      notCoveredBody:
        "Aucune unité du rôle d’évaluation foncière n’est chargée pour cette municipalité. Nous n’affichons ni valeur ni superficie plutôt que des zéros.",
      notCoveredAction: "Comprendre la couverture",
    },
    backToRegion: (region: string) => `Retour à ${region}`,
    regionStatsTitle: (region: string) => `Statistiques régionales — ${region}`,
    regionStatsNote: (region: string) =>
      `Le Registre foncier ne publie pas de statistiques à l’échelle municipale pour ce territoire. Les chiffres ci-dessous couvrent l’ensemble de la région ${region} et ne décrivent donc pas uniquement cette municipalité.`,
    stats: {
      title: "Statistiques du Registre foncier",
      subtitle: (window: string) =>
        `${window} · sommes des lignes publiées pour la municipalité.`,
    },
    statsMissing: {
      title: "Statistiques du Registre foncier non publiées pour ce territoire",
      body: (name: string) =>
        `Aucune statistique de ventes, d’inscriptions hypothécaires ni d’actes de difficulté financière n’est publiée pour ${name}. Les chiffres de la région restent disponibles sur la page régionale.`,
      action: (region: string) => `Voir la région ${region}`,
    },
  },
  charts: {
    salesTitle: "Ventes par période",
    salesBody:
      "Nombre de ventes publiées par période. Une période non publiée reste vide dans le graphique.",
    salesTitleFor: (name: string) => `Ventes par période — ${name}`,
    salesDescFor: (name: string, periodLine: string | null) =>
      `Ventes publiées par le Registre foncier pour ${name}${periodLine ? `, ${periodLine.toLowerCase()}` : ""}. Les périodes sans publication ne sont pas dessinées.`,
    salesCaptionFor: (name: string) => `Ventes par période, ${name}`,
    salesEmptyTitle: "Aucune vente publiée",
    salesEmptyBody:
      "Le Registre foncier ne publie aucune vente pour ce territoire sur la fenêtre affichée. Aucun graphique n’est dessiné à partir d’un zéro.",
    bandsTitle: "Ventes par tranche de prix",
    bandsBody: "Somme des ventes sur la fenêtre, par tranche de prix du Registre foncier.",
    bandsTitleFor: (name: string) => `Ventes par tranche de prix — ${name}`,
    bandsDescFor: (name: string, window: string) =>
      `Répartition des ventes de ${name} par tranche de prix du Registre foncier, sur ${window}.`,
    bandsCaptionFor: (name: string) => `Ventes par tranche de prix, ${name}`,
    bandsEmptyTitle: "Tranches de prix non publiées",
    bandsEmptyBody:
      "Aucune vente ventilée par tranche de prix n’est publiée pour ce territoire et cette fenêtre.",
    medianBandNote: (label: string) =>
      `Tranche médiane : ${label} — tranche où se situe la 50e vente; ce n’est pas un prix moyen et aucun prix n’est dérivé des tranches.`,
  },
  components: {
    municipalityTable: {
      caption: (region: string) =>
        `Municipalités de la région ${region} : unités au rôle, valeur médiane au rôle, superficie médiane du terrain et disponibilité des statistiques du Registre foncier.`,
      municipality: "Municipalité",
      units: "Unités au rôle",
      medianValue: "Valeur médiane au rôle",
      medianArea: "Terrain médian",
      registre: "Registre foncier",
      rollMissing: "Rôle non ingéré",
      published: "Publiées",
      notPublished: "Non publiées",
      emptyTitle: "Aucune municipalité rattachée à cette région",
      emptyBody:
        "Le répertoire des municipalités n’est pas encore chargé pour cette région. Les chiffres de marché ci-dessus restent valides; la liste des municipalités apparaîtra dès l’ingestion du répertoire.",
    },
    typeFilter: {
      label: "Filtrer l’inventaire par type de propriété",
    },
  },
  loading: {
    message: "Chargement des données du marché immobilier…",
  },
  error: {
    title: "Impossible de charger les données du marché",
    body: "Une erreur est survenue pendant la lecture des données. Réessayez; si le problème persiste, revenez à l’index du marché ou consultez les sources officielles.",
    retry: "Réessayer",
    back: "Retour au marché",
  },
  notFound: {
    title: "Territoire introuvable",
    body: "Cette page de marché n’existe pas : le code ou le slug demandé ne correspond à aucune région ou municipalité connue. Vérifiez l’adresse ou repartez de l’index du marché.",
    action: "Explorer le marché",
  },
};

export type MarketMessages = typeof fr;

const en: MarketMessages = {
  common: {
    home: "Home",
    market: "Housing market",
    breadcrumbsLabel: "Breadcrumb",
    coverageWarning: "Incomplete coverage",
    coverageInfo: "Note",
    official: "Official data",
    registre: "Registre foncier",
    pending: "Data pending",
    sourceSection: "Sources and licences",
    dataAndLicences: "Data and licences",
    backToRegions: "All regions",
    backToMarket: "Back to the market",
    retry: "Try again",
    noValue: "—",
  },
  window: {
    last12: "Last 12 published periods",
    published: (count: number) => `${count} published periods`,
    covered: (first: string, last: string) => `Covered period: ${first} to ${last}`,
    latest: (period: string) => `Latest period: ${period}`,
    rollYear: (year: number) => `${year} roll`,
  },
  chartUi: {
    viewValues: "View values",
    bandColumn: "Price band",
    shareColumn: "Share",
    periodColumn: "Period",
    sales: "Sales",
    units: "Units",
  },
  bands: {
    range: (min: string, max: string) => `${min} to ${max}`,
    lessThan: (max: string) => `Under ${max}`,
    andUp: (min: string) => `${min} and over`,
  },
  propertyTypes: {
    unifamiliale: "Single-family",
    copropriete: "Condo",
    plex: "Plex",
    terrain: "Land",
    nonResidentiel: "Non-residential",
    autre: "Other",
    all: "All types",
  },
  index: {
    meta: {
      title: "Quebec housing market, region by region",
      description:
        "Sales, mortgage registrations and financial-difficulty acts from the Registre foncier, region by region, with assessment-roll coverage and the source of every figure.",
    },
    eyebrow: "Official data · Registre foncier",
    title: "Quebec’s housing market, region by region",
    lead: "Sales, mortgage registrations and financial-difficulty acts compiled from Registre foncier statistics, completed by the assessment roll when it is ingested. No figure is displayed without its source.",
    regionsSection: {
      eyebrow: "Administrative regions",
      title: "Choose a region",
      description:
        "Each region leads to its market statistics and to the list of its municipalities covered by the assessment roll.",
    },
    summary: {
      regions: "Regions listed",
      withStats: "Regions with statistics",
      municipalities: "Municipalities with a roll",
      unitsHint: (count: string) => `${count} ingested units`,
      latest: "Most recent period",
      latestHint: "Registre foncier",
    },
    empty: {
      title: "No market data is loaded yet",
      body1:
        "The territory registry, the Registre foncier statistics and the assessment roll are not ingested in this instance yet. This page will list the administrative regions, their sales by price band and their covered municipalities as soon as the database is loaded.",
      body2:
        "No estimate is shown in the meantime: a missing figure stays missing, it is never replaced by a zero.",
      action: "See the data sources",
    },
    statsMissing: {
      title: "Registre foncier statistics are not loaded yet",
      body: "Territories are known, but no sales, mortgage or financial-difficulty statistics are available yet. The cards below therefore show no amount.",
      action: "See the data sources",
    },
    card: {
      sales: "Sales · 12 periods",
      mortgages: "Mortgage registrations",
      difficulties: "Difficulty acts",
      medianBand: "Median sales band",
      noStats:
        "No statistics published for this region. The region page will open on the coverage state, with no invented figures.",
      coverage: (covered: string, total: string, units: string) =>
        `${covered} / ${total} municipalities with an ingested roll · ${units} units`,
      rollMissing: "Assessment roll not ingested for this region",
      medianRoll: (value: string) => ` · median assessed value: ${value}`,
    },
    method: {
      eyebrow: "Method",
      title: "How to read these figures",
      window: {
        title: "A 12-period window",
        body1:
          "Sales, mortgage registrations and financial-difficulty act totals cover the last 12 monthly periods published by the Registre foncier. The most recent period is shown on every page.",
        body2:
          "An unpublished period stays empty: it is never counted as zero in charts or tables.",
      },
      median: {
        title: "A median band, not an average price",
        body1:
          "The median sales band is the price band containing the 50th sale of the window. It is a fact computed from the bands published by the Registre foncier, not an average price.",
        body2:
          "No price is estimated from the bands: we derive neither an average nor a median price from those bounds.",
      },
      roll: {
        title: "Roll values: medians of the ingested units",
        body: "Median assessed values cover the units actually ingested for a municipality, not the whole territory. The median is computed on exact values; with an even number of units it interpolates between the two central values.",
      },
      coverage: {
        title: "Explicit coverage",
        body: "A municipality without an ingested roll shows “roll not ingested” and dashes. A region without statistics shows a coverage note. This page never fills a gap with a zero.",
      },
    },
  },
  region: {
    meta: {
      title: (name: string) => `${name} — housing market and assessment roll`,
      description: (name: string) =>
        `Sales by price band, mortgage registrations and financial-difficulty acts for the ${name} region, and assessment-roll inventory for covered municipalities.`,
    },
    eyebrow: "Administrative region",
    lead: "Sales and financing registered with the Registre foncier du Québec, and assessment-roll inventory for covered municipalities.",
    stats: {
      title: "Registre foncier statistics",
      subtitle: (window: string) => `${window} · sums of the rows published for the region.`,
      sales: "Sales",
      mortgages: "Mortgage registrations",
      difficulties: "Difficulty acts",
      difficultiesHint: "Financial-difficulty acts",
      municipalities: "Municipalities with a roll",
      municipalitiesHint: "Ingested roll units",
      medianRoll: "Median assessed value",
      medianLandHint: (area: string) => `Median land area: ${area}`,
      medianRollHint: "Ingested units only",
    },
    statsMissing: {
      title: "Registre foncier statistics not published for this region",
      body: (name: string) =>
        `Sales, mortgage registrations and financial-difficulty acts are not loaded for ${name} yet. We show no total at zero: the page will be completed as soon as the official source is ingested.`,
      action: "See the data sources",
    },
    municipalities: {
      title: "Municipalities",
      body: "Each municipality leads to its market and, when ingested, to its assessment-roll inventory.",
      badgeNoStats: "Municipal statistics not published",
      rollMissingTitle: "Assessment roll not ingested for this region",
      rollMissingBody:
        "The Registre foncier statistics above remain valid. However, no assessment-roll unit is loaded for the municipalities of this region: no median value or land area is shown.",
      rollMissingAction: "Understand coverage",
      footnote: (units: string, area: string | null) =>
        `Median assessed value computed on the units actually ingested for the region (${units} units)${area ? `, median land area ${area}` : ""}. The median interpolates between the two central values when the number of units is even.`,
    },
  },
  municipality: {
    meta: {
      title: (name: string) => `${name} — housing market and assessment roll`,
      description: (name: string, region: string) =>
        `Housing market and assessment-roll inventory for ${name} (${region}): sales by price band, Registre foncier statistics and median assessed values.`,
    },
    eyebrow: "Municipality",
    lead: (region: string) => `Housing market and assessment-roll inventory — ${region}.`,
    filter: {
      label: "Filter the inventory by property type",
      title: "Property type",
      note: "The filter applies to roll values and land areas. Registre foncier statistics are not broken down by property type.",
    },
    roll: {
      title: "Assessment-roll inventory",
      body: "Assessment-roll units ingested for this municipality, by property type.",
      badge: "Assessment roll",
      unitsHint: (count: string) => `${count} ingested units`,
      unitsLabel: "Units",
      medianValue: "Median value",
      medianArea: "Median land area",
      bandsTitle: "Roll values by band",
      bandsBody: (count: string) =>
        `Distribution of ${count} units. Bands built from the real roll values, bounds rounded to $10,000 and displayed as-is.`,
      bandsChartTitle: (name: string) => `Roll values by band — ${name}`,
      bandsChartDesc: (name: string, count: string) =>
        `Distribution of the assessment values of ${count} units ingested for ${name}, by band built from the real values.`,
      bandsCaption: (name: string) => `Roll values by band, ${name}`,
      tableCaption: (name: string) => `Assessment-roll inventory of ${name} by property type.`,
      tableType: "Property type",
      ratioNote:
        "Median assessed value: median of the property values (RL0404A) of the ingested units. The median interpolates between the two central values when the number of units is even.",
      emptyTypeTitle: "No unit of this type",
      emptyTypeBody:
        "The ingested roll contains no unit of this type for this municipality. Remove the filter to see the full inventory.",
      removeFilter: "Remove the filter",
      notCoveredTitle: "Roll not ingested for this territory",
      notCoveredBody:
        "No assessment-roll unit is loaded for this municipality. We show neither value nor land area rather than zeros.",
      notCoveredAction: "Understand coverage",
    },
    backToRegion: (region: string) => `Back to ${region}`,
    regionStatsTitle: (region: string) => `Regional statistics — ${region}`,
    regionStatsNote: (region: string) =>
      `The Registre foncier does not publish municipal-level statistics for this territory. The figures below cover the whole ${region} region and therefore do not describe this municipality alone.`,
    stats: {
      title: "Registre foncier statistics",
      subtitle: (window: string) => `${window} · sums of the rows published for the municipality.`,
    },
    statsMissing: {
      title: "Registre foncier statistics not published for this territory",
      body: (name: string) =>
        `No sales, mortgage registration or financial-difficulty act statistic is published for ${name}. The region figures remain available on the region page.`,
      action: (region: string) => `See the ${region} region`,
    },
  },
  charts: {
    salesTitle: "Sales by period",
    salesBody: "Number of sales published per period. An unpublished period stays empty in the chart.",
    salesTitleFor: (name: string) => `Sales by period — ${name}`,
    salesDescFor: (name: string, periodLine: string | null) =>
      `Sales published by the Registre foncier for ${name}${periodLine ? `, ${periodLine.toLowerCase()}` : ""}. Periods without a publication are not drawn.`,
    salesCaptionFor: (name: string) => `Sales by period, ${name}`,
    salesEmptyTitle: "No published sale",
    salesEmptyBody:
      "The Registre foncier publishes no sale for this territory in the displayed window. No chart is drawn from a zero.",
    bandsTitle: "Sales by price band",
    bandsBody: "Sum of sales over the window, by Registre foncier price band.",
    bandsTitleFor: (name: string) => `Sales by price band — ${name}`,
    bandsDescFor: (name: string, window: string) =>
      `Distribution of ${name} sales by Registre foncier price band, over ${window}.`,
    bandsCaptionFor: (name: string) => `Sales by price band, ${name}`,
    bandsEmptyTitle: "Price bands not published",
    bandsEmptyBody:
      "No sale broken down by price band is published for this territory and window.",
    medianBandNote: (label: string) =>
      `Median band: ${label} — the band containing the 50th sale; this is not an average price and no price is derived from the bands.`,
  },
  components: {
    municipalityTable: {
      caption: (region: string) =>
        `Municipalities of the ${region} region: roll units, median assessed value, median land area and availability of Registre foncier statistics.`,
      municipality: "Municipality",
      units: "Roll units",
      medianValue: "Median assessed value",
      medianArea: "Median land area",
      registre: "Registre foncier",
      rollMissing: "Roll not ingested",
      published: "Published",
      notPublished: "Not published",
      emptyTitle: "No municipality attached to this region",
      emptyBody:
        "The municipality registry is not loaded for this region yet. The market figures above remain valid; the municipality list will appear once the registry is ingested.",
    },
    typeFilter: {
      label: "Filter the inventory by property type",
    },
  },
  loading: {
    message: "Loading housing market data…",
  },
  error: {
    title: "Unable to load the market data",
    body: "An error occurred while reading the data. Try again; if the problem persists, go back to the market index or check the official sources.",
    retry: "Try again",
    back: "Back to the market",
  },
  notFound: {
    title: "Territory not found",
    body: "This market page does not exist: the requested code or slug matches no known region or municipality. Check the address or start again from the market index.",
    action: "Explore the market",
  },
};

const dictionaries: Record<Locale, MarketMessages> = { fr, en };

export function messagesFor(locale: Locale): MarketMessages {
  return dictionaries[locale];
}

export { fr as marketFr, en as marketEn };
