import type { Localized } from "@/i18n/localized";

export interface MenuPage {
  page: number;
  src: string;
  section: Localized;
}

const section = (en: string, fr: string): Localized => ({ en, fr });

/**
 * Scanned pages of the physical restaurant menu (public/Menu/*.png).
 * Page 8 is missing from the scan set and page 14 is a blank back-cover;
 * both are excluded here. `page` keeps the original numbering.
 */
export const menuPages: MenuPage[] = [
  { page: 1, src: "/Menu/1.png", section: section("Soup", "Soupe") },
  { page: 2, src: "/Menu/2.png", section: section("Soup", "Soupe") },
  { page: 3, src: "/Menu/3.png", section: section("Rice noodles", "Nouilles de riz") },
  { page: 4, src: "/Menu/4.png", section: section("Rice dishes", "Plats de riz") },
  { page: 5, src: "/Menu/5.png", section: section("Rice dishes", "Plats de riz") },
  { page: 6, src: "/Menu/6.png", section: section("Wok noodles", "Nouilles au wok") },
  { page: 7, src: "/Menu/7.png", section: section("Wok noodles", "Nouilles au wok") },
  { page: 9, src: "/Menu/9.png", section: section("Spring rolls", "Rouleaux de printemps") },
  { page: 10, src: "/Menu/10.png", section: section("Smoothies & coffee", "Smoothies et café") },
  { page: 11, src: "/Menu/11.png", section: section("Milk tea", "Thé au lait") },
  { page: 12, src: "/Menu/12.png", section: section("Snacks", "En-cas") },
  { page: 13, src: "/Menu/13.png", section: section("More dishes", "Autres plats") },
];
