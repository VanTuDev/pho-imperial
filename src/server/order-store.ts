import { getDish, getVariant, unitPrice } from "@/data/menu";

export type OrderStatus = "new" | "cooking" | "ready" | "served";

export interface OrderItemInput {
  slug: string;
  variantId?: string | null;
  quantity: number;
  note?: string;
}

export interface OrderItem {
  slug: string;
  name: string;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  note: string;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  table: string;
  note: string;
  items: OrderItem[];
  total: number;
  createdAt: number;
}

export interface OrderView extends Order {
  status: OrderStatus;
}

/* Survive HMR / route re-evaluation in dev. */
const globalForOrders = globalThis as unknown as {
  __phoOrders?: Map<string, Order>;
};
const store: Map<string, Order> = (globalForOrders.__phoOrders ??= new Map());

/** Status is derived from how long ago the order was placed (demo kitchen). */
const STAGE_MS = {
  cooking: 25_000,
  ready: 120_000,
  served: 900_000,
};

export function statusFor(order: Order, now = Date.now()): OrderStatus {
  const age = now - order.createdAt;
  if (age >= STAGE_MS.served) return "served";
  if (age >= STAGE_MS.ready) return "ready";
  if (age >= STAGE_MS.cooking) return "cooking";
  return "new";
}

function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export class OrderError extends Error {}

export function createOrder(input: {
  table: unknown;
  note?: unknown;
  items: unknown;
}): OrderView {
  const table = typeof input.table === "string" ? input.table.trim() : "";
  if (!/^\w{1,8}$/.test(table)) {
    throw new OrderError("Invalid table number");
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new OrderError("Order has no items");
  }

  const items: OrderItem[] = [];
  for (const raw of input.items as OrderItemInput[]) {
    const dish = getDish(String(raw?.slug));
    if (!dish) throw new OrderError(`Unknown dish: ${raw?.slug}`);

    const quantity = Math.floor(Number(raw?.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
      throw new OrderError("Invalid quantity");
    }

    const variantId = raw?.variantId ?? null;
    if (dish.variants && variantId && !dish.variants.some((v) => v.id === variantId)) {
      throw new OrderError(`Unknown option for ${dish.slug}`);
    }
    const variant = getVariant(dish, variantId);
    const price = unitPrice(dish, variantId);

    items.push({
      slug: dish.slug,
      name: dish.name.en,
      variantId: variant?.id ?? null,
      variantName: variant?.name.en ?? null,
      quantity,
      note: typeof raw?.note === "string" ? raw.note.slice(0, 280) : "",
      unitPrice: price,
      lineTotal: price * quantity,
    });
  }

  const order: Order = {
    id: newId(),
    table,
    note: typeof input.note === "string" ? input.note.slice(0, 500) : "",
    items,
    total: items.reduce((sum, i) => sum + i.lineTotal, 0),
    createdAt: Date.now(),
  };

  store.set(order.id, order);
  return { ...order, status: statusFor(order) };
}

export function getOrder(id: string): OrderView | undefined {
  const order = store.get(id.toUpperCase());
  if (!order) return undefined;
  return { ...order, status: statusFor(order) };
}
