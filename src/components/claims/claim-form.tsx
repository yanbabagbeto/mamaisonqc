"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import {
  claimStatusLabel,
  fillClaim,
  type ClaimsMessages,
} from "@/modules/claims/messages";

/**
 * Claim request form. Every string comes from the dictionary; the duplicate case is not a success
 * banner and shows a localized status instead of the raw database value.
 */
export function ClaimForm({
  defaultMatricule,
  labels,
}: {
  defaultMatricule?: string;
  labels: ClaimsMessages["page"]["form"] & { status: ClaimsMessages["page"]["status"] };
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "exists" | "error">(
    "idle",
  );
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
        setMessage(body.ok ? labels.errorGeneric : body.error.message);
        return;
      }
      if (body.data.created) {
        setStatus("success");
        setMessage(labels.created);
      } else {
        setStatus("exists");
        setMessage(
          fillClaim(labels.existing, {
            status: claimStatusLabel(labels.status, body.data.status),
          }),
        );
      }
      router.refresh();
    } catch {
      setStatus("error");
      setMessage(labels.errorNetwork);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field label={labels.matriculeLabel} htmlFor="claim-matricule" hint={labels.matriculeHint}>
        <Input
          id="claim-matricule"
          name="matricule"
          required
          defaultValue={defaultMatricule}
          placeholder="ex. 319344091610000000"
        />
      </Field>
      <Field label={labels.evidenceLabel} htmlFor="claim-evidence" hint={labels.evidenceHint}>
        <Textarea id="claim-evidence" name="evidence" maxLength={600} />
      </Field>
      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? labels.submitting : labels.submit}
      </Button>
      <p
        aria-live="polite"
        className={
          status === "error"
            ? "text-sm font-medium text-danger"
            : status === "exists"
              ? "text-sm font-medium text-warning"
              : "text-sm text-success"
        }
      >
        {message}
      </p>
    </form>
  );
}
