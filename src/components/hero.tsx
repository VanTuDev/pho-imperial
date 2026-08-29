"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/i18n/provider";

export function Hero() {
  const t = useTranslations();

  return (
    <section className="relative flex min-h-[560px] items-center justify-center overflow-hidden py-[18vh]">
      <Image
        src="/images/pho-bo.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />

      <div className="ornamental-border relative z-10 mx-4 flex flex-col items-center bg-surface-container-lowest/60 p-8 text-center backdrop-blur-sm">
        <h1 className="gold-shimmer mb-4 font-display text-4xl uppercase tracking-widest text-primary md:text-6xl">
          BunPho
        </h1>
        <p className="max-w-lg font-display text-xl tracking-wide text-on-surface-variant md:text-2xl">
          {t("home.heroTagline")}
        </p>
        <Link
          href="/order"
          className="mt-6 rounded-full bg-primary px-8 py-3 font-body text-xs font-bold uppercase tracking-widest text-on-primary transition-colors hover:bg-primary-fixed"
        >
          {t("home.orderCta")}
        </Link>
      </div>
    </section>
  );
}
