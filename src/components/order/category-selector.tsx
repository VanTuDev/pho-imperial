"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";
import type { Category } from "@/lib/types";

interface Props {
  categories: Category[];
  active: string;
  onChange: (id: string) => void;
}

export function CategorySelector({ categories, active, onChange }: Props) {
  const { locale } = useI18n();
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active]);

  const hasImages = categories.some((c) => c.image);

  return (
    <nav className="sticky top-16 z-40 -mx-margin-mobile overflow-x-auto border-b border-outline-variant/20 bg-surface/95 px-margin-mobile py-4 shadow-lg backdrop-blur-md hide-scrollbar">
      <ul className="mx-auto flex min-w-max gap-3 md:justify-center">
        {categories.map((category) => {
          const isActive = category.id === active;
          return (
            <li key={category.id}>
              <button
                ref={isActive ? activeRef : undefined}
                type="button"
                onClick={() => onChange(category.id)}
                aria-pressed={isActive}
                className={`flex items-center gap-2 rounded-full py-1.5 pr-5 font-body text-sm uppercase tracking-widest transition-colors ${
                  hasImages ? "pl-1.5" : "pl-5"
                } ${
                  isActive
                    ? "bg-primary font-bold text-on-primary shadow-md"
                    : "border border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-primary hover:text-primary"
                }`}
              >
                {hasImages && (
                  <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background/20 font-display text-xs">
                    {category.image ? (
                      <Image src={category.image} alt="" fill sizes="28px" className="object-cover" />
                    ) : (
                      pick(category.name, locale).charAt(0)
                    )}
                  </span>
                )}
                {pick(category.name, locale)}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
