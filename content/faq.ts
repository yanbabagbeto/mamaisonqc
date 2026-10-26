/**
 * FAQ content (10 questions). Plain-text answers only: the same strings feed the visible
 * accordion and the FAQPage JSON-LD, so the structured data never claims more than the page
 * shows (Google's structured-data rules; PRD AC-10/AC-16).
 */
export type FaqItem = {
  /** Anchor id, used by /faq#methode and by the home page deep links. */
  id: string;
  question: string;
  answer: string;
  links?: { href: string; label: string }[];
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "methode",
    question: "Comment MaMaisonQC calcule-t-elle une estimation?",
    answer:
      "Nous partons de la valeur au rôle d'évaluation de la propriété, puis nous construisons un ensemble de comparables selon le découpage utilisé par l'évaluateur municipal : même municipalité, même unité de voisinage, même catégorie d'usage et superficie comparable. L'estimation est une médiane robuste des valeurs de ces comparables, accompagnée d'une fourchette et d'un niveau de confiance qui dépend du nombre de comparables et de leur dispersion. Il n'y a ni intelligence artificielle générative, ni modèle opaque : la méthode est statistique et les données d'entrée sont publiques. Quand les comparables sont trop peu nombreux, nous affichons un état « données insuffisantes » plutôt qu'un chiffre précis trompeur.",
    links: [{ href: "/donnees", label: "Voir les données utilisées" }],
  },
  {
    id: "gratuit",
    question: "Est-ce vraiment gratuit?",
    answer:
      "Oui. La consultation de la valeur au rôle, de la fourchette d'estimation, des comparables et des pages de marché est gratuite et ne demande pas de compte. Aucun paiement n'est requis pour utiliser les outils de base, et aucune information de carte de crédit n'est demandée. Certaines fonctionnalités liées à un compte — comme réclamer votre page ou publier un pré-marché — existent séparément, mais elles ne conditionnent pas l'accès aux chiffres publics.",
    links: [{ href: "/conditions", label: "Conditions d'utilisation" }],
  },
  {
    id: "donnees",
    question: "D'où viennent les données affichées?",
    answer:
      "Les données proviennent de sources officielles du gouvernement du Québec : le rôle d'évaluation foncière produit par les municipalités et diffusé par le ministère des Affaires municipales et de l'Habitation, les statistiques du Registre foncier du Québec sur le marché immobilier, le répertoire des municipalités et la liste des codes d'utilisation des biens-fonds. Le géocodage d'adresses utilise le service Adresses Québec du ministère des Ressources naturelles et des Forêts. Chaque jeu de données est publié sous licence CC-BY 4.0, avec attribution visible. La page Données et sources indique pour chacun l'éditeur, la licence, l'adresse de la source, la date de collecte et le nombre de lignes.",
    links: [{ href: "/donnees", label: "Données et sources" }],
  },
  {
    id: "valeur-municipale",
    question: "Est-ce la même chose que l'évaluation municipale?",
    answer:
      "Non. L'évaluation municipale est une valeur officielle inscrite au rôle, établie à une date de référence et utilisée pour répartir la taxe foncière pendant un cycle de trois ans. Notre estimation est une valeur de marché indicative, calculée à partir de comparables, qui cherche à refléter le marché au moment de la consultation. Les deux peuvent différer sans que l'une soit fausse. Ni l'une ni l'autre ne constitue une évaluation agréée par un évaluateur pour une transaction. Pour les taxes et la contestation, la référence reste le rôle; pour un prix de vente, la référence est le marché.",
    links: [
      { href: "/conseils/evaluation-municipale-vs-valeur-marche", label: "Lire l'explication détaillée" },
    ],
  },
  {
    id: "precision",
    question: "Quelle est la précision de l'estimation?",
    answer:
      "Nous ne promettons pas une précision au dollar. Nous affichons une fourchette et un niveau de confiance, parce qu'une estimation unique cache son incertitude. La confiance dépend du nombre de comparables disponibles dans le même secteur et de la dispersion de leurs valeurs : peu de comparables ou une dispersion élevée donnent une confiance faible, et nous le disons. Une estimation reste indicative : elle ne remplace ni une visite, ni une inspection, ni une évaluation professionnelle, et elle ne garantit pas un prix de vente.",
    links: [{ href: "/faq#methode", label: "Voir la méthode de calcul" }],
  },
  {
    id: "pre-marche",
    question: "Qu'est-ce qu'un pré-marché, et est-ce un contrat?",
    answer:
      "Le pré-marché est une fiche publiée par un propriétaire qui envisage de vendre dans un horizon donné, avant une mise en marché officielle. L'adresse civique n'est jamais affichée : seule la rue et la ville apparaissent. Ce n'est ni une annonce de courtage, ni une offre de vente, ni un contrat : aucun lien de courtage n'est créé, aucun prix n'est garanti et le propriétaire peut retirer sa fiche. Un acheteur intéressé laisse ses coordonnées; le propriétaire décide de la suite. Une inscription officielle, avec un courtier, suit un cadre différent, encadré par l'OACIQ.",
    links: [
      { href: "/pre-marche", label: "Parcourir le pré-marché" },
      { href: "/conseils/pre-marche-vs-inscription-officielle", label: "Pré-marché ou inscription officielle" },
    ],
  },
  {
    id: "reclamation",
    question: "Comment réclamer la page de ma propriété?",
    answer:
      "La réclamation permet à un propriétaire de demander le rattachement d'une fiche à son compte, afin d'accéder aux outils propriétaire. La demande est examinée par un administrateur et reste en attente tant qu'elle n'est pas approuvée : elle ne donne aucun droit de propriété et ne modifie aucune donnée publique. Une seule demande par propriété et par compte est acceptée. Pour commencer, utilisez la page Réclamer ma page et indiquez un élément permettant de vérifier le lien avec la propriété.",
    links: [{ href: "/reclamer-ma-page", label: "Réclamer ma page" }],
  },
  {
    id: "confidentialite",
    question: "Comment mes renseignements personnels sont-ils protégés?",
    answer:
      "Nous appliquons la Loi sur la protection des renseignements personnels dans le secteur privé, modernisée par la Loi 25. Nous ne collectons que les renseignements nécessaires aux fins annoncées — par exemple un courriel pour Le Brief, ou les coordonnées laissées lors d'une demande d'intérêt — et nous ne les utilisons pas à d'autres fins sans consentement. Aucun outil de mesure tiers ni pixel publicitaire n'est chargé : le site utilise ses propres mesures, et vous pouvez refuser la mesure d'usage sans perdre l'accès au site. Les détails, la durée de conservation et les droits sont décrits dans la politique de confidentialité.",
    links: [{ href: "/confidentialite", label: "Politique de confidentialité" }],
  },
  {
    id: "donnees-personnelles",
    question: "Puis-je accéder à mes données ou en demander la suppression?",
    answer:
      "Oui. Vous pouvez demander l'accès aux renseignements personnels que nous détenons à votre sujet, en demander la rectification s'ils sont inexacts ou incomplets, et demander leur suppression lorsque la finalité est accomplie ou lorsque la loi le permet. Une demande de suppression peut être refusée si une obligation légale nous impose de conserver le renseignement, par exemple une preuve de consentement. Les demandes se font par le formulaire de contact, qui est le canal officiel : indiquez l'objet de votre demande et l'adresse courriel concernée. Nous répondons dans les délais prévus par la loi.",
    links: [{ href: "/contact", label: "Formulaire de contact" }],
  },
  {
    id: "contact",
    question: "Comment vous joindre?",
    answer:
      "Le formulaire de contact est le canal officiel pour toute demande : question sur une estimation, réclamation de page, exercice d'un droit lié à vos renseignements personnels, signalement d'erreur ou demande de presse. Nous ne publions pas d'adresse courriel de boîte de réception, afin de limiter le pourriel et de garder une trace des demandes. Indiquez un objet précis et, si votre demande concerne une propriété, la municipalité et l'adresse visée. N'envoyez jamais de renseignement sensible par ce formulaire.",
    links: [{ href: "/contact", label: "Écrire via le formulaire" }],
  },
];

/**
 * English translations of the same ten questions, same ids so `/en/faq#methode` still works.
 * Authored, not machine-generated: each answer mirrors the French one claim for claim.
 */
export const FAQ_ITEMS_EN: FaqItem[] = [
  {
    id: "methode",
    question: "How does MaMaisonQC calculate an estimate?",
    answer:
      "We start from the property's assessment roll value, then build a comparable set using the municipal assessor's own segmentation: same municipality, same neighbourhood unit, same use category, and comparable area. The estimate is a robust median of those comparable values, with a range and a confidence level that depends on the number of comparables and their dispersion. There is no generative artificial intelligence and no opaque model: the method is statistical and the input data is public. When comparables are too few, we show an “insufficient data” state rather than a falsely precise number.",
    links: [{ href: "/donnees", label: "See the data used" }],
  },
  {
    id: "gratuit",
    question: "Is it really free?",
    answer:
      "Yes. Viewing the roll value, the estimate range, comparables and market pages is free and requires no account. No payment is required to use the core tools, and no credit card information is requested. Some account features — claiming your page or publishing a pre-market listing — exist separately, but they never gate access to public figures.",
    links: [{ href: "/conditions", label: "Terms of use" }],
  },
  {
    id: "donnees",
    question: "Where does the data come from?",
    answer:
      "The data comes from official Government of Québec sources: the assessment roll produced by municipalities and published by the ministère des Affaires municipales et de l'Habitation, the Québec land registry market statistics, the municipal directory and the list of property use codes. Address geocoding uses the MERN Adresses Québec service. Each dataset is published under the CC-BY 4.0 licence, with visible attribution. The Data and sources page lists each one's publisher, licence, source URL, collection date and row count.",
    links: [{ href: "/donnees", label: "Data and sources" }],
  },
  {
    id: "valeur-municipale",
    question: "Is this the same as the municipal assessment?",
    answer:
      "No. The municipal assessment is an official value entered on the roll, established at a reference date and used to allocate property tax over a three-year cycle. Our estimate is an indicative market value calculated from comparables, intended to reflect the market when you consult it. The two can differ without either being wrong. Neither is an accredited appraisal for a transaction. For taxes and contests, the roll is the reference; for a selling price, the market is the reference.",
    links: [
      { href: "/conseils/evaluation-municipale-vs-valeur-marche", label: "Read the detailed explanation" },
    ],
  },
  {
    id: "precision",
    question: "How accurate is the estimate?",
    answer:
      "We do not promise dollar-level accuracy. We show a range and a confidence level, because a single number hides its uncertainty. Confidence depends on the number of comparables available in the same area and on their dispersion: few comparables or high dispersion produce low confidence, and we say so. An estimate remains indicative: it does not replace a visit, an inspection or a professional appraisal, and it does not guarantee a selling price.",
    links: [{ href: "/faq#methode", label: "See the calculation method" }],
  },
  {
    id: "pre-marche",
    question: "What is a pre-market listing, and is it a contract?",
    answer:
      "A pre-market listing is a page published by an owner considering a sale within a given horizon, before an official listing. The civic number is never shown: only the street and city appear. It is not a brokerage listing, a sales offer or a contract: no brokerage relationship is created, no price is guaranteed, and the owner can withdraw it. An interested buyer leaves contact details; the owner decides what happens next. An official listing with a broker follows a different framework, supervised by the OACIQ.",
    links: [
      { href: "/pre-marche", label: "Browse the pre-market" },
      { href: "/conseils/pre-marche-vs-inscription-officielle", label: "Pre-market or official listing" },
    ],
  },
  {
    id: "reclamation",
    question: "How do I claim my property page?",
    answer:
      "Claiming lets an owner ask to link a property page to their account in order to access owner tools. The request is reviewed by an administrator and stays pending until approved: it grants no ownership right and changes no public data. One request per property and per account is accepted. To start, use the Claim my page page and provide an element that helps verify the link to the property.",
    links: [{ href: "/reclamer-ma-page", label: "Claim my page" }],
  },
  {
    id: "confidentialite",
    question: "How is my personal information protected?",
    answer:
      "We apply Québec's Act respecting the protection of personal information in the private sector, modernised by Law 25. We collect only the information needed for the stated purposes — for example an email for Le Brief, or the contact details left with an interest request — and we do not use it for other purposes without consent. No third-party analytics tool or advertising pixel is loaded: the site uses its own measurement, and you can refuse usage measurement without losing access. Details, retention periods and rights are described in the privacy policy.",
    links: [{ href: "/confidentialite", label: "Privacy policy" }],
  },
  {
    id: "donnees-personnelles",
    question: "Can I access or delete my data?",
    answer:
      "Yes. You may request access to the personal information we hold about you, request rectification if it is inaccurate or incomplete, and request deletion once the purpose is fulfilled or where the law allows. A deletion request may be refused if a legal obligation requires us to keep the information, for example proof of consent. Requests go through the contact form, which is the official channel: state the purpose of your request and the email address concerned. We answer within the time limits set by law.",
    links: [{ href: "/contact", label: "Contact form" }],
  },
  {
    id: "contact",
    question: "How can I reach you?",
    answer:
      "The contact form is the official channel for every request: question about an estimate, page claim, exercise of a privacy right, error report or press inquiry. We do not publish an inbox email address, to limit spam and keep a record of requests. State a precise subject and, if your request concerns a property, the municipality and address. Never send sensitive information through this form.",
    links: [{ href: "/contact", label: "Write via the form" }],
  },
];
