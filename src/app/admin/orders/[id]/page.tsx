"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  Col,
  Descriptions,
  List,
  Row,
  Segmented,
  Space,
  Tag,
  Typography,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getOrder, updateOrderStatus, type AdminOrder } from "@/lib/admin-api";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";
import { formatPrice } from "@/i18n/format";
import { ErrorNote, PageLoading } from "@/components/admin/ui";
import { StatusBadge, useStatusLabel } from "@/components/admin/status-badge";

export default function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { locale, t } = useI18n();
  const statusLabel = useStatusLabel();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    return getOrder(id).then(
      (result) => {
        if (!result) {
          setState("missing");
          return;
        }
        setOrder(result);
        setState("ready");
      },
      () => setState((s) => (s === "ready" ? "ready" : "error")),
    );
  }, [id]);

  useEffect(() => {
    let alive = true;
    const run = () => {
      if (alive) void load();
    };
    run();
    const timer = setInterval(run, 15_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [load]);

  async function setStatus(status: OrderStatus) {
    if (!order || saving) return;
    setSaving(true);
    try {
      setOrder(await updateOrderStatus(order.id, status));
    } catch {
      void load();
    } finally {
      setSaving(false);
    }
  }

  if (state === "loading") return <PageLoading />;
  if (state === "missing")
    return (
      <Space direction="vertical">
        <ErrorNote message={t("admin.orders.notFound")} />
        <Link href="/admin/orders">← {t("admin.orders.backToList")}</Link>
      </Space>
    );
  if (state === "error" || !order)
    return <ErrorNote message={t("admin.orders.loadError")} onRetry={load} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Link href="/admin/orders">
            <Space size={4}>
              <ArrowLeftOutlined />
              {t("admin.orders.backToList")}
            </Space>
          </Link>
          <Typography.Title level={3} style={{ marginTop: 4, marginBottom: 0 }}>
            {t("admin.orders.detailTitle", { number: order.orderNumber })}
          </Typography.Title>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title={t("admin.orders.itemsHeading")}>
            <List
              dataSource={order.items}
              renderItem={(item, i) => (
                <List.Item key={i} extra={formatPrice(item.lineTotal, locale)}>
                  <List.Item.Meta
                    title={
                      <>
                        <Typography.Text type="warning">{item.quantity}×</Typography.Text>{" "}
                        {pick(item.name, locale)}
                        {item.variantName && (
                          <Typography.Text type="secondary">
                            {" · "}
                            {pick(item.variantName, locale)}
                          </Typography.Text>
                        )}
                      </>
                    }
                    description={item.note ? `✏️ ${item.note}` : undefined}
                  />
                </List.Item>
              )}
            />
            {order.note && (
              <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
                📝 {order.note}
              </Typography.Paragraph>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                borderTop: "1px solid var(--color-border, #4d4635)",
                marginTop: 12,
                paddingTop: 12,
              }}
            >
              <Typography.Text strong>{t("admin.orders.total")}</Typography.Text>
              <Typography.Title level={4} style={{ margin: 0, color: "var(--color-primary)" }}>
                {formatPrice(order.total, locale)}
              </Typography.Title>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" size={16} style={{ display: "flex" }}>
            <Card title={t("admin.orders.tableHeading")}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={t("admin.orders.table")}>
                  {order.table.label}
                  {order.table.type === "vip" && (
                    <Tag color="gold" style={{ marginInlineStart: 8 }}>
                      VIP
                    </Tag>
                  )}
                </Descriptions.Item>
                {(order.customer.name || order.customer.phone) && (
                  <Descriptions.Item label="—">
                    {[order.customer.name, order.customer.phone].filter(Boolean).join(" · ")}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="—">
                  {new Date(order.createdAt).toLocaleString(locale)} ·{" "}
                  {t(`admin.orders.source.${order.source === "web" ? "web" : "qr"}`)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title={t("admin.orders.statusHeading")}>
              <Segmented
                vertical
                block
                value={order.status}
                disabled={saving}
                onChange={(v) => setStatus(v as OrderStatus)}
                options={ORDER_STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
