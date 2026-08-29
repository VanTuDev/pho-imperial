"use client";

import type { ReactNode } from "react";
import { AdminAuthProvider } from "@/components/admin/admin-auth";
import { AntdAdminProvider } from "@/components/admin/antd-provider";
import { AdminFrame } from "@/components/admin/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AntdAdminProvider>
        <AdminFrame>{children}</AdminFrame>
      </AntdAdminProvider>
    </AdminAuthProvider>
  );
}
