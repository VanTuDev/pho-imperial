"use client";

import Image from "next/image";
import { useTranslations } from "@/i18n/provider";

export function AboutSection() {
  const t = useTranslations();

  return (
    <section
      id="about"
      className="bamboo-pattern container-imperial px-margin-mobile py-section md:px-section"
    >
      <div className="flex flex-col items-center gap-gutter md:flex-row">
        <div className="w-full md:w-1/2">
          <h2 className="mb-6 font-display text-2xl tracking-wide text-primary md:text-3xl">
            {t("home.aboutTitle")}
          </h2>
          <p className="mb-4 font-body text-lg leading-relaxed text-on-surface-variant">
            {t("home.aboutBody")}
          </p>
          <button
            type="button"
            className="border border-primary px-8 py-3 font-body text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
          >
            {t("home.aboutCta")}
          </button>
        </div>
        <div className="relative h-80 w-full overflow-hidden rounded-sm border border-outline-variant/30 md:h-96 md:w-1/2">
          <Image
            src="/images/nem-ga.png"
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
