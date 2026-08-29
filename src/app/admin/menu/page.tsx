"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { App, Button, Popconfirm, Space, Switch, Table, Typography } from "antd";
import { CoffeeOutlined, EditOutlined, PlusOutlined, StarFilled } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  deleteMenuItem,
  listCategories,
  listMenu,
  updateMenuItem,
  type AdminMenuItem,
} from "@/lib/admin-api";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";
import { formatPrice } from "@/i18n/format";
import { useLoad } from "@/components/admin/use-load";
import { ErrorNote, PageLoading } from "@/components/admin/ui";
import { MenuFormModal } from "@/components/admin/menu-form-modal";

const loadMenuAndCategories = () => Promise.all([listMenu(), listCategories()]);

export default function MenuListPage() {
  const { locale, t } = useI18n();
  const { message } = App.useApp();
  const { data, error, reload: load } = useLoad(loadMenuAndCategories);
  const items = data?.[0] ?? null;
  const categories = useMemo(() => data?.[1] ?? [], [data]);

  const [editing, setEditing] = useState<AdminMenuItem | "new" | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, AdminMenuItem[]>();
    for (const item of items ?? []) {
      const arr = map.get(item.category) ?? [];
      arr.push(item);
      map.set(item.category, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.sortOrder - b.sortOrder);
    return map;
  }, [items]);

  async function toggleAvailable(item: AdminMenuItem) {
    try {
      await updateMenuItem(item.id, { available: !item.available });
    } finally {
      void load();
    }
  }

  async function remove(item: AdminMenuItem) {
    try {
      await deleteMenuItem(item.id);
      void load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("admin.common.deleteError"));
    }
  }

  const columns = useMemo<ColumnsType<AdminMenuItem>>(
    () => [
      {
        title: "",
        dataIndex: "image",
        width: 64,
        render: (_, item) => (
          <span
            style={{
              display: "flex",
              width: 44,
              height: 44,
              borderRadius: 10,
              overflow: "hidden",
              position: "relative",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--color-surface-container, #201f1f)",
              opacity: 0.9,
            }}
          >
            {item.image?.url ? (
              <Image src={item.image.url} alt="" fill sizes="44px" style={{ objectFit: "cover" }} />
            ) : (
              <CoffeeOutlined />
            )}
          </span>
        ),
      },
      {
        title: t("admin.menu.form.name"),
        dataIndex: "name",
        render: (_, item) => (
          <Space>
            <Typography.Text delete={!item.available}>{pick(item.name, locale)}</Typography.Text>
            {item.featured && <StarFilled style={{ color: "var(--color-primary)" }} />}
          </Space>
        ),
      },
      {
        title: t("admin.menu.form.price"),
        dataIndex: "price",
        width: 160,
        render: (_, item) =>
          item.variants.length > 0
            ? t("admin.menu.priceFrom", {
                price: formatPrice(item.price, locale),
                count: item.variants.length,
              })
            : formatPrice(item.price, locale),
      },
      {
        title: t("admin.menu.form.available"),
        dataIndex: "available",
        width: 110,
        render: (_, item) => (
          <Switch checked={item.available} onChange={() => toggleAvailable(item)} />
        ),
      },
      {
        title: "",
        key: "actions",
        width: 170,
        render: (_, item) => (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => setEditing(item)}>
              {t("admin.common.edit")}
            </Button>
            <Popconfirm
              title={t("admin.common.confirmDelete", { name: pick(item.name, locale) })}
              okText={t("admin.common.yes")}
              cancelText={t("admin.common.no")}
              onConfirm={() => remove(item)}
            >
              <Button size="small" danger>
                {t("admin.common.delete")}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    // toggleAvailable / remove are stable enough for this list; re-run on locale/t.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, t],
  );

  const orphans = (items ?? []).filter((i) => !categories.some((c) => c.id === i.category));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t("admin.menu.title")}
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing("new")}>
          {t("admin.menu.addDish")}
        </Button>
      </div>

      {error && <ErrorNote message={t("admin.common.loadError")} onRetry={load} />}

      {items === null ? (
        <PageLoading />
      ) : items.length === 0 ? (
        <Typography.Text type="secondary">{t("admin.menu.empty")}</Typography.Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {categories.map((cat) => {
            const catItems = grouped.get(cat.id) ?? [];
            if (catItems.length === 0) return null;
            return (
              <section key={cat.id}>
                <Typography.Title level={4} style={{ marginTop: 0 }}>
                  {pick(cat.name, locale)}
                </Typography.Title>
                <Table
                  rowKey="id"
                  size="middle"
                  columns={columns}
                  dataSource={catItems}
                  pagination={false}
                />
              </section>
            );
          })}

          {orphans.length > 0 && (
            <section>
              <Typography.Title level={4} type="danger" style={{ marginTop: 0 }}>
                {t("admin.menu.noCategory")}
              </Typography.Title>
              <Table
                rowKey="id"
                size="middle"
                columns={columns}
                dataSource={orphans}
                pagination={false}
              />
            </section>
          )}
        </div>
      )}

      <MenuFormModal
        open={editing !== null}
        item={editing && editing !== "new" ? editing : null}
        categories={categories}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          void load();
        }}
      />
    </div>
  );
}
