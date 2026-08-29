"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/provider";
import { ChevronLeftIcon } from "./icons";

interface Props {
  title: string;
  /** Where the back button goes; falls back to browser history. */
  backHref?: string;
}

export function PageHeader({ title, backHref }: Props) {
  const router = useRouter();
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-40 grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 border-b border-outline-variant/20 bg-background/90 px-margin-mobile py-3 backdrop-blur-md">
      <button
        type="button"
        onClick={() => (backHref ? router.push(backHref) : router.back())}
        aria-label={t("common.back")}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/40 text-primary transition-colors hover:bg-primary/10"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <h1 className="text-center font-display text-xl tracking-wide text-primary">
        {title}
      </h1>
      <span aria-hidden="true" />
    </header>
  );
}
