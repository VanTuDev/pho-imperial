"use client";

import { MinusIcon, PlusIcon } from "@/components/icons";
import { useTranslations } from "@/i18n/provider";

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

/** Rounded − N + control used on dish cards, the detail sheet and the cart. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  className = "",
}: Props) {
  const t = useTranslations();
  const dimension = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const text = size === "sm" ? "text-base" : "text-lg";

  return (
    <div
      className={`flex items-center gap-1 rounded-full border border-primary/30 bg-surface-container-low p-1 ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={t("menu.decrease")}
        className={`flex ${dimension} items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:opacity-30`}
      >
        <MinusIcon className="h-5 w-5" />
      </button>
      <span
        className={`min-w-[2ch] text-center font-body font-bold text-on-surface tabular-nums ${text}`}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={t("menu.increase")}
        className={`flex ${dimension} items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition-colors hover:bg-primary-fixed disabled:opacity-30`}
      >
        <PlusIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
