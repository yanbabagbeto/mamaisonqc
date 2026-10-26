"use client";

import { usePathname } from "next/navigation";

import { stripLocale } from "@/i18n/config";
import { messagesFor } from "@/modules/valuation/messages";

export default function EvaluationLoading() {
  const { locale } = stripLocale(usePathname() ?? "/");
  const messages = messagesFor(locale);

  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">{messages.loading}</span>
      <header className="border-b border-border bg-surface">
        <div className="container-page py-8 md:py-12">
          <div className="h-4 w-64 rounded bg-muted motion-safe:animate-pulse" />
          <div className="mt-6 h-10 w-2/3 max-w-xl rounded bg-muted motion-safe:animate-pulse" />
          <div className="mt-3 h-5 w-1/3 rounded bg-muted motion-safe:animate-pulse" />
        </div>
      </header>
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.55fr_0.75fr] lg:items-start">
        <div className="space-y-8">
          <div className="rounded-card border border-border bg-surface p-6">
            <div className="h-6 w-40 rounded bg-muted motion-safe:animate-pulse" />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="space-y-2">
                  <div className="h-3 w-24 rounded bg-muted motion-safe:animate-pulse" />
                  <div className="h-8 w-32 rounded bg-muted motion-safe:animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-card border border-border bg-surface p-6">
            <div className="h-6 w-56 rounded bg-muted motion-safe:animate-pulse" />
            <div className="mt-6 h-24 rounded bg-muted motion-safe:animate-pulse" />
          </div>
        </div>
        <div className="rounded-card border border-border bg-surface p-6">
          <div className="h-5 w-40 rounded bg-muted motion-safe:animate-pulse" />
          <div className="mt-4 h-16 rounded bg-muted motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  );
}
