"use client";

import { useActionState } from "react";

import { requestAccountDeletionAction } from "@/app/parametres/actions";
import { INITIAL_DELETION_STATE, type DeletionState } from "@/app/parametres/deletion-state";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/content";
import type { BuyerMessages } from "@/modules/buyer/messages";

export function DeleteAccountForm({ messages }: { messages: BuyerMessages }) {
  const t = messages.settings;
  const [state, action, pending] = useActionState<DeletionState, FormData>(
    requestAccountDeletionAction,
    INITIAL_DELETION_STATE,
  );

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-ink-soft">{t.deletionBody}</p>
      {state.status === "requested" ? (
        <Alert tone="success" title={t.deletionTitle}>
          {t.deletionConfirm}
        </Alert>
      ) : null}
      {state.status === "error" && state.message ? (
        <Alert tone="danger" title={messages.common.errorTitle}>
          {state.message}
        </Alert>
      ) : null}
      <form action={action}>
        <Button type="submit" variant="danger" disabled={pending || state.status === "requested"}>
          {t.deletionCta}
        </Button>
      </form>
      <p className="text-xs leading-relaxed text-muted-fg">{t.deletionNote}</p>
    </div>
  );
}
