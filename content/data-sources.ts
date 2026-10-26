/**
 * Curated catalogue of the official datasets MaMaisonQC relies on.
 *
 * The `dataset` table is the runtime source of truth (one row per ingested file, with row count
 * and fetch date). This file supplies the parts that are editorial rather than ingested:
 * what each dataset feeds on the site, and its known limitations. It also lets `/donnees`
 * stay honest before the first ingestion: it lists the official portals, never invented counts.
 *
 * Every URL below was verified against the publisher's own site; see docs/DATA-CONTRACT.md.
 */
export type KnownDataset = {
  /** Matches the `dataset.id` written by the pipeline, or `runtime:<id>` for non-ingested calls. */
  id: string;
  name: string;
  publisher: string;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string;
  feeds: string;
  limitations: string[];
};

export const CC_BY_URL = "https://www.donneesquebec.ca/licence/#cc-by";

export const KNOWN_DATASETS: KnownDataset[] = [
  {
    id: "role-evaluation",
    name: "Rôle d'évaluation foncière du Québec",
    publisher: "Ministère des Affaires municipales et de l'Habitation (MAMH)",
    license: "CC-BY 4.0",
    licenseUrl: CC_BY_URL,
    sourceUrl: "https://donneesouvertes.affmunqc.net/role/indexRole2026.csv",
    feeds:
      "Valeur au rôle (immeuble, terrain, bâtiment, rôle antérieur), unité de voisinage, catégorie d'usage, superficie, année de construction, date de référence du marché — donc les fiches d'évaluation et les comparables.",
    limitations: [
      "La valeur au rôle est une valeur réelle établie à une date de référence, pas un prix de marché du jour.",
      "Le rôle est triennal : la valeur inscrite sert de base d'imposition pendant trois ans.",
      "La couverture de la v1 est partielle : seules les municipalités ingérées ont des fiches; les autres affichent un avis de couverture.",
      "Les données physiques sont vérifiées par l'évaluateur à intervalles prévus par la loi, pas à chaque transaction.",
    ],
  },
  {
    id: "registre-foncier-stats",
    name: "Statistiques du Registre foncier du Québec sur le marché immobilier",
    publisher: "Registre foncier du Québec (ministère des Ressources naturelles et des Forêts)",
    license: "CC-BY 4.0",
    licenseUrl: CC_BY_URL,
    sourceUrl:
      "https://www.donneesquebec.ca/recherche/dataset/statistiques-du-registre-foncier-du-quebec-sur-le-marche-immobilier",
    feeds:
      "Volume de ventes par région et par plage de prix, transferts de propriété, hypothèques inscrites et actes de difficulté financière — donc les pages de marché et Le Brief.",
    limitations: [
      "Ce sont des nombres d'actes, pas des nombres de propriétés ni de personnes : seul le premier droit d'un acte est comptabilisé.",
      "Les ventes sont regroupées en trois plages de prix; la source ne publie aucun prix moyen.",
      "Les données sont diffusées par région administrative (reconstituée à partir des circonscriptions foncières), pas par municipalité ni par quartier.",
      "Le Nord-du-Québec est réparti entre le Saguenay–Lac-Saint-Jean, l'Abitibi-Témiscamingue et la Côte-Nord.",
    ],
  },
  {
    id: "mamh-municipalites",
    name: "Répertoire des municipalités du Québec",
    publisher: "Ministère des Affaires municipales et de l'Habitation (MAMH)",
    license: "CC-BY 4.0",
    licenseUrl: CC_BY_URL,
    sourceUrl: "https://www.donneesquebec.ca/recherche/dataset/repertoire-des-municipalites-du-quebec",
    feeds:
      "Hiérarchie des territoires (province, région administrative, MRC, municipalité) et codes géographiques utilisés dans les routes et les agrégations.",
    limitations: [
      "C'est un référentiel administratif : les limites et les codes peuvent évoluer entre deux diffusions.",
      "Il ne contient aucune donnée de valeur immobilière.",
    ],
  },
  {
    id: "cubf",
    name: "Liste des codes d'utilisation des biens-fonds (CUBF)",
    publisher: "Ministère des Affaires municipales et de l'Habitation (MAMH)",
    license: "Licence de gouvernement ouvert du Québec",
    licenseUrl: null,
    sourceUrl:
      "https://www.quebec.ca/habitation-territoire/information-fonciere/evaluation-fonciere/manuel/codes-utilisation-biens-fonds",
    feeds:
      "Libellé de la catégorie d'usage et regroupement en types de propriété (unifamiliale, copropriété, plex, terrain, autre) pour les filtres de marché.",
    limitations: [
      "Le regroupement en types de propriété est une décision de MaMaisonQC, documentée dans nos notes d'ingestion; les codes non reconnus restent « autre ».",
      "Un code d'usage décrit l'utilisation prédominante, pas l'état réel du bâtiment.",
    ],
  },
  {
    id: "adresses-quebec",
    name: "Adresses Québec — service de géocodage",
    publisher: "Ministère des Ressources naturelles et des Forêts (MERN)",
    license: "CC-BY 4.0",
    licenseUrl: CC_BY_URL,
    sourceUrl:
      "https://servicescarto.mrnf.gouv.qc.ca/pes/rest/services/Territoire/Adresse_Geocodage/GeocodeServer",
    feeds:
      "Recherche d'adresse : suggestions de civic, rue, ville, code postal et coordonnées, avant le rattachement au rôle d'évaluation.",
    limitations: [
      "Service appelé au moment de la recherche (non ingéré), avec délai d'attente et repli sur une liste vide en cas d'indisponibilité.",
      "Une adresse trouvée n'est pas nécessairement couverte par le rôle ingéré : la fiche peut afficher un avis de couverture.",
      "Aucune adresse n'est inventée : si le service ne retourne rien, le site le dit.",
    ],
  },
];

/** Editorial description used for rows whose id is not in the curated list above. */
export function describeDataset(id: string): { feeds: string; limitations: string[] } {
  const known = KNOWN_DATASETS.find((dataset) => id.startsWith(dataset.id));
  if (known) return { feeds: known.feeds, limitations: known.limitations };
  return {
    feeds:
      "Jeu de données enregistré par le pipeline d'ingestion; il alimente les pages de données publiques.",
    limitations: [
      "Aucune limite éditoriale spécifique n'est encore documentée pour ce jeu de données.",
    ],
  };
}

/** Limitations that apply to the product as a whole, not to a single dataset. */
export const SITE_LIMITATIONS: string[] = [
  "Les estimations MaMaisonQC sont indicatives : ce ne sont ni des évaluations agréées, ni des avis d'évaluateur agréé, ni des garanties de prix.",
  "La v1 couvre un sous-ensemble de municipalités; toute zone non ingérée affiche un avis de couverture au lieu de zéros.",
  "Aucune donnée de Centris, d'OpenHouseQC ou d'un autre site de courtage n'est utilisée : uniquement des sources ouvertes du gouvernement du Québec.",
  "Les chiffres affichés portent leur source, leur licence et leur date; un chiffre sans source n'est pas publié.",
];
