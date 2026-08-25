const footerLinks = [
  { href: "#privacy", label: "Privacy Policy" },
  { href: "#terms", label: "Terms of Service" },
  { href: "#booking", label: "Booking" },
  { href: "#press", label: "Press Kit" },
];

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="container-imperial flex w-full flex-col items-start gap-gutter border-t border-outline-variant px-margin-mobile py-12 md:flex-row md:justify-between md:px-section"
    >
      <div className="font-display text-2xl text-primary">Phở Imperial</div>
      <div className="font-body text-sm text-primary-fixed-dim">
        © 2026 Phở Imperial. Premium Vietnamese Cuisine in Russia.
      </div>
      <div className="flex flex-col gap-2">
        {footerLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="font-body text-xs uppercase tracking-widest text-on-surface-variant opacity-80 transition-opacity hover:text-primary hover:opacity-100"
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
