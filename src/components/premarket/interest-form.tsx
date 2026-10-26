"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";

export function InterestForm({ listingId }: { listingId: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      name: String(new FormData(form).get("name") ?? "").trim(),
      email: String(new FormData(form).get("email") ?? "").trim(),
      message: String(new FormData(form).get("message") ?? "").trim(),
    };
    setStatus("submitting");
    setMessage("");
    setFieldErrors({});
    try {
      const response = await fetch(`/api/premarket/${encodeURIComponent(listingId)}/interets`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as
        | { ok: true }
        | { ok: false; error: { message: string; details?: Record<string, string[]> } };
      if (!response.ok || !body.ok) {
        if (!body.ok && body.error.details) setFieldErrors(body.error.details);
        setStatus("error");
        setMessage(body.ok ? "Envoi impossible." : body.error.message);
        return;
      }
      form.reset();
      setStatus("success");
      setMessage("Votre intérêt est transmis au propriétaire. Il vous répondra directement.");
    } catch {
      setStatus("error");
      setMessage("Réseau indisponible. Réessayez dans un instant.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="Votre nom" htmlFor="interest-name" error={fieldErrors.name?.[0]}>
        <Input id="interest-name" name="name" autoComplete="name" required />
      </Field>
      <Field
        label="Votre courriel"
        htmlFor="interest-email"
        hint="Transmis au propriétaire pour qu'il puisse vous répondre."
        error={fieldErrors.email?.[0]}
      >
        <Input id="interest-email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Message (facultatif)" htmlFor="interest-message" error={fieldErrors.message?.[0]}>
        <Textarea id="interest-message" name="message" maxLength={600} />
      </Field>
      <p className="text-xs text-muted-fg">
        Vos coordonnées ne sont visibles que du propriétaire de cette propriété. Aucune inscription
        requise.
      </p>
      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Envoi…" : "Je suis intéressé"}
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
