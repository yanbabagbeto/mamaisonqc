"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Single opt-in subscription. No email is sent in v1: the row lands in the database
 * and the confirmation is shown inline (see docs/PRD.md non-goals).
 */
export function NewsletterForm({ source = "footer" }: { source?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!email) {
      setStatus("error");
      setMessage("Entrez une adresse courriel.");
      return;
    }
    setStatus("submitting");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const payload = (await response.json()) as
        | { ok: true }
        | { ok: false; error: { message: string } };
      if (!response.ok || !payload.ok) {
        setStatus("error");
        setMessage(!payload.ok ? payload.error.message : "Inscription impossible pour le moment.");
        return;
      }
      form.reset();
      setStatus("success");
      setMessage("C'est noté. Vous recevrez Le Brief dès la prochaine édition.");
    } catch {
      setStatus("error");
      setMessage("Réseau indisponible. Réessayez dans un instant.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2" noValidate>
      <Label htmlFor={`newsletter-${source}`} className="text-sm">
        Recevez Le Brief
      </Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={`newsletter-${source}`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="vous@exemple.ca"
          aria-describedby={message ? `newsletter-${source}-status` : undefined}
          disabled={status === "submitting"}
        />
        <Button type="submit" size="md" className="shrink-0" disabled={status === "submitting"}>
          {status === "submitting" ? "Inscription…" : "S'abonner"}
        </Button>
      </div>
      <p
        id={`newsletter-${source}-status`}
        aria-live="polite"
        className={
          status === "error" ? "text-xs font-medium text-danger" : "text-xs text-muted-fg"
        }
      >
        {message || "Une édition par mois. Désinscription en un clic."}
      </p>
    </form>
  );
}
