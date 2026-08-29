"use client";

import Link from "next/link";
import { useCart } from "@/store/cart-store";
import { useI18n } from "@/i18n/provider";
import { formatPrice } from "@/i18n/format";
import { ArrowForwardIcon } from "@/components/icons";

/**
 * The amber "view order" bar that slides up over the menu once the cart has
 * something in it. Sits above the bottom nav on mobile; anchors bottom-right
 * on tablet and up.
 */
export function FloatingCart() {
  const { totalItems, totalPrice } = useCart();
  const { locale, t } = useI18n();

  if (totalItems === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 px-4 md:bottom-6 md:left-auto md:right-6 md:px-0">
      <Link
        href="/cart"
        className="pointer-events-auto mx-auto flex max-w-lg animate-[slideUp_0.3s_ease-out] items-center justify-between gap-4 rounded-full bg-primary px-5 py-3.5 text-on-primary shadow-2xl transition-transform hover:scale-[1.01] md:mx-0 md:w-auto"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-on-primary/15 px-2 font-body text-sm font-bold tabular-nums">
            {totalItems}
          </span>
          <span className="whitespace-nowrap font-body text-sm font-bold uppercase tracking-wider">
            {t("floatingCart.view")}
          </span>
        </span>
        <span className="flex items-center gap-2 whitespace-nowrap font-display text-lg">
          {formatPrice(totalPrice, locale)}
          <ArrowForwardIcon className="h-4 w-4" />
        </span>
      </Link>
    </div>
  );
}
