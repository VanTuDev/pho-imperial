"use client";

import { useState } from "react";
import Image from "next/image";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Space,
  Switch,
  Typography,
} from "antd";
import { AppstoreOutlined, PlusOutlined } from "@ant-design/icons";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type AdminCategory,
} from "@/lib/admin-api";
import type { Localized } from "@/i18n/localized";
import { useI18n } from "@/i18n/provider";
import { pick } from "@/i18n/localized";
import { useLoad } from "@/components/admin/use-load";
import { ErrorNote, PageLoading } from "@/components/admin/ui";
import { LocalizedInput } from "@/components/admin/localized-input";
import { ImageUpload } from "@/components/admin/image-upload";

interface Draft {
  id?: string;
  name: Localized;
  sortOrder: number;
  active: boolean;
  image: AdminCategory["image"];
}

const emptyDraft = (): Draft => ({
  name: { ru: "", en: "", vi: "" },
  sortOrder: 0,
  active: true,
  image: null,
});

export default function CategoriesPage() {
  const { locale, t } = useI18n();
  const { message } = App.useApp();
  const { data: categories, error, reload: load } = useLoad(listCategories);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!draft) return;
    setSaving(true);
    try {
      const payload = {
        name: draft.name,
        sortOrder: draft.sortOrder,
        active: draft.active,
        image: draft.image,
      };
      if (draft.id) await updateCategory(draft.id, payload);
      else await createCategory(payload);
      setDraft(null);
      message.success(t("admin.common.saved"));
      void load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("admin.common.saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: AdminCategory) {
    try {
      await deleteCategory(c.id);
      void load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("admin.common.deleteError"));
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t("admin.categories.title")}
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDraft(emptyDraft())}>
          {t("admin.categories.add")}
        </Button>
      </div>

      {error && <ErrorNote message={t("admin.common.loadError")} onRetry={load} />}

      {categories === null ? (
        <PageLoading />
      ) : categories.length === 0 ? (
        <Typography.Text type="secondary">{t("admin.categories.empty")}</Typography.Text>
      ) : (
        <Row gutter={[16, 16]}>
          {categories.map((c) => (
            <Col xs={24} sm={12} key={c.id}>
              <Card>
                <Space align="start" style={{ width: "100%" }}>
                  <span
                    style={{
                      position: "relative",
                      width: 56,
                      height: 56,
                      flexShrink: 0,
                      overflow: "hidden",
                      borderRadius: 12,
                      background: "rgba(242,202,80,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-primary)",
                    }}
                  >
                    {c.image?.url ? (
                      <Image src={c.image.url} alt="" fill sizes="56px" style={{ objectFit: "cover" }} />
                    ) : (
                      <AppstoreOutlined />
                    )}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Typography.Text strong>{pick(c.name, locale)}</Typography.Text>
                    <div style={{ fontSize: 12, opacity: 0.65 }}>
                      {t("admin.categories.meta", {
                        slug: c.slug,
                        order: c.sortOrder,
                        state: c.active ? t("admin.common.active") : t("admin.common.hidden"),
                      })}
                    </div>
                    <Space style={{ marginTop: 8 }}>
                      <Button
                        size="small"
                        onClick={() =>
                          setDraft({
                            id: c.id,
                            name: c.name,
                            sortOrder: c.sortOrder,
                            active: c.active,
                            image: c.image,
                          })
                        }
                      >
                        {t("admin.common.edit")}
                      </Button>
                      <Popconfirm
                        title={t("admin.common.confirmDelete", { name: pick(c.name, locale) })}
                        okText={t("admin.common.yes")}
                        cancelText={t("admin.common.no")}
                        onConfirm={() => remove(c)}
                      >
                        <Button size="small" danger>
                          {t("admin.common.delete")}
                        </Button>
                      </Popconfirm>
                    </Space>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        open={draft !== null}
        onCancel={() => setDraft(null)}
        onOk={save}
        confirmLoading={saving}
        okText={t("admin.common.save")}
        cancelText={t("admin.common.cancel")}
        title={draft?.id ? t("admin.categories.editTitle") : t("admin.categories.newTitle")}
        destroyOnHidden
      >
        {draft && (
          <Form layout="vertical">
            <Form.Item>
              <LocalizedInput
                label={t("admin.categories.name")}
                value={draft.name}
                onChange={(name) => setDraft({ ...draft, name })}
                required
              />
            </Form.Item>
            <Form.Item label={t("admin.categories.sortOrder")}>
              <InputNumber
                value={draft.sortOrder}
                onChange={(v) => setDraft({ ...draft, sortOrder: Number(v) || 0 })}
              />
            </Form.Item>
            <Form.Item>
              <ImageUpload
                label={t("admin.categories.image")}
                value={draft.image}
                onChange={(image) => setDraft({ ...draft, image })}
              />
            </Form.Item>
            <Form.Item label={t("admin.categories.showInMenu")}>
              <Switch
                checked={draft.active}
                onChange={(active) => setDraft({ ...draft, active })}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
