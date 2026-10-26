"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/content";
import { localePath, stripLocale } from "@/i18n/config";

import { messagesFor } from "@/modules/market/messages";

/** Client error boundary shared by the three market routes (Next 16 passes `retry`). */
export function MarketError({ error, retry }: { error: unknown; retry: () => void }) {
  const pathname = usePathname();
  const { locale } = stripLocale(pathname);
  const m = messagesFor(locale);

  useEffect(() => {
    console.error("[marche-immobilier] render failed", error);
  }, [error]);

  return (
    <div className="container-page py-14 md:py-20">
      <EmptyState
        title={m.error.title}
        description={m.error.body}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => retry()}>{m.error.retry}</Button>
            <ButtonLink href={localePath("/marche-immobilier", locale)} variant="secondary">
              {m.error.back}
            </ButtonLink>
          </div>
        }
      />
    </div>
  );
}
