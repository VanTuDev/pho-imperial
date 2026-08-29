"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";
import { formatPrice } from "@/i18n/format";
import { getOrder } from "@/lib/api";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { CheckIcon } from "@/components/icons";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-primary text-on-primary",
  confirmed: "bg-secondary text-on-secondary",
  preparing: "bg-secondary text-on-secondary",
  ready: "bg-tertiary text-on-tertiary",
  served: "bg-surface-container-high text-on-surface-variant",
  cancelled: "bg-error-container text-on-error",
};

const STATUS_STEPS: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "served"];

export function OrderStatusClient({ id }: { id: string }) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  const fetchOrder = useCallback(async () => {
    try {
      const result = await getOrder(id);
      if (!result) {
        setState("missing");
        return;
      }
      setOrder(result);
      setState("ready");
    } catch {
      /* keep last known state; the poll will retry */
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (state !== "ready") return;
    if (order?.status === "served" || order?.status === "cancelled") return;
    const timer = setInterval(fetchOrder, 5000);
    return () => clearInterval(timer);
  }, [state, order?.status, fetchOrder]);

  function itemLabel(item: OrderItem): string {
    const base = pick(item.name, locale);
    if (!item.variantName) return base;
    return `${base} · ${pick(item.variantName, locale)}`;
  }

  return (
    <>
      <PageHeader title={t("order.title")} backHref="/order" />

      <main className="container-imperial px-margin-mobile py-8">
        <div className="mx-auto max-w-lg">
          {state === "loading" && (
            <p className="py-20 text-center font-body text-on-surface-variant">
              {t("order.loading")}
            </p>
          )}

          {state === "missing" && (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <p className="font-display text-2xl text-primary">{t("order.notFound")}</p>
              <p className="max-w-xs font-body text-sm text-on-surface-variant">
                {t("order.notFoundHint")}
              </p>
              <button
                type="button"
                onClick={() => router.push("/order")}
                className="mt-2 rounded-full bg-primary px-8 py-3 font-body text-xs font-bold uppercase tracking-widest text-on-primary transition-colors hover:bg-primary-fixed"
              >
                {t("order.orderMore")}
              </button>
            </div>
          )}

          {state === "ready" && order && (
            <div className="ornamental-border bg-surface-container-low p-6 sm:p-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_0_28px_rgba(242,202,80,0.4)]">
                  <CheckIcon className="h-8 w-8" />
                </span>
                <h2 className="font-display text-2xl text-primary">
                  {t("order.acceptedTitle")}
                </h2>
                <p className="font-body text-sm text-on-surface-variant">
                  {t("order.acceptedSubtitle")}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <span
                  className={`rounded-full px-4 py-1 font-body text-xs font-bold uppercase tracking-widest ${STATUS_STYLES[order.status]}`}
                >
                  {t(`order.statusLabel.${order.status}`)}
                </span>
                <span className="font-body text-sm text-on-surface-variant">
                  {t("order.table", { table: order.table.label })} ·{" "}
                  {t("order.number", { number: String(order.orderNumber) })}
                </span>
              </div>

              <p className="mt-3 text-center font-body text-xs text-on-surface-variant/70">
                {t(`order.statusHint.${order.status}`)}
              </p>

              {/* Progress track */}
              {order.status !== "cancelled" && (
                <ol className="mt-6 flex items-center gap-1">
                  {STATUS_STEPS.map((step, i) => {
                    const reached = STATUS_STEPS.indexOf(order.status) >= i;
                    return (
                      <li key={step} className="flex flex-1 flex-col items-center gap-1">
                        <span
                          className={`h-1.5 w-full rounded-full ${reached ? "bg-primary" : "bg-outline-variant/40"}`}
                        />
                        <span
                          className={`font-body text-[10px] uppercase tracking-wide ${reached ? "text-primary" : "text-on-surface-variant/50"}`}
                        >
                          {t(`order.statusLabel.${step}`)}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}

              <ul className="mt-6 divide-y divide-outline-variant/20 border-y border-outline-variant/20">
                {order.items.map((item, i) => (
                  <li key={i} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="font-body text-sm text-on-surface">
                        <span className="text-primary">{item.quantity}×</span> {itemLabel(item)}
                      </p>
                      {item.note && (
                        <p className="mt-0.5 font-body text-xs text-on-surface-variant/70">
                          {item.note}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 font-body text-sm text-on-surface-variant">
                      {formatPrice(item.lineTotal, locale)}
                    </span>
                  </li>
                ))}
              </ul>

              {order.note && (
                <p className="mt-3 font-body text-xs text-on-surface-variant/70">{order.note}</p>
              )}

              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-display text-xl text-primary">{t("order.total")}</span>
                <span className="font-display text-2xl text-primary">
                  {formatPrice(order.total, locale)}
                </span>
              </div>

              <p className="mt-2 text-center font-body text-xs text-on-surface-variant/60">
                {t("order.autoUpdate")}
              </p>

              <button
                type="button"
                onClick={() => router.push("/order")}
                className="mt-5 w-full rounded-full bg-primary px-6 py-4 font-body text-sm font-bold uppercase tracking-wider text-on-primary shadow-lg transition-colors hover:bg-primary-fixed"
              >
                {t("order.orderMore")}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
