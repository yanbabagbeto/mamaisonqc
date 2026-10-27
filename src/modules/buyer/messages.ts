import type { Locale } from "@/i18n/config";

/**
 * Buyer-area dictionary. Same contract as the rest of the app: the French object defines the
 * shape, `en` is typed against it, so a missing translation is a compile error. Property types,
 * horizons and notification keys stay as identifiers here; pages map them through these labels.
 */
export const fr = {
  common: {
    breadcrumb: "Fil d'Ariane",
    home: "Accueil",
    buyers: "Acheteurs",
    explorer: "Explorer",
    financing: "Mon financement",
    interests: "Mes intérêts",
    settings: "Paramètres",
    signIn: "Se connecter",
    signInRequiredTitle: "Connexion requise",
    signInRequiredBody:
      "Cette page affiche des données liées à votre compte. Connectez-vous pour les consulter : nous ne montrons jamais les intérêts ou les fiches d'une autre personne.",
    signInCta: "Se connecter",
    backHome: "Retour à l'accueil",
    loading: "Chargement…",
    errorTitle: "Une erreur est survenue",
    errorBody:
      "Cette page n'a pas pu être chargée. Aucune donnée partielle n'est affichée. Réessayez dans un instant.",
    retry: "Réessayer",
  },
  meta: {
    explorer: {
      title: "Explorer les propriétés en pré-marché",
      description:
        "Carte et liste des propriétés publiées en pré-marché au Québec, avec filtres par type, horizon de vente et région. Adresse exacte masquée par le propriétaire.",
    },
    financing: {
      title: "Mon financement : capacité d'emprunt et documents",
      description:
        "Estimez votre capacité d'emprunt à partir de vos revenus, dettes et mise de fonds, suivez vos documents et joignez la liste d'attente de préapprobation.",
    },
    interests: {
      title: "Mes intérêts : fiches sauvegardées et demandes envoyées",
      description:
        "Retrouvez les propriétés en pré-marché que vous avez sauvegardées et les intérêts que vous avez exprimés, dans votre session.",
    },
    settings: {
      title: "Paramètres du compte",
      description:
        "Profil, préférences de notification, langue et demande de suppression de compte pour votre compte MaMaisonQC.",
    },
  },
  saved: {
    save: "Sauvegarder",
    saved: "Sauvegardé",
    saving: "Enregistrement…",
    error: "Impossible de mettre à jour vos fiches. Réessayez dans un instant.",
    loginRequired: "Connectez-vous pour sauvegarder cette fiche.",
    ariaSave: "Sauvegarder la fiche de {street}",
    ariaSaved: "Retirer des fiches sauvegardées : {street}",
    removed: "Fiche retirée de vos sauvegardes.",
    added: "Fiche ajoutée à vos sauvegardes.",
  },
  explorer: {
    eyebrow: "Explorer",
    title: "Les propriétés avant leur mise en marché",
    intro:
      "Chaque fiche provient d'un propriétaire qui prépare sa vente. L'adresse exacte reste masquée : vous voyez la rue et la ville, jamais le numéro civique. Les propriétés sans coordonnées sont regroupées par ville, pas placées au hasard sur la carte.",
    filtersTitle: "Filtrer les résultats",
    typeLabel: "Type de propriété",
    horizonLabel: "Horizon de vente",
    regionLabel: "Région",
    allTypes: "Tous les types",
    allHorizons: "Tous les horizons",
    allRegions: "Toutes les régions",
    apply: "Appliquer les filtres",
    reset: "Réinitialiser",
    resultsCountOne: "{count} propriété en pré-marché",
    resultsCountMany: "{count} propriétés en pré-marché",
    emptyTitle: "Aucune propriété en pré-marché pour ces filtres",
    emptyTitleNoFilters: "Aucune propriété en pré-marché pour l'instant",
    emptyBody:
      "Le pré-marché se remplit au fur et à mesure que des propriétaires publient leur projet de vente. Élargissez les filtres ou revenez plus tard.",
    emptyCta: "Voir tout le pré-marché",
    resetCta: "Réinitialiser les filtres",
    mapTitle: "Carte des propriétés localisées",
    mapCaptionOne: "{located} sur {total} propriété affichée sur la carte.",
    mapCaptionMany: "{located} sur {total} propriétés affichées sur la carte.",
    mapAria: "Carte interactive des propriétés en pré-marché localisées",
    mapLoading: "Chargement de la carte…",
    mapNoCoordsTitle: "Aucune propriété localisée pour ces filtres",
    mapNoCoordsBody:
      "Les propriétés correspondantes existent, mais aucune n'a de coordonnées dans le rôle ingéré. Elles sont listées ci-dessous, regroupées par ville : nous n'inventons pas d'emplacement.",
    tableCaption:
      "Propriétés en pré-marché correspondant aux filtres : rue, ville, type, horizon de vente et prix demandé. Chaque rue ouvre la fiche complète.",
    tableStreet: "Rue",
    tableCity: "Ville",
    tableType: "Type",
    tableHorizon: "Horizon",
    tablePrice: "Prix demandé",
    tableView: "Voir la fiche",
    unlocatedTitle: "Propriétés sans coordonnées",
    unlocatedBody:
      "Ces propriétés ne peuvent pas être placées sur la carte. Elles sont regroupées par ville, sans emplacement inventé.",
    cityCountOne: "{count} propriété",
    cityCountMany: "{count} propriétés",
    listTitle: "Toutes les propriétés correspondantes",
    typeLabels: {
      unifamiliale: "Unifamiliale",
      copropriete: "Copropriété",
      plex: "Plex",
      terrain: "Terrain",
      "non-residentiel": "Non résidentiel",
      autre: "Autre",
    },
    horizonLabels: {
      "0-3": "D'ici 3 mois",
      "3-6": "Dans 3 à 6 mois",
      "6-12": "Dans 6 à 12 mois",
      "12+": "Dans plus d'un an",
    },
    privacyNote:
      "Le pré-marché masque le numéro civique : ne demandez pas l'adresse exacte dans un message. Le propriétaire décide quand et à qui la communiquer.",
  },
  financing: {
    eyebrow: "Financement",
    title: "Votre capacité d'emprunt approximative",
    intro:
      "Trois chiffres suffisent pour situer votre budget : revenus, dettes et mise de fonds. Le résultat est une estimation arithmétique, jamais une préapprobation.",
    calculator: {
      title: "Calculer ma capacité",
      intro:
        "Les montants sont traités en cents et le taux en points de base : aucun arrondi flottant ne s'accumule.",
      incomeLabel: "Revenu annuel brut du ménage ($)",
      incomeHint: "Avant impôts, toutes sources confondues.",
      incomePlaceholder: "120 000",
      debtsLabel: "Dettes mensuelles ($)",
      debtsHint: "Paiements minimaux de cartes, prêts auto, marge de crédit. Entrez 0 s'il n'y en a pas.",
      debtsPlaceholder: "500",
      downLabel: "Mise de fonds ($)",
      downHint: "Montant que vous pouvez verser comptant, avant frais.",
      downPlaceholder: "50 000",
      rateLabel: "Taux annuel estimé (%)",
      rateHint: "Hypothèse de calcul, pas un taux offert par un prêteur.",
      ratePlaceholder: "4,79",
      yearsLabel: "Amortissement (années)",
      yearsHint: "Durée totale du prêt, entre 5 et 50 ans.",
      yearsPlaceholder: "25",
      submit: "Estimer ma capacité",
      invalidTitle: "Vérifiez les champs indiqués",
      invalidBody: "Aucun résultat n'est affiché tant que les valeurs ne sont pas valides.",
      resultTitle: "Votre budget estimé",
      resultIntro:
        "Calcul indicatif selon l'hypothèse de ratio d'endettement affichée. Aucune vérification de crédit, de revenus ou de valeur marchande n'est simulée.",
      loanLabel: "Capacité d'emprunt",
      budgetLabel: "Budget d'achat maximal",
      paymentLabel: "Paiement mensuel maximal",
      paymentHint: "Part mensuelle disponible pour le logement, avant taxes et chauffage.",
      incomeLabelResult: "Revenu mensuel brut",
      tdsLabel: "Hypothèse d'endettement",
      tdsValue: "40 % du revenu brut mensuel",
      debtLimited:
        "Vos dettes de {debts} par mois atteignent 40 % de votre revenu brut : la capacité d'emprunt est plafonnée à 0 $.",
      assumptionsTitle: "Hypothèses du calcul",
      assumptions: [
        "Ratio d'endettement total de 40 % du revenu brut mensuel, dettes mensuelles soustraites.",
        "Taux nominal annuel composé mensuellement, taux fixe pendant l'amortissement.",
        "Capacité d'emprunt calculée comme la valeur actuelle des paiements disponibles.",
        "Aucun frais, taxe municipale, chauffage, assurance ni prime SCHL n'est inclus.",
        "Aucune règle de prêteur, de mise de fonds minimale ou de stress test n'est appliquée.",
      ],
      disclaimer:
        "Cette estimation ne remplace pas une préapprobation hypothécaire. Un prêteur vérifie vos revenus, votre crédit, vos dettes et la valeur de la propriété selon ses propres règles.",
      emptyTitle: "Votre résultat",
      emptyBody:
        "Le résultat apparaîtra ici : capacité d'emprunt, budget d'achat et paiement mensuel maximal.",
      notPreApproval: "Estimation indicative — pas une préapprobation",
      stressLabel: "Test de résistance (taux +2 %, minimum 5,25 %)",
      stressHint:
        "Le prêt est qualifié au taux le plus élevé entre votre taux + 2 % et 5,25 %, comme le font les prêteurs canadiens.",
      qualifyingRateLabel: "Taux de qualification",
      downLimited:
        "Votre mise de fonds limite l'achat à {budget}. La mise minimale pour ce prix est de {minDown} (5 % jusqu'à 500 000 $, 10 % au-delà).",
      stressApplied: "Test de résistance appliqué",
      stressNotApplied: "Sans test de résistance",
    },
    checklist: {
      title: "Mes documents de préapprobation",
      intro:
        "Quatre documents sont généralement demandés par un prêteur. Cochez ceux que vous avez déjà : la progression reste dans votre navigateur, rien n'est envoyé à nos serveurs.",
      items: [
        "Preuves de revenus (talons de paie ou avis de cotisation)",
        "Relevés bancaires des 90 derniers jours",
        "Preuve de mise de fonds (épargne, REER, don familial)",
        "Pièce d'identité avec photo",
      ],
      progress: "{done} sur {total} documents prêts",
      reset: "Réinitialiser la liste",
      resetHint: "La progression efface aussi les cases cochées dans ce navigateur.",
      savedLocally: "Progression enregistrée dans ce navigateur uniquement.",
      storageUnavailable:
        "Votre navigateur bloque le stockage local : la progression ne sera pas conservée.",
      updated: "Progression enregistrée.",
    },
    waitlist: {
      title: "Liste d'attente de préapprobation",
      intro:
        "Nous préparons un accompagnement avec des courtiers hypothécaires partenaires. Inscrivez-vous : votre demande est conservée, aucun courriel n'est envoyé automatiquement.",
      emailLabel: "Courriel",
      emailHint: "Utilisez le même courriel que votre compte si vous en avez un.",
      noteLabel: "Précisions (facultatif)",
      noteHint: "Horizon d'achat, région visée, situation particulière. 500 caractères maximum.",
      consentLabel:
        "J'accepte que MaMaisonQC conserve mon courriel, ma note et la date de mon consentement afin de me contacter au sujet de la préapprobation. Je peux demander la suppression de ces données en tout temps (Loi 25).",
      consentError: "Vous devez accepter la conservation de vos données pour vous inscrire.",
      submit: "Joindre la liste d'attente",
      submitting: "Inscription…",
      successTitle: "Demande enregistrée",
      successBody:
        "Votre demande est dans la liste d'attente. Aucun courriel n'est envoyé automatiquement : nous vous contacterons lorsque l'accompagnement sera disponible. Vous pouvez demander la suppression de vos données depuis vos paramètres.",
      error: "Inscription impossible pour le moment. Réessayez dans un instant.",
      alreadyTitle: "Vous êtes déjà sur la liste",
      alreadyBody:
        "Une demande existe déjà pour ce courriel. Elle sera traitée avec les nouvelles demandes; vous pouvez nous écrire pour la modifier ou la retirer.",
      privacyNote:
        "Aucune donnée n'est transmise à un courtier sans votre action. Aucune préapprobation n'est automatique.",
    },
    errors: {
      incomeRequired: "Entrez votre revenu annuel brut.",
      incomeInvalid: "Montant invalide : utilisez des chiffres, par exemple 120 000.",
      incomeRange: "Le revenu doit être supérieur à 0 et inférieur au plafond de saisie.",
      debtsRequired: "Entrez vos dettes mensuelles (0 s'il n'y en a pas).",
      debtsInvalid: "Montant invalide : utilisez des chiffres, par exemple 500.",
      downRequired: "Entrez votre mise de fonds (0 si aucune).",
      downInvalid: "Montant invalide : utilisez des chiffres, par exemple 50 000.",
      rateRequired: "Entrez un taux annuel (par exemple 4,79).",
      rateInvalid: "Taux invalide : utilisez un pourcentage, par exemple 4,79.",
      rateRange: "Le taux doit être entre 0 et 25 %.",
      yearsRequired: "Entrez la durée d'amortissement en années.",
      yearsInvalid: "Année invalide : entrez un nombre entier d'années.",
      yearsRange: "L'amortissement doit être entre 5 et 50 ans.",
    },
  },
  interests: {
    eyebrow: "Mes intérêts",
    title: "Vos fiches sauvegardées et vos demandes",
    intro:
      "Tout ce qui suit provient de votre session : les fiches que vous avez sauvegardées et les intérêts que vous avez exprimés avec le courriel de votre compte.",
    savedTitle: "Fiches sauvegardées",
    savedIntro:
      "Les fiches restent sauvegardées même après votre visite. Si une fiche est retirée du pré-marché, elle n'apparaît plus ici.",
    savedCountOne: "{count} fiche sauvegardée",
    savedCountMany: "{count} fiches sauvegardées",
    savedEmptyTitle: "Aucune fiche sauvegardée",
    savedEmptyBody:
      "Parcourez l'explorateur et sauvegardez les propriétés qui vous intéressent : elles apparaîtront ici dans votre session.",
    savedEmptyCta: "Explorer le pré-marché",
    savedColumns: {
      street: "Rue",
      city: "Ville",
      type: "Type",
      horizon: "Horizon",
      price: "Prix demandé",
      savedOn: "Sauvegardée le",
      status: "État",
      action: "Action",
    },
    active: "En pré-marché",
    remove: "Retirer",
    removing: "Retrait…",
    removeError: "Impossible de retirer cette fiche. Réessayez dans un instant.",
    interestsTitle: "Mes demandes d'intérêt",
    interestsIntro:
      "Les demandes que vous avez envoyées aux propriétaires, avec le courriel de votre compte. Elles sont en lecture seule.",
    interestsEmptyTitle: "Aucune demande d'intérêt",
    interestsEmptyBody:
      "Ouvrez une fiche en pré-marché et exprimez votre intérêt : le propriétaire reçoit votre message et vous pourrez suivre la demande ici.",
    interestsEmptyCta: "Voir le pré-marché",
    interestColumns: {
      listing: "Propriété",
      message: "Votre message",
      sentOn: "Envoyée le",
      status: "État",
    },
    interestStatus: {
      nouveau: "Nouvelle",
      contacte: "Contactée",
      clos: "Close",
    },
    noMessage: "Aucun message",
    reference: "Référence {id}",
  },
  settings: {
    eyebrow: "Paramètres",
    title: "Votre compte",
    intro:
      "Votre profil, vos notifications et la langue de l'interface. Les données liées à votre compte restent dans votre session.",
    profileTitle: "Profil",
    profileName: "Nom",
    profileEmail: "Courriel",
    profileRole: "Type de compte",
    roleOwner: "Propriétaire",
    roleAdmin: "Administrateur",
    profileNote:
      "Le nom et le courriel ne sont pas modifiables en v1. Écrivez-nous si une correction est nécessaire.",
    languageTitle: "Langue de l'interface",
    languageBody:
      "MaMaisonQC est offert en français (par défaut) et en anglais. Le changement de langue conserve la page courante lorsque possible.",
    languageCurrent: "Langue actuelle : {language}",
    languageFr: "Français",
    languageEn: "English",
    languageSwitch: "Changer de langue",
    notificationsTitle: "Notifications",
    notificationsBody:
      "Choisissez les sujets pour lesquels vous acceptez d'être contacté. Vos préférences sont enregistrées dans votre compte et peuvent être modifiées en tout temps.",
    notificationLabels: {
      offres: "Nouvelles propriétés correspondant à mes critères",
      annonce: "Changements sur mes fiches sauvegardées",
      marche: "Le Brief et les nouvelles du marché",
      conseils: "Conseils pour acheteurs",
    },
    save: "Enregistrer mes préférences",
    saving: "Enregistrement…",
    saved: "Préférences enregistrées.",
    saveError: "Impossible d'enregistrer vos préférences. Réessayez dans un instant.",
    deletionTitle: "Supprimer mon compte",
    deletionBody:
      "Vous pouvez demander la suppression de votre compte et des données qui y sont liées : sauvegardes, préférences et demandes. Les données de propriété publiées par un propriétaire peuvent avoir une durée de conservation distincte.",
    deletionCta: "Demander la suppression",
    deletionConfirm:
      "Votre demande est enregistrée. Un délai de 30 jours s'applique avant la suppression définitive : pendant cette période, vous pouvez annuler en nous écrivant.",
    deletionNote:
      "La demande est horodatée et conservée dans notre journal d'audit. Aucune suppression immédiate n'est effectuée par ce bouton.",
    deletionError: "Impossible d'enregistrer votre demande. Réessayez dans un instant.",
  },
};

export type BuyerMessages = typeof fr;

export const en: BuyerMessages = {
  common: {
    breadcrumb: "Breadcrumb",
    home: "Home",
    buyers: "Buyers",
    explorer: "Explore",
    financing: "My financing",
    interests: "My interests",
    settings: "Settings",
    signIn: "Sign in",
    signInRequiredTitle: "Sign-in required",
    signInRequiredBody:
      "This page shows data linked to your account. Sign in to view it: we never show another person's saved listings or interests.",
    signInCta: "Sign in",
    backHome: "Back to home",
    loading: "Loading…",
    errorTitle: "An error occurred",
    errorBody:
      "This page could not be loaded. No partial data is shown. Try again in a moment.",
    retry: "Try again",
  },
  meta: {
    explorer: {
      title: "Explore pre-market properties",
      description:
        "Map and list of Quebec properties published pre-market, with filters by property type, sale horizon and region. The civic number stays hidden.",
    },
    financing: {
      title: "My financing: borrowing capacity and documents",
      description:
        "Estimate your borrowing capacity from your income, debts and down payment, track your documents and join the pre-approval waitlist.",
    },
    interests: {
      title: "My interests: saved listings and sent requests",
      description:
        "Find the pre-market properties you saved and the interests you expressed, inside your session.",
    },
    settings: {
      title: "Account settings",
      description:
        "Profile, notification preferences, language and account deletion request for your MaMaisonQC account.",
    },
  },
  saved: {
    save: "Save",
    saved: "Saved",
    saving: "Saving…",
    error: "Your saved listings could not be updated. Try again in a moment.",
    loginRequired: "Sign in to save this listing.",
    ariaSave: "Save the listing at {street}",
    ariaSaved: "Remove from saved listings: {street}",
    removed: "Listing removed from your saved listings.",
    added: "Listing added to your saved listings.",
  },
  explorer: {
    eyebrow: "Explore",
    title: "Properties before they hit the market",
    intro:
      "Each listing comes from an owner preparing a sale. The exact address stays masked: you see the street and the city, never the civic number. Properties without coordinates are grouped by city, not placed at random on the map.",
    filtersTitle: "Filter results",
    typeLabel: "Property type",
    horizonLabel: "Sale horizon",
    regionLabel: "Region",
    allTypes: "All types",
    allHorizons: "All horizons",
    allRegions: "All regions",
    apply: "Apply filters",
    reset: "Reset",
    resultsCountOne: "{count} pre-market property",
    resultsCountMany: "{count} pre-market properties",
    emptyTitle: "No pre-market property matches these filters",
    emptyTitleNoFilters: "No pre-market property yet",
    emptyBody:
      "The pre-market fills up as owners publish their sale projects. Widen the filters or come back later.",
    emptyCta: "See the whole pre-market",
    resetCta: "Reset filters",
    mapTitle: "Map of located properties",
    mapCaptionOne: "{located} of {total} property shown on the map.",
    mapCaptionMany: "{located} of {total} properties shown on the map.",
    mapAria: "Interactive map of located pre-market properties",
    mapLoading: "Loading the map…",
    mapNoCoordsTitle: "No located property for these filters",
    mapNoCoordsBody:
      "Matching properties exist, but none has coordinates in the ingested roll. They are listed below, grouped by city: we do not invent a location.",
    tableCaption:
      "Pre-market properties matching the filters: street, city, type, sale horizon and asking price. Each street opens the full listing.",
    tableStreet: "Street",
    tableCity: "City",
    tableType: "Type",
    tableHorizon: "Horizon",
    tablePrice: "Asking price",
    tableView: "View listing",
    unlocatedTitle: "Properties without coordinates",
    unlocatedBody:
      "These properties cannot be placed on the map. They are grouped by city, with no invented location.",
    cityCountOne: "{count} property",
    cityCountMany: "{count} properties",
    listTitle: "All matching properties",
    typeLabels: {
      unifamiliale: "Single-family",
      copropriete: "Condominium",
      plex: "Plex",
      terrain: "Land",
      "non-residentiel": "Non-residential",
      autre: "Other",
    },
    horizonLabels: {
      "0-3": "Within 3 months",
      "3-6": "In 3 to 6 months",
      "6-12": "In 6 to 12 months",
      "12+": "In more than a year",
    },
    privacyNote:
      "The pre-market hides the civic number: do not ask for the exact address in a message. The owner decides when and with whom to share it.",
  },
  financing: {
    eyebrow: "Financing",
    title: "Your approximate borrowing capacity",
    intro:
      "Three numbers are enough to locate your budget: income, debts and down payment. The result is an arithmetic estimate, never a pre-approval.",
    calculator: {
      title: "Calculate my capacity",
      intro:
        "Amounts are handled in cents and rates in basis points: no floating-point drift accumulates.",
      incomeLabel: "Household gross annual income ($)",
      incomeHint: "Before tax, all sources combined.",
      incomePlaceholder: "120,000",
      debtsLabel: "Monthly debts ($)",
      debtsHint: "Minimum card, car loan and line of credit payments. Enter 0 if none.",
      debtsPlaceholder: "500",
      downLabel: "Down payment ($)",
      downHint: "Cash you can pay upfront, before fees.",
      downPlaceholder: "50,000",
      rateLabel: "Estimated annual rate (%)",
      rateHint: "A calculation assumption, not a rate offered by a lender.",
      ratePlaceholder: "4.79",
      yearsLabel: "Amortization (years)",
      yearsHint: "Total loan term, between 5 and 50 years.",
      yearsPlaceholder: "25",
      submit: "Estimate my capacity",
      invalidTitle: "Check the highlighted fields",
      invalidBody: "No result is shown while the values are invalid.",
      resultTitle: "Your estimated budget",
      resultIntro:
        "Indicative calculation under the displayed debt-ratio assumption. No credit, income or market-value verification is simulated.",
      loanLabel: "Borrowing capacity",
      budgetLabel: "Maximum purchase budget",
      paymentLabel: "Maximum monthly payment",
      paymentHint: "Monthly amount available for housing, before taxes and heating.",
      incomeLabelResult: "Gross monthly income",
      tdsLabel: "Debt-ratio assumption",
      tdsValue: "40% of gross monthly income",
      debtLimited:
        "Your monthly debts of {debts} reach 40% of your gross income: borrowing capacity is capped at $0.",
      assumptionsTitle: "Calculation assumptions",
      assumptions: [
        "Total debt ratio of 40% of gross monthly income, minus monthly debts.",
        "Nominal annual rate compounded monthly, fixed during the amortization.",
        "Borrowing capacity computed as the present value of the available payments.",
        "No fees, municipal taxes, heating, insurance or CMHC premium is included.",
        "No lender rule, minimum down payment or stress test is applied.",
      ],
      disclaimer:
        "This estimate does not replace a mortgage pre-approval. A lender verifies your income, credit, debts and the property value under its own rules.",
      emptyTitle: "Your result",
      emptyBody:
        "The result will appear here: borrowing capacity, purchase budget and maximum monthly payment.",
      notPreApproval: "Indicative estimate — not a pre-approval",
      stressLabel: "Stress test (rate +2%, minimum 5.25%)",
      stressHint:
        "The loan is qualified at the higher of your rate + 2% and 5.25%, as Canadian lenders do.",
      qualifyingRateLabel: "Qualifying rate",
      downLimited:
        "Your down payment caps the purchase at {budget}. The minimum down payment for that price is {minDown} (5% up to $500,000, 10% above).",
      stressApplied: "Stress test applied",
      stressNotApplied: "No stress test",
    },
    checklist: {
      title: "My pre-approval documents",
      intro:
        "Lenders generally ask for four documents. Tick the ones you already have: progress stays in your browser, nothing is sent to our servers.",
      items: [
        "Proof of income (pay stubs or notices of assessment)",
        "Bank statements for the last 90 days",
        "Proof of down payment (savings, RRSP, family gift)",
        "Photo identification",
      ],
      progress: "{done} of {total} documents ready",
      reset: "Reset the list",
      resetHint: "Resetting also clears the ticked boxes in this browser.",
      savedLocally: "Progress saved in this browser only.",
      storageUnavailable: "Your browser blocks local storage: progress will not be kept.",
      updated: "Progress saved.",
    },
    waitlist: {
      title: "Pre-approval waitlist",
      intro:
        "We are preparing support with partner mortgage brokers. Join the list: your request is kept, and no email is sent automatically.",
      emailLabel: "Email",
      emailHint: "Use the same email as your account if you have one.",
      noteLabel: "Details (optional)",
      noteHint: "Purchase horizon, target region, particular situation. 500 characters maximum.",
      consentLabel:
        "I agree that MaMaisonQC may keep my email, my note and the date of my consent in order to contact me about pre-approval. I can ask for this data to be deleted at any time (Quebec Law 25).",
      consentError: "You must accept the storage of your data to join the list.",
      submit: "Join the waitlist",
      submitting: "Signing up…",
      successTitle: "Request recorded",
      successBody:
        "Your request is on the waitlist. No email is sent automatically: we will contact you when support becomes available. You can ask for your data to be deleted from your settings.",
      error: "Sign-up is unavailable right now. Try again in a moment.",
      alreadyTitle: "You are already on the list",
      alreadyBody:
        "A request already exists for this email. It will be processed with the new requests; write to us to change or withdraw it.",
      privacyNote:
        "No data is shared with a broker without your action. No pre-approval is automatic.",
    },
    errors: {
      incomeRequired: "Enter your gross annual income.",
      incomeInvalid: "Invalid amount: use digits, for example 120,000.",
      incomeRange: "Income must be above 0 and below the entry cap.",
      debtsRequired: "Enter your monthly debts (0 if none).",
      debtsInvalid: "Invalid amount: use digits, for example 500.",
      downRequired: "Enter your down payment (0 if none).",
      downInvalid: "Invalid amount: use digits, for example 50,000.",
      rateRequired: "Enter an annual rate (for example 4.79).",
      rateInvalid: "Invalid rate: use a percentage, for example 4.79.",
      rateRange: "The rate must be between 0 and 25%.",
      yearsRequired: "Enter the amortization in years.",
      yearsInvalid: "Invalid year: enter a whole number of years.",
      yearsRange: "Amortization must be between 5 and 50 years.",
    },
  },
  interests: {
    eyebrow: "My interests",
    title: "Your saved listings and requests",
    intro:
      "Everything below comes from your session: the listings you saved and the interests you expressed with your account email.",
    savedTitle: "Saved listings",
    savedIntro:
      "Listings stay saved between visits. When a listing is removed from the pre-market, it no longer appears here.",
    savedCountOne: "{count} saved listing",
    savedCountMany: "{count} saved listings",
    savedEmptyTitle: "No saved listing",
    savedEmptyBody:
      "Browse the explorer and save the properties you like: they will appear here in your session.",
    savedEmptyCta: "Explore the pre-market",
    savedColumns: {
      street: "Street",
      city: "City",
      type: "Type",
      horizon: "Horizon",
      price: "Asking price",
      savedOn: "Saved on",
      status: "Status",
      action: "Action",
    },
    active: "Pre-market",
    remove: "Remove",
    removing: "Removing…",
    removeError: "This listing could not be removed. Try again in a moment.",
    interestsTitle: "My interest requests",
    interestsIntro:
      "The requests you sent to owners, with your account email. They are read-only.",
    interestsEmptyTitle: "No interest request",
    interestsEmptyBody:
      "Open a pre-market listing and express your interest: the owner receives your message and you can follow the request here.",
    interestsEmptyCta: "See the pre-market",
    interestColumns: {
      listing: "Property",
      message: "Your message",
      sentOn: "Sent on",
      status: "Status",
    },
    interestStatus: {
      nouveau: "New",
      contacte: "Contacted",
      clos: "Closed",
    },
    noMessage: "No message",
    reference: "Reference {id}",
  },
  settings: {
    eyebrow: "Settings",
    title: "Your account",
    intro:
      "Your profile, notifications and interface language. Account data stays inside your session.",
    profileTitle: "Profile",
    profileName: "Name",
    profileEmail: "Email",
    profileRole: "Account type",
    roleOwner: "Owner",
    roleAdmin: "Administrator",
    profileNote:
      "Name and email cannot be changed in v1. Contact us if a correction is needed.",
    languageTitle: "Interface language",
    languageBody:
      "MaMaisonQC is available in French (default) and English. Switching keeps the current page where possible.",
    languageCurrent: "Current language: {language}",
    languageFr: "Français",
    languageEn: "English",
    languageSwitch: "Switch language",
    notificationsTitle: "Notifications",
    notificationsBody:
      "Choose the topics you agree to be contacted about. Preferences are saved to your account and can be changed at any time.",
    notificationLabels: {
      offres: "New properties matching my criteria",
      annonce: "Changes to my saved listings",
      marche: "The Brief and market news",
      conseils: "Advice for buyers",
    },
    save: "Save my preferences",
    saving: "Saving…",
    saved: "Preferences saved.",
    saveError: "Your preferences could not be saved. Try again in a moment.",
    deletionTitle: "Delete my account",
    deletionBody:
      "You can request deletion of your account and the data linked to it: saved listings, preferences and requests. Property data published by an owner may have a separate retention period.",
    deletionCta: "Request deletion",
    deletionConfirm:
      "Your request is recorded. A 30-day delay applies before permanent deletion: during that period you can cancel by writing to us.",
    deletionNote:
      "The request is timestamped and kept in our audit log. No immediate deletion is performed by this button.",
    deletionError: "Your request could not be recorded. Try again in a moment.",
  },
};

export function messagesFor(locale: Locale): BuyerMessages {
  return locale === "en" ? en : fr;
}

export function propertyTypeLabel(messages: BuyerMessages, type: string): string {
  const labels: Record<string, string> = messages.explorer.typeLabels;
  return labels[type] ?? messages.explorer.typeLabels.autre;
}

export function horizonLabel(messages: BuyerMessages, horizon: string): string {
  const labels: Record<string, string> = messages.explorer.horizonLabels;
  return labels[horizon] ?? horizon;
}
