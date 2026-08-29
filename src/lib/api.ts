import { API_BASE, ApiError, createClient } from "./http";
import type {
  Category,
  CreateOrderPayload,
  DishVariant,
  MenuItem,
  Order,
  OrderItem,
  TableInfo,
} from "./types";

export { API_BASE, ApiError };

/** Public (unauthenticated) API client for the customer-facing site. */
const http = createClient();

/* ─── Normalisers: raw backend docs → clean client shapes ─── */

type Raw = Record<string, unknown>;

const asId = (v: unknown): string =>
  typeof v === "string" ? v : v && typeof v === "object" ? String(v) : "";

function normVariant(raw: Raw): DishVariant {
  return {
    id: asId(raw._id ?? raw.id),
    name: (raw.name as DishVariant["name"]) ?? { ru: "", en: "" },
    price: Number(raw.price ?? 0),
  };
}

export function normalizeCategory(raw: Raw): Category {
  const image = raw.image as Raw | null | undefined;
  return {
    id: asId(raw._id ?? raw.id),
    name: (raw.name as Category["name"]) ?? { ru: "", en: "" },
    slug: String(raw.slug ?? ""),
    sortOrder: Number(raw.sortOrder ?? 0),
    image: image?.url ? String(image.url) : null,
  };
}

export function normalizeMenuItem(raw: Raw): MenuItem {
  const image = raw.image as Raw | null | undefined;
  return {
    id: asId(raw._id ?? raw.id),
    name: (raw.name as MenuItem["name"]) ?? { ru: "", en: "" },
    description: (raw.description as MenuItem["description"]) ?? { ru: "", en: "" },
    categoryId: asId(raw.category),
    price: Number(raw.price ?? 0),
    image: image?.url ? String(image.url) : null,
    imageAlt: null,
    variants: Array.isArray(raw.variants) ? (raw.variants as Raw[]).map(normVariant) : [],
    available: raw.available !== false,
    featured: Boolean(raw.featured),
    sortOrder: Number(raw.sortOrder ?? 0),
  };
}

function normalizeOrderItem(raw: Raw): OrderItem {
  return {
    menuItemId: asId(raw.menuItem),
    name: (raw.name as OrderItem["name"]) ?? { ru: "", en: "" },
    variantId: raw.variantId ? asId(raw.variantId) : null,
    variantName: (raw.variantName as OrderItem["variantName"]) ?? null,
    unitPrice: Number(raw.unitPrice ?? 0),
    quantity: Number(raw.quantity ?? 1),
    note: String(raw.note ?? ""),
    lineTotal: Number(raw.lineTotal ?? 0),
  };
}

export function normalizeOrder(raw: Raw): Order {
  const table = (raw.table as Raw) ?? {};
  const customer = (raw.customer as Raw) ?? {};
  return {
    id: asId(raw._id ?? raw.id),
    orderNumber: Number(raw.orderNumber ?? 0),
    table: {
      code: String(table.code ?? ""),
      label: String(table.label ?? ""),
      type: table.type === "vip" ? "vip" : "standard",
    },
    customer: { name: String(customer.name ?? ""), phone: String(customer.phone ?? "") },
    items: Array.isArray(raw.items) ? (raw.items as Raw[]).map(normalizeOrderItem) : [],
    note: String(raw.note ?? ""),
    total: Number(raw.total ?? 0),
    status: (raw.status as Order["status"]) ?? "pending",
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

/* ─── Endpoints ──────────────────────────────────────────── */

export async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await http.get<{ categories: Raw[] }>("/api/categories");
    return data.categories.map(normalizeCategory).sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, "Не удалось загрузить категории");
  }
}

export async function getMenu(
  opts: { category?: string; featured?: boolean } = {},
): Promise<MenuItem[]> {
  try {
    const { data } = await http.get<{ items: Raw[] }>("/api/menu", {
      params: {
        ...(opts.category ? { category: opts.category } : {}),
        ...(opts.featured ? { featured: "true" } : {}),
      },
    });
    return data.items.map(normalizeMenuItem).sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, "Не удалось загрузить меню");
  }
}

export async function resolveTable(code: string): Promise<TableInfo | null> {
  try {
    const { data } = await http.get<{ table: TableInfo }>(
      `/api/tables/${encodeURIComponent(code)}`,
    );
    return data.table;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  try {
    const { data } = await http.post<{ order: Raw }>("/api/orders", payload);
    return normalizeOrder(data.order);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, "Не удалось оформить заказ");
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    const { data } = await http.get<{ order: Raw }>(`/api/orders/${encodeURIComponent(id)}`);
    return normalizeOrder(data.order);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
