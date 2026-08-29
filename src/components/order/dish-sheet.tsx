"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { MenuItem } from "@/lib/types";
import { defaultVariant, unitPrice } from "@/lib/menu-utils";
import { useCart } from "@/store/cart-store";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";
import { formatPrice } from "@/i18n/format";
import { CloseIcon } from "@/components/icons";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { DishImage } from "./dish-image";

interface Props {
  dish: MenuItem | null;
  onClose: () => void;
}

export function DishSheet({ dish, onClose }: Props) {
  return dish ? <DishSheetInner key={dish.id} dish={dish} onClose={onClose} /> : null;
}

function DishSheetInner({ dish, onClose }: { dish: MenuItem; onClose: () => void }) {
  const { locale, t } = useI18n();
  const { addLine } = useCart();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  const [variantId, setVariantId] = useState<string | null>(
    defaultVariant(dish)?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  // Lock body scroll, focus the close button, close on Escape.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const price = unitPrice(dish, variantId) * quantity;

  function handleAdd() {
    if (!dish.available) return;
    addLine({ menuItemId: dish.id, variantId, quantity, note: note.trim() });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label={t("common.close")}
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-outline-variant/40 bg-surface-container-low shadow-2xl animate-[slideUp_0.28s_ease-out] sm:max-h-[88vh] sm:max-w-lg sm:rounded-3xl">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-background/70 text-primary backdrop-blur transition-colors hover:bg-primary/10"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <div className="overflow-y-auto overscroll-contain">
          {/* Image */}
          <div className="relative h-56 w-full sm:h-64">
            <DishImage
              dish={dish}
              locale={locale}
              sizes="(min-width: 640px) 512px, 100vw"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-container-low to-transparent" />
          </div>

          <div className="px-5 pb-4 pt-3 sm:px-7">
            {/* Grab handle (mobile) */}
            <div
              className="mx-auto mb-4 h-1 w-10 rounded-full bg-outline-variant sm:hidden"
              aria-hidden="true"
            />

            <h2
              id={titleId}
              className="font-display text-2xl tracking-wide text-primary"
            >
              {pick(dish.name, locale)}
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-on-surface-variant">
              {pick(dish.description, locale)}
            </p>

            {/* Variants */}
            {dish.variants && dish.variants.length > 0 && (
              <fieldset className="mt-6">
                <legend className="mb-3 font-body text-xs font-bold uppercase tracking-widest text-primary">
                  {t("dish.chooseVariant")}
                </legend>
                <div className="flex flex-col gap-2">
                  {dish.variants.map((variant) => {
                    const selected = variant.id === variantId;
                    return (
                      <label
                        key={variant.id}
                        className={
                          selected
                            ? "flex cursor-pointer items-center justify-between rounded-xl border border-primary bg-primary/10 px-4 py-3"
                            : "flex cursor-pointer items-center justify-between rounded-xl border border-outline-variant/40 px-4 py-3 transition-colors hover:border-primary/50"
                        }
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={
                              selected
                                ? "flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary"
                                : "flex h-5 w-5 items-center justify-center rounded-full border-2 border-outline-variant"
                            }
                            aria-hidden="true"
                          >
                            {selected && (
                              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                            )}
                          </span>
                          <input
                            type="radio"
                            name="variant"
                            value={variant.id}
                            checked={selected}
                            onChange={() => setVariantId(variant.id)}
                            className="sr-only"
                          />
                          <span className="font-body text-base text-on-surface">
                            {pick(variant.name, locale)}
                          </span>
                        </span>
                        <span className="font-display text-lg text-primary">
                          {formatPrice(variant.price, locale)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* Comment */}
            <div className="mt-6">
              <label
                htmlFor="dish-note"
                className="mb-2 block font-body text-xs font-bold uppercase tracking-widest text-primary"
              >
                {t("dish.commentLabel")}{" "}
                <span className="font-normal text-on-surface-variant">
                  ({t("common.optional")})
                </span>
              </label>
              <textarea
                id="dish-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder={t("dish.commentPlaceholder")}
                className="w-full resize-none rounded-xl border border-outline-variant/40 bg-surface-container px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sticky action bar */}
        <div className="flex items-center gap-3 border-t border-outline-variant/30 bg-surface-container-low p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!dish.available}
            className="flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-4 font-body text-sm font-bold uppercase tracking-wider text-on-primary shadow-lg transition-colors hover:bg-primary-fixed disabled:cursor-not-allowed disabled:opacity-50"
          >
            {dish.available
              ? t("dish.addWithPrice", { price: formatPrice(price, locale) })
              : t("menu.unavailable")}
          </button>
        </div>
      </div>
    </div>
  );
}
