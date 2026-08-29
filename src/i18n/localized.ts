import { defaultLocale, type Locale } from "./config";

/** A string that exists in every supported locale. */
export type Localized = Record<Locale, string>;

export function pick(value: Localized, locale: Locale): string {
  return value[locale] ?? value[defaultLocale];
}
