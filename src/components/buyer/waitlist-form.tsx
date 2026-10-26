"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/content";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import type { BuyerMessages } from "@/modules/buyer/messages";

type Status = "idle" | "submitting" | "success" | "already" | "error";

/**
 * Pre-approval waitlist form. The consent checkbox is required client-side and validated again
 * server-side (`consent` must be literally true before anything is written). No email is sent.
 */
export function WaitlistForm({
  messages,
  defaultEmail = "",
  alreadyOnList,
}: {
  messages: BuyerMessages;
  defaultEmail?: string;
  alreadyOnList: boolean;
}) {
  const t = messages.financing.waitlist;
  const [email, setEmail] = useState(defaultEmail);
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [problem, setProblem] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      setProblem(t.consentError);
      return;
    }
    setStatus("submitting");
    setProblem(null);
    try {
      const response = await fetch("/api/buyer/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, note, consent: true, policyVersion: "loi25-v1" }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok: true; data?: { already?: boolean } }
        | { ok: false; error?: { message?: string } }
        | null;
      if (!response.ok || !payload || payload.ok !== true) {
        setProblem(t.error);
        setStatus("error");
        return;
      }
      setStatus(payload.data?.already ? "already" : "success");
    } catch {
      setStatus("error");
      setProblem(t.error);
    }
  }

  if (alreadyOnList) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <Alert tone="info" title={t.alreadyTitle}>
            {t.alreadyBody}
          </Alert>
          <p className="text-xs leading-relaxed text-muted-fg">{t.privacyNote}</p>
        </CardBody>
      </Card>
    );
  }

  if (status === "success" || status === "already") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <Alert tone="success" title={status === "already" ? t.alreadyTitle : t.successTitle}>
            {status === "already" ? t.alreadyBody : t.successBody}
          </Alert>
          <p className="text-xs leading-relaxed text-muted-fg">{t.privacyNote}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-sm leading-relaxed text-ink-soft">{t.intro}</p>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label={t.emailLabel} htmlFor="waitlist-email" hint={t.emailHint}>
            <Input
              id="waitlist-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-describedby="waitlist-email-hint"
            />
          </Field>
          <Field label={t.noteLabel} htmlFor="waitlist-note" hint={t.noteHint}>
            <Textarea
              id="waitlist-note"
              name="note"
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              aria-describedby="waitlist-note-hint"
            />
          </Field>
          <label className="flex items-start gap-3 rounded-xl border border-border px-3 py-3">
            <Checkbox
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              aria-describedby="waitlist-consent-note"
            />
            <span className="text-sm leading-relaxed text-ink-soft">{t.consentLabel}</span>
          </label>
          <p id="waitlist-consent-note" className="text-xs leading-relaxed text-muted-fg">
            {t.privacyNote}
          </p>
          {problem ? (
            <p role="alert" className="text-sm font-medium text-danger">
              {problem}
            </p>
          ) : null}
          <Button type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? t.submitting : t.submit}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
