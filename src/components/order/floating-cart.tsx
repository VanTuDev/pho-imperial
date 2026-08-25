"use client";

import { useCart } from "@/store/cart-store";
import { ArrowForwardIcon } from "@/components/icons";

export function FloatingCart() {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  /* Format price with locale-aware thousands separator */
  const formattedPrice = totalPrice.toLocaleString("ru-RU") + " ₽";

  return (
    <div className="pointer-events-none fixed bottom-24 left-0 z-40 w-full px-4 md:hidden">
      <div className="pointer-events-auto flex animate-[slideUp_0.3s_ease-out] items-center justify-between rounded-xl border border-primary/30 bg-surface-container-high/95 p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col">
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
            Ваш заказ
          </span>
          <span className="mt-1 font-display text-xl text-primary">
            {formattedPrice}
          </span>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-body text-xs font-bold uppercase tracking-wider text-on-primary transition-colors hover:bg-primary-fixed">
          Оформить
          <ArrowForwardIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
