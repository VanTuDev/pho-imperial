"use client";

import { useEffect, useRef } from "react";
import { categories, type CategoryId } from "@/data/menu";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";

interface Props {
  active: CategoryId;
  onChange: (id: CategoryId) => void;
}

export function CategorySelector({ active, onChange }: Props) {
  const { locale } = useI18n();
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active]);

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
                className={
                  isActive
                    ? "rounded-full bg-primary px-5 py-2 font-body text-sm font-bold uppercase tracking-widest text-on-primary shadow-md"
                    : "rounded-full border border-outline-variant/30 bg-surface-container-low px-5 py-2 font-body text-sm uppercase tracking-widest text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                }
              >
                {pick(category.label, locale)}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
