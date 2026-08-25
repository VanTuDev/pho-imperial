"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/store/cart-store";
import { CloseIcon, MenuIcon, ShoppingBagIcon } from "./icons";

const navLinks = [
  { href: "/order", label: "Menu" },
  { href: "#about", label: "About Us" },
  { href: "#locations", label: "Locations" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-outline-variant/30 bg-background/90 backdrop-blur-md">
      <div className="container-imperial flex h-16 items-center justify-between px-margin-mobile md:px-section">
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center text-primary transition-opacity hover:opacity-80 md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
          aria-label="Открыть меню навигации"
        >
          {isMenuOpen ? (
            <CloseIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </button>

        <nav className="hidden gap-gutter md:flex">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              className={
                index === 0
                  ? "border-b-2 border-primary pb-1 font-body text-xs font-semibold uppercase tracking-widest text-primary"
                  : "font-body text-xs font-semibold uppercase tracking-widest text-on-surface-variant transition-colors duration-300 hover:text-primary-fixed-dim"
              }
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/"
          className="font-display text-xl uppercase tracking-widest text-primary md:absolute md:left-1/2 md:-translate-x-1/2"
        >
          Phở Imperial
        </Link>

        <Link
          href="/order"
          className="relative flex h-10 w-10 items-center justify-center text-primary transition-opacity hover:opacity-80"
          aria-label="Корзина заказа"
        >
          <ShoppingBagIcon className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-nav"
          className="flex flex-col gap-1 border-t border-outline-variant/30 bg-surface-container-lowest px-margin-mobile py-4 md:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="py-2 font-body text-xs font-semibold uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
