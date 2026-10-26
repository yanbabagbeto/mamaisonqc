"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/content";
import { localePath, stripLocale } from "@/i18n/config";
import { messagesFor } from "@/modules/valuation/messages";

/**
 * Segment error boundary for `/evaluation/[matricule]`. It renders no partial figure: a page
 * that failed to load must not fall back to an estimate computed from incomplete data.
 * `retry()` re-renders the segment (Next 16.3+; `reset()` would skip the re-fetch).
 * Locale comes from the browser pathname because error boundaries receive no server props.
 */
export default function EvaluationError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const { locale } = stripLocale(usePathname() ?? "/");
  const messages = messagesFor(locale);

  useEffect(() => {
    console.error("[evaluation] render error", error);
  }, [error]);

  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-xl space-y-5">
        <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">
          {messages.error.eyebrow}
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
          {messages.error.title}
        </h1>
        <Alert tone="danger" title={messages.error.errorTitle}>
          {messages.error.message}
        </Alert>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => retry()}>{messages.error.retry}</Button>
          <ButtonLink href={localePath("/", locale)} variant="secondary">
            {messages.error.home}
          </ButtonLink>
        </div>
        <p className="text-sm leading-relaxed text-muted-fg">{messages.error.note}</p>
      </div>
    </div>
  );
}
