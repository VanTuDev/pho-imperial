import type { Metadata } from "next";
import { cookies } from "next/headers";
import { CartPageClient } from "@/components/cart/cart-page-client";
import { getDictionary } from "@/i18n/dictionaries";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "@/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  const dict = getDictionary(isLocale(value) ? value : defaultLocale);
  return { title: `${dict.cart.title} | PHỞ IMPERIAL` };
}

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background pb-[max(2rem,env(safe-area-inset-bottom))]">
      <CartPageClient />
    </div>
  );
}
