"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { getMenu } from "@/lib/api";
import { getVariant, unitPrice } from "@/lib/menu-utils";
import type { DishVariant, MenuItem } from "@/lib/types";

/* ─── Types ─────────────────────────────────────────────── */

/** What we persist per line: enough to re-resolve names/prices in any locale. */
export interface CartLine {
  id: string;
  menuItemId: string;
  variantId: string | null;
  quantity: number;
  note: string;
}

/** A line joined with live menu data, ready to render. */
export interface ResolvedLine extends CartLine {
  item: MenuItem;
  variant: DishVariant | undefined;
  unitPrice: number;
  lineTotal: number;
}

type TableType = "standard" | "vip";

interface CartState {
  lines: CartLine[];
  table: string | null;
  tableLabel: string | null;
  tableType: TableType | null;
  customerName: string;
  customerPhone: string;
  orderNote: string;
  hydrated: boolean;
}

type CartAction =
  | { type: "HYDRATE"; state: Partial<CartState> }
  | { type: "ADD"; menuItemId: string; variantId: string | null; quantity: number; note: string }
  | { type: "SET_QUANTITY"; id: string; quantity: number }
  | { type: "SET_NOTE"; id: string; note: string }
  | { type: "REMOVE"; id: string }
  | { type: "SET_TABLE"; table: string | null; label?: string | null; tableType?: TableType | null }
  | { type: "SET_CONTACT"; name?: string; phone?: string }
  | { type: "SET_ORDER_NOTE"; note: string }
  | { type: "CLEAR" };

interface CartContextValue {
  lines: ResolvedLine[];
  totalItems: number;
  totalPrice: number;
  table: string | null;
  tableLabel: string | null;
  tableType: TableType | null;
  customerName: string;
  customerPhone: string;
  orderNote: string;
  hydrated: boolean;
  menu: MenuItem[];
  menuLoaded: boolean;
  menuError: boolean;
  reloadMenu: () => void;
  addLine: (input: {
    menuItemId: string;
    variantId?: string | null;
    quantity?: number;
    note?: string;
  }) => void;
  setQuantity: (id: string, quantity: number) => void;
  setLineNote: (id: string, note: string) => void;
  removeLine: (id: string) => void;
  setTable: (
    table: string | null,
    meta?: { label?: string | null; type?: TableType | null },
  ) => void;
  setContact: (input: { name?: string; phone?: string }) => void;
  setOrderNote: (note: string) => void;
  clearCart: () => void;
  lineFor: (menuItemId: string, variantId?: string | null) => ResolvedLine | undefined;
}

/* ─── Persistence ───────────────────────────────────────── */

const STORAGE_KEY = "pho.cart.v2";

interface PersistShape {
  lines: CartLine[];
  table: string | null;
  tableLabel: string | null;
  tableType: TableType | null;
  customerName: string;
  customerPhone: string;
  orderNote: string;
}

function lineId(menuItemId: string, variantId: string | null): string {
  return `${menuItemId}::${variantId ?? ""}`;
}

function load(): Partial<CartState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistShape>;
    const lines = (parsed.lines ?? [])
      .filter((l) => l && typeof l.menuItemId === "string" && l.quantity > 0)
      .map((l) => ({
        id: lineId(l.menuItemId, l.variantId ?? null),
        menuItemId: l.menuItemId,
        variantId: l.variantId ?? null,
        quantity: Math.max(1, Math.floor(l.quantity)),
        note: typeof l.note === "string" ? l.note : "",
      }));
    return {
      lines,
      table: typeof parsed.table === "string" ? parsed.table : null,
      tableLabel: typeof parsed.tableLabel === "string" ? parsed.tableLabel : null,
      tableType: parsed.tableType === "vip" || parsed.tableType === "standard" ? parsed.tableType : null,
      customerName: typeof parsed.customerName === "string" ? parsed.customerName : "",
      customerPhone: typeof parsed.customerPhone === "string" ? parsed.customerPhone : "",
      orderNote: typeof parsed.orderNote === "string" ? parsed.orderNote : "",
    };
  } catch {
    return null;
  }
}

function save(state: CartState) {
  try {
    const shape: PersistShape = {
      lines: state.lines,
      table: state.table,
      tableLabel: state.tableLabel,
      tableType: state.tableType,
      customerName: state.customerName,
      customerPhone: state.customerPhone,
      orderNote: state.orderNote,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shape));
  } catch {
    /* storage unavailable — ignore */
  }
}

/* ─── Reducer ───────────────────────────────────────────── */

const initialState: CartState = {
  lines: [],
  table: null,
  tableLabel: null,
  tableType: null,
  customerName: "",
  customerPhone: "",
  orderNote: "",
  hydrated: false,
};

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.state, hydrated: true };

    case "ADD": {
      const id = lineId(action.menuItemId, action.variantId);
      const existing = state.lines.find((l) => l.id === id);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.id === id
              ? { ...l, quantity: l.quantity + action.quantity, note: action.note || l.note }
              : l,
          ),
        };
      }
      return {
        ...state,
        lines: [
          ...state.lines,
          {
            id,
            menuItemId: action.menuItemId,
            variantId: action.variantId,
            quantity: action.quantity,
            note: action.note,
          },
        ],
      };
    }

    case "SET_QUANTITY": {
      if (action.quantity <= 0) {
        return { ...state, lines: state.lines.filter((l) => l.id !== action.id) };
      }
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.id === action.id ? { ...l, quantity: action.quantity } : l,
        ),
      };
    }

    case "SET_NOTE":
      return {
        ...state,
        lines: state.lines.map((l) => (l.id === action.id ? { ...l, note: action.note } : l)),
      };

    case "REMOVE":
      return { ...state, lines: state.lines.filter((l) => l.id !== action.id) };

    case "SET_TABLE":
      return {
        ...state,
        table: action.table,
        tableLabel: action.label !== undefined ? action.label : state.tableLabel,
        tableType: action.tableType !== undefined ? action.tableType : state.tableType,
      };

    case "SET_CONTACT":
      return {
        ...state,
        customerName: action.name ?? state.customerName,
        customerPhone: action.phone ?? state.customerPhone,
      };

    case "SET_ORDER_NOTE":
      return { ...state, orderNote: action.note };

    case "CLEAR":
      return { ...state, lines: [], orderNote: "" };

    default:
      return state;
  }
}

/* ─── Context ───────────────────────────────────────────── */

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [menuError, setMenuError] = useState(false);
  const [menuNonce, setMenuNonce] = useState(0);

  // Hydrate the cart once on mount from localStorage.
  useEffect(() => {
    dispatch({ type: "HYDRATE", state: load() ?? {} });
  }, []);

  // Load the live menu (and reload on demand / on locale-independent refresh).
  useEffect(() => {
    let active = true;
    getMenu()
      .then((items) => {
        if (!active) return;
        setMenu(items);
        setMenuError(false);
        setMenuLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        setMenuError(true);
        setMenuLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [menuNonce]);

  // Persist after every change — only once the initial hydrate has landed.
  useEffect(() => {
    if (state.hydrated) save(state);
  }, [state]);

  const menuById = useMemo(() => new Map(menu.map((i) => [i.id, i])), [menu]);

  const resolved = useMemo<ResolvedLine[]>(() => {
    return state.lines
      .map((line) => {
        const item = menuById.get(line.menuItemId);
        if (!item) return null;
        const variant = getVariant(item, line.variantId);
        const price = unitPrice(item, line.variantId);
        return {
          ...line,
          item,
          variant,
          unitPrice: price,
          lineTotal: price * line.quantity,
        } satisfies ResolvedLine;
      })
      .filter((l): l is ResolvedLine => l !== null);
  }, [state.lines, menuById]);

  const totalItems = resolved.reduce((sum, l) => sum + l.quantity, 0);
  const totalPrice = resolved.reduce((sum, l) => sum + l.lineTotal, 0);

  const addLine = useCallback<CartContextValue["addLine"]>((input) => {
    dispatch({
      type: "ADD",
      menuItemId: input.menuItemId,
      variantId: input.variantId ?? null,
      quantity: input.quantity ?? 1,
      note: input.note ?? "",
    });
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: "SET_QUANTITY", id, quantity });
  }, []);

  const setLineNote = useCallback((id: string, note: string) => {
    dispatch({ type: "SET_NOTE", id, note });
  }, []);

  const removeLine = useCallback((id: string) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  const setTable = useCallback<CartContextValue["setTable"]>((table, meta) => {
    dispatch({
      type: "SET_TABLE",
      table,
      label: meta?.label,
      tableType: meta?.type,
    });
  }, []);

  const setContact = useCallback((input: { name?: string; phone?: string }) => {
    dispatch({ type: "SET_CONTACT", name: input.name, phone: input.phone });
  }, []);

  const setOrderNote = useCallback((note: string) => {
    dispatch({ type: "SET_ORDER_NOTE", note });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const reloadMenu = useCallback(() => setMenuNonce((n) => n + 1), []);

  const value = useMemo<CartContextValue>(() => {
    const lineFor = (menuItemId: string, variantId?: string | null) =>
      resolved.find((l) => l.id === lineId(menuItemId, variantId ?? null));
    return {
      lines: resolved,
      totalItems,
      totalPrice,
      table: state.table,
      tableLabel: state.tableLabel,
      tableType: state.tableType,
      customerName: state.customerName,
      customerPhone: state.customerPhone,
      orderNote: state.orderNote,
      hydrated: state.hydrated,
      menu,
      menuLoaded,
      menuError,
      reloadMenu,
      addLine,
      setQuantity,
      setLineNote,
      removeLine,
      setTable,
      setContact,
      setOrderNote,
      clearCart,
      lineFor,
    };
  }, [
    resolved,
    totalItems,
    totalPrice,
    state.table,
    state.tableLabel,
    state.tableType,
    state.customerName,
    state.customerPhone,
    state.orderNote,
    state.hydrated,
    menu,
    menuLoaded,
    menuError,
    reloadMenu,
    addLine,
    setQuantity,
    setLineNote,
    removeLine,
    setTable,
    setContact,
    setOrderNote,
    clearCart,
  ]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a <CartProvider>");
  return ctx;
}
