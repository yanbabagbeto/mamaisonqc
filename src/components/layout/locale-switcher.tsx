"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/components/ui/cn";
import type { Locale } from "@/i18n/config";

/**
 * Switches between the French canonical tree and the `/en` tree.
 * Renders as a real link, so it works with the keyboard and can be crawled.
 */
export function LocaleSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? "/";
  const isEnglishPath = pathname === "/en" || pathname.startsWith("/en/");
  const bare = isEnglishPath ? pathname.replace(/^\/en/, "") || "/" : pathname;

  const target: Locale = locale === "fr" ? "en" : "fr";
  const href =
    target === "en" ? (bare === "/" ? "/en" : `/en${bare}`) : bare === "/" ? "/" : bare;

  return (
    <Link
      href={href}
      hrefLang={target === "en" ? "en-CA" : "fr-CA"}
      aria-label={label}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border-strong",
        "px-2 text-xs font-bold tracking-wide text-ink-soft hover:border-primary/40 hover:text-primary",
      )}
    >
      {target === "en" ? "EN" : "FR"}
    </Link>
  );
}
