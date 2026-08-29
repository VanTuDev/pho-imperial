"use client";

import { useState } from "react";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Segmented,
  Space,
  Switch,
  Typography,
} from "antd";
import { PlusOutlined, PrinterOutlined } from "@ant-design/icons";
import {
  bulkCreateTables,
  createTable,
  deleteTable,
  listTables,
  updateTable,
  type AdminTable,
} from "@/lib/admin-api";
import { useI18n } from "@/i18n/provider";
import { useLoad } from "@/components/admin/use-load";
import { ErrorNote, PageLoading } from "@/components/admin/ui";
import { QrThumb, printTableQr, tableOrderUrl } from "@/components/admin/qr-code";

interface Draft {
  id?: string;
  label: string;
  code: string;
  type: "standard" | "vip";
  active: boolean;
  note: string;
}

interface Bulk {
  from: number;
  to: number;
  type: "standard" | "vip";
  prefix: string;
}

const emptyDraft = (): Draft => ({ label: "", code: "", type: "standard", active: true, note: "" });

export default function TablesPage() {
  const { t } = useI18n();
  const { message } = App.useApp();
  const { data: tables, error, reload: load } = useLoad(listTables);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [bulk, setBulk] = useState<Bulk | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!draft) return;
    setSaving(true);
    try {
      const payload = {
        label: draft.label,
        code: draft.code || undefined,
        type: draft.type,
        active: draft.active,
        note: draft.note,
      };
      if (draft.id) await updateTable(draft.id, payload);
      else await createTable(payload);
      setDraft(null);
      void load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("admin.common.saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function saveBulk() {
    if (!bulk) return;
    setSaving(true);
    try {
      const count = await bulkCreateTables(bulk);
      setBulk(null);
      void load();
      message.success(t("admin.tables.bulkCreated", { count }));
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("admin.common.saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function toggleType(table: AdminTable, type: "standard" | "vip") {
    try {
      await updateTable(table.id, { type });
    } finally {
      void load();
    }
  }

  async function remove(table: AdminTable) {
    try {
      await deleteTable(table.id);
      void load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("admin.common.deleteError"));
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t("admin.tables.title")}
        </Typography.Title>
        <Space>
          <Button onClick={() => setBulk({ from: 1, to: 20, type: "standard", prefix: "" })}>
            {t("admin.tables.bulkAdd")}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setDraft(emptyDraft())}>
            {t("admin.tables.add")}
          </Button>
        </Space>
      </div>

      {error && <ErrorNote message={t("admin.common.loadError")} onRetry={load} />}

      {tables === null ? (
        <PageLoading />
      ) : tables.length === 0 ? (
        <Typography.Text type="secondary">{t("admin.tables.empty")}</Typography.Text>
      ) : (
        <Row gutter={[16, 16]}>
          {tables.map((table) => (
            <Col xs={24} sm={12} key={table.id}>
              <Card>
                <Space align="start" style={{ width: "100%" }}>
                  <QrThumb code={table.code} size={84} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Typography.Text strong>
                      {t("admin.orders.table")} {table.label}
                      {!table.active && (
                        <Typography.Text type="secondary" style={{ marginInlineStart: 8 }}>
                          ({t("admin.tables.hidden")})
                        </Typography.Text>
                      )}
                    </Typography.Text>
                    <div
                      style={{
                        fontSize: 11,
                        opacity: 0.6,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tableOrderUrl(table.code)}
                    </div>
                    <Space wrap style={{ marginTop: 8 }}>
                      <Segmented
                        size="small"
                        value={table.type}
                        onChange={(v) => toggleType(table, v as "standard" | "vip")}
                        options={[
                          { value: "standard", label: t("admin.tables.standard") },
                          { value: "vip", label: "VIP" },
                        ]}
                      />
                      <Button
                        size="small"
                        icon={<PrinterOutlined />}
                        onClick={() =>
                          printTableQr(table.label, table.code, {
                            heading: `${t("admin.orders.table")} ${table.label}`,
                            caption: t("admin.tables.qrCaption"),
                          })
                        }
                      >
                        {t("admin.tables.printQr")}
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          setDraft({
                            id: table.id,
                            label: table.label,
                            code: table.code,
                            type: table.type,
                            active: table.active,
                            note: table.note,
                          })
                        }
                      >
                        {t("admin.common.edit")}
                      </Button>
                      <Popconfirm
                        title={t("admin.tables.confirmDelete", { label: table.label })}
                        okText={t("admin.common.yes")}
                        cancelText={t("admin.common.no")}
                        onConfirm={() => remove(table)}
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
        title={draft?.id ? t("admin.tables.editTitle") : t("admin.tables.newTitle")}
        destroyOnHidden
      >
        {draft && (
          <Form layout="vertical">
            <Form.Item label={t("admin.tables.label")} help={t("admin.tables.labelHint")}>
              <Input
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              />
            </Form.Item>
            <Form.Item label={t("admin.tables.code")} help={t("admin.tables.codeHint")}>
              <Input
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
              />
            </Form.Item>
            <Form.Item label={t("admin.tables.type")}>
              <Segmented
                value={draft.type}
                onChange={(v) => setDraft({ ...draft, type: v as "standard" | "vip" })}
                options={[
                  { value: "standard", label: t("admin.tables.standard") },
                  { value: "vip", label: t("admin.tables.vip") },
                ]}
              />
            </Form.Item>
            <Form.Item label={t("admin.tables.note")}>
              <Input
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              />
            </Form.Item>
            <Form.Item label={t("admin.tables.activeToggle")}>
              <Switch
                checked={draft.active}
                onChange={(active) => setDraft({ ...draft, active })}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        open={bulk !== null}
        onCancel={() => setBulk(null)}
        onOk={saveBulk}
        confirmLoading={saving}
        okText={t("admin.common.create")}
        cancelText={t("admin.common.cancel")}
        title={t("admin.tables.bulkTitle")}
        destroyOnHidden
      >
        {bulk && (
          <Form layout="vertical">
            <Space size="middle">
              <Form.Item label={t("admin.tables.bulkFrom")}>
                <InputNumber
                  min={1}
                  value={bulk.from}
                  onChange={(v) => setBulk({ ...bulk, from: Number(v) || 1 })}
                />
              </Form.Item>
              <Form.Item label={t("admin.tables.bulkTo")}>
                <InputNumber
                  min={1}
                  value={bulk.to}
                  onChange={(v) => setBulk({ ...bulk, to: Number(v) || 1 })}
                />
              </Form.Item>
            </Space>
            <Form.Item label={t("admin.tables.bulkPrefix")} help={t("admin.tables.bulkPrefixHint")}>
              <Input
                value={bulk.prefix}
                onChange={(e) => setBulk({ ...bulk, prefix: e.target.value })}
              />
            </Form.Item>
            <Form.Item label={t("admin.tables.type")}>
              <Segmented
                value={bulk.type}
                onChange={(v) => setBulk({ ...bulk, type: v as "standard" | "vip" })}
                options={[
                  { value: "standard", label: t("admin.tables.standard") },
                  { value: "vip", label: t("admin.tables.vip") },
                ]}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
