import type { Locale } from "@/i18n/config";

/**
 * Owner-area dictionary. Same contract as `src/i18n/messages/{fr,en}.ts`: the French object defines
 * the shape, the English object must satisfy it, so a missing translation is a type error.
 * Only strings, arrays of strings and simple formatter functions live here; pages own structure.
 */
const fr = {
  common: {
    home: "Accueil",
    owners: "Propriétaires",
    equity: "Équité",
    mortgage: "Hypothèque",
    subsidies: "Subventions",
    dashboard: "Tableau de bord",
    interests: "Intérêts reçus",
    login: "Connexion",
    signup: "Créer un compte",
    logout: "Se déconnecter",
    breadcrumb: "Fil d'Ariane",
    viewSheet: "Voir la fiche d'évaluation",
    backToDashboard: "Retour au tableau de bord",
    notProvided: "Non fourni",
    estimated: "Estimation",
  },
  meta: {
    hub: {
      title: "Propriétaires : équité, hypothèque, subventions",
      description:
        "Calculez votre équité et votre marge de refinancement, comprenez votre renouvellement hypothécaire et repérez les subventions de rénovation vérifiées.",
    },
    equity: {
      title: "Calculer mon équité et ma marge de refinancement",
      description:
        "Calculez votre paiement hypothécaire, votre équité en dollars et en pourcentage, et la marge de refinancement théorique à 80 % de la valeur de votre propriété.",
    },
    mortgageIndex: {
      title: "Guides hypothécaires pour propriétaires",
      description:
        "Six guides pour comprendre le renouvellement, le refinancement, la consolidation de dettes, la séparation et le choix entre vendre et rénover.",
    },
    subsidiesIndex: {
      title: "Subventions de rénovation au Québec",
      description:
        "Rénoclimat, Rénoclimat – Adaptation, LogisVert et les programmes associés : montants, admissibilité et sources officielles vérifiées.",
    },
    dashboard: {
      title: "Tableau de bord propriétaire",
      description:
        "Vos réclamations de propriété, vos pré-marchés et le nombre d'intérêts reçus, dans une session privée.",
    },
    interests: {
      title: "Intérêts reçus sur mes pré-marchés",
      description:
        "Les marques d'intérêt des acheteurs pour vos propres pré-marchés, visibles seulement dans votre session.",
    },
    signIn: {
      title: "Connexion",
      description:
        "Connectez-vous à votre espace propriétaire MaMaisonQC pour retrouver vos réclamations, vos pré-marchés et les intérêts reçus.",
    },
    signUp: {
      title: "Créer un compte propriétaire",
      description:
        "Créez votre compte MaMaisonQC pour réclamer la fiche d'une propriété, suivre vos pré-marchés et consulter les intérêts reçus.",
    },
    signOut: {
      title: "Déconnexion",
      description: "Fermer votre session MaMaisonQC.",
    },
  },
  hub: {
    eyebrow: "Propriétaires",
    title: "Votre maison, votre équité, vos options",
    intro:
      "Que vous renouveliez bientôt, pensiez à refinancer ou cherchiez de l'aide pour rénover, partez de vos chiffres. Nos outils calculent, nos guides expliquent, et chaque donnée officielle affiche sa source.",
    equity: {
      eyebrow: "Outil gratuit",
      title: "Calculez votre équité",
      body: "Valeur, solde hypothécaire, taux et amortissement : obtenez votre paiement mensuel, votre équité et la marge de refinancement théorique à 80 % de la valeur.",
      cta: "Calculer mon équité",
    },
    mortgage: {
      eyebrow: "Hypothèque",
      title: "Six situations, six guides",
      body: "Renouvellement, rénovation, investissement, dettes, séparation, vente ou rénovation : des explications concrètes, sans taux inventé ni promesse d'approbation.",
      cta: "Voir les guides hypothécaires",
    },
    subsidies: {
      eyebrow: "Subventions",
      title: "Aide financière pour rénover",
      body: "Cinq programmes, avec les montants publiés, les critères d'admissibilité et la page officielle consultée. Quand un détail ne peut pas être vérifié, il est signalé.",
      cta: "Voir les programmes",
    },
    assurance: {
      eyebrow: "Assurance",
      title: "Assurance habitation : ce qu'il faut vérifier",
      body: [
        "L'assurance habitation protège le bâtiment et votre responsabilité; elle ne remplace pas l'assurance prêt hypothécaire, qui protège le prêteur en cas de décès ou d'invalidité.",
        "Vérifiez que le montant assuré correspond au coût de reconstruction, pas à la valeur au rôle ni au prix payé. Une valeur au rôle peut être très différente du coût de reconstruction.",
        "Passez en revue les exclusions et les franchises, notamment le refoulement d'eau, les infiltrations, les inondations, les tremblements de terre et les travaux mal exécutés.",
        "Après une rénovation, informez votre assureur : une cuisine refaite, un sous-sol aménagé ou un système de chauffage remplacé changent la valeur du bâtiment.",
        "En copropriété, l'assurance du syndicat couvre les parties communes; votre police personnelle couvre vos biens et les améliorations que vous avez apportées à votre unité.",
      ],
      note: "MaMaisonQC n'a aucune entente avec un assureur et ne vend ni ne recommande aucun produit d'assurance. Les éléments ci-dessus sont des points de vérification généraux, pas une police ni un avis d'assurance. Consultez un courtier ou un assureur pour votre situation.",
      cta: "Questions fréquentes",
    },
    dashboard: {
      title: "Votre espace privé",
      body: "Retrouvez les fiches que vous avez réclamées et les intérêts reçus sur vos pré-marchés. Seule votre session donne accès à ces données.",
      cta: "Ouvrir mon tableau de bord",
    },
    notDoTitle: "Ce que nous ne faisons pas",
    notDoBody:
      "Nous ne sommes ni prêteur, ni courtier hypothécaire, ni assureur. Nous ne vendons pas de produits financiers et nous ne transmettons pas votre dossier à un tiers sans votre action.",
    notDo: [
      "Aucune offre de prêt et aucune préapprobation.",
      "Aucun taux « moyen » inventé : les taux varient selon le prêteur et le dossier.",
      "Aucune évaluation agréée : nos estimations sont indicatives et affichent leur méthode.",
      "Aucune assurance vendue ou recommandée.",
    ],
    disclosure:
      "Les outils de cette section produisent des calculs arithmétiques à partir de vos chiffres. Ils ne constituent ni une offre de financement, ni une évaluation agréée, ni un conseil financier personnalisé.",
  },
  equity: {
    eyebrow: "Outil propriétaire",
    title: "Calculez votre équité et votre marge de refinancement",
    intro:
      "Entrez la valeur de votre propriété, le solde de votre hypothèque, le taux et l'amortissement restant. Vous verrez votre paiement mensuel, votre équité et la marge théorique disponible à 80 % de la valeur.",
    prefill: {
      title: "Valeur préremplie depuis le rôle d'évaluation",
      body: "Valeur au rôle {value}, rôle {year}. La fiche complète contient les valeurs du terrain et du bâtiment, la date de référence et les comparables.",
      noAddress: "Adresse non publiée",
      sheetLink: "Voir la fiche d'évaluation",
    },
    notFoundTitle: "Matricule introuvable",
    notFoundBody:
      "Le matricule fourni ne correspond à aucune propriété de notre couverture actuelle. Vous pouvez saisir votre valeur à la main; nous ne remplaçons jamais une donnée manquante par une estimation inventée.",
    calculator: {
      sectionTitle: "Calculatrice d'équité",
      cardTitle: "Vos chiffres",
      cardIntro:
        "Tous les montants sont traités en cents à l'intérieur du calcul : aucun arrondi flottant ne s'accumule dans le résultat.",
      invalidTitle: "Vérifiez les champs indiqués",
      invalidBody: "Aucun résultat n'est affiché tant que les valeurs ne sont pas valides.",
      valueLabel: "Valeur de la propriété ($)",
      valueHint:
        "Préremplie depuis le rôle d'évaluation lorsque la page est ouverte depuis une fiche.",
      valuePlaceholder: "450 000",
      balanceLabel: "Solde hypothécaire ($)",
      balanceHint: "Capital restant dû, sans les intérêts. Entrez 0 s'il n'y a plus d'hypothèque.",
      balancePlaceholder: "300 000",
      rateLabel: "Taux annuel (%)",
      rateHint: "Taux nominal de votre prêt, par exemple 4,79.",
      ratePlaceholder: "4,79",
      yearsLabel: "Amortissement restant (années)",
      yearsPlaceholder: "25",
      monthsLabel: "Mois en plus",
      monthsPlaceholder: "0",
      submit: "Calculer mon équité",
      submitting: "Calcul en cours…",
      resultTitle: "Votre situation estimée",
      resultHint: "Calcul indicatif à partir des chiffres saisis. Hypothèses détaillées plus bas.",
      negativeTitle: "Équité négative",
      negativeBefore: "Votre solde hypothécaire dépasse la valeur saisie de",
      negativeAfter:
        "Il n'y a aucune marge de refinancement à 80 % tant que cette situation dure. Aucun refinancement n'est donc proposé ici : parlez à un courtier hypothécaire des options possibles (remboursement partiel, vente, renégociation avec le prêteur).",
      paymentLabel: "Paiement mensuel",
      paymentNoMortgage: "Aucune hypothèque",
      paymentHint: "Capital et intérêts, {months} mois restants",
      paymentHintNoMortgage: "Solde saisi : 0 $",
      equityLabel: "Équité",
      equityHint: "{percent} de la valeur saisie",
      ltvLabel: "80 %",
      headroomLabel: "Marge à {ltv}",
      headroomNone: "Aucune marge",
      headroomHintBalance: "Le solde atteint ou dépasse le plafond de financement.",
      headroomHintNone: "Aucune valeur exploitable.",
      headroomHintRoom: "Plafond théorique avant frais et règles du prêteur.",
      maxLoanLabel: "Prêt maximal à {ltv}",
      maxLoanHint: "Valeur saisie × {ltv}, arrondie au cent.",
      refinanceNote:
        "Une marge existe, mais elle n'est pas une offre : le prêteur vérifie vos revenus, vos dettes, la valeur marchande et ses propres règles.",
      refinanceCta: "Comprendre le refinancement",
      assumptionsTitle: "Hypothèses du calcul",
      assumptions: [
        "Taux nominal annuel composé mensuellement, taux fixe pendant la période restante.",
        "Paiement calculé sur le solde saisi et l'amortissement restant, en versements mensuels égaux.",
        "Marge de refinancement plafonnée à 80 % de la valeur saisie — une hypothèse de calcul, pas une règle universelle des prêteurs.",
        "Aucun frais, aucune pénalité de remboursement anticipé, aucune prime d'assurance ni taxe n'est incluse.",
        "Aucune vérification de revenus, de crédit ou de valeur marchande n'est simulée.",
      ],
      disclaimer:
        "Ce calcul ne remplace pas une offre de prêt ni une évaluation agréée. Les taux, frais et pénalités varient selon le prêteur, le terme, le produit et votre dossier; validez votre situation avec un courtier hypothécaire ou votre prêteur.",
      emptyTitle: "Votre résultat",
      emptyBody:
        "Le calcul apparaîtra ici : paiement mensuel, équité en dollars et en pourcentage, puis marge de refinancement à 80 % de la valeur.",
      emptyNote:
        "Nous n'inventons aucune valeur par défaut : sans vos chiffres, il n'y a pas de résultat.",
    },
    methodTitle: "Méthode de calcul",
    method: [
      {
        title: "L'équité",
        body: "Valeur de la propriété moins le capital restant dû. C'est la part que vous possédez réellement, avant frais de vente éventuels.",
      },
      {
        title: "La marge à 80 %",
        body: "Le prêt maximal utilisé ici est de 80 % de la valeur saisie, moins votre solde. Les prêteurs appliquent leurs propres ratios et exigent souvent une évaluation.",
      },
      {
        title: "Le paiement",
        body: "Paiement mensuel constant sur le solde et l'amortissement restants, à taux fixe. Frais, assurances, taxes et pénalités ne sont pas inclus.",
      },
    ],
    nextTitle: "Et ensuite?",
    nextBody:
      "Une marge de refinancement ne signifie pas qu'un prêt sera accordé. Avant d'engager des travaux ou une consolidation, comparez les scénarios avec un courtier hypothécaire et vérifiez les pénalités de remboursement anticipé de votre prêt actuel.",
    nextMortgageCta: "Les guides hypothécaires",
    nextSubsidiesCta: "Subventions pour rénover",
    disclaimer:
      "MaMaisonQC n'est ni un prêteur ni un courtier hypothécaire. Cet outil produit une estimation arithmétique à partir de vos chiffres; il ne constitue ni une offre de financement, ni une évaluation agréée, ni un conseil financier personnalisé.",
    errors: {
      valueRequired: "Entrez la valeur de la propriété.",
      valueInvalid: "Montant invalide : utilisez des chiffres, par exemple 450 000.",
      valueRange: "Ce montant dépasse la limite permise.",
      valueZero: "La valeur doit être supérieure à 0.",
      balanceRequired: "Entrez le solde de votre hypothèque (0 s'il n'y en a pas).",
      balanceInvalid: "Montant invalide : utilisez des chiffres, par exemple 450 000.",
      balanceRange: "Ce montant dépasse la limite permise.",
      rateRequired: "Entrez le taux annuel (par exemple 4,79).",
      rateInvalid: "Taux invalide : entrez un pourcentage, par exemple 4,79.",
      rateRange: "Le taux doit être entre 0 % et 25 %.",
      yearsRequired: "Entrez l'amortissement restant en années.",
      yearsInvalid: "Années invalides : entrez un nombre entier.",
      monthsInvalid: "Mois invalides : entrez un nombre entre 0 et 11.",
      monthsRange: "L'amortissement restant doit être entre 1 et 600 mois.",
    },
  },
  auth: {
    errors: {
      emailRequired: "Entrez votre adresse courriel.",
      emailInvalid: "Adresse courriel invalide.",
      emailTooLong: "Adresse courriel trop longue.",
      passwordRequired: "Entrez votre mot de passe.",
      passwordTooLong: "Mot de passe trop long.",
      passwordShort: "Le mot de passe doit contenir au moins 10 caractères.",
      nameShort: "Entrez votre nom (2 caractères minimum).",
      nameLong: "Nom trop long (80 caractères maximum).",
      confirmRequired: "Confirmez votre mot de passe.",
      mismatch: "Les deux mots de passe ne correspondent pas.",
      invalidCredentials: "Courriel ou mot de passe invalide.",
      genericSignIn: "Connexion impossible pour le moment. Réessayez dans un instant.",
      genericSignUp:
        "Ce compte n'a pas pu être créé avec ces informations. Si vous avez déjà un compte, connectez-vous.",
      throttledSignIn: "Trop de tentatives. Réessayez dans une minute.",
      throttledSignUp: "Trop de tentatives. Réessayez dans quelques minutes.",
    },
    signIn: {
      eyebrow: "Espace propriétaire",
      title: "Connexion",
      intro:
        "Vos réclamations, vos pré-marchés et les intérêts reçus sont visibles seulement dans votre session.",
      signedOutTitle: "Déconnexion réussie",
      signedOutBody: "Votre session a été fermée. Vous pouvez vous reconnecter en tout temps.",
      formErrorTitle: "Connexion impossible",
      emailLabel: "Adresse courriel",
      passwordLabel: "Mot de passe",
      passwordHint: "Jamais partagé, jamais affiché dans l'URL.",
      submit: "Se connecter",
      submitting: "Connexion…",
      noAccount: "Pas encore de compte?",
      signUpLink: "Créer un compte",
      footerNote: "Vous arrivez d'une réclamation?",
      footerLink: "Créez votre compte depuis la fiche de la propriété",
      footerAfter: "pour que la demande soit rattachée au bon immeuble.",
    },
    signUp: {
      eyebrow: "Espace propriétaire",
      title: "Créer un compte",
      intro:
        "Un compte vous permet de réclamer la fiche d'une propriété, de préparer un pré-marché et de recevoir les marques d'intérêt des acheteurs.",
      claimTitle: "Réclamation rattachée à cette inscription",
      claimBody: "Vous demandez à réclamer : {address}.",
      claimFallback: "matricule {id}",
      claimPending:
        "La demande sera en attente jusqu'à sa vérification. Vous pourrez suivre son état dans votre tableau de bord.",
      claimNotFoundTitle: "Propriété non trouvée",
      claimNotFoundBody:
        "Le matricule fourni ne correspond à aucune propriété de notre couverture actuelle. Vous pouvez créer un compte, puis réclamer une page depuis une fiche d'évaluation.",
      formErrorTitle: "Inscription impossible",
      nameLabel: "Nom",
      emailLabel: "Adresse courriel",
      passwordLabel: "Mot de passe",
      passwordHint: "10 caractères minimum. Utilisez une phrase de passe unique.",
      confirmLabel: "Confirmer le mot de passe",
      termsPrefix: "En créant un compte, vous acceptez les",
      termsLink: "conditions d'utilisation",
      termsMiddle: "et la",
      privacyLink: "politique de confidentialité",
      termsSuffix: ".",
      submit: "Créer mon compte",
      submitting: "Création du compte…",
      haveAccount: "Déjà inscrit?",
      signInLink: "Se connecter",
      enumerationNote:
        "Nous ne vérifions pas publiquement si une adresse courriel possède déjà un compte : le message affiché reste le même dans tous les cas.",
      faqBefore: "Besoin d'aide? Consultez la",
      faqLink: "FAQ",
      faqAfter: ".",
    },
    signOut: {
      title: "Déconnexion",
      intro: "Vous êtes connecté comme {email}. Fermer la session supprime le cookie et révoque la session côté serveur.",
      submit: "Se déconnecter",
      stayBefore: "Vous préférez rester connecté?",
      stayLink: "Retour au tableau de bord",
      stayAfter: ".",
      notSignedIn: "Vous n'êtes pas connecté : aucune session à fermer.",
      loginLink: "Se connecter",
    },
  },
  mortgage: {
    eyebrow: "Guides hypothécaires",
    indexTitle: "Comprendre votre hypothèque avant de signer",
    indexIntro:
      "Six situations fréquentes chez les propriétaires du Québec. Chaque guide explique les questions à poser, les documents à réunir et les pièges à vérifier. Aucun taux n'y est inventé : les conditions varient selon le prêteur et votre dossier.",
    readGuide: "Lire le guide",
    checklistTitle: "À vérifier avec un courtier",
    checklistIntro:
      "Ces points ne remplacent pas une analyse de votre dossier, mais ils vous évitent d'arriver sans questions.",
    ratesTitle: "Les taux varient — toujours",
    ratesBody:
      "Les taux, les frais et les pénalités varient selon le prêteur, le produit, le terme et votre dossier. Les comparateurs et les taux affichés ailleurs ne constituent pas une offre pour votre situation. Validez avec un courtier hypothécaire ou votre prêteur.",
    relatedTitle: "Guides liés",
    ctaTitle: "Où en êtes-vous?",
    ctaBody:
      "Avant de discuter avec un prêteur, calculez votre équité et la marge de refinancement théorique à 80 % de la valeur. Vous arriverez avec des chiffres plutôt qu'avec une impression.",
    ctaButton: "Calculer mon équité",
    backToIndex: "Tous les guides",
    disclaimer:
      "Ce guide est de l'information générale, pas un conseil financier, juridique ou fiscal personnalisé. MaMaisonQC n'est ni prêteur ni courtier hypothécaire. Les décisions de crédit appartiennent au prêteur.",
  },
  subsidies: {
    eyebrow: "Subventions rénovation",
    indexTitle: "Les programmes d'aide pour rénover au Québec",
    indexIntro:
      "Cinq programmes qui peuvent financer une partie de vos travaux. Chaque fiche indique les montants et les critères publiés par le programme, la page officielle consultée et la date de vérification. Les programmes changent : vérifiez toujours avant de commencer des travaux.",
    programLabel: "Programme",
    publisherLabel: "Administré par",
    verifiedOn: "Vérifié le",
    officialPage: "Page officielle du programme",
    amountsTitle: "Montants et travaux admissibles",
    amountsNote:
      "Montants maximaux publiés par le programme. Le montant réel dépend de votre projet et des règles en vigueur au moment de la demande.",
    measureColumn: "Mesure",
    amountColumn: "Aide financière maximale",
    eligibilityTitle: "Admissibilité",
    stepsTitle: "Étapes à suivre",
    deadlinesTitle: "Dates et périodes importantes",
    unverifiedTitle: "Détails non reproduits ici",
    unverifiedBody:
      "Certains détails n'ont pas pu être vérifiés sur la page officielle à la date de consultation. Ils ne sont pas inventés ici : vérifiez auprès du programme.",
    checkProgram: "vérifiez auprès du programme",
    sourcesTitle: "Sources officielles",
    disclaimerTitle: "Avant de commencer des travaux",
    disclaimerBody:
      "Ne commencez pas les travaux avant d'avoir confirmé votre admissibilité, les montants applicables et les documents exigés par le programme. Les programmes, montants et dates peuvent changer sans préavis; cette page est une synthèse datée, pas une décision d'admissibilité.",
    backToIndex: "Tous les programmes",
    ctaTitle: "Financer le reste avec votre équité?",
    ctaBody:
      "Une subvention couvre rarement la totalité des travaux. Calculez la marge de refinancement théorique à 80 % de la valeur de votre propriété avant de choisir vos travaux.",
    ctaButton: "Calculer mon équité",
    sourcePrefix: "Source :",
    lastChecked: "Dernière vérification",
    pageUpdated: "Page mise à jour le",
    statusOpen: "Ouvert",
    statusClosed: "Fermé",
    statusVariable: "Variable",
    statusUnknown: "À vérifier",
    statusLabel: "Statut",
    audienceTitle: "À qui s'adresse ce programme",
    notForIndividuals:
      "Ce programme ne s'adresse pas d'abord aux propriétaires occupants qui rénovent leur maison.",
  },
  dashboard: {
    eyebrow: "Espace propriétaire",
    title: "Tableau de bord",
    greeting: "Bonjour {name}.",
    welcomeTitle: "Bienvenue",
    welcomeBody: "Votre compte est créé. Réclamez une propriété pour suivre ses données et préparer un pré-marché.",
    claimRequestedTitle: "Réclamation envoyée",
    claimRequestedBody:
      "Votre demande est en attente de vérification. Vous la verrez ci-dessous avec son statut.",
    claimNotFoundTitle: "Réclamation non enregistrée",
    claimNotFoundBody:
      "Le matricule fourni n'était pas dans notre couverture. Votre compte est créé; vous pouvez réclamer une propriété depuis une fiche d'évaluation.",
    claimsTitle: "Mes réclamations",
    claimsIntro:
      "Une réclamation devient une fiche à vous seulement après vérification. Seules les fiches approuvées ouvrent les données privées.",
    approvedTitle: "Approuvées",
    pendingTitle: "En attente",
    rejectedTitle: "Refusées",
    noClaimsTitle: "Aucune réclamation pour l'instant",
    noClaimsBody:
      "Trouvez votre propriété par adresse, puis réclamez sa fiche. Tant qu'elle n'est pas approuvée, vous pouvez continuer à utiliser le calculateur librement.",
    findProperty: "Trouver ma propriété",
    statusPending: "En attente",
    statusApproved: "Approuvée",
    statusRejected: "Refusée",
    requestedOn: "Demandée le",
    decidedOn: "Décidée le",
    listingsTitle: "Mes pré-marchés",
    listingsIntro:
      "Vos annonces en préparation de mise en marché et le nombre d'intérêts reçus. Seuls les intérêts de vos propres annonces sont visibles.",
    noListingsTitle: "Aucun pré-marché",
    noListingsBody:
      "Un pré-marché vous permet de mesurer l'intérêt des acheteurs avant une inscription officielle, sans publier votre adresse civique.",
    viewMarket: "Voir le pré-marché",
    listingAsking: "Prix demandé",
    listingHorizon: "Horizon",
    listingVisibility: "Visibilité",
    listingStatus: "Statut",
    listingCreated: "Créé le",
    listingStatusActive: "Actif",
    listingStatusPaused: "En pause",
    listingStatusRetired: "Retiré",
    visibilityVerified: "Acheteurs vérifiés",
    visibilityPrivate: "Privé",
    viewInterests: "Voir les intérêts",
    interestsCount: "{count} intérêt",
    interestsCountPlural: "{count} intérêts",
    securityTitle: "Confidentialité",
    securityBody:
      "Ces données sont lues avec votre identifiant de session. Aucun paramètre d'URL ne permet de consulter les réclamations ou les intérêts d'une autre personne.",
    signOutTitle: "Fin de session",
    signOutBody: "Fermer votre session supprime le cookie et révoque la session côté serveur.",
    viewSheet: "Voir la fiche",
    unknownAddress: "Adresse non publiée",
  },
  interests: {
    eyebrow: "Intérêts reçus",
    title: "Les acheteurs intéressés par vos pré-marchés",
    intro:
      "Seuls les intérêts rattachés à vos propres annonces apparaissent ici. L'accès vient de votre session, jamais d'un paramètre d'URL.",
    emptyTitle: "Aucun intérêt reçu pour l'instant",
    emptyBody:
      "Quand une annonce de pré-marché est visible et qu'un acheteur manifeste son intérêt, la demande apparaît ici avec ses coordonnées.",
    emptyCta: "Retour au tableau de bord",
    listingLabel: "Annonce",
    askingLabel: "Prix demandé",
    fromLabel: "Nom",
    emailLabel: "Courriel",
    messageLabel: "Message",
    noMessage: "Aucun message",
    receivedOn: "Reçu le",
    statusLabel: "Statut",
    statusNew: "Nouveau",
    statusContacted: "Contacté",
    statusClosed: "Clos",
    contactNote:
      "MaMaisonQC n'envoie pas de courriel à votre place : écrivez directement à la personne intéressée.",
    totalLabel: "Intérêts affichés",
    listingsLabel: "Annonces concernées",
    backToDashboard: "Retour au tableau de bord",
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

/** The contract: only shape and argument types are shared, never the literals. */
export type OwnerMessages = Widen<typeof fr>;

const en: OwnerMessages = {
  common: {
    home: "Home",
    owners: "Owners",
    equity: "Equity",
    mortgage: "Mortgage",
    subsidies: "Subsidies",
    dashboard: "Dashboard",
    interests: "Interests received",
    login: "Log in",
    signup: "Create an account",
    logout: "Log out",
    breadcrumb: "Breadcrumb",
    viewSheet: "View the assessment page",
    backToDashboard: "Back to dashboard",
    notProvided: "Not provided",
    estimated: "Estimate",
  },
  meta: {
    hub: {
      title: "Owners: equity, mortgage, subsidies",
      description:
        "Calculate your equity and refinance headroom, understand your mortgage renewal and find verified renovation subsidies.",
    },
    equity: {
      title: "Calculate my equity and refinance headroom",
      description:
        "Calculate your monthly mortgage payment, your equity in dollars and percent, and the theoretical refinance headroom at 80% of your property value.",
    },
    mortgageIndex: {
      title: "Mortgage guides for owners",
      description:
        "Six guides to understand renewal, refinancing, debt consolidation, separation and choosing between selling and renovating.",
    },
    subsidiesIndex: {
      title: "Renovation subsidies in Quebec",
      description:
        "Rénoclimat, Rénoclimat – Adaptation, LogisVert and related programs: amounts, eligibility and verified official sources.",
    },
    dashboard: {
      title: "Owner dashboard",
      description:
        "Your property claims, your pre-market listings and the number of interests received, in a private session.",
    },
    interests: {
      title: "Interests received on my pre-market listings",
      description:
        "Buyer interests for your own pre-market listings, visible only in your session.",
    },
    signIn: {
      title: "Log in",
      description:
        "Log in to your MaMaisonQC owner area to see your claims, pre-market listings and the interests received.",
    },
    signUp: {
      title: "Create an owner account",
      description:
        "Create your MaMaisonQC account to claim a property page, follow your pre-market listings and read the interests received.",
    },
    signOut: {
      title: "Log out",
      description: "Close your MaMaisonQC session.",
    },
  },
  hub: {
    eyebrow: "Owners",
    title: "Your home, your equity, your options",
    intro:
      "Whether you are renewing soon, considering refinancing or looking for help to renovate, start from your numbers. Our tools calculate, our guides explain, and every official figure shows its source.",
    equity: {
      eyebrow: "Free tool",
      title: "Calculate your equity",
      body: "Value, mortgage balance, rate and amortization: get your monthly payment, your equity and the theoretical refinance headroom at 80% of the value.",
      cta: "Calculate my equity",
    },
    mortgage: {
      eyebrow: "Mortgage",
      title: "Six situations, six guides",
      body: "Renewal, renovation, investment, debt, separation, selling or renovating: concrete explanations, with no invented rates and no promise of approval.",
      cta: "See the mortgage guides",
    },
    subsidies: {
      eyebrow: "Subsidies",
      title: "Financial help to renovate",
      body: "Five programs with published amounts, eligibility rules and the official page we consulted. When a detail cannot be verified, we say so.",
      cta: "See the programs",
    },
    assurance: {
      eyebrow: "Insurance",
      title: "Home insurance: what to check",
      body: [
        "Home insurance protects the building and your liability; it does not replace mortgage insurance, which protects the lender if you die or become disabled.",
        "Check that the insured amount reflects the rebuild cost, not the assessment value or the price you paid. An assessment value can be very different from a rebuild cost.",
        "Review exclusions and deductibles, especially sewer backup, water seepage, flooding, earthquakes and poorly executed work.",
        "After a renovation, tell your insurer: a rebuilt kitchen, a finished basement or a replaced heating system changes the value of the building.",
        "In a condominium, the syndicate's insurance covers common areas; your own policy covers your belongings and the improvements you made to your unit.",
      ],
      note: "MaMaisonQC has no agreement with any insurer and does not sell or recommend insurance products. The points above are general checks, not a policy or insurance advice. Talk to a broker or insurer about your situation.",
      cta: "Frequently asked questions",
    },
    dashboard: {
      title: "Your private space",
      body: "Find the pages you claimed and the interests received on your pre-market listings. Only your session grants access to this data.",
      cta: "Open my dashboard",
    },
    notDoTitle: "What we do not do",
    notDoBody:
      "We are not a lender, a mortgage broker or an insurer. We do not sell financial products and we do not send your file to a third party without your action.",
    notDo: [
      "No loan offer and no pre-approval.",
      "No invented 'average' rate: rates vary by lender and by file.",
      "No certified appraisal: our estimates are indicative and show their method.",
      "No insurance sold or recommended.",
    ],
    disclosure:
      "The tools in this section produce arithmetic calculations from your numbers. They are not a financing offer, a certified appraisal or personal financial advice.",
  },
  equity: {
    eyebrow: "Owner tool",
    title: "Calculate your equity and refinance headroom",
    intro:
      "Enter your property value, your mortgage balance, the rate and the remaining amortization. You will see your monthly payment, your equity and the theoretical headroom available at 80% of the value.",
    prefill: {
      title: "Value pre-filled from the assessment roll",
      body: "Assessment value {value}, roll {year}. The full page shows land and building values, the reference date and comparables.",
      noAddress: "Address not published",
      sheetLink: "View the assessment page",
    },
    notFoundTitle: "Assessment number not found",
    notFoundBody:
      "The assessment number provided does not match any property in our current coverage. You can enter your value manually; we never replace missing data with an invented estimate.",
    calculator: {
      sectionTitle: "Equity calculator",
      cardTitle: "Your numbers",
      cardIntro:
        "All amounts are handled in integer cents inside the calculation: no floating-point rounding accumulates in the result.",
      invalidTitle: "Check the highlighted fields",
      invalidBody: "No result is shown until the values are valid.",
      valueLabel: "Property value ($)",
      valueHint:
        "Pre-filled from the assessment roll when the page is opened from a property page.",
      valuePlaceholder: "450,000",
      balanceLabel: "Mortgage balance ($)",
      balanceHint: "Remaining principal, excluding interest. Enter 0 if there is no mortgage.",
      balancePlaceholder: "300,000",
      rateLabel: "Annual rate (%)",
      rateHint: "Nominal rate of your loan, for example 4.79.",
      ratePlaceholder: "4.79",
      yearsLabel: "Remaining amortization (years)",
      yearsPlaceholder: "25",
      monthsLabel: "Extra months",
      monthsPlaceholder: "0",
      submit: "Calculate my equity",
      submitting: "Calculating…",
      resultTitle: "Your estimated position",
      resultHint: "Indicative calculation from the numbers entered. Assumptions are detailed below.",
      negativeTitle: "Negative equity",
      negativeBefore: "Your mortgage balance exceeds the value entered by",
      negativeAfter:
        "There is no refinance headroom at 80% while this lasts. No refinancing is suggested here: talk to a mortgage broker about the available options (partial repayment, sale, renegotiation with the lender).",
      paymentLabel: "Monthly payment",
      paymentNoMortgage: "No mortgage",
      paymentHint: "Principal and interest, {months} months remaining",
      paymentHintNoMortgage: "Balance entered: $0",
      equityLabel: "Equity",
      equityHint: "{percent} of the value entered",
      ltvLabel: "80%",
      headroomLabel: "Headroom at {ltv}",
      headroomNone: "No headroom",
      headroomHintBalance: "The balance reaches or exceeds the financing ceiling.",
      headroomHintNone: "No usable value.",
      headroomHintRoom: "Theoretical ceiling before fees and lender rules.",
      maxLoanLabel: "Maximum loan at {ltv}",
      maxLoanHint: "Value entered × {ltv}, rounded to the cent.",
      refinanceNote:
        "Headroom exists, but it is not an offer: the lender verifies your income, debts, market value and its own rules.",
      refinanceCta: "Understand refinancing",
      assumptionsTitle: "Calculation assumptions",
      assumptions: [
        "Nominal annual rate compounded monthly, fixed for the remaining period.",
        "Payment calculated on the balance entered and the remaining amortization, in equal monthly payments.",
        "Refinance headroom capped at 80% of the value entered — a calculation assumption, not a universal lender rule.",
        "No fees, no prepayment penalty, no insurance premium and no tax are included.",
        "No income, credit or market-value verification is simulated.",
      ],
      disclaimer:
        "This calculation is not a loan offer or a certified appraisal. Rates, fees and penalties vary by lender, term, product and your file; confirm your situation with a mortgage broker or your lender.",
      emptyTitle: "Your result",
      emptyBody:
        "The calculation will appear here: monthly payment, equity in dollars and percent, then refinance headroom at 80% of the value.",
      emptyNote: "We invent no default values: without your numbers, there is no result.",
    },
    methodTitle: "How it is calculated",
    method: [
      {
        title: "Equity",
        body: "Property value minus the remaining principal. It is the part you truly own, before any selling costs.",
      },
      {
        title: "Headroom at 80%",
        body: "The maximum loan used here is 80% of the value entered, minus your balance. Lenders apply their own ratios and often require an appraisal.",
      },
      {
        title: "The payment",
        body: "Constant monthly payment on the remaining balance and amortization, at a fixed rate. Fees, insurance, taxes and penalties are not included.",
      },
    ],
    nextTitle: "What next?",
    nextBody:
      "Refinance headroom does not mean a loan will be approved. Before committing to renovations or consolidation, compare scenarios with a mortgage broker and check the prepayment penalties on your current loan.",
    nextMortgageCta: "The mortgage guides",
    nextSubsidiesCta: "Renovation subsidies",
    disclaimer:
      "MaMaisonQC is not a lender or a mortgage broker. This tool produces an arithmetic estimate from your numbers; it is not a financing offer, a certified appraisal or personal financial advice.",
    errors: {
      valueRequired: "Enter the property value.",
      valueInvalid: "Invalid amount: use digits, for example 450,000.",
      valueRange: "This amount exceeds the allowed limit.",
      valueZero: "The value must be greater than 0.",
      balanceRequired: "Enter your mortgage balance (0 if you have none).",
      balanceInvalid: "Invalid amount: use digits, for example 300,000.",
      balanceRange: "This amount exceeds the allowed limit.",
      rateRequired: "Enter the annual rate (for example 4.79).",
      rateInvalid: "Invalid rate: enter a percentage, for example 4.79.",
      rateRange: "The rate must be between 0% and 25%.",
      yearsRequired: "Enter the remaining amortization in years.",
      yearsInvalid: "Invalid years: enter a whole number.",
      monthsInvalid: "Invalid months: enter a number between 0 and 11.",
      monthsRange: "The remaining amortization must be between 1 and 600 months.",
    },
  },
  auth: {
    errors: {
      emailRequired: "Enter your email address.",
      emailInvalid: "Invalid email address.",
      emailTooLong: "Email address is too long.",
      passwordRequired: "Enter your password.",
      passwordTooLong: "Password is too long.",
      passwordShort: "The password must contain at least 10 characters.",
      nameShort: "Enter your name (at least 2 characters).",
      nameLong: "Name is too long (80 characters maximum).",
      confirmRequired: "Confirm your password.",
      mismatch: "The two passwords do not match.",
      invalidCredentials: "Invalid email or password.",
      genericSignIn: "Sign-in is unavailable right now. Try again in a moment.",
      genericSignUp:
        "This account could not be created with these details. If you already have an account, log in.",
      throttledSignIn: "Too many attempts. Try again in a minute.",
      throttledSignUp: "Too many attempts. Try again in a few minutes.",
    },
    signIn: {
      eyebrow: "Owner area",
      title: "Log in",
      intro:
        "Your claims, your pre-market listings and the interests received are visible only in your session.",
      signedOutTitle: "You are logged out",
      signedOutBody: "Your session was closed. You can log in again at any time.",
      formErrorTitle: "Sign-in failed",
      emailLabel: "Email address",
      passwordLabel: "Password",
      passwordHint: "Never shared, never shown in the URL.",
      submit: "Log in",
      submitting: "Logging in…",
      noAccount: "No account yet?",
      signUpLink: "Create an account",
      footerNote: "Coming from a claim?",
      footerLink: "Create your account from the property page",
      footerAfter: "so the request is attached to the right building.",
    },
    signUp: {
      eyebrow: "Owner area",
      title: "Create an account",
      intro:
        "An account lets you claim a property page, prepare a pre-market listing and receive buyer interests.",
      claimTitle: "Claim attached to this sign-up",
      claimBody: "You are asking to claim: {address}.",
      claimFallback: "assessment number {id}",
      claimPending:
        "The request will stay pending until it is verified. You can follow its status in your dashboard.",
      claimNotFoundTitle: "Property not found",
      claimNotFoundBody:
        "The assessment number provided does not match any property in our current coverage. You can create an account, then claim a page from an assessment page.",
      formErrorTitle: "Sign-up failed",
      nameLabel: "Name",
      emailLabel: "Email address",
      passwordLabel: "Password",
      passwordHint: "At least 10 characters. Use a unique passphrase.",
      confirmLabel: "Confirm password",
      termsPrefix: "By creating an account, you accept the",
      termsLink: "terms of use",
      termsMiddle: "and the",
      privacyLink: "privacy policy",
      termsSuffix: ".",
      submit: "Create my account",
      submitting: "Creating the account…",
      haveAccount: "Already registered?",
      signInLink: "Log in",
      enumerationNote:
        "We do not publicly check whether an email address already has an account: the message shown is the same in every case.",
      faqBefore: "Need help? See the",
      faqLink: "FAQ",
      faqAfter: ".",
    },
    signOut: {
      title: "Log out",
      intro: "You are logged in as {email}. Closing the session deletes the cookie and revokes the session on the server.",
      submit: "Log out",
      stayBefore: "Would you rather stay logged in?",
      stayLink: "Back to dashboard",
      stayAfter: ".",
      notSignedIn: "You are not logged in: there is no session to close.",
      loginLink: "Log in",
    },
  },
  mortgage: {
    eyebrow: "Mortgage guides",
    indexTitle: "Understand your mortgage before you sign",
    indexIntro:
      "Six situations Quebec homeowners commonly face. Each guide explains the questions to ask, the documents to gather and the traps to check. No rate is invented: conditions vary by lender and by file.",
    readGuide: "Read the guide",
    checklistTitle: "What to check with a broker",
    checklistIntro:
      "These points do not replace an analysis of your file, but they keep you from arriving without questions.",
    ratesTitle: "Rates vary — always",
    ratesBody:
      "Rates, fees and penalties vary by lender, product, term and your file. Comparison sites and rates shown elsewhere are not an offer for your situation. Confirm with a mortgage broker or your lender.",
    relatedTitle: "Related guides",
    ctaTitle: "Where do you stand?",
    ctaBody:
      "Before talking to a lender, calculate your equity and the theoretical refinance headroom at 80% of the value. You will arrive with numbers rather than an impression.",
    ctaButton: "Calculate my equity",
    backToIndex: "All guides",
    disclaimer:
      "This guide is general information, not personal financial, legal or tax advice. MaMaisonQC is not a lender or a mortgage broker. Credit decisions belong to the lender.",
  },
  subsidies: {
    eyebrow: "Renovation subsidies",
    indexTitle: "Financial aid to renovate in Quebec",
    indexIntro:
      "Five programs that can fund part of your work. Each page shows the amounts and rules published by the program, the official page consulted and the verification date. Programs change: always verify before starting work.",
    programLabel: "Program",
    publisherLabel: "Administered by",
    verifiedOn: "Verified on",
    officialPage: "Official program page",
    amountsTitle: "Amounts and eligible work",
    amountsNote:
      "Maximum amounts published by the program. The actual amount depends on your project and on the rules in force when you apply.",
    measureColumn: "Measure",
    amountColumn: "Maximum financial assistance",
    eligibilityTitle: "Eligibility",
    stepsTitle: "Steps to follow",
    deadlinesTitle: "Important dates and periods",
    unverifiedTitle: "Details not reproduced here",
    unverifiedBody:
      "Some details could not be verified on the official page on the consultation date. They are not invented here: verify with the program.",
    checkProgram: "verify with the program",
    sourcesTitle: "Official sources",
    disclaimerTitle: "Before starting work",
    disclaimerBody:
      "Do not start work before confirming your eligibility, the applicable amounts and the documents required by the program. Programs, amounts and dates can change without notice; this page is a dated summary, not an eligibility decision.",
    backToIndex: "All programs",
    ctaTitle: "Fund the rest with your equity?",
    ctaBody:
      "A subsidy rarely covers all the work. Calculate the theoretical refinance headroom at 80% of your property value before choosing your work.",
    ctaButton: "Calculate my equity",
    sourcePrefix: "Source:",
    lastChecked: "Last verified",
    pageUpdated: "Page updated",
    statusOpen: "Open",
    statusClosed: "Closed",
    statusVariable: "Variable",
    statusUnknown: "To verify",
    statusLabel: "Status",
    audienceTitle: "Who this program is for",
    notForIndividuals:
      "This program is not primarily aimed at owner-occupants renovating their home.",
  },
  dashboard: {
    eyebrow: "Owner area",
    title: "Dashboard",
    greeting: "Hello {name}.",
    welcomeTitle: "Welcome",
    welcomeBody: "Your account is created. Claim a property to follow its data and prepare a pre-market listing.",
    claimRequestedTitle: "Claim sent",
    claimRequestedBody: "Your request is pending verification. You will see it below with its status.",
    claimNotFoundTitle: "Claim not recorded",
    claimNotFoundBody:
      "The assessment number provided was not in our coverage. Your account is created; you can claim a property from an assessment page.",
    claimsTitle: "My claims",
    claimsIntro:
      "A claim becomes a page of your own only after verification. Only approved pages unlock private data.",
    approvedTitle: "Approved",
    pendingTitle: "Pending",
    rejectedTitle: "Rejected",
    noClaimsTitle: "No claims yet",
    noClaimsBody:
      "Find your property by address, then claim its page. Until it is approved, you can keep using the calculator freely.",
    findProperty: "Find my property",
    statusPending: "Pending",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    requestedOn: "Requested on",
    decidedOn: "Decided on",
    listingsTitle: "My pre-market listings",
    listingsIntro:
      "Your listings being prepared for market and the number of interests received. Only interests for your own listings are visible.",
    noListingsTitle: "No pre-market listings",
    noListingsBody:
      "A pre-market listing lets you gauge buyer interest before an official listing, without publishing your civic number.",
    viewMarket: "See the pre-market",
    listingAsking: "Asking price",
    listingHorizon: "Horizon",
    listingVisibility: "Visibility",
    listingStatus: "Status",
    listingCreated: "Created on",
    listingStatusActive: "Active",
    listingStatusPaused: "Paused",
    listingStatusRetired: "Retired",
    visibilityVerified: "Verified buyers",
    visibilityPrivate: "Private",
    viewInterests: "View interests",
    interestsCount: "{count} interest",
    interestsCountPlural: "{count} interests",
    securityTitle: "Privacy",
    securityBody:
      "This data is read with your session identifier. No URL parameter allows anyone to view another person's claims or interests.",
    signOutTitle: "End of session",
    signOutBody: "Closing your session deletes the cookie and revokes the session on the server.",
    viewSheet: "View the page",
    unknownAddress: "Address not published",
  },
  interests: {
    eyebrow: "Interests received",
    title: "Buyers interested in your pre-market listings",
    intro:
      "Only interests attached to your own listings appear here. Access comes from your session, never from a URL parameter.",
    emptyTitle: "No interests received yet",
    emptyBody:
      "When a pre-market listing is visible and a buyer shows interest, the request appears here with their contact details.",
    emptyCta: "Back to dashboard",
    listingLabel: "Listing",
    askingLabel: "Asking price",
    fromLabel: "Name",
    emailLabel: "Email",
    messageLabel: "Message",
    noMessage: "No message",
    receivedOn: "Received on",
    statusLabel: "Status",
    statusNew: "New",
    statusContacted: "Contacted",
    statusClosed: "Closed",
    contactNote:
      "MaMaisonQC does not send email on your behalf: write directly to the interested person.",
    totalLabel: "Interests shown",
    listingsLabel: "Listings involved",
    backToDashboard: "Back to dashboard",
  },
};

const dictionaries: Record<Locale, OwnerMessages> = { fr, en };

export function messagesFor(locale: Locale): OwnerMessages {
  return dictionaries[locale];
}

/** "Bonjour {name}." + { name: "Sylvie" } → "Bonjour Sylvie." Used for the few composed labels. */
export function fill(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.split(`{${key}}`).join(String(value)),
    template,
  );
}
