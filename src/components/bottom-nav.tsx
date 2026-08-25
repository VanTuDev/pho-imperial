"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, PersonIcon, ReceiptIcon, RestaurantMenuIcon } from "./icons";
import type { SVGProps, ComponentType } from "react";

interface NavItem {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
}

const items: NavItem[] = [
  { icon: HomeIcon, label: "Home", href: "/" },
  { icon: RestaurantMenuIcon, label: "Menu", href: "/order" },
  { icon: ReceiptIcon, label: "Orders", href: "/orders" },
  { icon: PersonIcon, label: "Profile", href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around border-t border-outline-variant/30 bg-surface px-2 pb-safe md:hidden">
      {items.map(({ icon: Icon, label, href }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={label}
            href={href}
            className={
              isActive
                ? "flex w-1/4 scale-110 flex-col items-center justify-center text-primary font-bold duration-200"
                : "flex w-1/4 flex-col items-center justify-center text-on-surface-variant transition-colors hover:text-secondary"
            }
          >
            <Icon className="mb-1 h-6 w-6" />
            <span className="font-body text-[10px] uppercase tracking-wide">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
