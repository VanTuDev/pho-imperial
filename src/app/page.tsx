import { AboutSection } from "@/components/about-section";
import { BottomNav } from "@/components/bottom-nav";
import { FeaturedDishes } from "@/components/featured-dishes";
import { Hero } from "@/components/hero";
import { MenuCarousel } from "@/components/menu-carousel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="m-2 min-h-screen border border-primary/20">
      <SiteHeader />
      <main className="pt-16">
        <Hero />
        <AboutSection />
        <FeaturedDishes />
        <MenuCarousel />
      </main>
      <SiteFooter />
      <BottomNav />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}
