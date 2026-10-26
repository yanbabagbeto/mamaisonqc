export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "fr" || value === "en";
}

/** Canonical URL for a path in a locale: French stays at the root, English is prefixed. */
export function localePath(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return normalized;
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

/** Strip an `/en` prefix so the same route renders for both locales. */
export function stripLocale(pathname: string): { locale: Locale; path: string } {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const path = pathname.replace(/^\/en/, "") || "/";
    return { locale: "en", path };
  }
  return { locale: defaultLocale, path: pathname || "/" };
}

export const htmlLang: Record<Locale, string> = {
  fr: "fr-CA",
  en: "en-CA",
};

export const intlLocale: Record<Locale, string> = {
  fr: "fr-CA",
  en: "en-CA",
};
