import type { Locale } from "@/i18n/config";

/**
 * Claim flow copy, both languages. `en` is typed against `fr`, so a missing key is a type error.
 * Status labels are localized here: the database stores `pending|approved|rejected`, and raw values
 * must never reach the screen (reported in review).
 */
type Widen<T> = T extends string ? string : { readonly [K in keyof T]: Widen<T[K]> };

const fr = {
  meta: {
    title: "Réclamer la page de ma propriété",
    description:
      "Prenez possession de la page d'évaluation de votre propriété : suivez son marché, publiez en pré-marché et accédez à vos outils propriétaire.",
  },
  page: {
    eyebrow: "Propriétaire",
    title: "Prenez possession de votre page",
    intro:
      "La fiche publique d'une propriété existe déjà, comme le rôle d'évaluation dont elle provient. En la réclamant, vous ajoutez vos outils : équité, pré-marché, suivi des intérêts.",
    stepsTitle: "Comment ça se passe",
    steps: [
      "Trouvez votre adresse pour obtenir le matricule de votre unité d'évaluation.",
      "Connectez-vous ou créez un compte, puis envoyez la demande.",
      "Un administrateur la vérifie; une fois approuvée, vos outils propriétaire s'ouvrent.",
    ],
    searchCta: "Trouver mon adresse",
    createTitle: "Créez votre compte d'abord",
    createBody:
      "Pour réclamer une page, il faut un compte — c'est ce qui empêche quelqu'un d'autre de publier en votre nom. Créez-le en 30 secondes.",
    createCta: "Créer mon compte",
    loginCta: "J'ai déjà un compte",
    newRequestTitle: "Nouvelle demande",
    signedInAs: "Connecté en tant que {name} ({email}).",
    myRequestsTitle: "Mes demandes",
    requestedOn: "Demande du {date}",
    noRequests: "Aucune demande pour l'instant.",
    findProperty: "Trouvez votre propriété pour obtenir son matricule.",
    privacy:
      "Vos informations personnelles ne sont pas publiées. Une demande approuvée vous donne accès aux outils propriétaire de cette fiche — pas à la propriété du terrain.",
    form: {
      matriculeLabel: "Matricule de la propriété",
      matriculeHint:
        "Le matricule figure sur la fiche d'évaluation (bouton « Réclamer cette page ») ou dans l'adresse de la fiche.",
      evidenceLabel: "Comment savons-nous que c'est la vôtre? (facultatif)",
      evidenceHint:
        "Numéro de compte de taxes, nom au rôle, ou tout élément vérifiable. 600 caractères max.",
      submit: "Envoyer la demande",
      submitting: "Envoi…",
      errorGeneric: "Demande impossible.",
      errorNetwork: "Réseau indisponible. Réessayez dans un instant.",
      created:
        "Demande enregistrée. Un administrateur la validera; vous verrez son état dans votre tableau de bord.",
      existing: "Une demande existe déjà pour cette propriété (état : {status}).",
    },
    status: { pending: "en attente", approved: "approuvée", rejected: "refusée" },
  },
} as const;

type ClaimsMessages = Widen<typeof fr>;

const en: ClaimsMessages = {
  meta: {
    title: "Claim my property's page",
    description:
      "Take ownership of your property's valuation page: follow its market, publish a pre-market listing and unlock the owner tools.",
  },
  page: {
    eyebrow: "Homeowner",
    title: "Take ownership of your page",
    intro:
      "A property's public record already exists, just like the assessment roll it comes from. Claiming it unlocks your tools: equity, pre-market and interest tracking.",
    stepsTitle: "How it works",
    steps: [
      "Find your address to get your assessment unit's roll number.",
      "Sign in or create an account, then send the request.",
      "An administrator verifies it; once approved, your owner tools open.",
    ],
    searchCta: "Find my address",
    createTitle: "Create your account first",
    createBody:
      "Claiming a page requires an account — that is what stops anyone else from publishing in your name. It takes 30 seconds.",
    createCta: "Create my account",
    loginCta: "I already have an account",
    newRequestTitle: "New request",
    signedInAs: "Signed in as {name} ({email}).",
    myRequestsTitle: "My requests",
    requestedOn: "Requested on {date}",
    noRequests: "No request yet.",
    findProperty: "Find your property to get its roll number.",
    privacy:
      "Your personal information is not published. An approved request gives you access to this record's owner tools — not to the land itself.",
    form: {
      matriculeLabel: "Property roll number",
      matriculeHint:
        "The roll number appears on the valuation record (the “Claim this page” button) or in the record's URL.",
      evidenceLabel: "How do we know it is yours? (optional)",
      evidenceHint: "Tax account number, name on the roll, or anything verifiable. 600 characters max.",
      submit: "Send request",
      submitting: "Sending…",
      errorGeneric: "Request failed.",
      errorNetwork: "Network unavailable. Try again in a moment.",
      created:
        "Request recorded. An administrator will review it; you can follow its status in your dashboard.",
      existing: "A request already exists for this property (status: {status}).",
    },
    status: { pending: "pending", approved: "approved", rejected: "rejected" },
  },
};

const dictionaries: Record<Locale, ClaimsMessages> = { fr, en };

export type { ClaimsMessages };

export function claimsMessagesFor(locale: Locale): ClaimsMessages {
  return dictionaries[locale];
}

export function fillClaim(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

/** Maps `pending|approved|rejected` to a localized label; unknown values fall back to the raw code. */
export function claimStatusLabel(
  statusLabels: Record<string, string>,
  status: string,
): string {
  return statusLabels[status] ?? status;
}
