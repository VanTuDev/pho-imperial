import type { Localized } from "@/i18n/localized";

/** Clean client-side shapes. `api.ts` normalises raw backend docs into these. */

export interface Category {
  id: string;
  name: Localized;
  slug: string;
  sortOrder: number;
  image: string | null;
}

export interface DishVariant {
  id: string;
  name: Localized;
  price: number;
}

export interface MenuItem {
  id: string;
  name: Localized;
  description: Localized;
  categoryId: string;
  /** Base price; also the "from" price when variants exist. */
  price: number;
  image: string | null;
  imageAlt: Localized | null;
  variants: DishVariant[];
  available: boolean;
  featured: boolean;
  sortOrder: number;
}

export interface TableInfo {
  code: string;
  label: string;
  type: "standard" | "vip";
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem {
  menuItemId: string;
  name: Localized;
  variantId: string | null;
  variantName: Localized | null;
  unitPrice: number;
  quantity: number;
  note: string;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  table: { code: string; label: string; type: "standard" | "vip" };
  customer: { name: string; phone: string };
  items: OrderItem[];
  note: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface CreateOrderPayload {
  tableCode: string;
  customer?: { name?: string; phone?: string };
  note?: string;
  items: {
    menuItemId: string;
    variantId: string | null;
    quantity: number;
    note?: string;
  }[];
}
