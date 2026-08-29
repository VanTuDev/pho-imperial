"use client";

import type { ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider, theme, type ThemeConfig } from "antd";
import enUS from "antd/locale/en_US";
import ruRU from "antd/locale/ru_RU";
import viVN from "antd/locale/vi_VN";
import type { Locale as AntdLocale } from "antd/lib/locale";
import { useI18n } from "@/i18n/provider";
import type { Locale } from "@/i18n/config";

/**
 * Ant Design surface for the admin area only. `AntdRegistry` extracts the
 * component CSS during SSR (via `useServerInsertedHTML`); because it lives in
 * the admin layout the customer site never ships antd styles.
 */

const ANTD_LOCALE: Record<Locale, AntdLocale> = {
  ru: ruRU as AntdLocale,
  en: enUS as AntdLocale,
  vi: viVN as AntdLocale,
};

// Gold-on-black "Imperial Lotus Noir" palette, mirrored from globals.css.
const adminTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#f2ca50",
    colorInfo: "#f2ca50",
    colorBgBase: "#131313",
    colorBgContainer: "#1c1b1b",
    colorBgElevated: "#201f1f",
    colorBorder: "#4d4635",
    colorText: "#e5e2e1",
    colorTextSecondary: "#d0c5af",
    borderRadius: 12,
    fontFamily:
      "var(--font-manrope), Manrope, ui-sans-serif, system-ui, sans-serif",
  },
  components: {
    Layout: {
      headerBg: "#0e0e0e",
      siderBg: "#0e0e0e",
      bodyBg: "#131313",
      headerHeight: 64,
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedColor: "#f2ca50",
      itemSelectedBg: "rgba(242, 202, 80, 0.15)",
    },
    Table: {
      headerBg: "#1c1b1b",
      borderColor: "rgba(77, 70, 53, 0.4)",
    },
  },
};

export function AntdAdminProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  return (
    <AntdRegistry>
      <ConfigProvider theme={adminTheme} locale={ANTD_LOCALE[locale]}>
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
