"use client";

import Link from "next/link";
import { Button, Card, Col, Empty, Row, Space, Statistic, Typography } from "antd";
import {
  ArrowRightOutlined,
  DollarOutlined,
  LineChartOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { listOrders, updateOrderStatus, type AdminOrder } from "@/lib/admin-api";
import type { OrderStatus } from "@/lib/types";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";
import { formatPrice } from "@/i18n/format";
import { useLoad } from "@/components/admin/use-load";
import { ErrorNote, PageLoading } from "@/components/admin/ui";
import { StatusBadge, useStatusLabel } from "@/components/admin/status-badge";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "served",
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const loadDashboard = () =>
  Promise.all([listOrders({ active: true }), listOrders({ date: todayStr(), limit: 300 })]);

export default function AdminDashboard() {
  const { locale, t } = useI18n();
  const statusLabel = useStatusLabel();
  const { data, error, reload: load } = useLoad(loadDashboard, { pollMs: 10_000 });

  if (data === null) return <PageLoading />;
  const [orders, today] = data;

  const revenue = today
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  async function advance(order: AdminOrder) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      await updateOrderStatus(order.id, next);
    } finally {
      void load();
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t("admin.dashboard.title")}
      </Typography.Title>

      {error && <ErrorNote message={t("admin.dashboard.refreshError")} onRetry={load} />}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={t("admin.dashboard.activeOrders")}
              value={orders.length}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={t("admin.dashboard.ordersToday")}
              value={today.length}
              prefix={<ProfileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={t("admin.dashboard.revenueToday")}
              value={formatPrice(revenue, locale)}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t("admin.dashboard.activeOrders")}
        </Typography.Title>
        <Link href="/admin/orders">
          <Space size={4}>
            {t("admin.dashboard.allOrders")}
            <ArrowRightOutlined />
          </Space>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Empty description={t("admin.dashboard.noActive")} />
      ) : (
        <Row gutter={[16, 16]}>
          {orders.map((order) => (
            <Col xs={24} md={12} key={order.id}>
              <Card>
                <Space direction="vertical" size={12} style={{ display: "flex" }}>
                  <Space wrap>
                    <Link href={`/admin/orders/${order.id}`}>
                      <Typography.Text strong>№{order.orderNumber}</Typography.Text>
                    </Link>
                    <Typography.Text type="secondary">
                      {t("admin.orders.table")} {order.table.label}
                      {order.table.type === "vip" && " · VIP"}
                    </Typography.Text>
                    <StatusBadge status={order.status} />
                  </Space>
                  <Typography.Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{ margin: 0 }}
                  >
                    {order.items
                      .map((i) => `${i.quantity}× ${pick(i.name, locale)}`)
                      .join(", ")}
                  </Typography.Paragraph>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      {formatPrice(order.total, locale)}
                    </Typography.Text>
                    {NEXT_STATUS[order.status] && (
                      <Button size="small" type="primary" onClick={() => advance(order)}>
                        {statusLabel(NEXT_STATUS[order.status]!)}
                      </Button>
                    )}
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
