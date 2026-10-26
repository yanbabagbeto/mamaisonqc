"use client";

import { usePathname } from "next/navigation";

import { localePath, stripLocale } from "@/i18n/config";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/content";

import { messagesFor } from "@/modules/market/messages";

export default function MarketNotFound() {
  const pathname = usePathname();
  const { locale } = stripLocale(pathname);
  const m = messagesFor(locale);

  return (
    <div className="container-page py-16 md:py-24">
      <EmptyState
        title={m.notFound.title}
        description={m.notFound.body}
        action={
          <ButtonLink href={localePath("/marche-immobilier", locale)} size="md">
            {m.notFound.action}
          </ButtonLink>
        }
      />
    </div>
  );
}
