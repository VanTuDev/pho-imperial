import { intlLocale, type Locale } from "./config";

/**
 * Format a rouble amount the way the menu shows it: a grouped integer plus the
 * ₽ suffix (`1 590 ₽`). Prices in this app are always whole roubles.
 */
export function formatPrice(amount: number, locale: Locale): string {
  const number = new Intl.NumberFormat(intlLocale[locale], {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${number} ₽`;
}
