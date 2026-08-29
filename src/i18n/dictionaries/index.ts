import type { Locale } from "../config";
import customerEn from "./en";
import customerRu from "./ru";
import customerVi from "./vi";
import adminEn from "./admin/en";
import adminRu from "./admin/ru";
import adminVi from "./admin/vi";

const en = { ...customerEn, admin: adminEn };
const ru = { ...customerRu, admin: adminRu };
const vi = { ...customerVi, admin: adminVi };

export type Dictionary = typeof en;

export const dictionaries: Record<Locale, Dictionary> = { ru, en, vi };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}
