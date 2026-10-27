"use client";

import { useRef, useState, type FormEvent } from "react";

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
  nameInvalid: string;
  emailInvalid: string;
  messageInvalid: string;
  consentRequired: string;
  network: string;
  rateLimited: string;
};

type Status = "idle" | "submitting" | "success" | "error";
type FieldName = "name" | "email" | "message" | "consent";
type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Posts to `/api/contact`. Validation is repeated server-side; here it exists to give per-field
 * errors, move focus to the first invalid control and never leave the visitor with one generic
 * message (reported in review).
 */
export function ContactForm({ labels }: { labels: ContactFormLabels }) {
  const [status, setStatus] = useState<Status>("idle");
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  function focusFirstInvalid(fieldErrors: FieldErrors): void {
    const order: FieldName[] = ["name", "email", "message", "consent"];
    const first = order.find((field) => fieldErrors[field]);
    if (!first) return;
    formRef.current?.querySelector<HTMLElement>(`#contact-${first}`)?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const body = String(data.get("message") ?? "").trim();
    const consent = data.get("consent");

    const fieldErrors: FieldErrors = {};
    if (name.length < 2) fieldErrors.name = labels.nameInvalid;
    if (!EMAIL_RE.test(email)) fieldErrors.email = labels.emailInvalid;
    if (body.length < 10) fieldErrors.message = labels.messageInvalid;
    if (!consent) fieldErrors.consent = labels.consentRequired;

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setStatus("error");
      setNotice({ title: labels.errorTitle, body: labels.invalid });
      focusFirstInvalid(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");
    setNotice(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message: body }),
      });

      if (response.status === 429) {
        setStatus("error");
        setNotice({ title: labels.errorTitle, body: labels.rateLimited });
        return;
      }
      if (!response.ok) {
        setStatus("error");
        setNotice({ title: labels.errorTitle, body: labels.errorBody });
        return;
      }

      form.reset();
      setStatus("success");
      setNotice({ title: labels.successTitle, body: labels.successBody });
      document.getElementById("contact-status")?.focus();
    } catch {
      setStatus("error");
      setNotice({ title: labels.errorTitle, body: labels.network });
    }
  }

  const submitting = status === "submitting";

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
      <fieldset className="space-y-4" disabled={submitting}>
        {/* The card already renders this heading; the legend stays for assistive tech only. */}
        <legend className="sr-only">{labels.legend}</legend>

        <Field label={labels.name} htmlFor="contact-name" hint={labels.nameHint} error={errors.name}>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            placeholder={labels.namePlaceholder}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "contact-name-error" : "contact-name-hint"}
          />
        </Field>

        <Field label={labels.email} htmlFor="contact-email" hint={labels.emailHint} error={errors.email}>
          <Input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder={labels.emailPlaceholder}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "contact-email-error" : "contact-email-hint"}
          />
        </Field>

        <Field
          label={labels.message}
          htmlFor="contact-message"
          hint={labels.messageHint}
          error={errors.message}
        >
          <Textarea
            id="contact-message"
            name="message"
            required
            minLength={10}
            maxLength={1500}
            rows={6}
            placeholder={labels.messagePlaceholder}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "contact-message-error" : "contact-message-hint"}
          />
        </Field>

        <div className="space-y-1.5">
          <label htmlFor="contact-consent" className="flex items-start gap-2.5 text-sm text-ink-soft">
            <Checkbox
              id="contact-consent"
              name="consent"
              required
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? "contact-consent-error" : undefined}
            />
            <span>{labels.consent}</span>
          </label>
          {errors.consent ? (
            <p id="contact-consent-error" className="text-sm font-medium text-danger" role="alert">
              {errors.consent}
            </p>
          ) : null}
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? labels.submitting : labels.submit}
        </Button>
      </fieldset>

      <div id="contact-status" tabIndex={-1} aria-live="polite" className="rounded-xl outline-none">
        {notice ? (
          <p
            className={
              status === "success"
                ? "rounded-xl bg-[#e7f6ee] px-4 py-3 text-sm text-success"
                : "rounded-xl bg-[#fdeceb] px-4 py-3 text-sm text-danger"
            }
          >
            <span className="font-semibold">{notice.title}. </span>
            {notice.body}
          </p>
        ) : null}
      </div>
    </form>
  );
}
