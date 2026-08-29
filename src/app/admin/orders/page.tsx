"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { DatePicker, Segmented, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import { listOrders, listTables, type AdminOrder } from "@/lib/admin-api";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";
import { formatPrice } from "@/i18n/format";
import { useLoad } from "@/components/admin/use-load";
import { ErrorNote, PageLoading } from "@/components/admin/ui";
import { StatusBadge, useStatusLabel } from "@/components/admin/status-badge";

export default function AdminOrdersPage() {
  const { locale, t } = useI18n();
  const statusLabel = useStatusLabel();
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [tableCode, setTableCode] = useState<string>("");

  const loader = useCallback(
    () =>
      listOrders({
        status: status || undefined,
        date: date || undefined,
        table: tableCode || undefined,
        limit: 300,
      }),
    [status, date, tableCode],
  );
  const { data: orders, error, reload: load } = useLoad(loader, { pollMs: 15_000 });
  const { data: tables } = useLoad(listTables);

  const revenue = useMemo(
    () => (orders ?? []).filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
    [orders],
  );

  const columns = useMemo<ColumnsType<AdminOrder>>(
    () => [
      {
        title: t("admin.orders.colNumber"),
        dataIndex: "orderNumber",
        width: 90,
        render: (_, o) => <Link href={`/admin/orders/${o.id}`}>{o.orderNumber}</Link>,
      },
      {
        title: t("admin.orders.colTable"),
        dataIndex: ["table", "label"],
        render: (_, o) => (
          <Space size={4}>
            {o.table.label}
            {o.table.type === "vip" && <Tag color="gold">VIP</Tag>}
          </Space>
        ),
      },
      {
        title: t("admin.orders.colItems"),
        key: "items",
        render: (_, o) => (
          <Typography.Text type="secondary" ellipsis style={{ maxWidth: 280 }}>
            {o.items.map((i) => `${i.quantity}× ${pick(i.name, locale)}`).join(", ")}
          </Typography.Text>
        ),
      },
      {
        title: t("admin.orders.colTotal"),
        dataIndex: "total",
        width: 120,
        render: (_, o) => formatPrice(o.total, locale),
      },
      {
        title: t("admin.orders.colStatus"),
        dataIndex: "status",
        width: 130,
        render: (_, o) => <StatusBadge status={o.status} />,
      },
      {
        title: t("admin.orders.colTime"),
        dataIndex: "createdAt",
        width: 90,
        render: (_, o) =>
          new Date(o.createdAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }),
      },
    ],
    [locale, t],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t("admin.orders.title")}
      </Typography.Title>

      <Space wrap size="middle" align="end">
        <label>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
            {t("admin.orders.status")}
          </div>
          <Select
            style={{ width: 160 }}
            value={status}
            onChange={setStatus}
            options={[
              { value: "", label: t("admin.common.all") },
              ...ORDER_STATUSES.map((s) => ({ value: s, label: statusLabel(s) })),
            ]}
          />
        </label>
        <Segmented
          value={date ? "day" : "all"}
          onChange={(v) => setDate(v === "all" ? "" : new Date().toISOString().slice(0, 10))}
          options={[
            { value: "day", label: t("admin.orders.today") },
            { value: "all", label: t("admin.orders.allTime") },
          ]}
        />
        {date && (
          <DatePicker
            value={dayjs(date)}
            allowClear={false}
            onChange={(d: Dayjs | null) => d && setDate(d.format("YYYY-MM-DD"))}
          />
        )}
        <label>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
            {t("admin.orders.table")}
          </div>
          <Select
            style={{ width: 180 }}
            value={tableCode}
            onChange={setTableCode}
            options={[
              { value: "", label: t("admin.orders.allTables") },
              ...(tables ?? []).map((tbl) => ({
                value: tbl.code,
                label: `${tbl.label}${tbl.type === "vip" ? " · VIP" : ""}`,
              })),
            ]}
          />
        </label>
      </Space>

      {error && <ErrorNote message={t("admin.orders.loadError")} onRetry={load} />}

      {orders && orders.length > 0 && (
        <Typography.Text type="secondary">
          {t("admin.orders.summary", {
            count: orders.length,
            revenue: formatPrice(revenue, locale),
          })}
        </Typography.Text>
      )}

      {orders === null ? (
        <PageLoading />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={orders}
          pagination={{ pageSize: 25, hideOnSinglePage: true }}
          scroll={{ x: 720 }}
        />
      )}
    </div>
  );
}
