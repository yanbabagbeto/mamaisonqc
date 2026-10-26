"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";

export function ClaimForm({ defaultMatricule }: { defaultMatricule?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("submitting");
    setMessage("");
    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          matricule: String(data.get("matricule") ?? "").trim(),
          evidence: String(data.get("evidence") ?? "").trim(),
        }),
      });
      const body = (await response.json()) as
        | { ok: true; data: { claimId: string; status: string; created: boolean } }
        | { ok: false; error: { message: string } };
      if (!response.ok || !body.ok) {
        setStatus("error");
        setMessage(body.ok ? "Demande impossible." : body.error.message);
        return;
      }
      setStatus("success");
      setMessage(
        body.data.created
          ? "Demande enregistrée. Un administrateur la validera; vous verrez son état dans votre tableau de bord."
          : `Une demande existe déjà pour cette propriété (état : ${body.data.status}).`,
      );
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Réseau indisponible. Réessayez dans un instant.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field
        label="Matricule de la propriété"
        htmlFor="claim-matricule"
        hint="Le matricule figure sur la fiche d'évaluation (bouton « Réclamer cette page »)."
      >
        <Input
          id="claim-matricule"
          name="matricule"
          required
          defaultValue={defaultMatricule}
          placeholder="ex. 1234567"
        />
      </Field>
      <Field
        label="Comment savons-nous que c'est la vôtre? (facultatif)"
        htmlFor="claim-evidence"
        hint="Numéro de matricule du compte de taxes, nom au rôle, ou tout élément vérifiable. 600 caractères max."
      >
        <Textarea id="claim-evidence" name="evidence" maxLength={600} />
      </Field>
      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Envoi…" : "Envoyer la demande"}
      </Button>
      <p
        aria-live="polite"
        className={status === "error" ? "text-sm font-medium text-danger" : "text-sm text-success"}
      >
        {message}
      </p>
    </form>
  );
}
