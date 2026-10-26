import type { Locale } from "@/i18n/config";

import { MORTGAGE_PAGES_EN } from "./mortgage-content.en";

export type MortgageSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type MortgagePage = {
  slug: MortgageSlug;
  navLabel: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  sections: MortgageSection[];
  checklist: string[];
  relatedSlugs: MortgageSlug[];
};

export const MORTGAGE_SLUGS = [
  "renouvellement-hypothecaire",
  "refinancer-pour-renover",
  "refinancer-pour-investir",
  "consolidation-de-dettes",
  "separation-racheter-la-maison",
  "vendre-ou-renover",
] as const;

export type MortgageSlug = (typeof MORTGAGE_SLUGS)[number];

export const MORTGAGE_PAGES: MortgagePage[] = [
  {
    slug: "renouvellement-hypothecaire",
    navLabel: "Renouvellement hypothécaire",
    title: "Renouveler son hypothèque sans signer à l'aveugle",
    metaTitle: "Renouvellement hypothécaire : vérifier avant de signer",
    metaDescription:
      "À l'échéance de votre terme, comparez l'offre de votre prêteur avec d'autres soumissions, vérifiez la pénalité et les frais avant de signer.",
    intro: [
      "Votre prêteur vous envoie une offre de renouvellement avant la fin de votre terme. Cette lettre n'est pas une obligation : vous pouvez l'accepter, la négocier, transférer votre hypothèque ailleurs ou rembourser le solde. Beaucoup de propriétaires signent sans comparer, simplement parce que le document ressemble à une formalité. Cette lettre arrive souvent au moment où le propriétaire est le moins disponible pour comparer.",
      "Le renouvellement reste pourtant le meilleur moment pour revoir votre taux, votre amortissement et vos conditions. Une fois le nouveau terme signé, les options se referment pour plusieurs années.",
    ],
    sections: [
      {
        heading: "Ce qui se passe vraiment à la fin de votre terme",
        paragraphs: [
          "Un terme est la période pendant laquelle votre taux et vos conditions restent en vigueur. L'amortissement, lui, décrit le nombre d'années prévu pour rembourser la totalité du prêt. À la fin du terme, le prêteur vous propose un nouveau contrat : nouveau taux, nouvelles conditions, parfois de nouveaux frais.",
          "Rien ne vous force à accepter la première offre. Vous pouvez demander une meilleure combinaison à votre prêteur actuel, magasiner auprès d'un courtier hypothécaire ou faire transférer l'hypothèque. Il faut simplement respecter les délais indiqués dans votre contrat et dans la lettre de renouvellement.",
        ],
      },
      {
        heading: "Taux fixe ou taux variable : deux façons de porter le risque",
        paragraphs: [
          "À taux fixe, le taux et généralement le versement restent les mêmes pendant tout le terme. Vous connaissez votre coût, mais vous renoncez à profiter d'une baisse pendant cette période.",
          "À taux variable, le taux suit l'indice ou le taux de référence du prêteur. Le versement peut changer, ou la portion remboursée en capital peut varier selon le contrat. Ce choix dépend de votre tolérance aux variations et de votre marge de manœuvre budgétaire, pas seulement du taux du jour.",
          "Aucune des deux formules n'est meilleure en soi. Ce qui compte, c'est votre capacité à absorber une hausse sans compromettre vos autres obligations.",
        ],
      },
      {
        heading: "La pénalité de remboursement anticipé, à vérifier avant de changer",
        paragraphs: [
          "Si vous remboursez plus que ce que permet votre contrat, ou si vous transférez votre prêt avant la fin du terme, une pénalité peut s'appliquer. Son montant dépend du prêteur, du produit, du taux en vigueur et du temps restant.",
          "Certains prêteurs calculent selon un différentiel de taux, d'autres selon un nombre de versements d'intérêts. La méthode exacte et le montant ne peuvent pas être devinés : demandez une estimation écrite avant de prendre une décision. Un courtier peut vous dire si le transfert vaut la peine compte tenu de l'écart de taux.",
        ],
      },
      {
        heading: "Ce que le prêteur vérifie avant de vous offrir un taux",
        paragraphs: [
          "Le taux proposé dépend de votre dossier, pas seulement du marché. Le prêteur regarde vos revenus, vos dettes, votre historique de crédit, la valeur de la propriété et le ratio prêt-valeur. Il évalue aussi le type de propriété et la solidité de la garantie.",
          "Deux voisins avec des maisons semblables peuvent recevoir des offres différentes. C'est pourquoi une comparaison de taux entre amis ou entre annonces ne dit rien de votre situation réelle. Un dossier solide ne garantit pas le meilleur taux, mais il élargit les options.",
        ],
      },
      {
        heading: "Comparer le coût total, pas seulement le taux affiché",
        paragraphs: [
          "Un taux plus bas peut cacher des frais plus élevés : évaluation, acte notarié, transfert, assurance ou pénalité. Demandez le coût total pour la durée du terme et les conditions de remboursement anticipé de chaque soumission. Demandez également si des frais s'appliquent au transfert à l'intérieur du même prêteur.",
          "Les taux, les frais et les pénalités varient selon le prêteur, le produit et votre dossier ; validez votre situation avec un courtier hypothécaire ou votre prêteur. Un écart de taux peut sembler minime à la signature, mais il compte sur la durée du terme.",
          "Gardez aussi en tête que le renouvellement n'est pas un concours de vitesse. Un délai de réflexion de quelques jours peut éviter des années de conditions mal adaptées.",
        ],
      },
    ],
    checklist: [
      "Demandez à votre prêteur actuel une estimation écrite de la pénalité de remboursement anticipé.",
      "Vérifiez la date exacte de la fin de votre terme et le délai de réponse demandé.",
      "Demandez à un courtier hypothécaire de comparer l'offre de renouvellement avec au moins une autre soumission.",
      "Vérifiez quels frais sont inclus dans chaque offre et qui les assume.",
      "Relisez les conditions de remboursement anticipé et la possibilité de transférer l'hypothèque.",
    ],
    relatedSlugs: ["refinancer-pour-renover", "consolidation-de-dettes"],
  },
  {
    slug: "refinancer-pour-renover",
    navLabel: "Refinancer pour rénover",
    title: "Refinancer pour rénover : ce que le prêteur regarde",
    metaTitle: "Refinancer pour rénover : les vérifications utiles",
    metaDescription:
      "Refinancer pour financer des travaux engage votre maison. Vérifiez les ratios, les frais cachés et les permis avant de signer un nouveau prêt.",
    intro: [
      "Refinancer pour rénover consiste à remplacer votre hypothèque actuelle par une nouvelle, souvent plus élevée, pour libérer de l'équité et payer les travaux. L'équité correspond à la valeur de la propriété moins le solde du prêt. La démarche ressemble à un renouvellement, mais le montant change la donne.",
      "C'est une option courante quand les économies ne suffisent pas. Elle comporte toutefois un risque clair : la maison garantit désormais une dette plus importante.",
    ],
    sections: [
      {
        heading: "Équité, ratio prêt-valeur et capacité d'emprunt",
        paragraphs: [
          "Le ratio prêt-valeur compare le montant du prêt à la valeur de la propriété. Plus ce ratio est élevé, plus la marge de sécurité du prêteur est mince, et plus les conditions peuvent être exigeantes.",
          "Le prêteur ne se fie pas toujours à la valeur du rôle d'évaluation municipal. Il peut demander une évaluation, parfois à vos frais, pour confirmer la valeur marchande avant d'accepter le nouveau montant. Une valeur plus basse que prévu réduit le montant accessible, même si vos revenus sont solides.",
        ],
      },
      {
        heading: "Ce que le prêteur veut savoir sur vos travaux",
        paragraphs: [
          "La nature des rénovations compte. Des travaux de cuisine ou de salle de bain se présentent différemment d'un agrandissement, d'un sous-sol à aménager ou d'une réfection structurale. Le prêteur peut demander des soumissions, des plans ou des permis.",
          "Il veut aussi savoir qui exécutera les travaux. Un entrepreneur licencié, un échéancier réaliste et des permis obtenus avant le début du chantier rassurent davantage qu'un projet flou.",
          "Des travaux réalisés sans permis peuvent compliquer la vente plus tard. Le prêteur et l'acheteur éventuel y verront un risque, et la conformité peut coûter plus cher à corriger qu'à faire correctement.",
          "Les rénovations qui améliorent durablement la propriété sont généralement mieux perçues que celles qui correspondent à un goût personnel difficile à revendre. Un acheteur cherche un bien fonctionnel, pas le reflet exact des goûts du vendeur.",
        ],
      },
      {
        heading: "Les coûts qu'on oublie dans le budget",
        paragraphs: [
          "Le montant emprunté n'est pas le coût total du projet. Il faut ajouter l'évaluation, les frais notariés, la pénalité si le terme actuel est interrompu, les permis et une réserve pour les imprévus. Une soumission détaillée vaut mieux qu'une estimation verbale.",
          "Les taxes municipales peuvent augmenter après une rénovation évaluée par la municipalité. Prévoyez cet effet dans votre budget annuel, pas seulement dans le calcul du prêt.",
          "Avant de signer, demandez une simulation écrite qui tient compte des frais et de la nouvelle cotisation. Les taux, les frais et les pénalités varient selon le prêteur, le produit et votre dossier ; validez votre situation avec un courtier hypothécaire ou votre prêteur.",
        ],
      },
      {
        heading: "Rénover sans hypothéquer son avenir",
        paragraphs: [
          "Refinancer pour rénover n'augmente pas automatiquement la valeur de la maison du montant dépensé. Le marché local, la qualité des travaux et l'équilibre du voisinage déterminent ce qu'un acheteur acceptera de payer.",
          "Une rénovation trop ambitieuse pour le secteur peut coûter plus qu'elle ne rapporte. Il vaut la peine de regarder les propriétés comparables et de discuter avec un courtier hypothécaire avant de fixer le budget.",
          "Si le projet est surtout esthétique et que vous prévoyez vendre bientôt, la question du rendement mérite d'être posée honnêtement. Un acheteur paie rarement le coût exact des travaux, même bien exécutés.",
        ],
      },
      {
        heading: "Une marge de crédit hypothécaire peut être plus souple",
        paragraphs: [
          "Une marge de crédit hypothécaire permet de tirer des montants au besoin, alors qu'un refinancement classique libère une somme fixe. La marge convient parfois à des travaux réalisés par étapes, mais elle exige de la discipline : les intérêts s'accumulent sur ce qui est utilisé.",
          "Les deux options n'ont pas le même fonctionnement ni les mêmes frais. Demandez à votre courtier hypothécaire de les comparer avec votre projet réel, plutôt qu'avec un scénario abstrait. Une marge laissée ouverte peut aussi influencer le ratio utilisé par le prêteur lors d'une demande future.",
        ],
      },
    ],
    checklist: [
      "Demandez au prêteur quel ratio prêt-valeur maximum s'applique à votre dossier.",
      "Vérifiez si une évaluation de la propriété sera exigée et qui en paiera les frais.",
      "Demandez une estimation écrite de la pénalité si vous interrompez votre terme actuel.",
      "Vérifiez auprès de votre municipalité si les travaux requièrent un permis.",
      "Comparez le coût total d'un refinancement avec celui d'une marge de crédit hypothécaire.",
    ],
    relatedSlugs: ["renouvellement-hypothecaire", "vendre-ou-renover"],
  },
  {
    slug: "refinancer-pour-investir",
    navLabel: "Refinancer pour investir",
    title: "Refinancer sa résidence pour investir dans un immeuble à revenus",
    metaTitle: "Refinancer pour investir : les points à vérifier",
    metaDescription:
      "Utiliser l'équité de sa maison pour investir dans un immeuble à revenus demande des vérifications : revenus, ratio prêt-valeur, frais et risques.",
    intro: [
      "Utiliser l'équité de sa résidence pour acheter un immeuble à revenus est une stratégie fréquente au Québec. Elle permet de financer la mise de fonds sans vendre la maison, mais elle transforme aussi la résidence en garantie d'une dette plus lourde.",
      "Le projet mérite d'être évalué comme une entreprise, pas comme une évidence. Le temps passé à vérifier les chiffres se rattrape rarement mal.",
    ],
    sections: [
      {
        heading: "Ce que l'équité permet, et ce qu'elle engage",
        paragraphs: [
          "L'équité disponible correspond à la valeur de la propriété moins le solde de l'hypothèque et les autres garanties. Le prêteur peut accepter de la rendre accessible par un refinancement ou une marge de crédit hypothécaire.",
          "Cet argent n'est pas un revenu : c'est une dette supplémentaire garantie par votre résidence. En cas de difficulté, le prêteur peut exercer ses recours sur la maison, même si l'immeuble à revenus est censé rembourser le prêt.",
          "Avant d'emprunter, il faut aussi vérifier la clause de remboursement anticipé du prêt actuel. Une pénalité imprévue peut réduire l'équité disponible au moment où vous en avez besoin.",
        ],
      },
      {
        heading: "Le test de revenus et la capacité de porter deux dettes",
        paragraphs: [
          "Le prêteur calcule votre capacité de remboursement en tenant compte de vos revenus, de vos dettes existantes et de la nouvelle obligation. Les revenus de location sont souvent considérés en partie seulement, selon les règles du prêteur et la stabilité des baux. Un logement vacant ne compte pas de la même façon qu'un bail signé.",
          "Un projet qui semble rentable sur papier peut échouer au test de revenus. C'est souvent le loyer net, après taxes, assurances, entretien et frais de copropriété, qui détermine la vraie capacité de payer. Demandez au prêteur comment il traite un bail à venir ou une partie de logement occupée par le propriétaire.",
        ],
      },
      {
        heading: "Le ratio prêt-valeur de l'immeuble à revenus",
        paragraphs: [
          "Les immeubles à revenus sont généralement financés à un ratio prêt-valeur plus prudent que la résidence principale. La mise de fonds demandée peut donc être plus élevée, et le prêteur peut exiger une évaluation indépendante.",
          "Le nombre de logements, l'usage réel et le type de propriété influencent aussi la décision. Une copropriété divisée comporte des frais de syndicat et des règles à vérifier avant d'acheter. Une inspection préachat et une lecture des procès-verbaux du syndicat évitent des surprises coûteuses.",
        ],
      },
      {
        heading: "Le rendement ne se calcule pas avec le loyer brut",
        paragraphs: [
          "Un loyer encaissé n'est pas un profit. Il faut soustraire les taxes municipales et scolaires, l'assurance, l'entretien, les réparations, la gestion et les périodes d'inoccupation.",
          "Le marché local détermine le loyer réaliste et le risque de vacance. Deux immeubles semblables dans deux quartiers différents n'offrent pas le même rendement.",
          "Le calcul du rendement doit rester prudent : mieux vaut sous-estimer le loyer net que le surestimer. Les taux, les frais et les pénalités varient selon le prêteur, le produit et votre dossier ; validez votre situation avec un courtier hypothécaire ou votre prêteur.",
        ],
      },
      {
        heading: "Les risques à nommer avant d'emprunter",
        paragraphs: [
          "L'effet de levier amplifie les gains comme les pertes. Une hausse des taux, une vacance prolongée ou des travaux majeurs peuvent transformer un projet équilibré en charge difficile à porter.",
          "Il faut aussi penser à la liquidité : vendre un immeuble à revenus prend du temps et coûte des frais. Garder une réserve pour les imprévus fait partie d'un plan sérieux. Un plan de sortie, même sommaire, aide à décider si l'investissement tient sur plusieurs années.",
          "Un courtier hypothécaire peut vous aider à comparer les scénarios de financement. La décision d'investir, elle, vous appartient et dépend de votre tolérance au risque.",
        ],
      },
    ],
    checklist: [
      "Demandez au prêteur comment les revenus de location seront calculés dans votre dossier.",
      "Vérifiez le ratio prêt-valeur maximal accepté pour un immeuble à revenus.",
      "Demandez une estimation des frais d'évaluation, d'inspection et de notaire.",
      "Calculez une réserve pour les périodes d'inoccupation et les réparations.",
      "Vérifiez les règles de la copropriété divisée, s'il y a lieu, avant de vous engager.",
    ],
    relatedSlugs: ["refinancer-pour-renover", "consolidation-de-dettes"],
  },
  {
    slug: "consolidation-de-dettes",
    navLabel: "Consolidation de dettes",
    title: "Consolidation de dettes : comprendre avant d'emprunter",
    metaTitle: "Consolidation de dettes : ce qu'il faut comprendre",
    metaDescription:
      "Consolider ses dettes dans l'hypothèque peut simplifier les paiements, mais allonge la dette et augmente souvent le coût total des intérêts.",
    intro: [
      "La consolidation de dettes consiste à regrouper plusieurs dettes, souvent des cartes de crédit et des prêts personnels, dans une seule dette hypothécaire ou un prêt garanti par la maison. Le versement mensuel baisse parfois, mais la nature de la dette change.",
      "Ce changement mérite d'être compris avant de signer, parce qu'il touche votre résidence. Un versement plus bas n'est pas automatiquement une meilleure affaire.",
    ],
    sections: [
      {
        heading: "Ce que la consolidation règle, et ce qu'elle ne règle pas",
        paragraphs: [
          "Regrouper des dettes peut simplifier les paiements et abaisser le versement mensuel. En revanche, la consolidation ne réduit pas la dette elle-même : elle la déplace vers un prêt plus long, souvent garanti par la propriété.",
          "Si le problème vient d'un manque de revenus ou d'habitudes de dépense, la consolidation reporte la difficulté plutôt que de la résoudre. Un budget réaliste et un fonds d'urgence font souvent plus pour la stabilité qu'un nouveau prêt.",
        ],
      },
      {
        heading: "Une dette garantie par la maison change le risque",
        paragraphs: [
          "Les cartes de crédit et les prêts personnels sont généralement non garantis. Une fois consolidés dans l'hypothèque, ils deviennent garantis par votre résidence : un défaut de paiement peut mener à la perte du logement.",
          "Ce n'est pas une raison d'écarter la consolidation, mais c'est une raison de la traiter avec sérieux. La flexibilité apparente d'un versement plus bas a un coût. Ce coût se mesure sur la durée, pas sur le premier mois.",
          "Demandez au prêteur quelles garanties seront inscrites et comment elles seront radiées lorsque la dette sera remboursée. Cette formalité a un coût et un délai.",
        ],
      },
      {
        heading: "L'amortissement plus long et le coût total des intérêts",
        paragraphs: [
          "Étirer la dette sur une plus longue période réduit le versement, mais augmente le total des intérêts payés. C'est le point que les simulations mettent souvent de côté.",
          "Demandez le coût total du crédit sur toute la durée, et non seulement le paiement mensuel. Un versement plus bas ne dit rien de la dette restante après quelques années. Comparez ce total avec ce que vous paieriez en remboursant vos dettes actuelles plus rapidement.",
          "Il faut aussi prévoir ce qui arrive si de nouvelles dettes s'ajoutent après la consolidation. Une marge de crédit laissée ouverte peut recréer la situation initiale. Fermer les cartes remboursées ou réduire leur limite fait partie d'une consolidation cohérente.",
        ],
      },
      {
        heading: "Ce que le prêteur vérifie dans un dossier de consolidation",
        paragraphs: [
          "Le prêteur analyse vos revenus, vos dettes, votre historique de crédit et l'équité disponible dans la propriété. Il vérifie aussi que le nouveau prêt respecte ses ratios et ses règles internes.",
          "Un dossier refusé aujourd'hui peut être retravaillé : réduire le montant demandé, rembourser une petite dette ou attendre une amélioration du dossier change parfois la décision. Préparez des relevés récents et une liste complète de vos dettes avant la rencontre.",
        ],
      },
      {
        heading: "Quand la consolidation n'est pas la bonne réponse",
        paragraphs: [
          "Si les dettes dépassent largement la capacité de remboursement, d'autres options existent, comme la consultation budgétaire ou les régimes prévus par la loi. Ces questions dépassent le cadre d'un site d'information : parlez-en à un professionnel qualifié.",
          "Un courtier hypothécaire peut vous expliquer les conséquences d'un prêt garanti par la maison, mais il ne remplace ni un conseiller en insolvabilité ni un avocat. Pour les situations lourdes, demandez une référence vers une ressource reconnue. Demandez les réponses par écrit afin de pouvoir les comparer.",
          "La consolidation n'est pas un plan budgétaire à elle seule. Les taux, les frais et les pénalités varient selon le prêteur, le produit et votre dossier ; validez votre situation avec un courtier hypothécaire ou votre prêteur.",
        ],
      },
    ],
    checklist: [
      "Demandez le coût total des intérêts sur toute la durée, pas seulement le versement mensuel.",
      "Vérifiez si le prêt consolidé est garanti par votre résidence et ce que cela implique en cas de défaut.",
      "Demandez quelles dettes seront remboursées et lesquelles resteront ouvertes.",
      "Vérifiez les conditions de remboursement anticipé du nouveau prêt.",
      "Demandez à un courtier hypothécaire de comparer la consolidation avec une marge de crédit non garantie.",
    ],
    relatedSlugs: ["renouvellement-hypothecaire", "refinancer-pour-investir"],
  },
  {
    slug: "separation-racheter-la-maison",
    navLabel: "Séparation et rachat",
    title: "Séparation : racheter la maison sans se précipiter",
    metaTitle: "Séparation : racheter la maison, sans se précipiter",
    metaDescription:
      "Racheter la maison après une séparation touche au patrimoine familial et à l'accord du prêteur. Voici les vérifications à faire avant de signer une entente.",
    intro: [
      "Quand un couple se sépare, la maison devient rapidement la question la plus lourde. L'un souhaite rester, l'autre veut récupérer sa part, et les délais du prêteur ne correspondent pas toujours au rythme de la séparation.",
      "Le rachat est possible, mais il repose sur des décisions juridiques et financières qui ne s'improvisent pas. Les étapes s'enchaînent rarement dans l'ordre souhaité.",
    ],
    sections: [
      {
        heading: "Une décision à deux, même quand le dialogue est difficile",
        paragraphs: [
          "Le partage du patrimoine familial et la valeur des droits de chacun relèvent du droit familial. Un notaire ou un avocat doit être consulté avant de signer quoi que ce soit, y compris une entente entre les deux personnes.",
          "Cette page explique des notions générales et ne remplace pas un avis juridique. Les montants, les délais et les documents à produire varient selon la situation. Aucune entente verbale ne devrait précéder ces vérifications.",
          "Le climat émotionnel de la séparation rend les calculs difficiles. C'est précisément pour cela qu'il vaut mieux faire vérifier les chiffres par des professionnels plutôt que de s'appuyer sur des estimations improvisées.",
        ],
      },
      {
        heading: "Le rachat vu par le prêteur",
        paragraphs: [
          "Pour racheter la maison, la personne qui reste doit généralement devenir seule emprunteuse. Le prêteur réévalue alors le dossier avec un seul revenu, les dettes existantes et les obligations familiales, s'il y a lieu. Il peut aussi tenir compte d'une pension ou d'une autre obligation récurrente.",
          "Même si l'entente entre les deux personnes est claire, le prêteur doit approuver le nouveau profil. Il peut refuser ou demander une mise de fonds supplémentaire, une évaluation ou un garant.",
          "Un refus du prêteur n'est pas nécessairement définitif. Un apport supplémentaire, un co-emprunteur ou un délai pour assainir le dossier peuvent changer la réponse.",
        ],
      },
      {
        heading: "L'équité n'est pas automatiquement une mise de fonds",
        paragraphs: [
          "L'équité de la maison correspond à la valeur marchande moins le solde de l'hypothèque. La part de chaque personne dépend ensuite du partage convenu ou décidé, d'où l'importance d'une entente écrite et validée.",
          "Si la personne qui reste doit verser une somme à l'autre, ce versement peut passer par un refinancement. Le prêteur vérifie que le nouveau prêt reste soutenable après ce versement. Il peut aussi exiger une évaluation pour confirmer la valeur utilisée dans le partage.",
        ],
      },
      {
        heading: "Le rôle du notaire et la trace écrite",
        paragraphs: [
          "Un acte notarié est souvent nécessaire pour formaliser le transfert, la quittance ou la radiation d'une garantie. Ces étapes ne se font pas par simple échange de courriels.",
          "Demandez un estimé des frais et des délais avant de vous engager. Les documents manquants sont une cause fréquente de retard. Un acte notarié clair protège les deux personnes, même lorsque la relation est déjà terminée.",
        ],
      },
      {
        heading: "Protéger la suite, pas seulement la transaction",
        paragraphs: [
          "Après le rachat, le budget doit tenir avec un seul revenu : hypothèque, taxes municipales, assurance, entretien et imprévus. Un calcul optimiste aujourd'hui peut devenir une contrainte durable. Il vaut mieux un budget prudent qu'un rachat suivi d'un nouvel endettement.",
          "Prenez le temps de comparer les scénarios, y compris celui de la vente. Parfois, vendre et repartir sur des bases plus légères est la solution la plus saine pour les deux personnes. Cette option n'est pas un échec ; c'est parfois la façon la plus équitable de partager la valeur.",
          "Une décision prise dans l'urgence se corrige mal. Les taux, les frais et les pénalités varient selon le prêteur, le produit et votre dossier ; validez votre situation avec un courtier hypothécaire ou votre prêteur.",
        ],
      },
    ],
    checklist: [
      "Demandez une évaluation écrite de la valeur marchande avant de fixer la part de chacun.",
      "Vérifiez auprès du prêteur si votre revenu seul permet d'assumer l'hypothèque.",
      "Demandez au notaire un estimé des frais, des documents et des délais.",
      "Vérifiez le solde exact de l'hypothèque et les pénalités liées à un remboursement anticipé.",
      "Faites confirmer par un avocat ou un notaire le partage du patrimoine familial avant de signer.",
      "Demandez une simulation écrite du budget mensuel avec un seul revenu.",
    ],
    relatedSlugs: ["vendre-ou-renover", "renouvellement-hypothecaire"],
  },
  {
    slug: "vendre-ou-renover",
    navLabel: "Vendre ou rénover",
    title: "Vendre ou rénover : comparer les vrais coûts avant de décider",
    metaTitle: "Vendre ou rénover : comparer les vrais coûts",
    metaDescription:
      "Vendre ou rénover ? Comparez frais de transaction, coûts des travaux, permis et délais avant de choisir la meilleure option pour votre maison.",
    intro: [
      "Vendre ou rénover n'est pas seulement une question de goût. Les deux options engagent des coûts, des délais et des risques différents, et la bonne réponse dépend de votre quartier, de votre budget et de votre horizon.",
      "Comparer les scénarios avec des chiffres plausibles vaut mieux que décider sur une impression. Un écart de quelques semaines dans le calendrier peut changer le calcul.",
    ],
    sections: [
      {
        heading: "Deux projets, deux structures de coûts",
        paragraphs: [
          "Vendre implique des frais de transaction : rémunération du courtier immobilier, frais notariés, déménagement et parfois une pénalité hypothécaire. Les droits de mutation, souvent désignés sous le nom de taxe de bienvenue, sont payés par l'acheteur, mais ils pèsent sur le prix qu'il peut offrir. Ces frais se calculent avant la mise en marché, pas après la vente.",
          "Rénover implique des coûts de travaux, de permis, d'inspection et de délais. Une rénovation majeure peut aussi exiger de quitter temporairement le logement.",
          "Les deux options peuvent aussi se combiner : certains propriétaires rénovent les éléments essentiels, puis vendent avec un dossier plus solide. Dans ce cas, il faut vérifier que les travaux seront terminés avant la mise en marché.",
        ],
      },
      {
        heading: "Ce que la rénovation change à la valeur",
        paragraphs: [
          "Toutes les rénovations ne se traduisent pas en valeur à la revente. Les acheteurs paient pour ce qu'ils constatent : une cuisine fonctionnelle, une salle de bain saine, une toiture en bon état. Les travaux invisibles protègent la valeur sans l'augmenter spectaculairement. Une maison entretenue se vend généralement plus facilement qu'une maison récemment rénovée mais mal finie.",
          "Une rénovation supérieure au standard du secteur peut être difficile à rentabiliser. Regardez les propriétés comparables avant de fixer un budget. Un courtier immobilier du secteur peut vous dire ce que les acheteurs recherchent réellement.",
        ],
      },
      {
        heading: "Les coûts de transaction qu'on découvre trop tard",
        paragraphs: [
          "En plus des frais connus, il faut prévoir les ajustements de taxes, l'assurance, les travaux exigés par l'inspection préachat et parfois une baisse de prix négociée. Ces éléments réduisent le produit net de la vente.",
          "À l'inverse, un projet de rénovation comporte des imprévus : mauvaises surprises derrière les murs, délais de permis, disponibilité des entrepreneurs. Une réserve de contingence n'est pas un luxe.",
          "Demandez des soumissions écrites et gardez une marge pour les imprévus. Les travaux les plus coûteux sont souvent ceux qu'on n'avait pas prévus.",
        ],
      },
      {
        heading: "Permis, copropriété et règles à vérifier",
        paragraphs: [
          "Les travaux qui touchent la structure, l'électricité, la plomberie ou l'enveloppe exigent souvent un permis municipal. En copropriété divisée, le syndicat peut aussi encadrer les modifications et les horaires de chantier. Les règles varient d'une municipalité et d'une copropriété à l'autre.",
          "Faire vérifier ces règles avant de commander des matériaux évite des dépenses inutiles. Un entrepreneur licencié et assuré réduit aussi le risque de malfaçon. Un chantier sans permis peut être interrompu, ce qui retarde la vente ou la mise en location.",
        ],
      },
      {
        heading: "Comment trancher avec des chiffres",
        paragraphs: [
          "Le calcul utile compare le produit net d'une vente avec le coût réel d'une rénovation et la valeur estimée après travaux. Il tient compte des délais, du marché local et de votre tolérance au risque.",
          "Aucun de ces chiffres n'est certain. Les taux, les frais et les pénalités varient selon le prêteur, le produit et votre dossier ; validez votre situation avec un courtier hypothécaire ou votre prêteur.",
          "Se faire accompagner par un courtier hypothécaire et, au besoin, par un évaluateur permet de tester les scénarios avant de prendre une décision coûteuse. Cette étape ne garantit pas un résultat, mais elle rend les compromis plus visibles.",
        ],
      },
    ],
    checklist: [
      "Demandez une estimation des frais de vente, y compris la rémunération du courtier et les frais notariés.",
      "Vérifiez le coût réel des travaux avec des soumissions écrites, permis inclus.",
      "Demandez à la municipalité si votre projet requiert un permis ou une dérogation.",
      "Vérifiez auprès du prêteur la pénalité liée à un remboursement anticipé si vous vendez.",
      "Comparez le produit net de la vente avec la valeur estimée de la maison après rénovation.",
      "Demandez un échéancier écrit pour les travaux, avec les permis et les inspections requis.",
    ],
    relatedSlugs: ["renouvellement-hypothecaire", "refinancer-pour-renover"],
  },
];

export function isMortgageSlug(value: string): value is MortgageSlug {
  return (MORTGAGE_SLUGS as readonly string[]).includes(value);
}

export function listMortgagePages(locale: Locale): MortgagePage[] {
  return locale === "en" ? MORTGAGE_PAGES_EN : MORTGAGE_PAGES;
}

export function getMortgagePage(slug: string, locale: Locale = "fr"): MortgagePage | null {
  if (!isMortgageSlug(slug)) {
    return null;
  }

  return listMortgagePages(locale).find((page) => page.slug === slug) ?? null;
}
