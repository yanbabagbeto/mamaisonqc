import { headers } from "next/headers";

import { defaultLocale, isLocale, type Locale } from "./config";
import { en } from "./messages/en";
import { fr, type Dictionary } from "./messages/fr";

const dictionaries: Record<Locale, Dictionary> = { fr, en };

/**
 * Locale comes from the `x-maqc-locale` header set by `src/proxy.ts` when a request hits
 * `/en/...`. French is served at the root, so existing routes work unchanged in both locales.
 */
export async function getLocale(): Promise<Locale> {
  const headerStore = await headers();
  const headerLocale = headerStore.get("x-maqc-locale");
  if (isLocale(headerLocale)) return headerLocale;
  return defaultLocale;
}

export async function getMessages(): Promise<Dictionary> {
  return dictionaries[await getLocale()];
}

export function messagesFor(locale: Locale): Dictionary {
  return dictionaries[locale];
}
