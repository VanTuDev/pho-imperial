"use client";

import { useMemo, useState } from "react";
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { createAdmin, deleteAdmin, listAdmins, updateAdmin, type AdminUser } from "@/lib/admin-api";
import { useI18n } from "@/i18n/provider";
import { useAdminAuth } from "@/components/admin/admin-auth";
import { useLoad } from "@/components/admin/use-load";
import { ErrorNote, PageLoading } from "@/components/admin/ui";

interface Invite {
  email: string;
  name: string;
  password: string;
}

export default function AdminsPage() {
  const { locale, t } = useI18n();
  const { message } = App.useApp();
  const { admin: current } = useAdminAuth();
  const { data: admins, error, reload: load } = useLoad(listAdmins);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [saving, setSaving] = useState(false);

  async function submitInvite() {
    if (!invite) return;
    if (invite.password.length < 6) {
      message.error(t("admin.admins.passwordHint"));
      return;
    }
    setSaving(true);
    try {
      await createAdmin({
        email: invite.email.trim(),
        name: invite.name.trim(),
        password: invite.password,
      });
      setInvite(null);
      void load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("admin.common.saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(a: AdminUser) {
    try {
      await updateAdmin(a.id, { active: !a.active });
    } finally {
      void load();
    }
  }

  async function remove(a: AdminUser) {
    try {
      await deleteAdmin(a.id);
      void load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("admin.common.deleteError"));
    }
  }

  const columns = useMemo<ColumnsType<AdminUser>>(
    () => [
      {
        title: t("admin.admins.name"),
        dataIndex: "name",
        render: (_, a) => (
          <Space>
            {a.name}
            {a.role === "owner" && <Tag color="gold">{t("admin.nav.owner")}</Tag>}
            {!a.active && <Tag color="red">{t("admin.admins.disabled")}</Tag>}
          </Space>
        ),
      },
      {
        title: t("admin.admins.email"),
        dataIndex: "email",
        render: (_, a) => (
          <Typography.Text type="secondary">
            {a.email}
            {a.lastLoginAt &&
              ` · ${t("admin.admins.lastLogin", {
                date: new Date(a.lastLoginAt).toLocaleDateString(locale),
              })}`}
          </Typography.Text>
        ),
      },
      {
        title: "",
        key: "actions",
        width: 200,
        render: (_, a) =>
          a.role === "owner" ? null : (
            <Space>
              <Button size="small" onClick={() => toggleActive(a)}>
                {a.active ? t("admin.admins.disable") : t("admin.admins.enable")}
              </Button>
              <Popconfirm
                title={t("admin.common.confirmDelete", { name: a.email })}
                okText={t("admin.common.yes")}
                cancelText={t("admin.common.no")}
                onConfirm={() => remove(a)}
              >
                <Button size="small" danger>
                  {t("admin.common.delete")}
                </Button>
              </Popconfirm>
            </Space>
          ),
      },
    ],
    // toggleActive / remove only touch the API then reload; safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, t],
  );

  if (current && current.role !== "owner") {
    return <ErrorNote message={t("admin.admins.ownerOnly")} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t("admin.admins.title")}
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setInvite({ email: "", name: "", password: "" })}
        >
          {t("admin.admins.invite")}
        </Button>
      </div>

      <Typography.Text type="secondary">{t("admin.admins.explainer")}</Typography.Text>

      {error && <ErrorNote message={t("admin.common.loadError")} onRetry={load} />}

      {admins === null ? (
        <PageLoading />
      ) : (
        <Table rowKey="id" columns={columns} dataSource={admins} pagination={false} />
      )}

      <Modal
        open={invite !== null}
        onCancel={() => setInvite(null)}
        onOk={submitInvite}
        confirmLoading={saving}
        okText={t("admin.common.add")}
        cancelText={t("admin.common.cancel")}
        title={t("admin.admins.newTitle")}
        destroyOnHidden
      >
        {invite && (
          <Form layout="vertical">
            <Form.Item label={t("admin.admins.email")} help={t("admin.admins.emailHint")}>
              <Input
                type="email"
                value={invite.email}
                onChange={(e) => setInvite({ ...invite, email: e.target.value })}
              />
            </Form.Item>
            <Form.Item label={t("admin.admins.name")}>
              <Input
                value={invite.name}
                onChange={(e) => setInvite({ ...invite, name: e.target.value })}
              />
            </Form.Item>
            <Form.Item label={t("admin.admins.password")} help={t("admin.admins.passwordHint")}>
              <Input.Password
                value={invite.password}
                onChange={(e) => setInvite({ ...invite, password: e.target.value })}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
