import type { Locale } from "@/i18n/config";

/**
 * Renovation subsidy reference, authored from the official programme pages fetched on 2026-10-26.
 *
 * Rules for this file:
 * - every amount, eligibility rule and date below was read on the cited official page on that date;
 * - when a detail could not be verified, it is NOT invented: it goes to `unverified` and the page
 *   tells the reader to check with the programme;
 * - `verifiedOn` is the ISO date of the consultation, not the programme's own update date (kept in
 *   `pageUpdated` when the source displays one).
 */
export const SUBSIDY_SLUGS = [
  "renoclimat",
  "renoclimat-adaptation",
  "logisvert",
  "logisvert-revenu-modeste",
  "maisons-abordables-plus-vertes",
] as const;

export type SubsidySlug = (typeof SUBSIDY_SLUGS)[number];
export type SubsidyStatus = "open" | "closed" | "variable" | "unknown";

export type SubsidyAmount = {
  measure: string;
  amount: string;
  note?: string;
};

export type SubsidySource = {
  label: string;
  publisher: string;
  url: string;
  /** ISO date of consultation. */
  verifiedOn: string;
  /** ISO date displayed by the source itself, when it shows one. */
  pageUpdated?: string;
};

export type SubsidyPage = {
  slug: SubsidySlug;
  navLabel: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  programName: string;
  publisher: string;
  status: SubsidyStatus;
  summary: string[];
  amounts: SubsidyAmount[];
  amountsNote?: string;
  eligibility: string[];
  steps: string[];
  deadlines: string[];
  unverified: string[];
  sources: SubsidySource[];
  relatedSlugs: SubsidySlug[];
  /** True when the programme is aimed at organisations, not individual owner-occupants. */
  notForIndividuals?: boolean;
};

const VERIFIED_ON = "2026-10-26";

const renoclimatUrl =
  "https://www.quebec.ca/habitation-territoire/chauffage-consommation-energie/aide-financiere-renovation-ecoenergetique/renoclimat";
const renoclimatAmountsUrl = `${renoclimatUrl}/aide-financiere`;
const renoclimatConditionsUrl = `${renoclimatUrl}/conditions`;
const renoclimatChangesUrl = `${renoclimatUrl}/nouveautes-adaptation-inondations`;
const logisvertUrl =
  "https://www.hydroquebec.com/residentiel/mieux-consommer/aides-financieres/logisvert/";
const logisvertResidentialUrl = `${logisvertUrl}residentiel.html`;
const logisvertModestUrl = `${logisvertUrl}menages-revenu-modeste/`;
const cmhcGreenerUrl =
  "https://www.cmhc-schl.gc.ca/professionnels/financement-de-projets-et-financement-hypothecaire/programmes-de-financement/toutes-les-opportunites-de-financement/programme-canadien-pour-des-logements-abordables-plus-verts";

const fr: SubsidyPage[] = [
  {
    slug: "renoclimat",
    navLabel: "Rénoclimat — efficacité énergétique",
    title: "Rénoclimat : aide financière pour la rénovation écoénergétique",
    metaTitle: "Rénoclimat : montants et admissibilité vérifiés",
    metaDescription:
      "Montants, travaux admissibles et critères de Rénoclimat pour une maison, un duplex, un triplex ou un petit immeuble, avec les sources officielles.",
    programName: "Rénoclimat — volet Efficacité énergétique",
    publisher: "Gouvernement du Québec",
    status: "open",
    summary: [
      "Rénoclimat soutient les travaux qui améliorent la performance énergétique d'une habitation : isolation, fenêtres, étanchéité, systèmes mécaniques, raccordement à une source de secours et ajout d'une batterie fixe.",
      "Depuis le 1er octobre 2026, l'évaluation énergétique avant travaux n'est plus obligatoire, mais elle reste recommandée et une aide financière est offerte pour la faire réaliser.",
      "Le programme indique que les travaux doivent être exécutés par un entrepreneur détenant les licences appropriées et que les pièces justificatives doivent être conservées en attendant le portail de demande.",
    ],
    amounts: [
      {
        measure: "Isolation du toit",
        amount: "2 000 $ / 5 000 $",
        note: "Maison / duplex, triplex ou IRLM.",
      },
      {
        measure: "Isolation des murs extérieurs",
        amount: "7 000 $ / 11 000 $",
        note: "Maison / duplex, triplex ou IRLM.",
      },
      {
        measure: "Isolation des fondations",
        amount: "2 500 $ / 3 500 $",
        note: "Maison / duplex, triplex ou IRLM.",
      },
      {
        measure: "Remplacement de fenêtres",
        amount: "4 500 $ / 6 000 $",
        note: "Maison / duplex, triplex ou IRLM; 300 $ par fenêtre.",
      },
      {
        measure: "Raccordement à une source de secours",
        amount: "1 000 $",
        note: "Nouvelle mesure pour les résidences principales et les IRLM seulement.",
      },
      {
        measure: "Ajout d'une batterie fixe",
        amount: "4 000 $",
        note: "Nouvelle mesure pour les résidences principales et les IRLM seulement.",
      },
      {
        measure: "Évaluation énergétique",
        amount: "500 $",
        note: "Recommandée mais facultative.",
      },
    ],
    amountsNote:
      "Montants maximaux publiés dans le tableau des nouveautés en vigueur depuis le 1er octobre 2026. Les montants réels dépendent des travaux et des règles du programme.",
    eligibility: [
      "Propriétaires d'une habitation unifamiliale (individuelle, jumelée, en rangée, maison mobile, maison de chambres, chalet quatre saisons), d'un duplex, d'un triplex ou d'un petit immeuble résidentiel d'au plus trois étages hors sol et d'une superficie au sol maximale de 600 m².",
      "Le propriétaire peut être un particulier, une succession, une fiducie, une entreprise, un syndicat de copropriété, un organisme à but non lucratif ou un conseil de bande.",
      "L'habitation doit être située au Québec, habitable à l'année, avoir une enveloppe en état convenable pour le test d'étanchéité et avoir été construite et habitable depuis au moins 12 mois avant la participation.",
      "Autres critères : vocation résidentielle sur plus de 50 % de la superficie, fondations permanentes, chauffage capable de maintenir 21 °C, entrée électrique, eau potable, service d'égouts ou installation septique, au moins une chambre, une salle de bain et une cuisine fonctionnelle.",
      "Pour un condominium, l'évaluation doit porter sur l'ensemble du bâtiment et l'inscription doit être faite au nom du syndicat de copropriété, qui reçoit l'aide.",
      "Les travaux doivent améliorer la performance énergétique et être réalisés par un entrepreneur détenant les licences appropriées (RBQ, CMMTQ ou CMEQ selon les travaux).",
    ],
    steps: [
      "Choisir les travaux et vérifier qu'ils figurent parmi les mesures admissibles.",
      "Retenir un entrepreneur licencié et conserver les factures détaillées.",
      "Faire réaliser les travaux après le 1er octobre 2026 et remplir le formulaire d'attestation de conformité signé par l'entrepreneur.",
      "S'inscrire au formulaire d'avis pour être informé de l'ouverture du portail de demande, puis déposer la demande avec les pièces justificatives.",
    ],
    deadlines: [
      "1er octobre 2026 : entrée en vigueur des nouvelles modalités et des nouveaux montants.",
      "31 mars 2027 : date limite pour faire réaliser l'évaluation énergétique après travaux dans le cadre de la période de transition, si une évaluation avant travaux a déjà été faite selon les anciennes modalités.",
      "Portail de demande : annoncé comme devant être mis à disposition au cours de l'automne 2026; aucune date précise n'est publiée.",
    ],
    unverified: [
      "La date exacte d'ouverture du portail de demande n'est pas publiée à la date de vérification.",
      "Les critères de reconnaissance des professionnels qui réaliseront les diagnostics du volet Adaptation sont annoncés comme étant en élaboration.",
      "Les règles propres à certains produits (modèles de portes et fenêtres, systèmes mécaniques) ne sont pas détaillées sur la page consultée; consultez le guide du participant.",
    ],
    sources: [
      {
        label: "Aide financière Rénoclimat",
        publisher: "Gouvernement du Québec",
        url: renoclimatUrl,
        verifiedOn: VERIFIED_ON,
        pageUpdated: "2026-10-13",
      },
      {
        label: "Nouveautés et tableau des montants",
        publisher: "Gouvernement du Québec",
        url: renoclimatChangesUrl,
        verifiedOn: VERIFIED_ON,
        pageUpdated: "2026-10-13",
      },
      {
        label: "Conditions d'admissibilité",
        publisher: "Gouvernement du Québec",
        url: renoclimatConditionsUrl,
        verifiedOn: VERIFIED_ON,
        pageUpdated: "2026-10-13",
      },
      {
        label: "Montants de l'aide financière",
        publisher: "Gouvernement du Québec",
        url: renoclimatAmountsUrl,
        verifiedOn: VERIFIED_ON,
        pageUpdated: "2026-10-13",
      },
    ],
    relatedSlugs: ["renoclimat-adaptation", "logisvert"],
  },
  {
    slug: "renoclimat-adaptation",
    navLabel: "Rénoclimat — Adaptation",
    title: "Rénoclimat – Adaptation : protéger sa résidence contre les inondations",
    metaTitle: "Rénoclimat Adaptation : montants et parcours",
    metaDescription:
      "Rénoclimat Adaptation finance des mesures préventives contre les inondations : pompe submersible, clapet antiretour, batardeau et travaux de résilience.",
    programName: "Rénoclimat — volet Adaptation",
    publisher: "Gouvernement du Québec",
    status: "open",
    summary: [
      "Le volet Adaptation offre une aide préventive aux propriétaires qui souhaitent réduire le risque d'accumulation et d'infiltration d'eau dans leur habitation.",
      "Deux parcours existent : un parcours simplifié pour des mesures ciblées, et un parcours accompagné réservé aux personnes qui résident en zone inondable, qui commence par un diagnostic de résilience climatique.",
      "Le programme s'adresse aux résidences principales et aux immeubles résidentiels à logements multiples. Il ne remplace pas l'aide d'urgence après un sinistre admissible, qui relève d'un autre programme.",
    ],
    amounts: [
      {
        measure: "Pompe submersible avec batterie (parcours simplifié)",
        amount: "1 000 $",
      },
      { measure: "Clapet antiretour (parcours simplifié)", amount: "700 $" },
      { measure: "Batardeau amovible (parcours simplifié)", amount: "800 $" },
      {
        measure: "Diagnostic de résilience climatique (parcours accompagné, obligatoire)",
        amount: "1 000 $",
      },
      {
        measure: "Protection des fondations et travaux de résilience (parcours accompagné)",
        amount: "35 000 $ ou 75 % des dépenses admissibles",
        note: "Dépenses payées avant les taxes applicables; la règle exacte est détaillée sur la page officielle.",
      },
    ],
    amountsNote:
      "Montants maximaux publiés dans le tableau du volet Adaptation. Les mesures exactes du parcours accompagné sont décrites sur la page officielle.",
    eligibility: [
      "Propriétaires d'une résidence principale ou d'un immeuble résidentiel à logements multiples, selon le parcours.",
      "Parcours simplifié : mesures préventives ciblées, sans diagnostic préalable selon la page officielle.",
      "Parcours accompagné : réservé aux citoyens qui résident en zone inondable, avec un diagnostic de résilience climatique obligatoire au départ.",
      "Les travaux doivent être réalisés après le 1er octobre 2026 par un entrepreneur détenant les licences appropriées, et les pièces justificatives doivent être conservées.",
    ],
    steps: [
      "Déterminer si l'habitation est en zone inondable, ce qui détermine le parcours accessible.",
      "Pour le parcours accompagné, faire réaliser le diagnostic de résilience climatique par un professionnel reconnu lorsque la liste sera publiée.",
      "Faire exécuter les travaux par un entrepreneur licencié et conserver factures, attestation et diagnostic.",
      "Déposer la demande lorsque le portail Rénoclimat sera en ligne; s'inscrire au formulaire d'avis en attendant.",
    ],
    deadlines: [
      "1er octobre 2026 : entrée en vigueur du volet Adaptation et des nouveaux montants.",
      "Portail de demande annoncé pour l'automne 2026; aucune date précise n'est publiée.",
      "En cas de sinistre admissible lié à une inondation, l'aide d'urgence relève du Programme général d'assistance financière lors de sinistres, distinct de Rénoclimat.",
    ],
    unverified: [
      "La liste et les critères de reconnaissance des professionnels autorisés à réaliser le diagnostic de résilience climatique sont annoncés comme étant en élaboration.",
      "La date d'ouverture du portail n'est pas publiée.",
      "Le détail de chaque mesure admissible du parcours accompagné au-delà des catégories publiées doit être confirmé dans le guide du participant.",
    ],
    sources: [
      {
        label: "Nouveautés Rénoclimat et volet Adaptation",
        publisher: "Gouvernement du Québec",
        url: renoclimatChangesUrl,
        verifiedOn: VERIFIED_ON,
        pageUpdated: "2026-10-13",
      },
      {
        label: "Aide financière Rénoclimat",
        publisher: "Gouvernement du Québec",
        url: renoclimatUrl,
        verifiedOn: VERIFIED_ON,
        pageUpdated: "2026-10-13",
      },
    ],
    relatedSlugs: ["renoclimat", "logisvert"],
  },
  {
    slug: "logisvert",
    navLabel: "LogisVert — clientèle résidentielle",
    title: "LogisVert : subventions résidentielles d'Hydro-Québec",
    metaTitle: "LogisVert : subventions résidentielles 2026",
    metaDescription:
      "Thermopompe, isolation, panneaux solaires, accumulateur de chaleur : montants publiés par Hydro-Québec pour la clientèle résidentielle du programme LogisVert.",
    programName: "Programme LogisVert — clientèle résidentielle",
    publisher: "Hydro-Québec",
    status: "open",
    summary: [
      "LogisVert verse une subvention pour la mise en place de mesures d'efficacité énergétique dans une habitation, que le demandeur soit locataire ou propriétaire d'une maison, d'une copropriété, d'un plex ou d'un immeuble multilogement.",
      "Les mesures couvrent notamment la thermopompe, la cuisinière à induction, la sécheuse à pompe à chaleur, l'isolation de toit et le calfeutrage, la pompe de piscine efficace, les panneaux solaires, l'accumulateur de chaleur et la thermopompe géothermique.",
      "Le programme majore la subvention de 5 % lorsque plusieurs mesures sont soumises dans une même demande, selon l'annexe du guide de participation.",
    ],
    amounts: [
      { measure: "Thermopompe", amount: "Jusqu'à 6 700 $", note: "Montant plus élevé pour une thermopompe à très haute efficacité." },
      { measure: "Cuisinière à induction", amount: "250 $", note: "Les plaques de cuisson à induction ne sont pas admissibles." },
      { measure: "Sécheuse à pompe à chaleur", amount: "250 $" },
      { measure: "Isolation de toit et calfeutrage", amount: "1 500 $" },
      { measure: "Pompe efficace pour piscine", amount: "Jusqu'à 300 $", note: "Mesure indiquée « dernière chance » sur la page officielle." },
      { measure: "Remplacement d'une thermopompe géothermique", amount: "250 $ par 1 000 BTU/h" },
      { measure: "Panneaux solaires", amount: "1 000 $ par kilowatt installé", note: "La subvention peut couvrir jusqu'à 40 % des coûts d'achat et d'installation." },
      { measure: "Accumulateur de chaleur et thermopompe centrale", amount: "22 000 $" },
      { measure: "Accumulateur de chaleur seul", amount: "15 000 $" },
      { measure: "Thermopompe géothermique", amount: "750 $ par 1 000 BTU/h" },
    ],
    amountsNote:
      "Montants publiés sur la page de la clientèle résidentielle. Chaque mesure a ses propres conditions; le montant réel dépend de l'équipement et de la demande.",
    eligibility: [
      "Locataires ou propriétaires d'une maison, d'une copropriété, d'un plex ou d'un immeuble multilogement, selon les conditions de chaque mesure.",
      "La thermopompe doit figurer sur la liste des appareils admissibles du programme, consultable sur le site d'Hydro-Québec.",
      "Les conditions propres à chaque mesure (équipement, installation, factures) doivent être respectées; le guide de participation les détaille.",
      "Hydro-Québec précise qu'elle ne fait aucune sollicitation téléphonique ou de porte-à-porte pour LogisVert; seules les entreprises autorisées peuvent installer certains équipements.",
    ],
    steps: [
      "Choisir les mesures et vérifier l'équipement admissible avant l'achat.",
      "Calculer le montant estimatif sur le portail LogisVert.",
      "Déposer la demande sur le portail avec les pièces demandées.",
      "Suivre la demande sur le portail; après approbation, la subvention est versée par la poste.",
    ],
    deadlines: [
      "Aucune date de fin n'est affichée pour les mesures résidentielles sur la page consultée; vérifiez le portail avant d'acheter.",
      "La pompe efficace pour piscine est présentée comme une « dernière chance », sans date de fin publiée.",
      "Le 8 octobre 2026, le gouvernement fédéral a annoncé son intention d'offrir des subventions pour les thermopompes à compter de 2027; le détail n'est pas connu et le programme LogisVert reste en vigueur.",
    ],
    unverified: [
      "Les conditions détaillées par mesure (marques, modèles, seuils) ne sont pas toutes reproduites ici; consultez le guide de participation officiel.",
      "Le délai de traitement des demandes n'est pas publié sur la page consultée.",
    ],
    sources: [
      {
        label: "Programme LogisVert",
        publisher: "Hydro-Québec",
        url: logisvertUrl,
        verifiedOn: VERIFIED_ON,
      },
      {
        label: "LogisVert — clientèle résidentielle",
        publisher: "Hydro-Québec",
        url: logisvertResidentialUrl,
        verifiedOn: VERIFIED_ON,
      },
    ],
    relatedSlugs: ["logisvert-revenu-modeste", "renoclimat"],
  },
  {
    slug: "logisvert-revenu-modeste",
    navLabel: "LogisVert — ménages à revenu modeste",
    title: "Thermopompe sans frais pour les ménages à revenu modeste",
    metaTitle: "LogisVert revenu modeste : inscriptions fermées",
    metaDescription:
      "LogisVert offre aux ménages à revenu modeste une thermopompe et son installation sans frais. Inscriptions 2026-2027 fermées : conditions publiées.",
    programName: "LogisVert — thermopompes sans frais pour ménages à revenu modeste",
    publisher: "Hydro-Québec",
    status: "closed",
    summary: [
      "Ce volet offre une thermopompe murale certifiée ENERGY STAR pour climat froid, son installation et un accompagnement, sans frais pour le ménage admissible.",
      "L'offre passe par Éconologis, un programme du gouvernement du Québec qui aide les ménages à revenu modeste à améliorer le confort et l'efficacité énergétique de leur logement en hiver.",
      "Hydro-Québec indique que les inscriptions pour la saison 2026-2027 sont fermées, afin de traiter les demandes déjà reçues, et que seules les entreprises autorisées par Hydro-Québec peuvent installer les thermopompes.",
    ],
    amounts: [
      {
        measure: "Thermopompe murale, installation et accompagnement",
        amount: "Sans frais pour le ménage admissible",
        note: "Aucun montant en dollars n'est publié : l'offre couvre l'appareil et l'installation.",
      },
      {
        measure: "Thermostats intelligents (autre mesure possible)",
        amount: "Installation sans frais selon admissibilité",
        note: "Hydro-Québec mentionne cette option pour les personnes qui ne sont pas admissibles à la thermopompe.",
      },
    ],
    amountsNote:
      "Le programme ne publie pas de montant en dollars : il s'agit d'une installation sans frais. Les critères de revenu ne sont pas reproduits sur la page consultée.",
    eligibility: [
      "Ménages à revenu modeste, selon les critères du programme Éconologis et de LogisVert.",
      "Locataires, propriétaires occupants et propriétaires locateurs : les démarches peuvent différer, et le locataire doit généralement commencer la demande selon la page officielle.",
      "Le logement doit se trouver dans une région où le service d'installation est offert; le déploiement est progressif.",
      "Seules les entreprises autorisées par Hydro-Québec peuvent installer les thermopompes sans frais.",
    ],
    steps: [
      "Vérifier son admissibilité sur la page officielle du volet revenu modeste.",
      "Suivre le parcours correspondant à sa situation (locataire, propriétaire occupant ou propriétaire locateur).",
      "Attendre la communication d'Hydro-Québec dans les régions où le service est offert, les inscriptions 2026-2027 étant fermées.",
      "Ne confier l'installation qu'à une entreprise autorisée par Hydro-Québec.",
    ],
    deadlines: [
      "Inscriptions fermées pour la saison 2026-2027, afin de traiter les demandes déjà reçues.",
      "Aucune date de réouverture n'est publiée sur la page consultée.",
    ],
    unverified: [
      "Les seuils de revenu exacts ne figurent pas sur la page consultée; vérifiez auprès du programme.",
      "La date de réouverture des inscriptions n'est pas publiée.",
      "Les régions déjà desservies et le calendrier de déploiement ne sont pas détaillés sur la page consultée.",
    ],
    sources: [
      {
        label: "Thermopompes sans frais pour ménages à revenu modeste",
        publisher: "Hydro-Québec",
        url: logisvertModestUrl,
        verifiedOn: VERIFIED_ON,
      },
      {
        label: "Programme LogisVert",
        publisher: "Hydro-Québec",
        url: logisvertUrl,
        verifiedOn: VERIFIED_ON,
      },
    ],
    relatedSlugs: ["logisvert", "renoclimat"],
  },
  {
    slug: "maisons-abordables-plus-vertes",
    navLabel: "Maisons abordables plus vertes",
    title: "Programme canadien pour des logements abordables plus verts",
    metaTitle: "Logements abordables plus verts : vérifier la SCHL",
    metaDescription:
      "Programme de la SCHL en financement de projets pour professionnels. Montants non vérifiables : voici la source officielle et les points à confirmer.",
    programName: "Programme canadien pour des logements abordables plus verts",
    publisher: "Société canadienne d'hypothèques et de logement (SCHL)",
    status: "unknown",
    notForIndividuals: true,
    summary: [
      "Ce programme figure dans la section « Professionnels → Financement de projets → Programmes de financement » du site de la SCHL. Son nom indique qu'il porte sur des logements abordables et plus verts.",
      "Les montants, les critères d'admissibilité et les dates n'ont pas pu être extraits de la page officielle lors de notre consultation : le contenu détaillé n'était pas accessible. Nous ne les inventons pas.",
      "Pour la rénovation d'une maison individuelle au Québec, les programmes Rénoclimat et LogisVert sont les références directes présentées dans les autres fiches de cette section.",
    ],
    amounts: [],
    amountsNote:
      "Aucun montant n'est reproduit ici : ils n'ont pas pu être vérifiés sur la page officielle à la date de consultation. Vérifiez auprès du programme.",
    eligibility: [
      "Admissibilité non reproduite : elle n'a pas pu être vérifiée sur la page officielle à la date de consultation.",
      "L'emplacement du programme dans la section destinée aux professionnels et au financement de projets suggère qu'il vise des projets de logement abordable portés par des organismes, et non la rénovation d'une maison individuelle. Confirmez ce point auprès de la SCHL.",
    ],
    steps: [
      "Consulter la page officielle de la SCHL pour connaître les modalités en vigueur.",
      "Communiquer avec la SCHL pour confirmer l'admissibilité de votre projet.",
      "Pour une maison individuelle, consulter plutôt les fiches Rénoclimat et LogisVert de cette section.",
    ],
    deadlines: [
      "Aucune date n'est reproduite : elle n'a pas pu être vérifiée sur la page officielle à la date de consultation.",
    ],
    unverified: [
      "Montants, critères d'admissibilité, dates limites et type de financement (prêt, contribution ou combinaison) : vérifiez auprès du programme.",
      "Le détail du programme n'était pas accessible sur la page officielle lors de la consultation.",
    ],
    sources: [
      {
        label: "Programme canadien pour des logements abordables plus verts",
        publisher: "Société canadienne d'hypothèques et de logement",
        url: cmhcGreenerUrl,
        verifiedOn: VERIFIED_ON,
      },
    ],
    relatedSlugs: ["renoclimat", "logisvert"],
  },
];

const en: SubsidyPage[] = [
  {
    slug: "renoclimat",
    navLabel: "Rénoclimat — energy efficiency",
    title: "Rénoclimat: financial assistance for energy-efficient renovations",
    metaTitle: "Rénoclimat: verified amounts and eligibility",
    metaDescription:
      "Maximum amounts, eligible work and criteria of the Rénoclimat program for a house, duplex, triplex or small building, with official sources.",
    programName: "Rénoclimat — Energy Efficiency stream",
    publisher: "Government of Quebec",
    status: "open",
    summary: [
      "Rénoclimat supports work that improves a home's energy performance: insulation, windows, air sealing, mechanical systems, connection to a backup power source and adding a fixed battery.",
      "Since October 1, 2026, a pre-work energy evaluation is no longer mandatory, but it is still recommended and financial assistance is offered to have one done.",
      "The program states that work must be carried out by a contractor holding the appropriate licences and that supporting documents must be kept until the application portal opens.",
    ],
    amounts: [
      { measure: "Roof insulation", amount: "$2,000 / $5,000", note: "House / duplex, triplex or multi-unit building." },
      { measure: "Exterior wall insulation", amount: "$7,000 / $11,000", note: "House / duplex, triplex or multi-unit building." },
      { measure: "Foundation insulation", amount: "$2,500 / $3,500", note: "House / duplex, triplex or multi-unit building." },
      { measure: "Window replacement", amount: "$4,500 / $6,000", note: "House / duplex, triplex or multi-unit building; $300 per window." },
      { measure: "Connection to a backup power source", amount: "$1,000", note: "New measure for principal residences and multi-unit buildings only." },
      { measure: "Adding a fixed battery", amount: "$4,000", note: "New measure for principal residences and multi-unit buildings only." },
      { measure: "Energy evaluation", amount: "$500", note: "Recommended but optional." },
    ],
    amountsNote:
      "Maximum amounts published in the table of measures in force since October 1, 2026. Actual amounts depend on the work and on the program rules.",
    eligibility: [
      "Owners of a single-family home (detached, semi-detached, row, mobile home, rooming house, four-season cottage), a duplex, a triplex or a small residential building of at most three storeys above ground and a maximum footprint of 600 m².",
      "The owner may be an individual, an estate, a trust, a business, a condominium syndicate, a non-profit organisation or a band council.",
      "The home must be in Quebec, habitable year-round, have an envelope in suitable condition for the airtightness test, and have been built and habitable for at least 12 months before participating.",
      "Other criteria: residential use on more than 50% of the floor area, permanent foundations, heating able to maintain 21°C, an electrical service, drinking water, municipal sewers or a septic system, and at least one bedroom, one bathroom and a functional kitchen.",
      "For a condominium, the evaluation must cover the whole building and the application must be made in the name of the condominium syndicate, which receives the assistance.",
      "The work must improve energy performance and be carried out by a contractor holding the appropriate licences (RBQ, CMMTQ or CMEQ depending on the work).",
    ],
    steps: [
      "Choose the work and check that it is one of the eligible measures.",
      "Retain a licensed contractor and keep detailed invoices.",
      "Have the work done after October 1, 2026, and complete the compliance attestation form signed by the contractor.",
      "Sign up for the notice form to be told when the application portal opens, then submit the application with supporting documents.",
    ],
    deadlines: [
      "October 1, 2026: new terms and new amounts come into force.",
      "March 31, 2027: deadline to have the post-work energy evaluation done under the transition period, if a pre-work evaluation was already done under the former terms.",
      "Application portal: announced as becoming available during autumn 2026; no specific date is published.",
    ],
    unverified: [
      "The exact opening date of the application portal is not published as of the verification date.",
      "The recognition criteria for the professionals who will carry out the Adaptation stream diagnostics are announced as being under development.",
      "Rules specific to some products (door and window models, mechanical systems) are not detailed on the page consulted; see the participant guide.",
    ],
    sources: [
      { label: "Rénoclimat financial assistance", publisher: "Government of Quebec", url: renoclimatUrl, verifiedOn: VERIFIED_ON, pageUpdated: "2026-10-13" },
      { label: "New terms and amounts table", publisher: "Government of Quebec", url: renoclimatChangesUrl, verifiedOn: VERIFIED_ON, pageUpdated: "2026-10-13" },
      { label: "Eligibility conditions", publisher: "Government of Quebec", url: renoclimatConditionsUrl, verifiedOn: VERIFIED_ON, pageUpdated: "2026-10-13" },
      { label: "Financial assistance amounts", publisher: "Government of Quebec", url: renoclimatAmountsUrl, verifiedOn: VERIFIED_ON, pageUpdated: "2026-10-13" },
    ],
    relatedSlugs: ["renoclimat-adaptation", "logisvert"],
  },
  {
    slug: "renoclimat-adaptation",
    navLabel: "Rénoclimat — Adaptation",
    title: "Rénoclimat – Adaptation: protecting your home against flooding",
    metaTitle: "Rénoclimat Adaptation: amounts and streams",
    metaDescription:
      "Rénoclimat Adaptation funds preventive flood measures: submersible pump, backwater valve, flood barrier and resilience work, with official amounts.",
    programName: "Rénoclimat — Adaptation stream",
    publisher: "Government of Quebec",
    status: "open",
    summary: [
      "The Adaptation stream offers preventive assistance to owners who want to reduce the risk of water accumulation and infiltration in their home.",
      "Two streams exist: a simplified stream for targeted measures, and an accompanied stream reserved for people living in flood zones, which starts with a climate resilience diagnosis.",
      "The program is for principal residences and multi-unit residential buildings. It does not replace emergency assistance after an eligible disaster, which falls under another program.",
    ],
    amounts: [
      { measure: "Submersible pump with battery (simplified stream)", amount: "$1,000" },
      { measure: "Backwater valve (simplified stream)", amount: "$700" },
      { measure: "Removable flood barrier (simplified stream)", amount: "$800" },
      { measure: "Climate resilience diagnosis (accompanied stream, mandatory)", amount: "$1,000" },
      {
        measure: "Foundation protection and resilience work (accompanied stream)",
        amount: "$35,000 or 75% of eligible expenses",
        note: "Expenses paid before applicable taxes; the exact rule is detailed on the official page.",
      },
    ],
    amountsNote:
      "Maximum amounts published in the Adaptation stream table. The exact measures of the accompanied stream are described on the official page.",
    eligibility: [
      "Owners of a principal residence or a multi-unit residential building, depending on the stream.",
      "Simplified stream: targeted preventive measures, without a prior diagnosis according to the official page.",
      "Accompanied stream: reserved for residents of flood zones, with a mandatory climate resilience diagnosis at the start.",
      "Work must be carried out after October 1, 2026, by a contractor holding the appropriate licences, and supporting documents must be kept.",
    ],
    steps: [
      "Determine whether the home is in a flood zone, which sets the available stream.",
      "For the accompanied stream, have the climate resilience diagnosis done by a recognised professional once the list is published.",
      "Have the work done by a licensed contractor and keep invoices, the attestation and the diagnosis.",
      "Submit the application once the Rénoclimat portal is online; sign up for the notice form in the meantime.",
    ],
    deadlines: [
      "October 1, 2026: the Adaptation stream and new amounts come into force.",
      "Application portal announced for autumn 2026; no specific date is published.",
      "After an eligible flood-related disaster, emergency assistance falls under the General financial assistance program for disasters, separate from Rénoclimat.",
    ],
    unverified: [
      "The list and recognition criteria for professionals authorised to carry out the climate resilience diagnosis are announced as under development.",
      "The portal opening date is not published.",
      "The detail of each eligible measure in the accompanied stream beyond the published categories must be confirmed in the participant guide.",
    ],
    sources: [
      { label: "Rénoclimat news and Adaptation stream", publisher: "Government of Quebec", url: renoclimatChangesUrl, verifiedOn: VERIFIED_ON, pageUpdated: "2026-10-13" },
      { label: "Rénoclimat financial assistance", publisher: "Government of Quebec", url: renoclimatUrl, verifiedOn: VERIFIED_ON, pageUpdated: "2026-10-13" },
    ],
    relatedSlugs: ["renoclimat", "logisvert"],
  },
  {
    slug: "logisvert",
    navLabel: "LogisVert — residential customers",
    title: "LogisVert: Hydro-Québec residential subsidies",
    metaTitle: "LogisVert: residential subsidies in 2026",
    metaDescription:
      "Heat pump, insulation, solar panels, heat accumulator: amounts published by Hydro-Québec for residential customers under the LogisVert program.",
    programName: "LogisVert program — residential customers",
    publisher: "Hydro-Québec",
    status: "open",
    summary: [
      "LogisVert provides a subsidy for energy-efficiency measures in a home, whether the applicant rents or owns a house, a condominium, a plex or a multi-unit building.",
      "Measures include heat pumps, induction cooktops, heat-pump dryers, roof insulation and air sealing, efficient pool pumps, solar panels, heat accumulators and geothermal heat pumps.",
      "The program adds 5% to the subsidy when several measures are submitted in the same application, according to the participant guide annex.",
    ],
    amounts: [
      { measure: "Heat pump", amount: "Up to $6,700", note: "Higher amount for a very high-efficiency heat pump." },
      { measure: "Induction cooktop", amount: "$250", note: "Induction hobs are not eligible." },
      { measure: "Heat-pump dryer", amount: "$250" },
      { measure: "Roof insulation and air sealing", amount: "$1,500" },
      { measure: "Efficient pool pump", amount: "Up to $300", note: "Marked 'last chance' on the official page." },
      { measure: "Geothermal heat pump replacement", amount: "$250 per 1,000 BTU/h" },
      { measure: "Solar panels", amount: "$1,000 per installed kilowatt", note: "The subsidy can cover up to 40% of purchase and installation costs." },
      { measure: "Heat accumulator and central heat pump", amount: "$22,000" },
      { measure: "Heat accumulator alone", amount: "$15,000" },
      { measure: "Geothermal heat pump", amount: "$750 per 1,000 BTU/h" },
    ],
    amountsNote:
      "Amounts published on the residential customers page. Each measure has its own conditions; the actual amount depends on the equipment and the application.",
    eligibility: [
      "Tenants or owners of a house, a condominium, a plex or a multi-unit building, depending on the conditions of each measure.",
      "The heat pump must appear on the program's eligible equipment list, available on Hydro-Québec's site.",
      "The conditions specific to each measure (equipment, installation, invoices) must be met; the participant guide details them.",
      "Hydro-Québec states that it makes no phone or door-to-door solicitation for LogisVert; only authorised companies may install certain equipment.",
    ],
    steps: [
      "Choose the measures and check equipment eligibility before buying.",
      "Estimate the amount on the LogisVert portal.",
      "Submit the application on the portal with the required documents.",
      "Track the application on the portal; once approved, the subsidy is sent by mail.",
    ],
    deadlines: [
      "No end date is displayed for residential measures on the page consulted; check the portal before buying.",
      "The efficient pool pump is presented as a 'last chance', with no published end date.",
      "On October 8, 2026, the federal government announced its intention to offer heat pump subsidies starting in 2027; details are not known and the LogisVert program remains in force.",
    ],
    unverified: [
      "Not all detailed conditions per measure (brands, models, thresholds) are reproduced here; see the official participant guide.",
      "The application processing time is not published on the page consulted.",
    ],
    sources: [
      { label: "LogisVert program", publisher: "Hydro-Québec", url: logisvertUrl, verifiedOn: VERIFIED_ON },
      { label: "LogisVert — residential customers", publisher: "Hydro-Québec", url: logisvertResidentialUrl, verifiedOn: VERIFIED_ON },
    ],
    relatedSlugs: ["logisvert-revenu-modeste", "renoclimat"],
  },
  {
    slug: "logisvert-revenu-modeste",
    navLabel: "LogisVert — modest-income households",
    title: "Free heat pump for modest-income households",
    metaTitle: "LogisVert modest income: registrations closed",
    metaDescription:
      "LogisVert offers modest-income households a heat pump and its installation free of charge. 2026-2027 registrations are closed; here are the conditions.",
    programName: "LogisVert — free heat pumps for modest-income households",
    publisher: "Hydro-Québec",
    status: "closed",
    summary: [
      "This stream offers a cold-climate ENERGY STAR certified wall heat pump, its installation and support, free of charge for eligible households.",
      "The offer runs through Éconologis, a Government of Quebec program that helps modest-income households improve the comfort and energy efficiency of their home in winter.",
      "Hydro-Québec states that registrations for the 2026-2027 season are closed in order to process requests already received, and that only companies authorised by Hydro-Québec may install the heat pumps.",
    ],
    amounts: [
      {
        measure: "Wall heat pump, installation and support",
        amount: "Free for eligible households",
        note: "No dollar amount is published: the offer covers the unit and installation.",
      },
      {
        measure: "Smart thermostats (another possible measure)",
        amount: "Free installation subject to eligibility",
        note: "Hydro-Québec mentions this option for people not eligible for the heat pump.",
      },
    ],
    amountsNote:
      "The program publishes no dollar amount: it is a free installation. Income criteria are not reproduced on the page consulted.",
    eligibility: [
      "Modest-income households, according to the criteria of the Éconologis and LogisVert programs.",
      "Tenants, owner-occupants and landlords: the steps may differ, and the tenant generally must start the request according to the official page.",
      "The home must be in a region where the installation service is offered; deployment is progressive.",
      "Only companies authorised by Hydro-Québec may install the free heat pumps.",
    ],
    steps: [
      "Check eligibility on the official modest-income stream page.",
      "Follow the path for your situation (tenant, owner-occupant or landlord).",
      "Wait for Hydro-Québec contact in regions where the service is offered, since 2026-2027 registrations are closed.",
      "Have the installation done only by a company authorised by Hydro-Québec.",
    ],
    deadlines: [
      "Registrations closed for the 2026-2027 season in order to process requests already received.",
      "No reopening date is published on the page consulted.",
    ],
    unverified: [
      "The exact income thresholds do not appear on the page consulted; check with the program.",
      "The reopening date for registrations is not published.",
      "The regions already served and the deployment schedule are not detailed on the page consulted.",
    ],
    sources: [
      { label: "Free heat pumps for modest-income households", publisher: "Hydro-Québec", url: logisvertModestUrl, verifiedOn: VERIFIED_ON },
      { label: "LogisVert program", publisher: "Hydro-Québec", url: logisvertUrl, verifiedOn: VERIFIED_ON },
    ],
    relatedSlugs: ["logisvert", "renoclimat"],
  },
  {
    slug: "maisons-abordables-plus-vertes",
    navLabel: "Greener affordable housing",
    title: "Canada Greener Affordable Housing program",
    metaTitle: "Greener affordable housing: check with CMHC",
    metaDescription:
      "A CMHC program under professional project funding. We do not reproduce its amounts because they could not be verified; here is the official source.",
    programName: "Canada Greener Affordable Housing program",
    publisher: "Canada Mortgage and Housing Corporation (CMHC)",
    status: "unknown",
    notForIndividuals: true,
    summary: [
      "This program appears in the CMHC site's 'Professionals → Project funding → Funding programs' section. Its name indicates it concerns affordable and greener housing.",
      "Amounts, eligibility criteria and dates could not be extracted from the official page during our consultation: the detailed content was not accessible. We do not invent them.",
      "For renovating an individual home in Quebec, the Rénoclimat and LogisVert programs are the direct references presented in the other pages of this section.",
    ],
    amounts: [],
    amountsNote:
      "No amount is reproduced here: they could not be verified on the official page on the consultation date. Check with the program.",
    eligibility: [
      "Eligibility not reproduced: it could not be verified on the official page on the consultation date.",
      "The program's location in the section for professionals and project funding suggests it targets affordable housing projects led by organisations rather than the renovation of an individual home. Confirm this with CMHC.",
    ],
    steps: [
      "Consult the official CMHC page for the terms in force.",
      "Contact CMHC to confirm your project's eligibility.",
      "For an individual home, see the Rénoclimat and LogisVert pages in this section instead.",
    ],
    deadlines: [
      "No date is reproduced: it could not be verified on the official page on the consultation date.",
    ],
    unverified: [
      "Amounts, eligibility criteria, deadlines and type of funding (loan, contribution or a combination): check with the program.",
      "The program details were not accessible on the official page during the consultation.",
    ],
    sources: [
      {
        label: "Canada Greener Affordable Housing program",
        publisher: "Canada Mortgage and Housing Corporation",
        url: cmhcGreenerUrl,
        verifiedOn: VERIFIED_ON,
      },
    ],
    relatedSlugs: ["renoclimat", "logisvert"],
  },
];

const pages: Record<Locale, SubsidyPage[]> = { fr, en };

export function listSubsidyPages(locale: Locale): SubsidyPage[] {
  return pages[locale];
}

export function isSubsidySlug(value: string): value is SubsidySlug {
  return (SUBSIDY_SLUGS as readonly string[]).includes(value);
}

export function getSubsidyPage(slug: string, locale: Locale): SubsidyPage | null {
  return pages[locale].find((page) => page.slug === slug) ?? null;
}
