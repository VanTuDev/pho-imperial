import type { Localized } from "@/i18n/localized";

/* ─── Types ─────────────────────────────────────────────── */

export const categoryIds = [
  "starters",
  "pho",
  "noodles",
  "rice",
  "drinks",
] as const;

export type CategoryId = (typeof categoryIds)[number];

export interface Category {
  id: CategoryId;
  label: Localized;
}

export interface DishVariant {
  id: string;
  name: Localized;
  price: number;
}

export interface Dish {
  slug: string;
  name: Localized;
  description: Localized;
  category: CategoryId;
  /** Optional photo from `public/images`. Cards show a monogram when absent. */
  image?: string;
  imageAlt?: Localized;
  /** Price when the dish has no variants; also the "from" price otherwise. */
  basePrice: number;
  /** When present, the customer must pick one and it sets the line price. */
  variants?: DishVariant[];
}

/* ─── Helpers ───────────────────────────────────────────── */

/** A name/label that reads identically in every locale (proper nouns). */
const mono = (value: string): Localized => ({ en: value, fr: value });

export const categories: Category[] = [
  { id: "starters", label: { en: "Starters", fr: "Entrées" } },
  { id: "pho", label: mono("Phở") },
  { id: "noodles", label: { en: "Noodles", fr: "Nouilles" } },
  { id: "rice", label: { en: "Rice", fr: "Riz" } },
  { id: "drinks", label: { en: "Drinks", fr: "Boissons" } },
];

export function categoryLabel(id: CategoryId): Localized {
  return categories.find((c) => c.id === id)?.label ?? mono(id);
}

/* ─── Menu ──────────────────────────────────────────────── */

export const allDishes: Dish[] = [
  /* ── Starters ─────────────────────────────────────────── */
  {
    slug: "nem-tom",
    name: mono("Nem Tôm"),
    category: "starters",
    basePrice: 480,
    image: "/images/nem-tom.png",
    imageAlt: {
      en: "Crispy Vietnamese shrimp spring rolls",
      fr: "Nems croustillants aux crevettes",
    },
    description: {
      en: "Crisp rice-paper rolls filled with prawns, pork, shiitake and glass noodles, served with nước mắm dipping sauce.",
      fr: "Rouleaux de galette de riz croustillants garnis de crevettes, porc, shiitake et vermicelles, servis avec une sauce nước mắm.",
    },
  },
  {
    slug: "nem-ga",
    name: mono("Nem Gà"),
    category: "starters",
    basePrice: 420,
    image: "/images/nem-ga.png",
    imageAlt: {
      en: "Golden fried chicken spring rolls",
      fr: "Nems dorés au poulet",
    },
    description: {
      en: "Delicate spring rolls of chicken, mushrooms and vegetables, fried to a golden crunch.",
      fr: "Nems délicats au poulet, champignons et légumes, frits jusqu'à une croûte dorée.",
    },
  },
  {
    slug: "goi-cuon",
    name: mono("Gỏi Cuốn"),
    category: "starters",
    basePrice: 380,
    image: "/images/goi-cuon.png",
    imageAlt: {
      en: "Fresh summer rolls with prawns and herbs",
      fr: "Rouleaux de printemps frais aux crevettes et aux herbes",
    },
    description: {
      en: "Fresh rice-paper rolls with prawns, herbs and rice vermicelli, served with peanut sauce.",
      fr: "Rouleaux de galette de riz frais aux crevettes, herbes et vermicelles de riz, servis avec une sauce cacahuète.",
    },
  },

  /* ── Phở & soups ──────────────────────────────────────── */
  {
    slug: "pho-bo",
    name: mono("Phở Bò"),
    category: "pho",
    basePrice: 550,
    image: "/images/pho-bo.png",
    imageAlt: {
      en: "Steaming bowl of Phở Bò with beef and rice noodles",
      fr: "Bol fumant de Phở Bò au bœuf et nouilles de riz",
    },
    description: {
      en: "Beef, rice noodles, bean sprouts, fresh herbs and spring onion in a rich bone broth.",
      fr: "Bœuf, nouilles de riz, pousses de soja, herbes fraîches et oignon vert dans un bouillon d'os corsé.",
    },
  },
  {
    slug: "pho-ga",
    name: mono("Phở Gà"),
    category: "pho",
    basePrice: 550,
    image: "/images/pho-bo.png",
    imageAlt: {
      en: "Chicken Phở with rice noodles and herbs",
      fr: "Phở au poulet, nouilles de riz et herbes",
    },
    description: {
      en: "Chicken, rice noodles, bean sprouts, herbs and spring onion in a clear aromatic broth.",
      fr: "Poulet, nouilles de riz, pousses de soja, herbes et oignon vert dans un bouillon clair et parfumé.",
    },
  },
  {
    slug: "pho-sot-vang",
    name: mono("Phở Sốt Vang"),
    category: "pho",
    basePrice: 590,
    image: "/images/pho-bo.png",
    imageAlt: {
      en: "Braised beef Phở in red wine sauce",
      fr: "Phở au bœuf braisé, sauce au vin rouge",
    },
    description: {
      en: "Slow-braised beef, rice noodles, bean sprouts, herbs and spring onion in a spiced wine-dark broth.",
      fr: "Bœuf braisé longuement, nouilles de riz, pousses de soja, herbes et oignon vert dans un bouillon épicé au vin.",
    },
  },
  {
    slug: "bun-cha-chan",
    name: mono("Bún Chả Chan"),
    category: "pho",
    basePrice: 550,
    image: "/images/pho-bo.png",
    imageAlt: {
      en: "Rice-noodle soup with grilled pork and meatballs",
      fr: "Soupe de nouilles de riz au porc grillé et boulettes",
    },
    description: {
      en: "Rice-noodle soup with flame-grilled pork, meatballs, spring onion and crispy shallots.",
      fr: "Soupe de nouilles de riz au porc grillé à la flamme, boulettes, oignon vert et échalotes croustillantes.",
    },
  },
  {
    slug: "tom-yum",
    name: mono("Tom Yum"),
    category: "pho",
    basePrice: 550,
    description: {
      en: "Chicken broth on coconut milk with rice, mushrooms and herbs.",
      fr: "Bouillon de poulet au lait de coco, riz, champignons et herbes.",
    },
    variants: [
      { id: "chicken", name: { en: "Chicken", fr: "Poulet" }, price: 550 },
      { id: "shrimp", name: { en: "Shrimp", fr: "Crevettes" }, price: 590 },
    ],
  },

  /* ── Noodles ──────────────────────────────────────────── */
  {
    slug: "bun-thit-nuong",
    name: mono("Bún Thịt Nướng"),
    category: "noodles",
    basePrice: 550,
    image: "/images/bun-thit-nuong.png",
    imageAlt: {
      en: "Rice vermicelli with grilled pork",
      fr: "Vermicelles de riz au porc grillé",
    },
    description: {
      en: "Bún noodles, grilled meat, vegetables, bean sprouts, cucumber and herbs with a sweet-and-sour fish sauce.",
      fr: "Vermicelles bún, viande grillée, légumes, pousses de soja, concombre et herbes, sauce de poisson aigre-douce.",
    },
    variants: [
      { id: "pork", name: { en: "Pork", fr: "Porc" }, price: 550 },
      { id: "chicken", name: { en: "Chicken", fr: "Poulet" }, price: 550 },
      { id: "beef", name: { en: "Beef", fr: "Bœuf" }, price: 590 },
    ],
  },
  {
    slug: "bun-bo-nam-bo",
    name: mono("Bún Bò Nam Bộ"),
    category: "noodles",
    basePrice: 550,
    image: "/images/bun-thit-nuong.png",
    imageAlt: {
      en: "Southern-style noodle salad with beef",
      fr: "Salade de nouilles du Sud au bœuf",
    },
    description: {
      en: "Rice vermicelli, carrot, bean sprouts, cucumber, herbs and peanuts with a sweet-and-sour sauce.",
      fr: "Vermicelles de riz, carotte, pousses de soja, concombre, herbes et cacahuètes, sauce aigre-douce.",
    },
    variants: [
      { id: "beef", name: { en: "Beef", fr: "Bœuf" }, price: 550 },
      { id: "chicken", name: { en: "Chicken", fr: "Poulet" }, price: 550 },
    ],
  },
  {
    slug: "pad-thai",
    name: mono("Pad Thái"),
    category: "noodles",
    basePrice: 520,
    image: "/images/pad-thai.png",
    imageAlt: {
      en: "Stir-fried rice noodles Pad Thai",
      fr: "Nouilles de riz sautées Pad Thaï",
    },
    description: {
      en: "Stir-fried rice noodles with prawns, peanuts, egg, bean sprouts and lime.",
      fr: "Nouilles de riz sautées aux crevettes, cacahuètes, œuf, pousses de soja et citron vert.",
    },
  },
  {
    slug: "mi-xao",
    name: mono("Mì Xào"),
    category: "noodles",
    basePrice: 550,
    image: "/images/pad-thai.png",
    imageAlt: {
      en: "Wok-fried egg noodles with vegetables",
      fr: "Nouilles aux œufs sautées au wok avec légumes",
    },
    description: {
      en: "Wok-fried egg noodles with vegetables, bean sprouts and spring onion in a savoury sauce.",
      fr: "Nouilles aux œufs sautées au wok avec légumes, pousses de soja et oignon vert, sauce savoureuse.",
    },
    variants: [
      { id: "chicken", name: { en: "Chicken", fr: "Poulet" }, price: 550 },
      { id: "beef", name: { en: "Beef", fr: "Bœuf" }, price: 590 },
      { id: "shrimp", name: { en: "Shrimp", fr: "Crevettes" }, price: 590 },
    ],
  },

  /* ── Rice ─────────────────────────────────────────────── */
  {
    slug: "com-bo-luc-lac",
    name: mono("Cơm Bò Lúc Lắc"),
    category: "rice",
    basePrice: 600,
    image: "/images/com-bo-luc-lac.png",
    imageAlt: {
      en: "Shaking beef with steamed rice",
      fr: "Bœuf sauté « lúc lắc » avec riz vapeur",
    },
    description: {
      en: "\"Shaking\" beef — tender cubes of tenderloin wok-tossed with vegetables, served with fragrant rice.",
      fr: "Bœuf « secoué » — cubes de filet tendres sautés au wok avec des légumes, servis avec un riz parfumé.",
    },
  },
  {
    slug: "com-rang",
    name: mono("Cơm Rang"),
    category: "rice",
    basePrice: 480,
    image: "/images/com-rang.png",
    imageAlt: {
      en: "Vietnamese fried rice",
      fr: "Riz frit vietnamien",
    },
    description: {
      en: "Fried rice with vegetables, egg and soy sauce.",
      fr: "Riz frit aux légumes, œuf et sauce soja.",
    },
    variants: [
      { id: "vegetable", name: { en: "Vegetable", fr: "Légumes" }, price: 480 },
      { id: "chicken", name: { en: "Chicken", fr: "Poulet" }, price: 520 },
      { id: "seafood", name: { en: "Seafood", fr: "Fruits de mer" }, price: 590 },
    ],
  },
  {
    slug: "com-ga",
    name: mono("Cơm Gà"),
    category: "rice",
    basePrice: 520,
    image: "/images/com-rang.png",
    imageAlt: {
      en: "Chicken with rice and herbs",
      fr: "Poulet avec riz et herbes",
    },
    description: {
      en: "Marinated chicken with fragrant rice, pickles and fresh herbs.",
      fr: "Poulet mariné avec riz parfumé, pickles et herbes fraîches.",
    },
  },

  /* ── Drinks ───────────────────────────────────────────── */
  {
    slug: "ca-phe-sua",
    name: mono("Cà Phê Sữa"),
    category: "drinks",
    basePrice: 220,
    description: {
      en: "Vietnamese drip coffee with sweetened condensed milk.",
      fr: "Café vietnamien filtre au lait concentré sucré.",
    },
    variants: [
      { id: "hot", name: { en: "Hot", fr: "Chaud" }, price: 220 },
      { id: "iced", name: { en: "Iced", fr: "Glacé" }, price: 250 },
    ],
  },
  {
    slug: "tra-sen",
    name: mono("Trà Sen"),
    category: "drinks",
    basePrice: 180,
    description: {
      en: "Green tea scented with lotus blossom, served in a pot.",
      fr: "Thé vert parfumé à la fleur de lotus, servi en théière.",
    },
  },
  {
    slug: "sinh-to-xoai",
    name: mono("Sinh Tố Xoài"),
    category: "drinks",
    basePrice: 280,
    description: {
      en: "Fresh mango smoothie blended with yoghurt and a touch of lime.",
      fr: "Smoothie de mangue fraîche mixé au yaourt avec une pointe de citron vert.",
    },
  },
];

/* ─── Derived helpers ───────────────────────────────────── */

export function getDish(slug: string): Dish | undefined {
  return allDishes.find((d) => d.slug === slug);
}

export function defaultVariant(dish: Dish): DishVariant | undefined {
  return dish.variants?.[0];
}

export function getVariant(dish: Dish, variantId?: string | null): DishVariant | undefined {
  if (!dish.variants) return undefined;
  return dish.variants.find((v) => v.id === variantId) ?? dish.variants[0];
}

/** Unit price for a dish + optional chosen variant. */
export function unitPrice(dish: Dish, variantId?: string | null): number {
  const variant = getVariant(dish, variantId);
  return variant?.price ?? dish.basePrice;
}

export function priceRange(dish: Dish): { min: number; max: number } {
  if (!dish.variants || dish.variants.length === 0) {
    return { min: dish.basePrice, max: dish.basePrice };
  }
  const prices = dish.variants.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Landing-page highlights, derived from the canonical list. */
export const featuredSlugs = ["pho-bo", "com-bo-luc-lac", "bun-thit-nuong"];
export const featuredDishes = featuredSlugs
  .map((slug) => getDish(slug))
  .filter((d): d is Dish => Boolean(d));
