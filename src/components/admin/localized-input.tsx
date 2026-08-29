"use client";

import { Input } from "antd";
import type { Localized } from "@/i18n/localized";
import { locales, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

interface Props {
  label?: string;
  value?: Localized;
  onChange?: (v: Localized) => void;
  multiline?: boolean;
  required?: boolean;
}

const EMPTY: Localized = { ru: "", en: "", vi: "" };

const LANG_LABEL: Record<Locale, string> = {
  ru: "Русский",
  en: "English",
  vi: "Tiếng Việt",
};

/**
 * Paired Russian + English + Vietnamese fields for one localized string.
 * Controlled: works standalone or as a custom control inside `<Form.Item>`.
 */
export function LocalizedInput({ label, value, onChange, multiline, required }: Props) {
  const { locale } = useI18n();
  const current = value ?? EMPTY;
  const Control = multiline ? Input.TextArea : Input;

  // Show the current UI language first — it's the one being filled most often.
  const ordered = [locale, ...locales.filter((l) => l !== locale)];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-primary)",
          }}
        >
          {label}
        </span>
      )}
      {ordered.map((lang, i) => (
        <Control
          key={lang}
          rows={multiline ? 3 : undefined}
          placeholder={LANG_LABEL[lang]}
          status={required && i === 0 && !current[lang] ? "warning" : undefined}
          value={current[lang]}
          onChange={(e) => onChange?.({ ...current, [lang]: e.target.value })}
        />
      ))}
    </div>
  );
}
