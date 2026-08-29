"use client";

import type { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AdminAuthProvider } from "@/components/admin/admin-auth";
import { AntdAdminProvider } from "@/components/admin/antd-provider";
import { AdminFrame } from "@/components/admin/admin-shell";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AdminAuthProvider>
        <AntdAdminProvider>
          <AdminFrame>{children}</AdminFrame>
        </AntdAdminProvider>
      </AdminAuthProvider>
    </GoogleOAuthProvider>
  );
}
