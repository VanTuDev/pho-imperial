"use client";

import { Alert, Button, Spin } from "antd";
import { useI18n } from "@/i18n/provider";

/** Full-height centered spinner for a page that is still loading its data. */
export function PageLoading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "96px 0" }}>
      <Spin size="large" />
    </div>
  );
}

/** Inline error banner with an optional retry action. */
export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <Alert
      type="error"
      showIcon
      title={message}
      style={{ marginBottom: 16 }}
      action={
        onRetry ? (
          <Button size="small" danger onClick={onRetry}>
            {t("admin.common.retry")}
          </Button>
        ) : undefined
      }
    />
  );
}
