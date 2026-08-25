"use client";

import type { Category } from "@/data/menu";
import { categories } from "@/data/menu";
import { useRef, useEffect } from "react";

interface Props {
  active: Category;
  onChange: (cat: Category) => void;
}

export function CategorySelector({ active, onChange }: Props) {
  const activeRef = useRef<HTMLButtonElement>(null);

  /* scroll active chip into view on mount / change */
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active]);

  return (
    <nav className="sticky top-16 z-40 -mx-[20px] w-[calc(100%+40px)] overflow-x-auto border-b border-outline-variant/20 bg-surface/95 px-[20px] py-6 shadow-lg backdrop-blur-md hide-scrollbar">
      <ul className="flex min-w-max gap-4 px-4">
        {categories.map((cat) => {
          const isActive = cat === active;
          return (
            <li key={cat}>
              <button
                ref={isActive ? activeRef : undefined}
                onClick={() => onChange(cat)}
                className={
                  isActive
                    ? "rounded-full bg-primary px-6 py-2 font-body text-base font-bold uppercase tracking-widest text-on-primary shadow-md"
                    : "rounded-full border border-outline-variant/30 bg-surface-container-low px-6 py-2 font-body text-base uppercase tracking-widest text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                }
              >
                {cat}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
