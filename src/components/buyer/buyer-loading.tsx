"use client";

import { usePathname } from "next/navigation";

import { stripLocale } from "@/i18n/config";
import { messagesFor } from "@/modules/buyer/messages";

/** Shared loading skeleton for the buyer pages; locale comes from the browser pathname. */
export function BuyerLoading() {
  const { locale } = stripLocale(usePathname() ?? "/");
  const messages = messagesFor(locale);

  return (
    <div aria-busy="true" aria-live="polite" className="container-page py-10 md:py-14">
      <span className="sr-only">{messages.common.loading}</span>
      <div className="h-3 w-40 rounded bg-muted motion-safe:animate-pulse" />
      <div className="mt-4 h-10 w-2/3 max-w-xl rounded bg-muted motion-safe:animate-pulse" />
      <div className="mt-3 h-5 w-full max-w-2xl rounded bg-muted motion-safe:animate-pulse" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-28 rounded-card border border-border bg-surface motion-safe:animate-pulse"
          />
        ))}
      </div>
      <div className="mt-8 h-64 rounded-card border border-border bg-surface motion-safe:animate-pulse" />
    </div>
  );
}
