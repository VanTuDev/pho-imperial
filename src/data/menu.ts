export interface Dish {
  slug: string;
  name: string;
  price: number; // numeric price in ₽ for cart math
  priceLabel: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
}

export const categories = [
  "Khai vị",
  "Phở",
  "Mì",
  "Cơm",
  "Đồ uống",
] as const;

export type Category = (typeof categories)[number];

/**
 * Full menu used on the /order page.
 * Images come from public/images/*.png.
 */
export const allDishes: Dish[] = [
  // ── Khai vị ─────────────────────────────────────────────
  {
    slug: "nem-tom",
    name: "NEM TÔM",
    price: 480,
    priceLabel: "480 ₽",
    category: "Khai vị",
    description:
      "Хрустящие блинчики из рисовой бумаги с начинкой из креветок, свинины, грибов шиитаке и стеклянной лапши. Подаются с соусом ныок мам.",
    image: "/images/nem-tom.png",
    imageAlt: "Хрустящие вьетнамские нем с креветками",
  },
  {
    slug: "nem-ga",
    name: "NEM GÀ",
    price: 420,
    priceLabel: "420 ₽",
    category: "Khai vị",
    description:
      "Нежные спринг-роллы с начинкой из курицы, грибов и овощей, обжаренные до золотистой корочки.",
    image: "/images/nem-ga.png",
    imageAlt: "Золотистые нем с курицей",
  },
  {
    slug: "goi-cuon",
    name: "GỎI CUỐN",
    price: 380,
    priceLabel: "380 ₽",
    category: "Khai vị",
    description:
      "Свежие спринг-роллы из рисовой бумаги с креветками, зеленью, рисовой лапшой. Подаются с арахисовым соусом.",
    image: "/images/goi-cuon.png",
    imageAlt: "Свежие спринг-роллы гои куон",
  },

  // ── Phở ─────────────────────────────────────────────────
  {
    slug: "pho-bo",
    name: "PHỞ BÒ",
    price: 550,
    priceLabel: "550 ₽",
    category: "Phở",
    description:
      "Классический вьетнамский суп с рисовой лапшой, нежной говядиной, свежей зеленью и насыщенным бульоном, сваренным на кости.",
    image: "/images/pho-bo.png",
    imageAlt: "Дымящаяся тарелка Фо Бо с говядиной и рисовой лапшой",
  },

  // ── Mì ──────────────────────────────────────────────────
  {
    slug: "bun-thit-nuong",
    name: "BÚN THỊT NƯỚNG",
    price: 550,
    priceLabel: "550 ₽",
    category: "Mì",
    description:
      "Лапша бун, мясо на выбор, овощи, ростки бобов, огурцы и зелень, кисло-сладкий рыбный соус.",
    image: "/images/bun-thit-nuong.png",
    imageAlt: "Бун Тхит Ныонг — вермишель со свининой на гриле",
  },
  {
    slug: "pad-thai",
    name: "PAD THÁI",
    price: 520,
    priceLabel: "520 ₽",
    category: "Mì",
    description:
      "Обжаренная рисовая лапша с креветками, арахисом, яйцом, ростками бобов и лаймом.",
    image: "/images/pad-thai.png",
    imageAlt: "Пад Тай — тайская обжаренная лапша",
  },

  // ── Cơm ─────────────────────────────────────────────────
  {
    slug: "com-bo-luc-lac",
    name: "CƠM BÒ LÚC LẮC",
    price: 600,
    priceLabel: "600 ₽",
    category: "Cơm",
    description:
      "\"Встряхнутая\" говядина. Сочные кусочки говяжьей вырезки, обжаренные в воке с овощами, подаются с ароматным рисом.",
    image: "/images/com-bo-luc-lac.png",
    imageAlt: "Ком Бо Лук Лак — говядина с рисом",
  },
  {
    slug: "com-rang",
    name: "CƠM RANG",
    price: 480,
    priceLabel: "480 ₽",
    category: "Cơm",
    description:
      "Жареный рис с овощами, яйцом и соевым соусом. Классика вьетнамской кухни.",
    image: "/images/com-rang.png",
    imageAlt: "Ком Ранг — вьетнамский жареный рис",
  },
];

/**
 * Legacy export — landing-page featured dishes.
 * Now derived from the canonical allDishes list.
 */
export const featuredDishes = allDishes.filter((d) =>
  ["pho-bo", "com-bo-luc-lac", "bun-thit-nuong"].includes(d.slug),
);
