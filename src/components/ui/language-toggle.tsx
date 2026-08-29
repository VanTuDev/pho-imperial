"use client";

import { locales, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

const labels: Record<Locale, string> = { ru: "RU", en: "EN", vi: "VI" };
const full: Record<Locale, string> = { ru: "Русский", en: "English", vi: "Tiếng Việt" };

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={`flex items-center rounded-full border border-outline-variant/40 bg-surface-container-low p-0.5 ${className}`}
      role="group"
      aria-label={t("language.label")}
    >
      {locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            title={t("language.switchTo", { language: full[code] })}
            className={
              active
                ? "rounded-full bg-primary px-3 py-1 font-body text-xs font-bold tracking-widest text-on-primary"
                : "rounded-full px-3 py-1 font-body text-xs font-semibold tracking-widest text-on-surface-variant transition-colors hover:text-primary"
            }
          >
            {labels[code]}
          </button>
        );
      })}
    </div>
  );
}
