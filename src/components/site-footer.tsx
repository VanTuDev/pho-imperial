"use client";

import { useTranslations, type MessageKey } from "@/i18n/provider";

const footerLinks: { href: string; key: MessageKey }[] = [
  { href: "#privacy", key: "footer.privacy" },
  { href: "#terms", key: "footer.terms" },
  { href: "#booking", key: "footer.booking" },
  { href: "#press", key: "footer.press" },
];

export function SiteFooter() {
  const t = useTranslations();

  return (
    <footer
      id="contact"
      className="container-imperial flex w-full flex-col items-start gap-gutter border-t border-outline-variant px-margin-mobile py-12 md:flex-row md:justify-between md:px-section"
    >
      <div className="font-display text-2xl text-primary">Phở Imperial</div>
      <div className="font-body text-sm text-primary-fixed-dim">
        {t("footer.rights", { year: new Date().getFullYear() })}
      </div>
      <div className="flex flex-col gap-2">
        {footerLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="font-body text-xs uppercase tracking-widest text-on-surface-variant opacity-80 transition-opacity hover:text-primary hover:opacity-100"
          >
            {t(link.key)}
          </a>
        ))}
      </div>
    </footer>
  );
}
