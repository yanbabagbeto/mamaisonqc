"use client";

import Link from "next/link";
import { useCallback, useEffect, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "maqc-consent";
const POLICY_VERSION = "2026-10-26";
const SERVER_SNAPSHOT = "__server__";

/**
 * Tiny external store over localStorage. Using `useSyncExternalStore` instead of
 * `setState` inside an effect keeps the banner hydration-safe without cascading renders.
 */
let listeners: Array<() => void> = [];

function subscribe(callback: () => void): () => void {
  listeners = [...listeners, callback];
  return () => {
    listeners = listeners.filter((listener) => listener !== callback);
  };
}

function emit(): void {
  for (const listener of listeners) listener();
}

function readConsent(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private mode: treat as already answered so we never block the page.
    return "refuse";
  }
}

type Labels = {
  title: string;
  body: string;
  policy: string;
  accept: string;
  refuse: string;
};

/**
 * One honest choice, no dark pattern. Nothing is measured before a choice is made;
 * refusing logs nothing but the refusal (docs/adr/ADR-006-no-third-party-analytics.md).
 */
export function ConsentBanner({ labels, policyHref }: { labels: Labels; policyHref: string }) {
  const stored = useSyncExternalStore(
    subscribe,
    readConsent,
    // Server/hydration render: hide the banner, then reveal it if no choice is stored.
    () => SERVER_SNAPSHOT,
  );

  // Reserve room at the bottom of the document while the banner is up, so it cannot sit on top of
  // a submit button (reported on the equity calculator).
  useEffect(() => {
    const isVisible = stored !== SERVER_SNAPSHOT && stored === null;
    const previous = document.body.style.paddingBottom;
    if (isVisible) document.body.style.paddingBottom = "7rem";
    return () => {
      document.body.style.paddingBottom = previous;
    };
  }, [stored]);

  const decide = useCallback((choice: "accepte" | "refuse") => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // ignore: the fetch below still records the decision server-side
    }
    emit();
    void fetch("/api/consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ choice, policyVersion: POLICY_VERSION }),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  if (stored === SERVER_SNAPSHOT || stored !== null) return null;

  return (
    <div
      // Compact, bottom-right on desktop: a full-width bar sat on top of centred form buttons.
      className="fixed inset-x-3 bottom-3 z-50 rounded-card border border-border bg-surface p-4 shadow-[var(--shadow-lift)] md:inset-x-auto md:right-6 md:bottom-6 md:max-w-sm md:p-5"
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p id="consent-title" className="font-display text-base font-bold text-ink">
            {labels.title}
          </p>
          <p id="consent-desc" className="mt-1 text-sm text-ink-soft">
            {labels.body}{" "}
            <Link href={policyHref} className="underline underline-offset-2 hover:text-primary">
              {labels.policy}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" size="sm" onClick={() => decide("refuse")}>
            {labels.refuse}
          </Button>
          <Button size="sm" onClick={() => decide("accepte")}>
            {labels.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
