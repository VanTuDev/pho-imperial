export interface MenuPage {
  page: number;
  src: string;
  section: string;
}

/**
 * Scanned pages of the physical restaurant menu (public/Menu/1.png … 13.png).
 * Page 14 is an intentionally blank back-cover and is excluded here.
 */
export const menuPages: MenuPage[] = [
  { page: 1, src: "/Menu/1.png", section: "Суп" },
  { page: 2, src: "/Menu/2.png", section: "Суп" },
  { page: 3, src: "/Menu/3.png", section: "Рисовая лапша" },
  { page: 4, src: "/Menu/4.png", section: "Рисовые блюда" },
  { page: 5, src: "/Menu/5.png", section: "Рисовые блюда" },
  { page: 6, src: "/Menu/6.png", section: "Лапша вок" },
  { page: 7, src: "/Menu/7.png", section: "Лапша вок" },
  { page: 8, src: "/Menu/8.png", section: "Салат" },
  { page: 9, src: "/Menu/9.png", section: "Спринг-роллы" },
  { page: 10, src: "/Menu/10.png", section: "Смузи и кофе" },
  { page: 11, src: "/Menu/11.png", section: "Молочный чай" },
  { page: 12, src: "/Menu/12.png", section: "Закуски" },
  { page: 13, src: "/Menu/13.png", section: "Ещё блюда" },
];
