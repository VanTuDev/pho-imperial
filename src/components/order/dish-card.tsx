"use client";

import type { MenuItem } from "@/lib/types";
import { priceRange } from "@/lib/menu-utils";
import { useCart } from "@/store/cart-store";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";
import { formatPrice } from "@/i18n/format";
import { PlusIcon } from "@/components/icons";
import { DishImage } from "./dish-image";

interface Props {
  dish: MenuItem;
  onSelect: (dish: MenuItem) => void;
}

export function DishCard({ dish, onSelect }: Props) {
  const { locale, t } = useI18n();
  const { lines } = useCart();

  const inCart = lines
    .filter((l) => l.menuItemId === dish.id)
    .reduce((sum, l) => sum + l.quantity, 0);

  const { min, max } = priceRange(dish);
  const priceText =
    min === max
      ? formatPrice(min, locale)
      : t("menu.fromPrice", { price: formatPrice(min, locale) });

  return (
    <article className="group h-full">
      <button
        type="button"
        onClick={() => onSelect(dish)}
        aria-label={t("menu.addToCart", { dish: pick(dish.name, locale) })}
        className="flex h-full w-full items-stretch overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-low text-left shadow-lg transition-colors hover:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {/* Image — square-ish on the left, fills the card height */}
        <div className="relative w-32 min-h-28 shrink-0 self-stretch overflow-hidden sm:w-44 lg:w-52">
          <DishImage
            dish={dish}
            locale={locale}
            sizes="(min-width: 1024px) 13rem, (min-width: 640px) 11rem, 8rem"
            className="transition-transform duration-700 group-hover:scale-105"
          />
          {!dish.available && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/70 font-body text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {t("menu.unavailable")}
            </span>
          )}
        </div>

        {/* Content — name, description, price */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:gap-3 sm:p-5">
          <div className="min-w-0">
            <h2 className="font-display text-lg leading-tight tracking-wide text-primary sm:text-xl lg:text-2xl">
              {pick(dish.name, locale)}
            </h2>
            <p className="mt-1 line-clamp-2 font-body text-sm text-on-surface-variant sm:line-clamp-3">
              {pick(dish.description, locale)}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <span className="font-display text-lg text-primary sm:text-xl lg:text-2xl">
              {priceText}
            </span>
            <span
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition-colors group-hover:bg-primary-fixed sm:h-10 sm:w-10"
              aria-hidden="true"
            >
              <PlusIcon className="h-5 w-5" />
              {inCart > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-tertiary px-1 font-body text-[11px] font-bold text-on-tertiary">
                  {inCart}
                </span>
              )}
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
