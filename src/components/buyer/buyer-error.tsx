"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/content";
import { localePath, stripLocale } from "@/i18n/config";
import { messagesFor } from "@/modules/buyer/messages";

/** Shared error boundary UI for the buyer pages. Renders no partial data. */
export function BuyerError({ error, retry }: { error: unknown; retry: () => void }) {
  const { locale } = stripLocale(usePathname() ?? "/");
  const messages = messagesFor(locale);

  useEffect(() => {
    console.error("[buyer] render error", error);
  }, [error]);

  return (
    <div className="container-page max-w-xl py-16 md:py-24">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
        {messages.common.errorTitle}
      </h1>
      <div className="mt-4">
        <Alert tone="danger" title={messages.common.errorTitle}>
          {messages.common.errorBody}
        </Alert>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => retry()}>{messages.common.retry}</Button>
        <ButtonLink href={localePath("/", locale)} variant="secondary">
          {messages.common.backHome}
        </ButtonLink>
      </div>
    </div>
  );
}
