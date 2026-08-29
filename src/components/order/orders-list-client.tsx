"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { formatPrice } from "@/i18n/format";
import { getOrder } from "@/lib/api";
import { getOrderIds } from "@/lib/order-history";
import type { OrderStatus } from "@/lib/types";
import { SiteHeader } from "@/components/site-header";
import { BottomNav } from "@/components/bottom-nav";
import { ArrowForwardIcon } from "@/components/icons";

interface OrderSummary {
  id: string;
  orderNumber: number;
  tableLabel: string;
  total: number;
  status: OrderStatus;
  itemCount: number;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-primary text-on-primary",
  confirmed: "bg-secondary text-on-secondary",
  preparing: "bg-secondary text-on-secondary",
  ready: "bg-tertiary text-on-tertiary",
  served: "bg-surface-container-high text-on-surface-variant",
  cancelled: "bg-error-container text-on-error",
};

export function OrdersListClient() {
  const { locale, t } = useI18n();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all(
      getOrderIds().map(async (id): Promise<OrderSummary | null> => {
        try {
          const order = await getOrder(id);
          if (!order) return null;
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            tableLabel: order.table.label,
            total: order.total,
            status: order.status,
            itemCount: order.items.reduce((s, i) => s + i.quantity, 0),
          };
        } catch {
          return null;
        }
      }),
    ).then((list) => {
      if (active) setOrders(list.filter((o): o is OrderSummary => o !== null));
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-background pb-32">
      <SiteHeader />
      <main className="container-imperial px-margin-mobile pt-24">
        <h1 className="mb-6 font-display text-2xl tracking-wide text-primary">
          {t("orders.title")}
        </h1>

        {orders === null ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl bg-surface-container-low"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="font-display text-xl text-primary">{t("orders.empty")}</p>
            <p className="max-w-xs font-body text-sm text-on-surface-variant">
              {t("orders.emptyHint")}
            </p>
            <Link
              href="/order"
              className="mt-2 rounded-full bg-primary px-8 py-3 font-body text-xs font-bold uppercase tracking-widest text-on-primary transition-colors hover:bg-primary-fixed"
            >
              {t("cart.browseMenu")}
            </Link>
          </div>
        ) : (
          <ul className="mx-auto max-w-2xl space-y-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4 transition-colors hover:border-primary/50"
                >
                  <div className="min-w-0">
                    <p className="font-body text-sm text-on-surface">
                      {t("orders.tableAndNumber", {
                        table: order.tableLabel,
                        number: String(order.orderNumber),
                      })}
                    </p>
                    <p className="font-body text-xs text-on-surface-variant">
                      {order.itemCount === 1
                        ? t("orders.itemsOne", { count: order.itemCount })
                        : t("orders.itemsMany", { count: order.itemCount })}{" "}
                      · {formatPrice(order.total, locale)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 font-body text-[11px] font-bold uppercase tracking-widest ${STATUS_STYLES[order.status]}`}
                    >
                      {t(`order.statusLabel.${order.status}`)}
                    </span>
                    <ArrowForwardIcon className="h-4 w-4 text-primary" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <BottomNav />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}
