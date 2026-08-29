"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getMenu } from "@/lib/api";
import { priceRange } from "@/lib/menu-utils";
import type { MenuItem } from "@/lib/types";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";
import { formatPrice } from "@/i18n/format";

const FALLBACK_IMAGE = "/images/pho-bo.png";

export function FeaturedDishes() {
  const { locale, t } = useI18n();
  const [dishes, setDishes] = useState<MenuItem[] | null>(null);

  useEffect(() => {
    let active = true;
    getMenu({ featured: true })
      .then((items) => active && setDishes(items.slice(0, 6)))
      .catch(() => active && setDishes([]));
    return () => {
      active = false;
    };
  }, []);

  if (!dishes || dishes.length === 0) return null;

  return (
    <section className="bamboo-pattern relative px-margin-mobile py-section md:px-section">
      <div className="container-imperial">
        <div className="mb-12 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-primary/50 md:w-24" />
          <h3 className="text-center font-display text-2xl uppercase tracking-widest text-primary">
            {t("home.featuredTitle")}
          </h3>
          <div className="h-px w-16 bg-primary/50 md:w-24" />
        </div>

        <div className="grid grid-cols-1 gap-x-gutter gap-y-10 md:grid-cols-2 xl:grid-cols-3">
          {dishes.map((dish) => {
            const { min } = priceRange(dish);
            return (
              <div key={dish.id} className="flex items-start gap-5">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-sm border border-primary/50 shadow-[0_0_15px_rgba(242,202,80,0.15)]">
                  <Image
                    src={dish.image ?? FALLBACK_IMAGE}
                    alt={dish.imageAlt ? pick(dish.imageAlt, locale) : ""}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-primary/20" />
                </div>
                <div className="flex-1">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <h4 className="font-display text-xl text-primary">
                      {pick(dish.name, locale)}
                    </h4>
                    <span className="whitespace-nowrap font-display text-xl text-primary">
                      {formatPrice(min, locale)}
                    </span>
                  </div>
                  <p className="line-clamp-4 border-b border-outline-variant/30 pb-4 font-body text-sm text-on-surface-variant">
                    {pick(dish.description, locale)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
