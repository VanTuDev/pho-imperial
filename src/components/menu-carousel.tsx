"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type TouchEvent } from "react";
import { menuPages } from "@/data/menu-pages";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

const SWIPE_THRESHOLD = 40;

export function MenuCarousel() {
  const { locale, t } = useI18n();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const total = menuPages.length;
  const current = menuPages[index];

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD) goTo(index - 1);
    else if (delta < -SWIPE_THRESHOLD) goTo(index + 1);
    touchStartX.current = null;
  };

  return (
    <section
      id="menu"
      className="bg-surface-container-lowest px-margin-mobile py-section md:px-section"
    >
      <div className="container-imperial">
        <h2 className="mb-3 text-center font-display text-3xl uppercase tracking-widest text-primary md:text-5xl">
          {t("home.menuTitle")}
        </h2>
        <p className="mb-10 text-center font-body text-sm uppercase tracking-widest text-on-surface-variant md:mb-14">
          {t("home.menuPageStatus", {
            section: pick(current.section, locale),
            page: index + 1,
            total,
          })}
        </p>

        <div className="relative mx-auto flex max-w-md items-center gap-2 sm:max-w-lg md:max-w-xl">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label={t("home.menuPrev")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary transition-colors hover:bg-primary/10 sm:h-12 sm:w-12"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <div
            className="ornamental-border relative aspect-707/1000 flex-1 overflow-hidden bg-surface-container-lowest"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              key={current.src}
              src={current.src}
              alt={t("home.menuGoTo", {
                page: index + 1,
                section: pick(current.section, locale),
              })}
              fill
              sizes="(min-width: 768px) 576px, 90vw"
              className="object-contain"
              priority={index === 0}
            />
          </div>

          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label={t("home.menuNext")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary transition-colors hover:bg-primary/10 sm:h-12 sm:w-12"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="hide-scrollbar mx-auto mt-6 flex max-w-xl justify-start gap-2 overflow-x-auto px-1 sm:justify-center md:mt-8">
          {menuPages.map((page, i) => (
            <button
              key={page.page}
              type="button"
              onClick={() => goTo(i)}
              aria-label={t("home.menuGoTo", {
                page: i + 1,
                section: pick(page.section, locale),
              })}
              aria-current={i === index}
              className={
                i === index
                  ? "relative h-14 w-10 shrink-0 overflow-hidden rounded-sm border-2 border-primary sm:h-16 sm:w-12"
                  : "relative h-14 w-10 shrink-0 overflow-hidden rounded-sm border border-outline-variant/40 opacity-60 transition-opacity hover:opacity-100 sm:h-16 sm:w-12"
              }
            >
              <Image src={page.src} alt="" fill sizes="48px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
