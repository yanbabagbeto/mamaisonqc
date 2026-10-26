"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";

/** Labels come from the server parent so no display string is hardcoded in the client bundle. */
export type ContactFormLabels = {
  legend: string;
  name: string;
  nameHint: string;
  namePlaceholder: string;
  email: string;
  emailHint: string;
  emailPlaceholder: string;
  message: string;
  messageHint: string;
  messagePlaceholder: string;
  consent: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  errorTitle: string;
  errorBody: string;
  invalid: string;
  network: string;
  rateLimited: string;
};

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Posts to `/api/contact` (Lead-owned route): `{ name, email, message }` → `{ ok, data|error }`.
 * No email address is invented: the form is the official channel. Validation is repeated on the
 * server; this component only gives immediate feedback.
 */
export function ContactForm({ labels }: { labels: ContactFormLabels }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const body = String(data.get("message") ?? "").trim();
    const consent = data.get("consent");

    if (!consent || name.length < 2 || !email || body.length < 10) {
      setStatus("error");
      setTitle(labels.errorTitle);
      setMessage(labels.invalid);
      return;
    }

    setStatus("submitting");
    setTitle("");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message: body }),
      });

      if (response.status === 429) {
        setStatus("error");
        setTitle(labels.errorTitle);
        setMessage(labels.rateLimited);
        return;
      }
      if (response.status === 422) {
        setStatus("error");
        setTitle(labels.errorTitle);
        setMessage(labels.invalid);
        return;
      }
      if (!response.ok) {
        setStatus("error");
        setTitle(labels.errorTitle);
        setMessage(labels.errorBody);
        return;
      }

      form.reset();
      setStatus("success");
      setTitle(labels.successTitle);
      setMessage(labels.successBody);
    } catch {
      setStatus("error");
      setTitle(labels.errorTitle);
      setMessage(labels.network);
    }
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-describedby="contact-status">
      <fieldset className="space-y-4" disabled={submitting}>
        <legend className="font-display text-lg font-bold text-ink">{labels.legend}</legend>

        <Field label={labels.name} htmlFor="contact-name" hint={labels.nameHint}>
          <Input
            id="contact-name"
            name="name"
            aria-describedby="contact-name-hint"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            placeholder={labels.namePlaceholder}
          />
        </Field>

        <Field label={labels.email} htmlFor="contact-email" hint={labels.emailHint}>
          <Input
            id="contact-email"
            name="email"
            aria-describedby="contact-email-hint"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder={labels.emailPlaceholder}
          />
        </Field>

        <Field label={labels.message} htmlFor="contact-message" hint={labels.messageHint}>
          <Textarea
            id="contact-message"
            name="message"
            aria-describedby="contact-message-hint"
            required
            minLength={10}
            maxLength={1500}
            rows={6}
            placeholder={labels.messagePlaceholder}
          />
        </Field>

        <div className="flex items-start gap-3">
          <Checkbox id="contact-consent" name="consent" required className="mt-0.5" />
          <label htmlFor="contact-consent" className="text-sm leading-relaxed text-ink-soft">
            {labels.consent}
          </label>
        </div>
      </fieldset>

      <Button type="submit" size="md" disabled={submitting}>
        {submitting ? labels.submitting : labels.submit}
      </Button>

      <div
        id="contact-status"
        aria-live="polite"
        className={
          status === "error"
            ? "rounded-xl border border-danger/20 bg-[#fdeceb] px-4 py-3 text-sm text-danger"
            : status === "success"
              ? "rounded-xl border border-success/20 bg-[#e7f6ee] px-4 py-3 text-sm text-success"
              : "sr-only"
        }
      >
        {title ? <p className="font-semibold">{title}</p> : null}
        {message ? <p className={title ? "mt-1" : undefined}>{message}</p> : null}
      </div>
    </form>
  );
}
