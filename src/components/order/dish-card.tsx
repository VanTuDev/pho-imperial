"use client";

import type { Dish } from "@/data/menu";
import { priceRange } from "@/data/menu";
import { useCart } from "@/store/cart-store";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";
import { formatPrice } from "@/i18n/format";
import { PlusIcon } from "@/components/icons";
import { DishImage } from "./dish-image";

interface Props {
  dish: Dish;
  onSelect: (dish: Dish) => void;
}

export function DishCard({ dish, onSelect }: Props) {
  const { locale, t } = useI18n();
  const { lines } = useCart();

  const inCart = lines
    .filter((l) => l.slug === dish.slug)
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
        className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-low text-left shadow-lg transition-colors hover:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-row"
      >
        {/* Image */}
        <div className="relative h-44 w-full shrink-0 overflow-hidden sm:h-auto sm:min-h-[11rem] sm:w-2/5">
          <DishImage
            dish={dish}
            locale={locale}
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 100vw"
            className="transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="flex w-full flex-1 flex-col justify-between gap-4 p-5">
          <div>
            <h2 className="font-display text-xl tracking-wide text-primary sm:text-2xl">
              {pick(dish.name, locale)}
            </h2>
            <p className="mt-1 line-clamp-3 font-body text-sm text-on-surface-variant sm:text-base">
              {pick(dish.description, locale)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-display text-xl text-primary sm:text-2xl">
              {priceText}
            </span>
            <span
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition-colors group-hover:bg-primary-fixed"
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
