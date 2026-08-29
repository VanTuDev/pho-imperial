"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/store/cart-store";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";
import { formatPrice } from "@/i18n/format";
import { addOrderId } from "@/lib/order-history";
import { PageHeader } from "@/components/page-header";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { DishImage } from "@/components/order/dish-image";
import { TrashIcon } from "@/components/icons";

export function CartPageClient() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const {
    lines,
    totalItems,
    totalPrice,
    table,
    orderNote,
    hydrated,
    setQuantity,
    removeLine,
    setTable,
    setOrderNote,
    clearCart,
  } = useCart();

  const [tableInput, setTableInput] = useState("");
  const [editingTable, setEditingTable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill the table field once the cart hydrates with a known table number.
  const [syncedTable, setSyncedTable] = useState<string | null>(null);
  if (table !== syncedTable) {
    setSyncedTable(table);
    if (table) setTableInput(table);
  }

  const tableValid = /^\w{1,8}$/.test((table ?? "").trim());
  const showTableField = editingTable || !table;

  function commitTable() {
    const value = tableInput.trim();
    if (/^\w{1,8}$/.test(value)) {
      setTable(value);
      setEditingTable(false);
      setError(null);
    }
  }

  async function placeOrder() {
    if (!tableValid || lines.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table,
          note: orderNote,
          items: lines.map((l) => ({
            slug: l.slug,
            variantId: l.variantId,
            quantity: l.quantity,
            note: l.note,
          })),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const order = (await res.json()) as { id: string };
      addOrderId(order.id);
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch {
      setError(t("cart.error"));
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title={t("cart.title")} backHref="/order" />

      <main className="container-imperial px-margin-mobile py-6">
        {!hydrated ? (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-surface-container-low"
              />
            ))}
          </div>
        ) : lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-6 md:grid-cols-5 md:items-start">
            {/* Items */}
            <ul className="space-y-4 md:col-span-3">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <DishImage
                      dish={line.dish}
                      locale={locale}
                      sizes="80px"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-lg leading-tight text-primary">
                          {pick(line.dish.name, locale)}
                          {line.variant && (
                            <span className="text-on-surface-variant">
                              {" · "}
                              {pick(line.variant.name, locale)}
                            </span>
                          )}
                        </p>
                        <p className="font-body text-sm text-on-surface-variant">
                          {formatPrice(line.unitPrice, locale)} · {t("cart.each")}
                        </p>
                        {line.note && (
                          <p className="mt-1 line-clamp-2 font-body text-xs text-on-surface-variant/70">
                            {t("cart.itemNotePrefix")} {line.note}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 font-display text-lg text-primary">
                        {formatPrice(line.lineTotal, locale)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(q) => setQuantity(line.id, q)}
                        min={1}
                        size="sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="flex items-center gap-1.5 font-body text-sm text-error transition-opacity hover:opacity-80"
                      >
                        <TrashIcon className="h-4 w-4" />
                        {t("cart.remove")}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Summary */}
            <section className="space-y-4 rounded-2xl border border-primary/25 bg-surface-container-low p-5 md:sticky md:top-24 md:col-span-2">
              {/* Table */}
              <div>
                {!showTableField ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 font-body text-sm font-semibold text-primary">
                      {t("cart.tableChip", { table: table! })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingTable(true)}
                      className="shrink-0 font-body text-sm text-on-surface-variant underline decoration-dotted underline-offset-4 transition-colors hover:text-primary"
                    >
                      {t("cart.changeTable")}
                    </button>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="table-number"
                      className="mb-1.5 block font-body text-xs font-bold uppercase tracking-widest text-primary"
                    >
                      {t("cart.tablePrompt")}
                    </label>
                    <input
                      id="table-number"
                      inputMode="numeric"
                      value={tableInput}
                      onChange={(e) => setTableInput(e.target.value)}
                      onBlur={commitTable}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitTable();
                        }
                      }}
                      placeholder={t("cart.tablePlaceholder")}
                      className="w-full rounded-xl border border-outline-variant/40 bg-surface-container px-4 py-3 font-body text-base text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                    />
                    {!tableValid && (
                      <p className="mt-1.5 font-body text-xs text-error">
                        {t("cart.tableRequired")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Order comment */}
              <div>
                <label
                  htmlFor="order-note"
                  className="mb-1.5 block font-body text-xs font-bold uppercase tracking-widest text-primary"
                >
                  {t("cart.noteLabel")}
                </label>
                <textarea
                  id="order-note"
                  rows={3}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder={t("cart.notePlaceholder")}
                  className="w-full resize-none rounded-xl border border-outline-variant/40 bg-surface-container px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="border-t border-outline-variant/30 pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-xl text-primary">
                    {t("cart.total")}
                  </span>
                  <span className="font-display text-2xl text-primary">
                    {formatPrice(totalPrice, locale)}
                  </span>
                </div>
                <p className="mt-0.5 text-right font-body text-xs text-on-surface-variant">
                  {totalItems === 1
                    ? t("floatingCart.itemsOne", { count: totalItems })
                    : t("floatingCart.itemsMany", { count: totalItems })}
                </p>
              </div>

              {error && (
                <p className="font-body text-sm text-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={placeOrder}
                disabled={!tableValid || submitting}
                className="w-full rounded-full bg-primary px-6 py-4 font-body text-sm font-bold uppercase tracking-wider text-on-primary shadow-lg transition-colors hover:bg-primary-fixed disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? t("cart.submitting") : t("cart.checkout")}
              </button>
            </section>
          </div>
        )}
      </main>
    </>
  );
}

function EmptyCart() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="font-display text-2xl text-primary">{t("cart.empty")}</p>
      <p className="max-w-xs font-body text-sm text-on-surface-variant">
        {t("cart.emptyHint")}
      </p>
      <Link
        href="/order"
        className="mt-2 rounded-full bg-primary px-8 py-3 font-body text-xs font-bold uppercase tracking-widest text-on-primary transition-colors hover:bg-primary-fixed"
      >
        {t("cart.browseMenu")}
      </Link>
    </div>
  );
}
