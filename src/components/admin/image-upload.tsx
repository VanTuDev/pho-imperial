"use client";

import { useState } from "react";
import Image from "next/image";
import { App, Button, Upload } from "antd";
import { DeleteOutlined, LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import { uploadImage, type CloudImage } from "@/lib/admin-api";
import { useI18n } from "@/i18n/provider";

interface Props {
  value?: CloudImage | null;
  onChange?: (image: CloudImage | null) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label }: Props) {
  const { t } = useI18n();
  const { message } = App.useApp();
  const [busy, setBusy] = useState(false);

  async function pick(file: File) {
    setBusy(true);
    try {
      onChange?.(await uploadImage(file));
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("admin.image.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {label && (
        <span
          style={{
            display: "block",
            marginBottom: 6,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-primary)",
          }}
        >
          {label}
        </span>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            position: "relative",
            width: 96,
            height: 96,
            flexShrink: 0,
            overflow: "hidden",
            borderRadius: 12,
            border: "1px solid var(--color-border, #4d4635)",
            background: "var(--color-surface-container, #201f1f)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            opacity: value?.url ? 1 : 0.5,
          }}
        >
          {value?.url ? (
            <Image src={value.url} alt="" fill sizes="96px" style={{ objectFit: "cover" }} />
          ) : (
            t("admin.image.none")
          )}
          {busy && (
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.5)",
              }}
            >
              <LoadingOutlined style={{ fontSize: 22 }} />
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              void pick(file as File);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />} loading={busy}>
              {value ? t("admin.image.replace") : t("admin.image.upload")}
            </Button>
          </Upload>
          {value && (
            <Button type="text" icon={<DeleteOutlined />} onClick={() => onChange?.(null)}>
              {t("admin.image.remove")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
