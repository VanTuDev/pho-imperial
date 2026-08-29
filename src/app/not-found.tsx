import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/dictionaries";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "@/i18n/config";

export default async function NotFound() {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  const dict = getDictionary(isLocale(value) ? value : defaultLocale);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <p className="font-display text-3xl uppercase tracking-widest text-primary">BunPho</p>
      <div className="max-w-md space-y-3">
        <h1 className="font-display text-2xl text-on-surface">{dict.notFound.title}</h1>
        <p className="font-body text-sm text-on-surface-variant">{dict.notFound.body}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/order"
          className="rounded-full bg-primary px-8 py-3 font-body text-xs font-bold uppercase tracking-widest text-on-primary transition-colors hover:bg-primary-fixed"
        >
          {dict.notFound.menu}
        </Link>
        <Link
          href="/"
          className="rounded-full border border-primary/40 px-8 py-3 font-body text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
        >
          {dict.notFound.home}
        </Link>
      </div>
    </div>
  );
}
