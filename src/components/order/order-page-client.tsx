"use client";

import { useEffect, useMemo, useState } from "react";
import { getCategories, resolveTable } from "@/lib/api";
import type { Category, MenuItem, TableInfo } from "@/lib/types";
import { useCart } from "@/store/cart-store";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";
import { CategorySelector } from "./category-selector";
import { DishCard } from "./dish-card";
import { DishSheet } from "./dish-sheet";
import { FloatingCart } from "./floating-cart";

const TABLE_CODE_RE = /^[\w-]{1,40}$/;

export function OrderPageClient({ initialTable }: { initialTable: string | null }) {
  const { t, locale } = useI18n();
  const { setTable, menu, menuLoaded, menuError, reloadMenu } = useCart();

  const [categories, setCategories] = useState<Category[] | null>(null);
  const [catError, setCatError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [tableState, setTableState] = useState<
    { status: "none" } | { status: "ok"; table: TableInfo } | { status: "unknown" }
  >({ status: "none" });

  // Load categories.
  useEffect(() => {
    let active = true;
    getCategories()
      .then((list) => {
        if (!active) return;
        setCategories(list);
        setCatError(false);
        setActiveCategory((prev) => prev ?? list[0]?.id ?? null);
      })
      .catch(() => active && setCatError(true));
    return () => {
      active = false;
    };
  }, []);

  // Resolve the table from the QR link (`/order?table=<code>`).
  useEffect(() => {
    const code = initialTable?.trim().toLowerCase();
    if (!code || !TABLE_CODE_RE.test(code)) return;
    let active = true;
    resolveTable(code)
      .then((table) => {
        if (!active) return;
        if (table) {
          setTable(table.code, { label: table.label, type: table.type });
          setTableState({ status: "ok", table });
        } else {
          setTableState({ status: "unknown" });
        }
      })
      .catch(() => {
        // Network hiccup — trust the code so ordering still works.
        if (active) setTable(code, { label: code });
      });
    return () => {
      active = false;
    };
  }, [initialTable, setTable]);

  const dishes = useMemo(
    () => (activeCategory ? menu.filter((d) => d.categoryId === activeCategory) : []),
    [menu, activeCategory],
  );

  const loading = !menuLoaded || categories === null;
  const failed = (menuError || catError) && !loading;

  return (
    <>
      {tableState.status === "ok" && (
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 font-body text-sm font-semibold text-primary">
            {t("table.chip", { label: tableState.table.label })}
          </span>
          {tableState.table.type === "vip" && (
            <span className="inline-flex items-center rounded-full bg-tertiary px-3 py-1 font-body text-[11px] font-bold uppercase tracking-widest text-on-tertiary">
              {t("table.vip")}
            </span>
          )}
        </div>
      )}
      {tableState.status === "unknown" && (
        <p className="mb-3 rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface-variant">
          {t("table.unknown")}
        </p>
      )}

      {failed ? (
        <div className="py-20 text-center">
          <p className="font-display text-2xl text-primary">{t("menu.error")}</p>
          <button
            type="button"
            onClick={() => {
              reloadMenu();
              setCategories(null);
              getCategories()
                .then((list) => {
                  setCategories(list);
                  setActiveCategory((prev) => prev ?? list[0]?.id ?? null);
                  setCatError(false);
                })
                .catch(() => setCatError(true));
            }}
            className="mt-4 rounded-full bg-primary px-8 py-3 font-body text-xs font-bold uppercase tracking-widest text-on-primary transition-colors hover:bg-primary-fixed"
          >
            {t("common.retry")}
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-5 pb-10 pt-6 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-surface-container-low" />
          ))}
        </div>
      ) : (
        <>
          <CategorySelector
            categories={categories}
            active={activeCategory ?? ""}
            onChange={setActiveCategory}
          />

          {dishes.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 pb-10 pt-6 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {dishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} onSelect={setSelectedDish} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="font-display text-2xl text-on-surface-variant/60">
                {t("menu.comingSoon")}
              </p>
              <p className="mt-2 font-body text-sm text-on-surface-variant/40">
                {activeCategory && categories.find((c) => c.id === activeCategory)
                  ? pick(categories.find((c) => c.id === activeCategory)!.name, locale)
                  : t("menu.comingSoonHint")}
              </p>
            </div>
          )}
        </>
      )}

      <DishSheet dish={selectedDish} onClose={() => setSelectedDish(null)} />
      <FloatingCart />
    </>
  );
}
