"use server";

import { getLocale } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { messagesFor } from "@/modules/buyer/messages";
import { recordAccountDeletionRequest } from "@/modules/buyer/queries";

import type { DeletionState } from "./deletion-state";

/**
 * Account-deletion request. It writes an audit event and an outbox row for the admin, then tells
 * the user about the 30-day cancellation window. No data is deleted by this action; the button is
 * a request, not a destructive operation, and it is idempotent enough to be pressed twice.
 */
export async function requestAccountDeletionAction(
  previous: DeletionState,
): Promise<DeletionState> {
  const locale = await getLocale();
  const messages = messagesFor(locale);
  const user = await getCurrentUser();
  if (!user) {
    return { ...previous, status: "error", message: messages.common.signInRequiredBody };
  }

  const subject =
    locale === "en" ? "Account deletion request" : "Demande de suppression de compte";
  const body =
    locale === "en"
      ? `Deletion requested for ${user.email} (user ${user.id}). A 30-day cancellation window applies before permanent deletion.`
      : `Suppression demandée pour ${user.email} (utilisateur ${user.id}). Un délai d'annulation de 30 jours s'applique avant la suppression définitive.`;

  try {
    await recordAccountDeletionRequest({
      userId: user.id,
      email: user.email,
      subject,
      body,
    });
    return { status: "requested" };
  } catch {
    return { ...previous, status: "error", message: messages.settings.deletionError };
  }
}
