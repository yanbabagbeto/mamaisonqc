"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

type Labels = {
  title: string;
  placeholder: string;
  submit: string;
  submitting: string;
  hint: string;
  success: string;
  errorEmpty: string;
  errorGeneric: string;
  errorNetwork: string;
};

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Single opt-in subscription. No email is sent in v1: the row lands in the database
 * and the confirmation is shown inline (see docs/PRD.md non-goals).
 */
export function NewsletterForm({ source = "footer", labels }: { source?: string; labels: Labels }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!email) {
      setStatus("error");
      setMessage(labels.errorEmpty);
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
        setMessage(!payload.ok ? payload.error.message : labels.errorGeneric);
        return;
      }
      form.reset();
      setStatus("success");
      setMessage(labels.success);
    } catch {
      setStatus("error");
      setMessage(labels.errorNetwork);
    }
  }

  return (
    <form onSubmit={onSubmit} method="post" action="/api/newsletter" className="space-y-2" noValidate>
      <Label htmlFor={`newsletter-${source}`} className="text-sm">
        {labels.title}
      </Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={`newsletter-${source}`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder={labels.placeholder}
          aria-describedby={message ? `newsletter-${source}-status` : undefined}
          disabled={status === "submitting"}
        />
        <Button type="submit" size="md" className="shrink-0" disabled={status === "submitting"}>
          {status === "submitting" ? labels.submitting : labels.submit}
        </Button>
      </div>
      <p
        id={`newsletter-${source}-status`}
        aria-live="polite"
        className={status === "error" ? "text-xs font-medium text-danger" : "text-xs text-muted-fg"}
      >
        {message || labels.hint}
      </p>
    </form>
  );
}
