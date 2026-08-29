"use client";

import { useEffect, useMemo, useState } from "react";
import { allDishes, categories, type CategoryId, type Dish } from "@/data/menu";
import { useCart } from "@/store/cart-store";
import { useI18n } from "@/i18n/provider";
import { CategorySelector } from "./category-selector";
import { DishCard } from "./dish-card";
import { DishSheet } from "./dish-sheet";
import { FloatingCart } from "./floating-cart";

const FIRST_CATEGORY: CategoryId = categories[0].id;

export function OrderPageClient({ initialTable }: { initialTable: string | null }) {
  const { t } = useI18n();
  const { setTable } = useCart();
  const [activeCategory, setActiveCategory] = useState<CategoryId>(FIRST_CATEGORY);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  // Capture the table number from the QR link (`/order?table=12`).
  useEffect(() => {
    if (initialTable && /^\w{1,8}$/.test(initialTable)) {
      setTable(initialTable);
    }
  }, [initialTable, setTable]);

  const filtered = useMemo(
    () => allDishes.filter((d) => d.category === activeCategory),
    [activeCategory],
  );

  return (
    <>
      <CategorySelector active={activeCategory} onChange={setActiveCategory} />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 pb-10 pt-6 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {filtered.map((dish) => (
            <DishCard key={dish.slug} dish={dish} onSelect={setSelectedDish} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="font-display text-2xl text-on-surface-variant/60">
            {t("menu.comingSoon")}
          </p>
          <p className="mt-2 font-body text-sm text-on-surface-variant/40">
            {t("menu.comingSoonHint")}
          </p>
        </div>
      )}

      <DishSheet dish={selectedDish} onClose={() => setSelectedDish(null)} />
      <FloatingCart />
    </>
  );
}
