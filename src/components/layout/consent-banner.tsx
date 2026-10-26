"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const STORAGE_KEY = "maqc-consent";
const POLICY_VERSION = "2026-10-26";

/**
 * One honest choice, no dark pattern. Nothing is measured before a choice is made;
 * refusing logs nothing but the refusal (docs/adr/ADR-006-no-third-party-analytics.md).
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // Private mode: stay silent rather than blocking the page with a non-functional dialog.
    }
  }, []);

  function decide(choice: "accepte" | "refuse") {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // ignore
    }
    setVisible(false);
    void fetch("/api/consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ choice, policyVersion: POLICY_VERSION }),
      keepalive: true,
    }).catch(() => undefined);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-card border border-border bg-surface p-4 shadow-[var(--shadow-lift)] md:inset-x-6 md:bottom-6 md:p-5"
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p id="consent-title" className="font-display text-base font-bold text-ink">
            Respect de votre vie privée
          </p>
          <p id="consent-desc" className="mt-1 text-sm text-ink-soft">
            Nous mesurons l&apos;usage du site avec nos propres outils, sans publicité ni traqueur tiers.
            Vous pouvez refuser : le site fonctionne exactement pareil.{" "}
            <Link href="/confidentialite" className="underline underline-offset-2 hover:text-primary">
              Politique de confidentialité
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" size="sm" onClick={() => decide("refuse")}>
            Refuser
          </Button>
          <Button size="sm" onClick={() => decide("accepte")}>
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
}
