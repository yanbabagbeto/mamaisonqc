"use client";

import { usePathname } from "next/navigation";

import { stripLocale } from "@/i18n/config";
import { messagesFor } from "@/modules/geo/messages";

export default function RechercheLoading() {
  const { locale } = stripLocale(usePathname() ?? "/");
  const messages = messagesFor(locale);

  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">{messages.loading}</span>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-10 md:py-14">
          <div className="h-3 w-40 rounded bg-muted motion-safe:animate-pulse" />
          <div className="mt-4 h-10 w-2/3 max-w-lg rounded bg-muted motion-safe:animate-pulse" />
          <div className="mt-3 h-5 w-full max-w-2xl rounded bg-muted motion-safe:animate-pulse" />
          <div className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row">
            <div className="h-11 flex-1 rounded-xl bg-muted motion-safe:animate-pulse" />
            <div className="h-11 w-32 rounded-xl bg-muted motion-safe:animate-pulse" />
          </div>
        </div>
      </section>
      <div className="container-page py-10 md:py-14">
        <div className="max-w-3xl space-y-3">
          <div className="h-8 w-64 rounded bg-muted motion-safe:animate-pulse" />
          {[0, 1, 2].map((index) => (
            <div key={index} className="rounded-card border border-border bg-surface px-4 py-4">
              <div className="h-6 w-2/3 rounded bg-muted motion-safe:animate-pulse" />
              <div className="mt-2 h-4 w-1/3 rounded bg-muted motion-safe:animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
