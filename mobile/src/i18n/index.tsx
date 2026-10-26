import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { ApiErrorCode } from "../api/client";

import { en } from "./en";
import { fr, type Dictionary } from "./fr";

/**
 * Tiny i18n layer: two full dictionaries, a device-locale default, and a persisted manual choice.
 *
 * - Device language comes from `expo-localization` (`getLocales()[0].languageCode`).
 * - The manual choice is stored in AsyncStorage; it wins over the device locale.
 * - `t` is a `Dictionary`, not a key lookup: components get autocomplete and `tsc` catches a typo.
 * - Strings with placeholders are rendered with `format(template, values)`.
 */

export const LANGUAGES = ["fr", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

const STORAGE_KEY = "mamaisonqc.language";

const dictionaries: Record<Language, Dictionary> = { fr, en };

export function isLanguage(value: unknown): value is Language {
  return value === "fr" || value === "en";
}

/** Device primary language, falling back to French (the product's primary market). */
export function detectDeviceLanguage(): Language {
  try {
    const locales = getLocales();
    const first = locales[0];
    if (first && isLanguage(first.languageCode)) return first.languageCode;
  } catch {
    // A missing native module must never break startup: fall back to French.
  }
  return "fr";
}

/** Replace `{name}` placeholders; unknown placeholders are left untouched (visible in QA). */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}

export type I18nContextValue = {
  lang: Language;
  t: Dictionary;
  /** Persists the choice and re-renders. Resolves once AsyncStorage has written. */
  setLang: (lang: Language) => Promise<void>;
  /** True until the persisted preference has been read. */
  ready: boolean;
  /** Localized message for an API error code. */
  errorMessage: (code: ApiErrorCode) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => detectDeviceLanguage());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && isLanguage(stored)) setLangState(stored);
      })
      .catch(() => {
        // Storage unavailable (e.g. web private mode): keep the device default.
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const setLang = useCallback(async (next: Language) => {
    setLangState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The UI already switched; persistence can fail silently without breaking the session.
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = dictionaries[lang];
    return {
      lang,
      t: dictionary,
      setLang,
      ready,
      errorMessage: (code: ApiErrorCode) => dictionary.errors[code] ?? dictionary.errors.UNKNOWN,
    };
  }, [lang, setLang, ready]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return context;
}

export type { Dictionary };
