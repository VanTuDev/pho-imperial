import type { Metadata } from "next";
import { cookies } from "next/headers";
import { OrdersListClient } from "@/components/order/orders-list-client";
import { getDictionary } from "@/i18n/dictionaries";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "@/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  const dict = getDictionary(isLocale(value) ? value : defaultLocale);
  return { title: `${dict.orders.title} | PHỞ IMPERIAL` };
}

export default function OrdersPage() {
  return <OrdersListClient />;
}
