/**
 * Content-section dictionary (conseils, nouvelles, brief, FAQ, data trust, legal, contact).
 *
 * `fr` is the reference shape: `en` is typed as `ContentMessages`, so a missing or extra key is
 * a compile error. Chrome strings (header/footer/home) live in `src/i18n/messages/*`, owned by
 * the Lead — never duplicate them here.
 */
import type { Locale } from "@/i18n/config";

export const fr = {
  common: {
    home: "Accueil",
    breadcrumb: "Fil d'Ariane",
    published: (date: string) => `Publié le ${date}`,
    updated: (date: string) => `Mis à jour le ${date}`,
    readingTime: (minutes: number) => `${minutes} min de lecture`,
    sourceCount: (count: number) => `${count} sources officielles`,
    sourcesTitle: "Sources vérifiées",
    sourcesBody:
      "Chaque affirmation factuelle de ce texte renvoie à l'une de ces pages officielles, consultées à la date de mise à jour indiquée plus haut.",
    disclaimer:
      "Ce texte est de nature informative. Il ne constitue ni une évaluation agréée, ni un avis juridique, ni une recommandation de financement.",
    termsLink: "conditions d'utilisation",
    frenchOnlyTitle: "Disponible en français seulement",
    frenchOnlyBody:
      "Cet article n'a pas encore de version anglaise. La version française complète est affichée ci-dessous; aucune traduction automatique n'est présentée comme officielle.",
    frenchOnlyBadge: "Français seulement",
    backHome: "Retour à l'accueil",
    errorTitle: "Cette page est introuvable",
    errorBody: "Le lien est peut-être périmé, ou l'article a été renommé.",
    errorCta: "Voir tous les articles",
  },
  categories: {
    conseils: {
      label: "Conseils",
      eyebrow: "Comprendre",
      title: "Conseils pour propriétaires du Québec",
      description:
        "Le rôle d'évaluation, la valeur marchande, le bon moment pour vendre : des explications sourcées, sans promesse ni chiffre inventé.",
      intro:
        "Des textes courts et vérifiables pour comprendre ce que valent les chiffres immobiliers du Québec — et ce qu'ils ne disent pas. Chaque article nomme ses sources officielles.",
      empty: "Le premier conseil sera publié sous peu.",
    },
    nouvelles: {
      label: "Nouvelles",
      eyebrow: "Analyser",
      title: "Nouvelles et analyses du marché",
      description:
        "Ce que les statistiques du Registre foncier du Québec mesurent vraiment, et comment les lire sans se tromper.",
      intro:
        "Les données publiques du Québec sont riches, mais faciles à mal lire. Ces analyses expliquent la mécanique des fichiers officiels, sans reprendre de chiffres de presse non vérifiés.",
      empty: "La première analyse sera publiée sous peu.",
    },
  },
  faq: {
    eyebrow: "Questions fréquentes",
    title: "Vos questions, nos réponses vérifiables",
    description:
      "Méthode de calcul, gratuité, provenance des données, protection des renseignements personnels : les réponses courtes, avec les liens vers les pages complètes.",
    intro:
      "Ces réponses s'appliquent à l'ensemble du site. Les questions techniques renvoient aux pages de données et de confidentialité quand la réponse courte ne suffit pas.",
    anchorLabel: "Questions de cette page",
    detailsHint: "Cliquez sur une question pour afficher la réponse. Chaque section fonctionne aussi au clavier, sans JavaScript.",
    structuredNote:
      "Les données structurées FAQ de cette page reprennent exactement le texte affiché ci-dessus.",
    contactTitle: "Votre question n'est pas ici?",
    contactBody:
      "Le formulaire de contact est le canal officiel : questions sur une estimation, réclamation de page, droits liés à vos renseignements personnels, signalement d'erreur.",
    contactCta: "Écrire via le formulaire",
  },
  brief: {
    eyebrow: "Le Brief",
    title: "Le marché expliqué, une fois par mois",
    description:
      "Une édition courte, chiffrée et sourcée : les ventes de la dernière période, région par région, et ce que les données publiques permettent réellement d'affirmer.",
    intro:
      "Chaque édition part des statistiques du Registre foncier du Québec et les cite. Quand les données ne sont pas encore disponibles, nous affichons une édition à venir plutôt que des chiffres inventés.",
    latestEdition: "Dernière édition disponible",
    periodLabel: "Période",
    datasetLabel: "Jeu de données",
    totalSales: "Ventes comptabilisées",
    regionsCount: "Régions avec données",
    regionColumn: "Région administrative",
    salesColumn: "Ventes",
    shareColumn: "Part du total",
    totalRow: "Ensemble des régions affichées",
    tableCaption:
      "Nombre de ventes par région administrative pour la dernière période disponible, tel que compilé par le Registre foncier du Québec.",
    archiveTitle: "Éditions disponibles",
    archiveIntro:
      "Les périodes publiées par le Registre foncier et déjà ingérées. Une édition est ajoutée automatiquement quand une nouvelle période arrive.",
    archivePeriod: "Période",
    archiveSales: "Ventes",
    noArchive: "Aucune édition archivée pour le moment.",
    upcomingTitle: "Édition à venir",
    upcomingBody:
      "Les statistiques de ventes ne sont pas encore ingérées dans la base de données. Le Brief publiera sa première édition dès que la période sera disponible — nous n'affichons pas de chiffres estimés en attendant.",
    upcomingHint: "En attendant, consultez la page Données et sources pour voir les jeux de données prévus et leurs licences.",
    coverageTitle: "Ce que cette édition mesure",
    coverageBody:
      "Les chiffres proviennent des statistiques mensuelles du Registre foncier du Québec : nombre de ventes par plage de prix et par région administrative. Seul le premier droit de chaque acte est comptabilisé, et les plages de prix ne permettent pas de calculer un prix moyen.",
    editionNote: "Les éditions sont produites à partir des données ingérées; la date de collecte figure dans la provenance ci-dessous.",
    methodologyCta: "Comprendre la différence entre rôle et marché",
    newsletterTitle: "Recevoir la prochaine édition",
    newsletterBody: "Une édition par mois, sans publicité. Désinscription en un clic.",
  },
  donnees: {
    eyebrow: "Transparence",
    title: "Données et sources",
    description:
      "Chaque chiffre affiché sur MaMaisonQC provient d'un jeu de données officiel du gouvernement du Québec : éditeur, licence, adresse de la source, date de collecte et limites connues.",
    intro:
      "Cette page est la référence de provenance du site. Elle liste les jeux de données utilisés, ce qu'ils alimentent, et ce qu'ils ne permettent pas de conclure.",
    catalogueTitle: "Jeux de données utilisés",
    catalogueIntro:
      "Les lignes ci-dessous proviennent de la table des jeux de données ingérés. Les dates et les nombres de lignes sont ceux de la dernière collecte.",
    emptyTitle: "Catalogue en attente d'ingestion",
    emptyBody:
      "Aucun jeu de données n'est encore enregistré dans la base. Les sources officielles prévues sont listées ci-dessous avec leur éditeur et leur licence; aucun nombre de lignes n'est affiché tant que la collecte n'a pas eu lieu.",
    officialPortalsTitle: "Sources officielles prévues",
    labels: {
      publisher: "Éditeur",
      licence: "Licence",
      source: "Adresse de la source",
      fetched: "Date de collecte",
      reference: "Date de référence",
      rows: "Lignes ingérées",
      feeds: "Ce que ce jeu de données alimente",
      limitations: "Limites connues",
      identifier: "Identifiant",
    },
    notIngested: "non ingéré",
    notSpecified: "non précisée",
    rowCount: (count: number) => `${count} lignes`,
    siteLimitationsTitle: "Limites du produit",
    siteLimitationsIntro:
      "Ces limites s'appliquent à l'ensemble du site, en plus des limites propres à chaque jeu de données.",
    methodTitle: "Comment nous calculons une estimation",
    methodIntro:
      "Notre estimation part du rôle d'évaluation, puis construit un ensemble de comparables : même municipalité, même unité de voisinage (UMV), même catégorie d'usage, superficie comparable. La valeur estimée est une médiane robuste de ces comparables, accompagnée d'une fourchette et d'un niveau de confiance.",
    methodSteps: [
      "La valeur au rôle est lue dans le rôle d'évaluation de la municipalité, avec sa date de référence.",
      "Les comparables sont sélectionnés dans la même unité de voisinage et la même catégorie d'usage, avec une superficie comparable.",
      "L'estimation affichée est une médiane robuste, accompagnée d'une fourchette (P25–P75) et d'un niveau de confiance.",
      "Quand les comparables sont trop peu nombreux, la page affiche un état « données insuffisantes » plutôt qu'un chiffre précis.",
    ],
    methodCta: "Voir une estimation expliquée",
    methodNote:
      "Aucune intelligence artificielle générative n'intervient dans le calcul. Le modèle est statistique, ses données d'entrée sont publiques et chaque figure affichée porte sa provenance.",
    attributionTitle: "Attribution des licences",
    attributionBody:
      "Les jeux de données du gouvernement du Québec utilisés ici sont publiés sous licence CC-BY 4.0 ou sous licence de gouvernement ouvert. L'attribution est visible sur chaque page qui affiche un chiffre, et rappelée ci-dessus avec l'éditeur et le lien vers la licence.",
    backToTop: "Revenir au catalogue",
    licenceLinkLabel: "CC-BY 4.0 — Données Québec",
  },
  conditions: {
    eyebrow: "Cadre d'utilisation",
    title: "Conditions d'utilisation",
    description:
      "Les règles d'usage de MaMaisonQC : estimations indicatives, absence de lien de courtage, propriété intellectuelle, responsabilité et droit applicable au Québec.",
    updatedLabel: "Dernière mise à jour",
    updatedAt: "2026-10-26",
    intro:
      "En utilisant MaMaisonQC, vous acceptez les conditions ci-dessous. Elles sont rédigées en français et en anglais; en cas de divergence, la version française prévaut.",
    sections: [
      {
        heading: "1. Objet du service",
        paragraphs: [
          "MaMaisonQC est un service d'information immobilière. Il affiche des données publiques du gouvernement du Québec, des estimations indicatives calculées à partir de ces données, et des contenus explicatifs.",
          "L'accès aux pages publiques est gratuit et ne nécessite pas de compte. Certaines fonctionnalités, comme la réclamation d'une fiche ou la publication d'un pré-marché, nécessitent un compte et sont soumises aux règles supplémentaires affichées sur ces pages.",
        ],
      },
      {
        heading: "2. Des estimations indicatives, pas une évaluation agréée",
        paragraphs: [
          "Les estimations affichées sont indicatives. Elles sont produites par un modèle statistique à partir de données publiques et ne constituent ni une évaluation agréée, ni un avis d'évaluateur agréé, ni une garantie de prix.",
          "Une estimation ne remplace pas une visite, une inspection, un certificat de localisation, ni l'analyse d'un professionnel. Vous demeurez responsable des décisions que vous prenez sur la base des informations du site.",
        ],
      },
      {
        heading: "3. Aucun lien de courtage ni de conseil financier",
        paragraphs: [
          "MaMaisonQC n'est pas un courtier immobilier, ni un courtier hypothécaire, ni un évaluateur agréé. Le site ne crée aucun lien de courtage, ne reçoit aucun mandat et ne recommande aucun produit de financement.",
          "Une fiche de pré-marché n'est ni une annonce de courtage, ni une offre de vente, ni un contrat. Pour une transaction, consultez un courtier titulaire d'un permis de l'OACIQ, un notaire ou un avocat.",
        ],
        links: [{ label: "OACIQ — vérifier un courtier", href: "https://registre.oaciq.com/fr/" }],
      },
      {
        heading: "4. Exactitude et disponibilité des données",
        paragraphs: [
          "Les données proviennent de sources officielles, mais peuvent contenir des erreurs, des retards ou des omissions. Le site est fourni « tel quel », sans garantie d'exactitude, d'exhaustivité ou de disponibilité continue.",
          "Si vous constatez une erreur, signalez-la via le formulaire de contact : nous corrigeons la donnée à la source ou nous documentons la limite.",
        ],
        links: [{ label: "Signaler une erreur", href: "/contact" }],
      },
      {
        heading: "5. Propriété intellectuelle",
        paragraphs: [
          "Les textes, l'identité visuelle et le code de MaMaisonQC sont protégés. Les données publiques réutilisées restent la propriété de leurs éditeurs et sont utilisées conformément à leur licence, avec attribution.",
          "Vous pouvez citer un extrait court en indiquant la source et en renvoyant vers la page d'origine. Toute reproduction substantielle, revente ou réutilisation commerciale du contenu exige une autorisation écrite.",
        ],
        links: [{ label: "Voir les licences des données", href: "/donnees" }],
      },
      {
        heading: "6. Usage acceptable",
        paragraphs: [
          "Il est interdit d'extraire massivement les données du site, de contourner les limites d'accès, de publier de fausses réclamations de propriété ou d'utiliser le site à des fins illicites ou trompeuses.",
          "Nous pouvons suspendre ou retirer un accès en cas d'abus, sans préavis lorsque la sécurité du service ou celle d'un tiers l'exige.",
        ],
      },
      {
        heading: "7. Limitation de responsabilité",
        paragraphs: [
          "Dans la mesure permise par la loi applicable, MaMaisonQC ne peut être tenue responsable des dommages indirects, pertes de revenus ou décisions prises sur la base des informations du site.",
          "Cette limitation ne s'applique pas aux cas où la loi interdit une telle exclusion, notamment en matière de protection du consommateur.",
        ],
      },
      {
        heading: "8. Droit applicable",
        paragraphs: [
          "Les présentes conditions sont régies par les lois du Québec et les lois fédérales du Canada qui s'y appliquent. Tout litige relève des tribunaux compétents du Québec.",
        ],
      },
      {
        heading: "9. Modifications",
        paragraphs: [
          "Nous pouvons modifier ces conditions pour refléter une évolution du service ou de la loi. La date de mise à jour est affichée en tête de page; l'utilisation du site après une modification vaut acceptation.",
        ],
      },
      {
        heading: "10. Nous joindre",
        paragraphs: [
          "Pour toute question sur ces conditions, utilisez le formulaire de contact, qui est le canal officiel.",
        ],
        links: [{ label: "Formulaire de contact", href: "/contact" }],
      },
    ],
  },
  confidentialite: {
    eyebrow: "Vie privée",
    title: "Politique de confidentialité",
    description:
      "Loi 25 : quelles données MaMaisonQC collecte, pourquoi, combien de temps, et comment exercer vos droits d'accès, de rectification et de suppression.",
    updatedLabel: "Dernière mise à jour",
    updatedAt: "2026-10-26",
    intro:
      "Cette politique décrit le traitement des renseignements personnels par MaMaisonQC, conformément à la Loi sur la protection des renseignements personnels dans le secteur privé, modernisée par la Loi 25. Elle est offerte en français et en anglais; la version française prévaut.",
    officerTitle: "Responsable de la protection des renseignements personnels",
    officerBody:
      "Le responsable de la protection des renseignements personnels est la personne désignée par MaMaisonQC pour veiller à l'application de cette politique. Pour toute demande, utilisez le formulaire de contact : c'est le canal officiel, tracé et traité dans les délais prévus par la loi.",
    officerCta: "Joindre le responsable",
    sections: [
      {
        heading: "1. Renseignements collectés",
        paragraphs: [
          "Nous limitons la collecte au nécessaire. Selon votre usage du site, nous pouvons détenir : une adresse courriel pour l'abonnement au Brief; un nom, un courriel et un message lorsque vous utilisez le formulaire de contact; un courriel et un message lorsque vous manifestez de l'intérêt pour une fiche de pré-marché; un nom et un courriel si vous créez un compte pour réclamer une fiche.",
          "Nous ne demandons pas de renseignement sensible — santé, données biométriques, données financières détaillées — et vous ne devriez pas en transmettre via le formulaire.",
        ],
      },
      {
        heading: "2. Fins de la collecte",
        paragraphs: [
          "Vos renseignements servent à fournir le service demandé (réponse à un message, envoi du Brief, mise en relation avec un propriétaire), à assurer la sécurité et l'intégrité du site, à corriger des erreurs et à respecter nos obligations légales.",
          "Nous ne vendons pas de renseignements personnels, nous ne les utilisons pas pour de la publicité tierce et nous ne les communiquons pas à des fins commerciales.",
        ],
      },
      {
        heading: "3. Consentement et exceptions",
        paragraphs: [
          "Le consentement est recueilli de façon manifeste, libre, éclairée et spécifique, pour chaque fin. L'abonnement au Brief et les demandes de contact reposent sur une action volontaire de votre part.",
          "La mesure d'usage du site est soumise à votre choix via la bannière de consentement; le refus n'empêche pas l'accès au site. Certaines communications peuvent avoir lieu sans consentement dans les cas prévus par la loi, par exemple pour répondre à une obligation légale.",
        ],
      },
      {
        heading: "4. Témoins et mesure d'usage",
        paragraphs: [
          "Le site n'utilise aucun pixel publicitaire ni outil de mesure tiers. Un témoin local conserve votre choix de consentement. Les mesures d'usage, lorsqu'elles sont acceptées, sont agrégées et servent uniquement à améliorer le site.",
        ],
      },
      {
        heading: "5. Conservation et destruction",
        paragraphs: [
          "Les données de contact sont conservées 24 mois après la dernière interaction, puis détruites de façon sécuritaire. Les abonnés au Brief sont conservés jusqu'à la désinscription. Les demandes d'exercice de droits sont conservées le temps du traitement et de la preuve de conformité.",
          "Lorsque la finalité est accomplie, les renseignements sont détruits ou anonymisés, sauf lorsqu'une loi impose une durée de conservation plus longue.",
        ],
      },
      {
        heading: "6. Vos droits",
        paragraphs: [
          "Vous pouvez demander l'accès aux renseignements personnels que nous détenons à votre sujet, en demander la rectification s'ils sont inexacts ou incomplets, et demander leur suppression lorsque la loi le permet. Vous pouvez aussi retirer votre consentement à une fin donnée, par exemple vous désabonner du Brief.",
          "Utilisez le formulaire de contact en précisant l'objet de la demande et l'adresse courriel concernée. Nous répondons dans les délais prévus par la loi et pouvons demander une vérification d'identité raisonnable avant de donner suite.",
        ],
        links: [{ label: "Exercer mes droits", href: "/contact" }],
      },
      {
        heading: "7. Sécurité et incidents",
        paragraphs: [
          "Nous appliquons des mesures de sécurité raisonnables : accès restreint aux données, journalisation des opérations administratives, séparation entre les données publiques et les renseignements personnels. Aucun système n'est infaillible, mais ces mesures visent à réduire le risque d'accès non autorisé.",
          "En cas d'incident présentant un risque de préjudice sérieux, nous aviserons la Commission d'accès à l'information et les personnes concernées, conformément à la loi.",
        ],
      },
      {
        heading: "8. Communication hors Québec et fournisseurs",
        paragraphs: [
          "Nous privilégions un hébergement au Canada. Si un fournisseur doit traiter des renseignements personnels hors du Québec, nous effectuons une évaluation des facteurs relatifs à la vie privée et encadrons la communication par une entente écrite, comme la Loi 25 l'exige.",
        ],
      },
      {
        heading: "9. Mineurs",
        paragraphs: [
          "Le service s'adresse à des personnes majeures. Nous ne collectons pas sciemment de renseignements personnels concernant des mineurs; si une telle situation nous est signalée, nous les supprimerons.",
        ],
      },
      {
        heading: "10. Modifications et recours",
        paragraphs: [
          "La date de mise à jour figure en tête de page. Pour une question ou une plainte, commencez par le formulaire de contact. Si la réponse ne vous satisfait pas, vous pouvez vous adresser à la Commission d'accès à l'information du Québec.",
        ],
        links: [
          { label: "Formulaire de contact", href: "/contact" },
          { label: "Commission d'accès à l'information", href: "https://www.cai.gouv.qc.ca/" },
        ],
      },
    ],
  },
  contact: {
    eyebrow: "Nous joindre",
    title: "Contact",
    description:
      "Questions sur une estimation, réclamation de page, droits liés à vos renseignements personnels : le formulaire est le canal officiel.",
    intro:
      "Le formulaire ci-dessous est le canal officiel de MaMaisonQC. Il crée une trace de votre demande et nous permet d'y répondre sans exposer d'adresse de boîte de réception au pourriel.",
    officialChannelTitle: "Un seul canal, tracé",
    officialChannelBody:
      "Nous ne publions pas d'adresse courriel de boîte de réception. Toutes les demandes passent par ce formulaire : questions sur une estimation, signalement d'erreur de données, réclamation de page, exercice d'un droit d'accès ou de suppression, presse.",
    responseTitle: "Délais de réponse",
    responseBody:
      "Nous visons une réponse dans un délai de deux jours ouvrables pour les demandes courantes. Les demandes liées à la protection des renseignements personnels sont traitées dans les délais prévus par la loi.",
    form: {
      legend: "Votre message",
      name: "Nom",
      nameHint: "Facultatif de donner un prénom seulement.",
      namePlaceholder: "Votre nom",
      email: "Adresse courriel",
      emailHint: "Sert uniquement à vous répondre.",
      emailPlaceholder: "vous@exemple.ca",
      message: "Message",
      messageHint: "Précisez la municipalité et l'adresse visée si votre demande concerne une propriété.",
      messagePlaceholder: "Décrivez votre demande…",
      consent: "J'accepte que mes coordonnées soient utilisées pour traiter ma demande.",
      submit: "Envoyer le message",
      submitting: "Envoi…",
      successTitle: "Message envoyé",
      successBody: "Votre message a été enregistré. Nous vous répondrons à l'adresse indiquée.",
      errorTitle: "Envoi impossible",
      errorBody: "Vérifiez les champs et réessayez. Si l'échec persiste, aucun autre canal courriel n'est disponible : réessayez plus tard.",
      invalid: "Formulaire invalide : vérifiez le nom, le courriel et le message.",
      nameInvalid: "Entrez un nom de 2 caractères minimum.",
      emailInvalid: "Entrez une adresse courriel valide.",
      messageInvalid: "Votre message doit contenir au moins 10 caractères.",
      consentRequired: "Cochez la case pour accepter le traitement de vos coordonnées.",
      network: "Réseau indisponible. Réessayez dans un instant.",
      rateLimited: "Trop de tentatives. Attendez une minute avant de réessayer.",
    },
    privacyNote:
      "Vos renseignements sont traités conformément à notre politique de confidentialité et conservés 24 mois après la dernière interaction.",
    privacyCta: "Politique de confidentialité",
    faqCta: "Consulter la FAQ avant d'écrire",
  },
};

export type ContentMessages = typeof fr;

export const en: ContentMessages = {
  common: {
    home: "Home",
    breadcrumb: "Breadcrumb",
    published: (date: string) => `Published on ${date}`,
    updated: (date: string) => `Updated on ${date}`,
    readingTime: (minutes: number) => `${minutes} min read`,
    sourceCount: (count: number) => `${count} official sources`,
    sourcesTitle: "Verified sources",
    sourcesBody:
      "Every factual statement in this article links to one of these official pages, consulted on the update date shown above.",
    disclaimer:
      "This article is informational. It is not an accredited appraisal, legal advice, or a financing recommendation.",
    termsLink: "terms of use",
    frenchOnlyTitle: "Available in French only",
    frenchOnlyBody:
      "This article does not have an English version yet. The complete French version is shown below; no machine translation is presented as official.",
    frenchOnlyBadge: "French only",
    backHome: "Back to home",
    errorTitle: "This page could not be found",
    errorBody: "The link may be out of date, or the article was renamed.",
    errorCta: "See all articles",
  },
  categories: {
    conseils: {
      label: "Advice",
      eyebrow: "Understand",
      title: "Advice for Québec homeowners",
      description:
        "The assessment roll, market value, the right time to sell: sourced explanations, with no promises and no invented numbers.",
      intro:
        "Short, checkable pieces explaining what Québec real-estate numbers mean — and what they do not. Every article names its official sources.",
      empty: "The first advice article will be published shortly.",
    },
    nouvelles: {
      label: "News",
      eyebrow: "Analyse",
      title: "News and market analysis",
      description:
        "What the Québec land registry statistics actually measure, and how to read them without drawing false conclusions.",
      intro:
        "Québec's public data is rich but easy to misread. These pieces explain how the official files are built, without repeating unverified press figures.",
      empty: "The first analysis will be published shortly.",
    },
  },
  faq: {
    eyebrow: "Frequently asked questions",
    title: "Your questions, checkable answers",
    description:
      "Calculation method, cost, data provenance, privacy: short answers with links to the full pages.",
    intro:
      "These answers apply to the whole site. Technical questions link to the data and privacy pages when the short answer is not enough.",
    anchorLabel: "Questions on this page",
    detailsHint: "Select a question to reveal the answer. Every section also works with a keyboard, without JavaScript.",
    structuredNote:
      "The FAQ structured data on this page repeats exactly the text displayed above.",
    contactTitle: "Question not listed here?",
    contactBody:
      "The contact form is the official channel: questions about an estimate, claiming a page, privacy rights, or reporting an error.",
    contactCta: "Write via the form",
  },
  brief: {
    eyebrow: "Le Brief",
    title: "The market, explained once a month",
    description:
      "A short, sourced edition: sales for the latest period, region by region, and what the public data can actually support.",
    intro:
      "Each edition starts from the Québec land registry statistics and cites them. When data is not available yet, we show an upcoming edition instead of invented numbers.",
    latestEdition: "Latest available edition",
    periodLabel: "Period",
    datasetLabel: "Dataset",
    totalSales: "Counted sales",
    regionsCount: "Regions with data",
    regionColumn: "Administrative region",
    salesColumn: "Sales",
    shareColumn: "Share of total",
    totalRow: "All displayed regions",
    tableCaption:
      "Number of sales by administrative region for the latest available period, as compiled by the Québec land registry.",
    archiveTitle: "Available editions",
    archiveIntro:
      "Periods published by the land registry and already ingested. A new edition is added automatically when a new period arrives.",
    archivePeriod: "Period",
    archiveSales: "Sales",
    noArchive: "No archived edition yet.",
    upcomingTitle: "Edition coming soon",
    upcomingBody:
      "Sales statistics have not been ingested into the database yet. Le Brief will publish its first edition as soon as the period is available — we do not show estimated numbers in the meantime.",
    upcomingHint: "In the meantime, see the Data and sources page for the planned datasets and their licences.",
    coverageTitle: "What this edition measures",
    coverageBody:
      "The figures come from the monthly statistics of the Québec land registry: number of sales by price band and administrative region. Only the first right in each act is counted, and the price bands do not allow an average price to be computed.",
    editionNote: "Editions are produced from ingested data; the collection date appears in the provenance block below.",
    methodologyCta: "Understand the difference between roll and market",
    newsletterTitle: "Get the next edition",
    newsletterBody: "One edition per month, no advertising. Unsubscribe in one click.",
  },
  donnees: {
    eyebrow: "Transparency",
    title: "Data and sources",
    description:
      "Every figure shown on MaMaisonQC comes from an official Government of Québec dataset: publisher, licence, source URL, collection date and known limitations.",
    intro:
      "This page is the site's provenance record. It lists the datasets used, what they feed, and what they cannot support.",
    catalogueTitle: "Datasets used",
    catalogueIntro:
      "The rows below come from the ingested dataset table. Dates and row counts reflect the latest collection.",
    emptyTitle: "Catalogue awaiting ingestion",
    emptyBody:
      "No dataset is registered in the database yet. The planned official sources are listed below with their publisher and licence; no row count is shown before the collection actually happens.",
    officialPortalsTitle: "Planned official sources",
    labels: {
      publisher: "Publisher",
      licence: "Licence",
      source: "Source URL",
      fetched: "Collected on",
      reference: "Reference date",
      rows: "Ingested rows",
      feeds: "What this dataset feeds",
      limitations: "Known limitations",
      identifier: "Identifier",
    },
    notIngested: "not ingested",
    notSpecified: "not specified",
    rowCount: (count: number) => `${count} rows`,
    siteLimitationsTitle: "Product limitations",
    siteLimitationsIntro:
      "These limitations apply to the whole site, in addition to each dataset's own limits.",
    methodTitle: "How we calculate an estimate",
    methodIntro:
      "Our estimate starts from the assessment roll, then builds a comparable set: same municipality, same neighbourhood unit (UMV), same use category, comparable area. The estimated value is a robust median of those comparables, with a range and a confidence level.",
    methodSteps: [
      "The roll value is read from the municipality's assessment roll, with its reference date.",
      "Comparables are selected from the same neighbourhood unit and use category, with a comparable area.",
      "The displayed estimate is a robust median, with a range (P25–P75) and a confidence level.",
      "When comparables are too few, the page shows an “insufficient data” state instead of a precise figure.",
    ],
    methodCta: "See an explained estimate",
    methodNote:
      "No generative AI is involved in the calculation. The model is statistical, its inputs are public, and every displayed figure carries its provenance.",
    attributionTitle: "Licence attribution",
    attributionBody:
      "The Government of Québec datasets used here are published under CC-BY 4.0 or the open government licence. Attribution is visible on every page that shows a figure, and repeated above with the publisher and the licence link.",
    backToTop: "Back to the catalogue",
    licenceLinkLabel: "CC-BY 4.0 — Données Québec",
  },
  conditions: {
    eyebrow: "Terms",
    title: "Terms of use",
    description:
      "MaMaisonQC's rules of use: indicative estimates, no brokerage relationship, intellectual property, liability and Québec law.",
    updatedLabel: "Last updated",
    updatedAt: "2026-10-26",
    intro:
      "By using MaMaisonQC you accept the terms below. They are available in French and English; if the versions diverge, the French version prevails.",
    sections: [
      {
        heading: "1. Purpose of the service",
        paragraphs: [
          "MaMaisonQC is a real-estate information service. It displays public Government of Québec data, indicative estimates computed from that data, and explanatory content.",
          "Access to public pages is free and does not require an account. Some features, such as claiming a property page or publishing a pre-market listing, require an account and are subject to the additional rules shown on those pages.",
        ],
      },
      {
        heading: "2. Indicative estimates, not an accredited appraisal",
        paragraphs: [
          "Displayed estimates are indicative. They are produced by a statistical model from public data and are neither an accredited appraisal, nor an appraiser's opinion, nor a price guarantee.",
          "An estimate does not replace a visit, an inspection, a location certificate, or a professional's analysis. You remain responsible for decisions you make based on the site's information.",
        ],
      },
      {
        heading: "3. No brokerage relationship and no financial advice",
        paragraphs: [
          "MaMaisonQC is not a real-estate broker, mortgage broker or accredited appraiser. The site creates no brokerage relationship, receives no mandate and recommends no financing product.",
          "A pre-market listing is not a brokerage listing, a sales offer or a contract. For a transaction, consult a broker licensed by the OACIQ, a notary or a lawyer.",
        ],
        links: [{ label: "OACIQ — check a broker", href: "https://registre.oaciq.com/fr/" }],
      },
      {
        heading: "4. Data accuracy and availability",
        paragraphs: [
          "Data comes from official sources but may contain errors, delays or omissions. The site is provided “as is”, without warranty of accuracy, completeness or continuous availability.",
          "If you find an error, report it through the contact form: we correct the source data or document the limitation.",
        ],
        links: [{ label: "Report an error", href: "/contact" }],
      },
      {
        heading: "5. Intellectual property",
        paragraphs: [
          "MaMaisonQC's text, visual identity and code are protected. Reused public data remains the property of its publishers and is used under its licence, with attribution.",
          "You may quote a short excerpt with the source and a link to the original page. Substantial reproduction, resale or commercial reuse of the content requires written permission.",
        ],
        links: [{ label: "See data licences", href: "/donnees" }],
      },
      {
        heading: "6. Acceptable use",
        paragraphs: [
          "You may not mass-extract the site's data, bypass access limits, publish false ownership claims, or use the site for unlawful or misleading purposes.",
          "We may suspend or remove access in case of abuse, without notice where the security of the service or of a third party requires it.",
        ],
      },
      {
        heading: "7. Limitation of liability",
        paragraphs: [
          "To the extent permitted by applicable law, MaMaisonQC is not liable for indirect damages, lost revenue, or decisions made based on the site's information.",
          "This limitation does not apply where the law prohibits such an exclusion, including consumer protection matters.",
        ],
      },
      {
        heading: "8. Governing law",
        paragraphs: [
          "These terms are governed by the laws of Québec and the applicable federal laws of Canada. Any dispute falls under the jurisdiction of the competent courts of Québec.",
        ],
      },
      {
        heading: "9. Changes",
        paragraphs: [
          "We may change these terms to reflect changes to the service or the law. The update date appears at the top of the page; using the site after a change constitutes acceptance.",
        ],
      },
      {
        heading: "10. Contact us",
        paragraphs: [
          "For any question about these terms, use the contact form, which is the official channel.",
        ],
        links: [{ label: "Contact form", href: "/contact" }],
      },
    ],
  },
  confidentialite: {
    eyebrow: "Privacy",
    title: "Privacy policy",
    description:
      "Law 25: what MaMaisonQC collects, why, for how long, and how to exercise your rights of access, rectification and deletion.",
    updatedLabel: "Last updated",
    updatedAt: "2026-10-26",
    intro:
      "This policy describes how MaMaisonQC processes personal information under Québec's Act respecting the protection of personal information in the private sector, modernised by Law 25. It is available in French and English; the French version prevails.",
    officerTitle: "Privacy officer",
    officerBody:
      "The privacy officer is the person designated by MaMaisonQC to oversee this policy. For any request, use the contact form: it is the official, logged channel, handled within the time limits set by law.",
    officerCta: "Contact the privacy officer",
    sections: [
      {
        heading: "1. Information collected",
        paragraphs: [
          "We limit collection to what is needed. Depending on how you use the site, we may hold: an email address for the Le Brief subscription; a name, email and message when you use the contact form; an email and message when you express interest in a pre-market listing; a name and email if you create an account to claim a page.",
          "We do not ask for sensitive information — health, biometric or detailed financial data — and you should not send any through the form.",
        ],
      },
      {
        heading: "2. Purposes of collection",
        paragraphs: [
          "Your information is used to deliver the requested service (answer a message, send Le Brief, connect you with an owner), to keep the site secure and reliable, to correct errors, and to meet legal obligations.",
          "We do not sell personal information, do not use it for third-party advertising, and do not disclose it for commercial purposes.",
        ],
      },
      {
        heading: "3. Consent and exceptions",
        paragraphs: [
          "Consent is obtained clearly, freely, knowingly and for each specific purpose. Subscribing to Le Brief and sending a contact request are voluntary actions on your part.",
          "Site usage measurement depends on your choice through the consent banner; refusing does not block access to the site. Some communications may occur without consent in the cases provided by law, for example to meet a legal obligation.",
        ],
      },
      {
        heading: "4. Cookies and usage measurement",
        paragraphs: [
          "The site uses no advertising pixel and no third-party analytics. A local cookie stores your consent choice. Usage measurements, when accepted, are aggregated and used only to improve the site.",
        ],
      },
      {
        heading: "5. Retention and destruction",
        paragraphs: [
          "Contact data is kept for 24 months after the last interaction, then securely destroyed. Le Brief subscribers are kept until they unsubscribe. Rights requests are kept for the time needed to process them and to evidence compliance.",
          "When the purpose is fulfilled, information is destroyed or anonymised, unless a law requires a longer retention period.",
        ],
      },
      {
        heading: "6. Your rights",
        paragraphs: [
          "You may request access to the personal information we hold about you, request rectification if it is inaccurate or incomplete, and request deletion where the law allows. You may also withdraw consent for a given purpose, for example by unsubscribing from Le Brief.",
          "Use the contact form, stating the purpose of your request and the email address concerned. We answer within the time limits set by law and may ask for reasonable identity verification before acting.",
        ],
        links: [{ label: "Exercise my rights", href: "/contact" }],
      },
      {
        heading: "7. Security and incidents",
        paragraphs: [
          "We apply reasonable security measures: restricted data access, logging of administrative operations, and separation between public data and personal information. No system is infallible, but these measures aim to reduce the risk of unauthorised access.",
          "If an incident presents a risk of serious harm, we will notify the Commission d'accès à l'information and the individuals concerned, as required by law.",
        ],
      },
      {
        heading: "8. Transfers outside Québec and service providers",
        paragraphs: [
          "We favour hosting in Canada. If a provider must process personal information outside Québec, we carry out a privacy impact assessment and frame the transfer with a written agreement, as Law 25 requires.",
        ],
      },
      {
        heading: "9. Minors",
        paragraphs: [
          "The service is intended for adults. We do not knowingly collect personal information about minors; if such a situation is reported to us, we will delete it.",
        ],
      },
      {
        heading: "10. Changes and recourse",
        paragraphs: [
          "The update date appears at the top of the page. For a question or a complaint, start with the contact form. If the answer does not satisfy you, you may contact the Commission d'accès à l'information du Québec.",
        ],
        links: [
          { label: "Contact form", href: "/contact" },
          { label: "Commission d'accès à l'information", href: "https://www.cai.gouv.qc.ca/" },
        ],
      },
    ],
  },
  contact: {
    eyebrow: "Get in touch",
    title: "Contact",
    description:
      "Questions about an estimate, claiming a page, privacy rights: the form is the official channel.",
    intro:
      "The form below is MaMaisonQC's official channel. It keeps a record of your request and lets us reply without exposing an inbox address to spam.",
    officialChannelTitle: "One official, logged channel",
    officialChannelBody:
      "We do not publish an inbox email address. All requests go through this form: questions about an estimate, data error reports, page claims, access or deletion requests, press.",
    responseTitle: "Response times",
    responseBody:
      "We aim to answer within two business days for ordinary requests. Privacy-related requests are handled within the time limits set by law.",
    form: {
      legend: "Your message",
      name: "Name",
      nameHint: "A first name only is fine.",
      namePlaceholder: "Your name",
      email: "Email address",
      emailHint: "Used only to reply to you.",
      emailPlaceholder: "you@example.ca",
      message: "Message",
      messageHint: "Include the municipality and the address if your request is about a property.",
      messagePlaceholder: "Describe your request…",
      consent: "I agree that my contact details may be used to handle my request.",
      submit: "Send message",
      submitting: "Sending…",
      successTitle: "Message sent",
      successBody: "Your message has been recorded. We will reply to the address provided.",
      errorTitle: "Could not send",
      errorBody: "Check the fields and try again. If the failure persists, no other email channel is available: try again later.",
      invalid: "Invalid form: check the name, email and message.",
      nameInvalid: "Enter a name of at least 2 characters.",
      emailInvalid: "Enter a valid email address.",
      messageInvalid: "Your message must be at least 10 characters long.",
      consentRequired: "Tick the box to accept the processing of your details.",
      network: "Network unavailable. Try again in a moment.",
      rateLimited: "Too many attempts. Wait a minute before retrying.",
    },
    privacyNote:
      "Your information is processed under our privacy policy and kept for 24 months after the last interaction.",
    privacyCta: "Privacy policy",
    faqCta: "Read the FAQ before writing",
  },
};

const dictionaries: Record<Locale, ContentMessages> = { fr, en };

export function messagesFor(locale: Locale): ContentMessages {
  return dictionaries[locale];
}

export type { Locale };
