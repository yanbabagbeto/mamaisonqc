"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/field";
import { NOTIFICATION_KEYS, type NotificationPrefs } from "@/modules/buyer/types";
import type { BuyerMessages } from "@/modules/buyer/messages";

/** Notification preferences form; owned rows only, upserted by the API for the session user. */
export function PrefsForm({
  messages,
  initial,
}: {
  messages: BuyerMessages;
  initial: NotificationPrefs;
}) {
  const t = messages.settings;
  const [prefs, setPrefs] = useState<NotificationPrefs>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    try {
      const response = await fetch("/api/buyer/prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(prefs),
      });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.notificationsTitle}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-sm leading-relaxed text-ink-soft">{t.notificationsBody}</p>
        <form onSubmit={submit} className="space-y-3">
          <ul className="space-y-2">
            {NOTIFICATION_KEYS.map((key) => (
              <li key={key}>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3 py-2.5 hover:bg-muted">
                  <Checkbox
                    checked={prefs[key]}
                    onChange={(event) =>
                      setPrefs((current) => ({ ...current, [key]: event.target.checked }))
                    }
                  />
                  <span className="text-sm text-ink-soft">{t.notificationLabels[key]}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={status === "saving"}>
              {status === "saving" ? t.saving : t.save}
            </Button>
            <span aria-live="polite" className="text-sm">
              {status === "saved" ? t.saved : null}
              {status === "error" ? (
                <span role="alert" className="font-medium text-danger">
                  {t.saveError}
                </span>
              ) : null}
            </span>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
