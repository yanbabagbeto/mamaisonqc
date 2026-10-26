"use client";

import { usePathname } from "next/navigation";

import { stripLocale } from "@/i18n/config";

import { MarketPageSkeleton } from "@/components/market/loading-skeleton";

import { messagesFor } from "@/modules/market/messages";

export default function Loading() {
  const { locale } = stripLocale(usePathname());
  return <MarketPageSkeleton message={messagesFor(locale).loading.message} cards={6} />;
}
