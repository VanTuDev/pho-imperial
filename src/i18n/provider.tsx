"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { defaultLocale, LOCALE_COOKIE, type Locale } from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

/** Dot-separated paths to every string leaf in the dictionary. */
type Leaves<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : `${K}.${Leaves<T[K]>}`;
}[keyof T & string];

export type MessageKey = Leaves<Dictionary>;

type Params = Record<string, string | number>;

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
  t: (key: MessageKey, params?: Params) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolve(dict: Dictionary, key: string): string | undefined {
  const value = key
    .split(".")
    .reduce<unknown>((acc, part) => (acc == null ? acc : (acc as Record<string, unknown>)[part]), dict);
  return typeof value === "string" ? value : undefined;
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [syncedLocale, setSyncedLocale] = useState<Locale>(initialLocale);

  // If the server re-renders with a different locale (e.g. after a refresh),
  // adopt it during render — no effect needed.
  if (initialLocale !== syncedLocale) {
    setSyncedLocale(initialLocale);
    setLocaleState(initialLocale);
  }

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
      document.documentElement.lang = next;
      setLocaleState(next);
      router.refresh();
    },
    [router],
  );

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale] ?? dictionaries[defaultLocale];
    return {
      locale,
      dict,
      setLocale,
      t: (key, params) => {
        const template =
          resolve(dict, key) ?? resolve(dictionaries[defaultLocale], key) ?? key;
        return interpolate(template, params);
      },
    };
  }, [locale, setLocale]);

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}

/** Shorthand for components that only need the translate function. */
export function useTranslations(): I18nContextValue["t"] {
  return useI18n().t;
}
