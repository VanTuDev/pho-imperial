"use client";

import Image from "next/image";
import type { Dish } from "@/data/menu";
import { useCart } from "@/store/cart-store";
import { PlusIcon, MinusIcon } from "@/components/icons";

interface Props {
  dish: Dish;
}

export function DishCard({ dish }: Props) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.dish.slug === dish.slug);
  const qty = cartItem?.quantity ?? 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-low shadow-lg sm:flex-row">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden sm:h-auto sm:w-2/5">
        <Image
          src={dish.image}
          alt={dish.imageAlt}
          fill
          sizes="(min-width: 640px) 40vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent sm:bg-gradient-to-r" />
      </div>

      {/* Content */}
      <div className="flex w-full flex-col justify-between p-6 sm:w-3/5">
        <div>
          <div className="mb-2 flex items-start justify-between">
            <h2 className="font-display text-2xl tracking-wide text-primary">
              {dish.name}
            </h2>
            <span className="font-display text-2xl text-primary">
              {dish.priceLabel}
            </span>
          </div>
          <p className="line-clamp-3 font-body text-base text-on-surface-variant">
            {dish.description}
          </p>
        </div>

        {/* Add / Quantity controls */}
        <div className="mt-4 flex items-center justify-end gap-3">
          {qty > 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(dish.slug, qty - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/50 text-primary transition-colors hover:bg-primary/10"
                aria-label="Уменьшить количество"
              >
                <MinusIcon className="h-5 w-5" />
              </button>
              <span className="min-w-[2ch] text-center font-body text-lg font-bold text-on-surface">
                {qty}
              </span>
              <button
                onClick={() => addItem(dish)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition-colors hover:bg-primary-fixed"
                aria-label="Увеличить количество"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem(dish)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition-colors hover:bg-primary-fixed"
              aria-label="Добавить в корзину"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
