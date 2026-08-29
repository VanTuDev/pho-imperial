import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { BottomNav } from "@/components/bottom-nav";
import { OrderPageClient } from "@/components/order/order-page-client";
import { getDictionary } from "@/i18n/dictionaries";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "@/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  const dict = getDictionary(isLocale(value) ? value : defaultLocale);
  return {
    title: `${dict.menu.title} | BunPho`,
    description: dict.menu.subtitle,
  };
}

export default async function OrderPage({ searchParams }: PageProps<"/order">) {
  const params = await searchParams;
  const rawTable = params.table;
  const initialTable = typeof rawTable === "string" ? rawTable : null;

  return (
    <div className="relative min-h-screen bg-background pb-32">
      <div className="pointer-events-none fixed inset-0 z-[-1] opacity-5">
        <div className="bamboo-pattern absolute inset-0 opacity-20 mix-blend-screen" />
      </div>

      <SiteHeader />

      <main className="container-imperial w-full px-margin-mobile pt-20">
        <OrderPageClient initialTable={initialTable} />
      </main>

      <BottomNav />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}
