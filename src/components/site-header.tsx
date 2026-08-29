"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/store/cart-store";
import { useTranslations } from "@/i18n/provider";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { CloseIcon, MenuIcon, ShoppingBagIcon } from "./icons";

const navLinks = [
  { href: "/order", key: "nav.menu" as const },
  { href: "/#about", key: "nav.about" as const },
  { href: "/#contact", key: "nav.contact" as const },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const t = useTranslations();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-outline-variant/30 bg-background/90 backdrop-blur-md">
      <div className="container-imperial flex h-16 items-center justify-between px-margin-mobile md:px-section">
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center text-primary transition-opacity hover:opacity-80 md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
          aria-label={t("header.openMenu")}
        >
          {isMenuOpen ? (
            <CloseIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </button>

        <nav className="hidden items-center gap-gutter md:flex">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                index === 0
                  ? "border-b-2 border-primary pb-1 font-body text-xs font-semibold uppercase tracking-widest text-primary"
                  : "font-body text-xs font-semibold uppercase tracking-widest text-on-surface-variant transition-colors duration-300 hover:text-primary-fixed-dim"
              }
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="font-display text-xl uppercase tracking-widest text-primary md:absolute md:left-1/2 md:-translate-x-1/2"
        >
          Phở Imperial
        </Link>

        <div className="flex items-center gap-3">
          <LanguageToggle className="hidden md:flex" />
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center text-primary transition-opacity hover:opacity-80"
            aria-label={t("header.cart")}
          >
            <ShoppingBagIcon className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-nav"
          className="flex flex-col gap-1 border-t border-outline-variant/30 bg-surface-container-lowest px-margin-mobile py-4 md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="py-2 font-body text-xs font-semibold uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
            >
              {t(link.key)}
            </Link>
          ))}
          <div className="mt-3 border-t border-outline-variant/20 pt-3">
            <LanguageToggle />
          </div>
        </nav>
      )}
    </header>
  );
}
