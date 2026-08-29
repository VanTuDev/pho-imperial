"use client";

import { Tag } from "antd";
import type { OrderStatus } from "@/lib/types";
import { useI18n } from "@/i18n/provider";

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "gold",
  confirmed: "blue",
  preparing: "orange",
  ready: "cyan",
  served: "green",
  cancelled: "red",
};

export function useStatusLabel() {
  const { t } = useI18n();
  return (status: OrderStatus) => t(`admin.status.${status}`);
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const label = useStatusLabel();
  return (
    <Tag color={STATUS_COLOR[status]} style={{ marginInlineEnd: 0 }}>
      {label(status)}
    </Tag>
  );
}
