"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { useCart } from "@/store/cart-store";
import { useTranslations, type MessageKey } from "@/i18n/provider";
import { HomeIcon, ReceiptIcon, RestaurantMenuIcon, ShoppingBagIcon } from "./icons";

interface NavItem {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  key: MessageKey;
  href: string;
  match: (pathname: string) => boolean;
  badge?: boolean;
}

const items: NavItem[] = [
  { icon: HomeIcon, key: "nav.home", href: "/", match: (p) => p === "/" },
  {
    icon: RestaurantMenuIcon,
    key: "nav.menu",
    href: "/order",
    match: (p) => p === "/order",
  },
  {
    icon: ShoppingBagIcon,
    key: "cart.title",
    href: "/cart",
    match: (p) => p === "/cart",
    badge: true,
  },
  {
    icon: ReceiptIcon,
    key: "nav.orders",
    href: "/orders",
    match: (p) => p.startsWith("/orders"),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations();
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around border-t border-outline-variant/30 bg-surface px-2 pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map(({ icon: Icon, key, href, match, badge }) => {
        const isActive = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={
              isActive
                ? "flex w-1/4 scale-105 flex-col items-center justify-center font-bold text-primary duration-200"
                : "flex w-1/4 flex-col items-center justify-center text-on-surface-variant transition-colors hover:text-secondary"
            }
          >
            <span className="relative mb-1">
              <Icon className="h-6 w-6" />
              {badge && totalItems > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary">
                  {totalItems}
                </span>
              )}
            </span>
            <span className="font-body text-[10px] uppercase tracking-wide">
              {t(key)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
