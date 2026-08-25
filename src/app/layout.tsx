import type { Metadata } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
import { CartProvider } from "@/store/cart-store";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin", "cyrillic", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PHỞ IMPERIAL — Premium Vietnamese Cuisine",
  description:
    "Аутентичная вьетнамская кухня класса люкс в самом сердце России. Императорские рецепты, изысканная подача.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`dark ${ebGaramond.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-on-background" suppressHydrationWarning>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
