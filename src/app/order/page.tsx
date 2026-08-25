import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { BottomNav } from "@/components/bottom-nav";
import { OrderPageClient } from "@/components/order/order-page-client";

export const metadata: Metadata = {
  title: "Меню | PHỞ IMPERIAL",
  description:
    "Полное меню ресторана PHỞ IMPERIAL. Выберите блюда и оформите заказ онлайн.",
};

export default function OrderPage() {
  return (
    <div className="relative min-h-screen bg-background pb-32">
      {/* Decorative background overlay */}
      <div className="pointer-events-none fixed inset-0 z-[-1] opacity-5">
        <div className="bamboo-pattern absolute inset-0 opacity-20 mix-blend-screen" />
      </div>

      <SiteHeader />

      <main className="container-imperial w-full flex-grow px-[20px] pt-24">
        <OrderPageClient />
      </main>

      <BottomNav />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}
