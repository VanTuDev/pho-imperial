"use client";

import { useState } from "react";
import { allDishes, type Category } from "@/data/menu";
import { CategorySelector } from "./category-selector";
import { DishCard } from "./dish-card";
import { FloatingCart } from "./floating-cart";

export function OrderPageClient() {
  const [activeCategory, setActiveCategory] = useState<Category>("Phở");

  const filtered = allDishes.filter((d) => d.category === activeCategory);

  return (
    <>
      {/* Category Selector */}
      <CategorySelector active={activeCategory} onChange={setActiveCategory} />

      {/* Menu List */}
      <div className="flex w-full flex-col gap-6 pb-10 pt-8">
        {filtered.length > 0 ? (
          filtered.map((dish) => <DishCard key={dish.slug} dish={dish} />)
        ) : (
          <div className="py-20 text-center">
            <p className="font-display text-2xl text-on-surface-variant/60">
              Скоро появится…
            </p>
            <p className="mt-2 font-body text-sm text-on-surface-variant/40">
              Мы готовим для вас новые блюда в этой категории
            </p>
          </div>
        )}
      </div>

      {/* Floating Cart (mobile) */}
      <FloatingCart />
    </>
  );
}
