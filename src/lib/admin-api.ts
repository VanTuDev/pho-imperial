import { ApiError, createClient } from "./http";
import type { Localized } from "@/i18n/localized";
import type { OrderStatus } from "./types";

/* ─── Token (readable cookie, admin surface only) ─────────── */

const TOKEN_COOKIE = "admin_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days, matches the backend JWT

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string): void {
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)};path=/;max-age=${MAX_AGE};samesite=lax`;
}

export function clearToken(): void {
  document.cookie = `${TOKEN_COOKIE}=;path=/;max-age=0;samesite=lax`;
}

/** Authenticated client: injects the bearer token, drops it on a 401. */
const http = createClient({ getToken, onUnauthorized: clearToken });

/* ─── Types ──────────────────────────────────────────────── */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin";
  active: boolean;
  googleId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CloudImage {
  url: string;
  publicId: string;
}

export interface AdminCategory {
  id: string;
  name: Localized;
  slug: string;
  sortOrder: number;
  active: boolean;
  image: CloudImage | null;
}

export interface AdminVariant {
  id?: string;
  name: Localized;
  price: number;
}

export interface AdminMenuItem {
  id: string;
  name: Localized;
  description: Localized;
  category: string;
  price: number;
  image: CloudImage | null;
  variants: AdminVariant[];
  available: boolean;
  featured: boolean;
  sortOrder: number;
}

export interface AdminTable {
  id: string;
  label: string;
  code: string;
  type: "standard" | "vip";
  active: boolean;
  note: string;
}

export interface AdminOrderItem {
  name: Localized;
  variantName: Localized | null;
  unitPrice: number;
  quantity: number;
  note: string;
  lineTotal: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: number;
  table: { code: string; label: string; type: "standard" | "vip" };
  customer: { name: string; phone: string };
  items: AdminOrderItem[];
  note: string;
  total: number;
  status: OrderStatus;
  source: string;
  createdAt: string;
  statusHistory: { status: OrderStatus; at: string }[];
}

/* ─── Normalisers ────────────────────────────────────────── */

type Raw = Record<string, unknown>;

const asId = (r: Raw): string => String(r.id ?? r._id ?? "");

function normUser(r: Raw): AdminUser {
  return {
    id: asId(r),
    email: String(r.email ?? ""),
    name: String(r.name ?? ""),
    role: r.role === "owner" ? "owner" : "admin",
    active: r.active !== false,
    googleId: r.googleId ? String(r.googleId) : null,
    lastLoginAt: r.lastLoginAt ? String(r.lastLoginAt) : null,
    createdAt: String(r.createdAt ?? ""),
  };
}

function normImage(r: unknown): CloudImage | null {
  const img = r as Raw | null | undefined;
  return img?.url ? { url: String(img.url), publicId: String(img.publicId ?? "") } : null;
}

function normCategory(r: Raw): AdminCategory {
  return {
    id: asId(r),
    name: (r.name as Localized) ?? { ru: "", en: "" },
    slug: String(r.slug ?? ""),
    sortOrder: Number(r.sortOrder ?? 0),
    active: r.active !== false,
    image: normImage(r.image),
  };
}

function normMenuItem(r: Raw): AdminMenuItem {
  return {
    id: asId(r),
    name: (r.name as Localized) ?? { ru: "", en: "" },
    description: (r.description as Localized) ?? { ru: "", en: "" },
    category: String(
      typeof r.category === "object" && r.category ? asId(r.category as Raw) : (r.category ?? ""),
    ),
    price: Number(r.price ?? 0),
    image: normImage(r.image),
    variants: Array.isArray(r.variants)
      ? (r.variants as Raw[]).map((v) => ({
          id: v._id ? String(v._id) : v.id ? String(v.id) : undefined,
          name: (v.name as Localized) ?? { ru: "", en: "" },
          price: Number(v.price ?? 0),
        }))
      : [],
    available: r.available !== false,
    featured: Boolean(r.featured),
    sortOrder: Number(r.sortOrder ?? 0),
  };
}

function normTable(r: Raw): AdminTable {
  return {
    id: asId(r),
    label: String(r.label ?? ""),
    code: String(r.code ?? ""),
    type: r.type === "vip" ? "vip" : "standard",
    active: r.active !== false,
    note: String(r.note ?? ""),
  };
}

function normOrder(r: Raw): AdminOrder {
  const table = (r.table as Raw) ?? {};
  const customer = (r.customer as Raw) ?? {};
  return {
    id: asId(r),
    orderNumber: Number(r.orderNumber ?? 0),
    table: {
      code: String(table.code ?? ""),
      label: String(table.label ?? ""),
      type: table.type === "vip" ? "vip" : "standard",
    },
    customer: { name: String(customer.name ?? ""), phone: String(customer.phone ?? "") },
    items: Array.isArray(r.items)
      ? (r.items as Raw[]).map((i) => ({
          name: (i.name as Localized) ?? { ru: "", en: "" },
          variantName: (i.variantName as Localized) ?? null,
          unitPrice: Number(i.unitPrice ?? 0),
          quantity: Number(i.quantity ?? 1),
          note: String(i.note ?? ""),
          lineTotal: Number(i.lineTotal ?? 0),
        }))
      : [],
    note: String(r.note ?? ""),
    total: Number(r.total ?? 0),
    status: (r.status as OrderStatus) ?? "pending",
    source: String(r.source ?? "qr"),
    createdAt: String(r.createdAt ?? ""),
    statusHistory: Array.isArray(r.statusHistory)
      ? (r.statusHistory as Raw[]).map((h) => ({
          status: (h.status as OrderStatus) ?? "pending",
          at: String(h.at ?? ""),
        }))
      : [],
  };
}

/** Wrap a call so every failure surfaces as an ApiError with a Russian message. */
async function call<T>(fallback: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, fallback);
  }
}

/* ─── Auth ───────────────────────────────────────────────── */

export function login(email: string, password: string): Promise<AdminUser> {
  return call("Не удалось войти", async () => {
    const { data } = await http.post<{ token: string; admin: Raw }>("/api/auth/login", {
      email,
      password,
    });
    setToken(data.token);
    return normUser(data.admin);
  });
}

export function loginGoogle(credential: string): Promise<AdminUser> {
  return call("Google-вход не удался", async () => {
    const { data } = await http.post<{ token: string; admin: Raw }>("/api/auth/google", {
      credential,
    });
    setToken(data.token);
    return normUser(data.admin);
  });
}

export function me(): Promise<AdminUser> {
  return call("Не удалось получить профиль", async () => {
    const { data } = await http.get<{ admin: Raw }>("/api/auth/me");
    return normUser(data.admin);
  });
}

/* ─── Categories ─────────────────────────────────────────── */

export function listCategories(): Promise<AdminCategory[]> {
  return call("Не удалось загрузить категории", async () => {
    const { data } = await http.get<{ categories: Raw[] }>("/api/categories", {
      params: { all: "true" },
    });
    return data.categories.map(normCategory).sort((a, b) => a.sortOrder - b.sortOrder);
  });
}

export function createCategory(input: Partial<AdminCategory>): Promise<AdminCategory> {
  return call("Не удалось создать категорию", async () => {
    const { data } = await http.post<{ category: Raw }>("/api/categories", input);
    return normCategory(data.category);
  });
}

export function updateCategory(id: string, input: Partial<AdminCategory>): Promise<AdminCategory> {
  return call("Не удалось сохранить категорию", async () => {
    const { data } = await http.patch<{ category: Raw }>(`/api/categories/${id}`, input);
    return normCategory(data.category);
  });
}

export function deleteCategory(id: string): Promise<void> {
  return call("Не удалось удалить категорию", async () => {
    await http.delete(`/api/categories/${id}`);
  });
}

/* ─── Menu ───────────────────────────────────────────────── */

export function listMenu(): Promise<AdminMenuItem[]> {
  return call("Не удалось загрузить меню", async () => {
    const { data } = await http.get<{ items: Raw[] }>("/api/menu", { params: { all: "true" } });
    return data.items.map(normMenuItem);
  });
}

export function getMenuItem(id: string): Promise<AdminMenuItem> {
  return call("Не удалось загрузить блюдо", async () => {
    const { data } = await http.get<{ item: Raw }>(`/api/menu/${id}`);
    return normMenuItem(data.item);
  });
}

interface MenuItemInput {
  name: Localized;
  description?: Localized;
  category: string;
  price: number;
  image?: CloudImage | null;
  variants?: AdminVariant[];
  available?: boolean;
  featured?: boolean;
  sortOrder?: number;
}

export function createMenuItem(input: MenuItemInput): Promise<AdminMenuItem> {
  return call("Не удалось создать блюдо", async () => {
    const { data } = await http.post<{ item: Raw }>("/api/menu", input);
    return normMenuItem(data.item);
  });
}

export function updateMenuItem(id: string, input: Partial<MenuItemInput>): Promise<AdminMenuItem> {
  return call("Не удалось сохранить блюдо", async () => {
    const { data } = await http.patch<{ item: Raw }>(`/api/menu/${id}`, input);
    return normMenuItem(data.item);
  });
}

export function deleteMenuItem(id: string): Promise<void> {
  return call("Не удалось удалить блюдо", async () => {
    await http.delete(`/api/menu/${id}`);
  });
}

/* ─── Tables ─────────────────────────────────────────────── */

export function listTables(): Promise<AdminTable[]> {
  return call("Не удалось загрузить столы", async () => {
    const { data } = await http.get<{ tables: Raw[] }>("/api/tables");
    return data.tables.map(normTable);
  });
}

export function createTable(input: Partial<AdminTable>): Promise<AdminTable> {
  return call("Не удалось создать стол", async () => {
    const { data } = await http.post<{ table: Raw }>("/api/tables", input);
    return normTable(data.table);
  });
}

export function bulkCreateTables(input: {
  from: number;
  to: number;
  type?: "standard" | "vip";
  prefix?: string;
}): Promise<number> {
  return call("Не удалось создать столы", async () => {
    const { data } = await http.post<{ count: number }>("/api/tables/bulk", input);
    return data.count;
  });
}

export function updateTable(id: string, input: Partial<AdminTable>): Promise<AdminTable> {
  return call("Не удалось сохранить стол", async () => {
    const { data } = await http.patch<{ table: Raw }>(`/api/tables/${id}`, input);
    return normTable(data.table);
  });
}

export function deleteTable(id: string): Promise<void> {
  return call("Не удалось удалить стол", async () => {
    await http.delete(`/api/tables/${id}`);
  });
}

/* ─── Orders ─────────────────────────────────────────────── */

export function listOrders(
  params: {
    status?: OrderStatus;
    active?: boolean;
    date?: string;
    table?: string;
    limit?: number;
  } = {},
): Promise<AdminOrder[]> {
  return call("Не удалось загрузить заказы", async () => {
    const { data } = await http.get<{ orders: Raw[] }>("/api/orders", {
      params: {
        ...(params.status ? { status: params.status } : {}),
        ...(params.active ? { active: "true" } : {}),
        ...(params.date ? { date: params.date } : {}),
        ...(params.table ? { table: params.table } : {}),
        ...(params.limit ? { limit: params.limit } : {}),
      },
    });
    return data.orders.map(normOrder);
  });
}

export function getOrder(id: string): Promise<AdminOrder | null> {
  return call("Не удалось загрузить заказ", async () => {
    const { data } = await http.get<{ orders: Raw[] }>("/api/orders", { params: { id } });
    return data.orders[0] ? normOrder(data.orders[0]) : null;
  });
}

export function updateOrderStatus(id: string, status: OrderStatus): Promise<AdminOrder> {
  return call("Не удалось изменить статус", async () => {
    const { data } = await http.patch<{ order: Raw }>(`/api/orders/${id}/status`, { status });
    return normOrder(data.order);
  });
}

/* ─── Admins (owner only) ────────────────────────────────── */

export function listAdmins(): Promise<AdminUser[]> {
  return call("Не удалось загрузить администраторов", async () => {
    const { data } = await http.get<{ admins: Raw[] }>("/api/admins");
    return data.admins.map(normUser);
  });
}

export function createAdmin(input: {
  email: string;
  name: string;
  password?: string;
}): Promise<AdminUser> {
  return call("Не удалось добавить администратора", async () => {
    const { data } = await http.post<{ admin: Raw }>("/api/admins", input);
    return normUser(data.admin);
  });
}

export function updateAdmin(
  id: string,
  input: { name?: string; active?: boolean; password?: string },
): Promise<AdminUser> {
  return call("Не удалось сохранить администратора", async () => {
    const { data } = await http.patch<{ admin: Raw }>(`/api/admins/${id}`, input);
    return normUser(data.admin);
  });
}

export function deleteAdmin(id: string): Promise<void> {
  return call("Не удалось удалить администратора", async () => {
    await http.delete(`/api/admins/${id}`);
  });
}

/* ─── Uploads ────────────────────────────────────────────── */

export function uploadImage(file: File): Promise<CloudImage> {
  return call("Не удалось загрузить изображение", async () => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await http.post<{ image: CloudImage }>("/api/uploads", form);
    return data.image;
  });
}
