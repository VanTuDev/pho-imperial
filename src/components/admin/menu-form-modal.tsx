"use client";

import { useState } from "react";
import {
  App,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Switch,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  createMenuItem,
  updateMenuItem,
  type AdminCategory,
  type AdminMenuItem,
  type AdminVariant,
  type CloudImage,
} from "@/lib/admin-api";
import type { Localized } from "@/i18n/localized";
import { pick } from "@/i18n/localized";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { ImageUpload } from "./image-upload";

interface Props {
  open: boolean;
  item: AdminMenuItem | null;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: () => void;
}

interface FormValues {
  name: string;
  description: string;
  category: string;
  price: number;
  sortOrder: number;
  image: CloudImage | null;
  available: boolean;
  featured: boolean;
  variants: { name: string; price: number }[];
}

/** One string in / out — the menu form is single-language for now. */
const oneLine = (l: Localized | undefined, locale: Locale): string =>
  (l && (l[locale] || l.vi || l.ru || l.en)) || "";

/** Store the single value in every locale, keeping any existing translation. */
const spread = (s: string, prev: Localized | undefined, locale: Locale): Localized => ({
  ru: locale === "ru" ? s : prev?.ru || s,
  en: locale === "en" ? s : prev?.en || s,
  vi: locale === "vi" ? s : prev?.vi || s,
});

export function MenuFormModal({ open, item, categories, onClose, onSaved }: Props) {
  const { locale, t } = useI18n();
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);

  const initialValues: FormValues = {
    name: oneLine(item?.name, locale),
    description: oneLine(item?.description, locale),
    category: item?.category ?? "",
    price: item?.price ?? 0,
    sortOrder: item?.sortOrder ?? 0,
    image: item?.image ?? null,
    available: item?.available ?? true,
    featured: item?.featured ?? false,
    variants: item?.variants.map((v) => ({ name: oneLine(v.name, locale), price: v.price })) ?? [],
  };

  async function submit(values: FormValues) {
    if (!values.name?.trim()) {
      form.setFields([{ name: "name", errors: [t("admin.menu.form.nameRequired")] }]);
      return;
    }
    const category = values.category || categories[0]?.id || "";
    if (!category) {
      form.setFields([{ name: "category", errors: [t("admin.menu.form.categoryRequired")] }]);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: spread(values.name.trim(), item?.name, locale),
        description: spread(values.description?.trim() ?? "", item?.description, locale),
        category,
        price: Number(values.price) || 0,
        image: values.image ?? null,
        variants: (values.variants ?? [])
          .filter((v) => v.name?.trim())
          .map<AdminVariant>((v, i) => ({
            name: spread(v.name.trim(), item?.variants?.[i]?.name, locale),
            price: Number(v.price) || 0,
          })),
        available: values.available,
        featured: values.featured,
        sortOrder: Number(values.sortOrder) || 0,
      };
      if (item) await updateMenuItem(item.id, payload);
      else await createMenuItem(payload);
      message.success(t("admin.common.saved"));
      onSaved();
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("admin.common.saveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={saving}
      okText={t("admin.common.save")}
      cancelText={t("admin.common.cancel")}
      title={item ? pick(item.name, locale) : t("admin.menu.newTitle")}
      width="min(1040px, 94vw)"
      centered
      destroyOnHidden
      styles={{ body: { maxHeight: "calc(100vh - 200px)", overflowY: "auto", overflowX: "hidden" } }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={submit}
        preserve={false}
      >
        <Row gutter={24}>
          {/* Left column — the essentials */}
          <Col xs={24} md={13}>
            <Form.Item name="name" label={t("admin.menu.form.name")} style={{ marginBottom: 12 }}>
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label={t("admin.menu.form.description")}
              style={{ marginBottom: 12 }}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  name="category"
                  label={t("admin.menu.form.category")}
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    options={categories.map((c) => ({
                      value: c.id,
                      label: pick(c.name, locale),
                    }))}
                    placeholder={t("admin.menu.form.category")}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label={t("admin.menu.form.price")}
                  style={{ marginBottom: 12 }}
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sortOrder"
                  label={t("admin.menu.form.sortOrder")}
                  style={{ marginBottom: 12 }}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Space size="large">
              <Form.Item
                name="available"
                label={t("admin.menu.form.available")}
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="featured"
                label={t("admin.menu.form.featured")}
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch />
              </Form.Item>
            </Space>
          </Col>

          {/* Right column — image + options */}
          <Col xs={24} md={11}>
            <Form.Item name="image" style={{ marginBottom: 12 }}>
              <ImageUpload label={t("admin.image.label")} />
            </Form.Item>
            <Form.Item label={t("admin.menu.form.variants")} style={{ marginBottom: 0 }}>
              <Form.List name="variants">
                {(fields, { add, remove }) => (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {fields.length === 0 && (
                      <span style={{ fontSize: 13, opacity: 0.6 }}>
                        {t("admin.menu.form.noVariants")}
                      </span>
                    )}
                    {fields.map((field) => (
                      <Space key={field.key} align="baseline" style={{ display: "flex" }}>
                        <Form.Item name={[field.name, "name"]} noStyle>
                          <Input
                            placeholder={t("admin.menu.form.name")}
                            style={{ width: 200 }}
                          />
                        </Form.Item>
                        <Form.Item name={[field.name, "price"]} noStyle>
                          <InputNumber
                            min={0}
                            placeholder={t("admin.menu.form.variantPrice")}
                            style={{ width: 110 }}
                          />
                        </Form.Item>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          aria-label={t("admin.menu.form.removeVariant")}
                          onClick={() => remove(field.name)}
                        />
                      </Space>
                    ))}
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() =>
                        add({ name: "", price: form.getFieldValue("price") || 0 })
                      }
                    >
                      {t("admin.common.add")}
                    </Button>
                  </div>
                )}
              </Form.List>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
