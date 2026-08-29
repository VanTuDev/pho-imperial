"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar, Drawer, Dropdown, Grid, Layout, Menu, Spin } from "antd";
import {
  AppstoreOutlined,
  CoffeeOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuOutlined,
  ProfileOutlined,
  TableOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useI18n, type MessageKey } from "@/i18n/provider";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useAdminAuth } from "./admin-auth";

const { Header, Sider, Content } = Layout;

interface NavItem {
  href: string;
  key: MessageKey;
  icon: React.ReactNode;
  ownerOnly?: boolean;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/admin", key: "admin.nav.dashboard", icon: <DashboardOutlined />, exact: true },
  { href: "/admin/orders", key: "admin.nav.orders", icon: <ProfileOutlined /> },
  { href: "/admin/menu", key: "admin.nav.menu", icon: <CoffeeOutlined /> },
  { href: "/admin/categories", key: "admin.nav.categories", icon: <AppstoreOutlined /> },
  { href: "/admin/tables", key: "admin.nav.tables", icon: <TableOutlined /> },
  { href: "/admin/admins", key: "admin.nav.admins", icon: <TeamOutlined />, ownerOnly: true },
];

function activeHref(pathname: string): string {
  // Longest matching nav href wins (so /admin/menu beats /admin for /admin/menu/x).
  let best = "";
  for (const item of NAV) {
    const hit = item.exact ? pathname === item.href : pathname.startsWith(item.href);
    if (hit && item.href.length > best.length) best = item.href;
  }
  return best;
}

const FullPageSpin = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Spin size="large" />
  </div>
);

/**
 * Wraps every /admin page except /admin/login. Redirects to the login page when
 * there is no session, then renders the antd sidebar shell.
 */
export function AdminFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { admin, loading } = useAdminAuth();
  const screens = Grid.useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isDesktop = screens.lg ?? true;
  const isLogin = pathname === "/admin/login";
  const needsLogin = !isLogin && !loading && !admin;

  useEffect(() => {
    if (needsLogin) router.replace("/admin/login");
  }, [needsLogin, router]);

  const menuItems = useMemo(
    () =>
      NAV.filter((n) => !n.ownerOnly || admin?.role === "owner").map((n) => ({
        key: n.href,
        icon: n.icon,
        label: <Link href={n.href}>{t(n.key)}</Link>,
      })),
    [admin?.role, t],
  );

  if (isLogin) return <>{children}</>;
  if (loading || needsLogin || !admin) return <FullPageSpin />;

  const selectedKey = activeHref(pathname);
  const nav = (
    <AdminNav items={menuItems} selectedKey={selectedKey} onNavigate={() => setDrawerOpen(false)} />
  );

  const SIDER_WIDTH = 248;

  return (
    <Layout style={{ minHeight: "100vh" }} hasSider={isDesktop}>
      {isDesktop ? (
        <Sider
          width={SIDER_WIDTH}
          breakpoint="lg"
          collapsedWidth={0}
          trigger={null}
          style={{
            position: "fixed",
            insetInlineStart: 0,
            top: 0,
            bottom: 0,
            height: "100vh",
            overflow: "auto",
            zIndex: 20,
          }}
        >
          {nav}
        </Sider>
      ) : (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={SIDER_WIDTH}
          styles={{ body: { padding: 0 }, header: { display: "none" } }}
        >
          {nav}
        </Drawer>
      )}

      <Layout style={{ marginInlineStart: isDesktop ? SIDER_WIDTH : 0 }}>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingInline: 16,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          {!isDesktop && (
            <MenuOutlined
              onClick={() => setDrawerOpen(true)}
              style={{ fontSize: 18, cursor: "pointer" }}
              aria-label={t("admin.nav.openMenu")}
            />
          )}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <LanguageToggle />
            <UserMenu name={admin.name} role={admin.role} email={admin.email} />
          </div>
        </Header>
        <Content style={{ padding: 24, maxWidth: 1160, width: "100%", margin: "0 auto" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

const AdminNav = memo(function AdminNav({
  items,
  selectedKey,
  onNavigate,
}: {
  items: { key: string; icon: React.ReactNode; label: React.ReactNode }[];
  selectedKey: string;
  onNavigate: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Link
        href="/admin"
        style={{
          display: "flex",
          alignItems: "center",
          height: 64,
          paddingInline: 24,
          fontFamily: "var(--font-eb-garamond), serif",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--color-primary)",
          fontSize: 20,
        }}
      >
        BunPho
      </Link>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={items}
        onClick={onNavigate}
        style={{ borderInlineEnd: "none", flex: 1 }}
      />
    </div>
  );
});

function UserMenu({
  name,
  role,
  email,
}: {
  name: string;
  role: "owner" | "admin";
  email: string;
}) {
  const { t } = useI18n();
  const { logout } = useAdminAuth();
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: "who",
            label: (
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontWeight: 600 }}>{name}</div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>
                  {role === "owner" ? t("admin.nav.owner") : email}
                </div>
              </div>
            ),
            disabled: true,
          },
          { type: "divider" },
          {
            key: "logout",
            icon: <LogoutOutlined />,
            danger: true,
            label: t("admin.nav.logout"),
            onClick: logout,
          },
        ],
      }}
    >
      <Avatar style={{ backgroundColor: "rgba(242,202,80,0.15)", color: "var(--color-primary)", cursor: "pointer" }}>
        {initial}
      </Avatar>
    </Dropdown>
  );
}
