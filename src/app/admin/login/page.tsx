"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { Alert, Button, Divider, Form, Input, Typography } from "antd";
import { login, loginGoogle } from "@/lib/admin-api";
import { useI18n } from "@/i18n/provider";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useAdminAuth } from "@/components/admin/admin-auth";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { setAdmin } = useAdminAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(values: { email: string; password: string }) {
    setSubmitting(true);
    setError(null);
    try {
      const admin = await login(values.email.trim(), values.password);
      setAdmin(admin);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.login.failed"));
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/pho-bo.png"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/70 to-transparent" />
        <div className="ornamental-border absolute inset-10 flex flex-col justify-end p-10">
          <p className="gold-shimmer font-display text-5xl uppercase tracking-[0.2em] text-primary">
            BunPho
          </p>
          <p className="mt-3 max-w-sm font-display text-xl text-on-surface-variant">
            {t("home.heroTagline")}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center justify-between">
            <p className="font-display text-2xl uppercase tracking-[0.2em] text-primary lg:hidden">
              BunPho
            </p>
            <div className="ml-auto">
              <LanguageToggle />
            </div>
          </div>

          <Typography.Title level={3} style={{ marginBottom: 4 }}>
            {t("admin.login.subtitle")}
          </Typography.Title>
          <Typography.Paragraph type="secondary">BunPho</Typography.Paragraph>

          <Form layout="vertical" onFinish={submit} requiredMark={false}>
            <Form.Item
              name="email"
              label={t("admin.login.email")}
              rules={[{ required: true, type: "email" }]}
            >
              <Input autoComplete="username" size="large" />
            </Form.Item>
            <Form.Item
              name="password"
              label={t("admin.login.password")}
              rules={[{ required: true }]}
            >
              <Input.Password autoComplete="current-password" size="large" />
            </Form.Item>

            {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}

            <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
              {t("admin.login.signIn")}
            </Button>
          </Form>

          {GOOGLE_CLIENT_ID && (
            <>
              <Divider plain>{t("admin.login.or")}</Divider>
              <div className="flex justify-center">
                <GoogleLogin
                  theme="filled_black"
                  text="signin_with"
                  onSuccess={async (cred) => {
                    if (!cred.credential) return;
                    setError(null);
                    try {
                      const admin = await loginGoogle(cred.credential);
                      setAdmin(admin);
                      router.replace("/admin");
                    } catch (err) {
                      setError(err instanceof Error ? err.message : t("admin.login.googleFailed"));
                    }
                  }}
                  onError={() => setError(t("admin.login.googleFailed"))}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
