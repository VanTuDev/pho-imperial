import type { Localized } from "@/i18n/localized";

export interface MenuPage {
  page: number;
  src: string;
  section: Localized;
}

const section = (ru: string, en: string, vi: string): Localized => ({ ru, en, vi });

/**
 * Scanned pages of the physical restaurant menu (public/Menu/*.png).
 * Page 8 is missing from the scan set and page 14 is a blank back-cover;
 * both are excluded here. `page` keeps the original numbering.
 */
export const menuPages: MenuPage[] = [
  { page: 1, src: "/Menu/1.png", section: section("Супы", "Soup", "Món nước") },
  { page: 2, src: "/Menu/2.png", section: section("Супы", "Soup", "Món nước") },
  { page: 3, src: "/Menu/3.png", section: section("Рисовая лапша", "Rice noodles", "Bún, phở") },
  { page: 4, src: "/Menu/4.png", section: section("Блюда с рисом", "Rice dishes", "Món cơm") },
  { page: 5, src: "/Menu/5.png", section: section("Блюда с рисом", "Rice dishes", "Món cơm") },
  { page: 6, src: "/Menu/6.png", section: section("Лапша вок", "Wok noodles", "Mì xào") },
  { page: 7, src: "/Menu/7.png", section: section("Лапша вок", "Wok noodles", "Mì xào") },
  { page: 9, src: "/Menu/9.png", section: section("Спринг-роллы", "Spring rolls", "Nem, gỏi cuốn") },
  { page: 10, src: "/Menu/10.png", section: section("Смузи и кофе", "Smoothies & coffee", "Sinh tố & cà phê") },
  { page: 11, src: "/Menu/11.png", section: section("Молочный чай", "Milk tea", "Trà sữa") },
  { page: 12, src: "/Menu/12.png", section: section("Закуски", "Snacks", "Ăn vặt") },
  { page: 13, src: "/Menu/13.png", section: section("Другие блюда", "More dishes", "Món khác") },
];
