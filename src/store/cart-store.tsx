"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  allDishes,
  getDish,
  getVariant,
  unitPrice,
  type Dish,
  type DishVariant,
} from "@/data/menu";

/* ─── Types ─────────────────────────────────────────────── */

/** What we persist per line: enough to re-resolve names/prices in any locale. */
export interface CartLine {
  id: string;
  slug: string;
  variantId: string | null;
  quantity: number;
  note: string;
}

/** A line joined with live menu data, ready to render. */
export interface ResolvedLine extends CartLine {
  dish: Dish;
  variant: DishVariant | undefined;
  unitPrice: number;
  lineTotal: number;
}

interface CartState {
  lines: CartLine[];
  table: string | null;
  orderNote: string;
  hydrated: boolean;
}

type CartAction =
  | { type: "HYDRATE"; state: Partial<CartState> }
  | { type: "ADD"; slug: string; variantId: string | null; quantity: number; note: string }
  | { type: "SET_QUANTITY"; id: string; quantity: number }
  | { type: "SET_NOTE"; id: string; note: string }
  | { type: "REMOVE"; id: string }
  | { type: "SET_TABLE"; table: string | null }
  | { type: "SET_ORDER_NOTE"; note: string }
  | { type: "CLEAR" };

interface CartContextValue {
  lines: ResolvedLine[];
  totalItems: number;
  totalPrice: number;
  table: string | null;
  orderNote: string;
  hydrated: boolean;
  addLine: (input: {
    slug: string;
    variantId?: string | null;
    quantity?: number;
    note?: string;
  }) => void;
  setQuantity: (id: string, quantity: number) => void;
  setLineNote: (id: string, note: string) => void;
  removeLine: (id: string) => void;
  setTable: (table: string | null) => void;
  setOrderNote: (note: string) => void;
  clearCart: () => void;
  lineFor: (slug: string, variantId?: string | null) => ResolvedLine | undefined;
}

/* ─── Persistence ───────────────────────────────────────── */

const STORAGE_KEY = "pho.cart.v1";

interface PersistShape {
  lines: CartLine[];
  table: string | null;
  orderNote: string;
}

function lineId(slug: string, variantId: string | null): string {
  return `${slug}::${variantId ?? ""}`;
}

function load(): Partial<CartState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistShape;
    const validSlugs = new Set(allDishes.map((d) => d.slug));
    const lines = (parsed.lines ?? [])
      .filter((l) => validSlugs.has(l.slug) && l.quantity > 0)
      .map((l) => ({
        id: lineId(l.slug, l.variantId ?? null),
        slug: l.slug,
        variantId: l.variantId ?? null,
        quantity: Math.max(1, Math.floor(l.quantity)),
        note: typeof l.note === "string" ? l.note : "",
      }));
    return {
      lines,
      table: typeof parsed.table === "string" ? parsed.table : null,
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
  orderNote: "",
  hydrated: false,
};

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.state, hydrated: true };

    case "ADD": {
      const id = lineId(action.slug, action.variantId);
      const existing = state.lines.find((l) => l.id === id);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.id === id
              ? {
                  ...l,
                  quantity: l.quantity + action.quantity,
                  note: action.note || l.note,
                }
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
            slug: action.slug,
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
        lines: state.lines.map((l) =>
          l.id === action.id ? { ...l, note: action.note } : l,
        ),
      };

    case "REMOVE":
      return { ...state, lines: state.lines.filter((l) => l.id !== action.id) };

    case "SET_TABLE":
      return { ...state, table: action.table };

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

  // Hydrate once on mount from localStorage.
  useEffect(() => {
    dispatch({ type: "HYDRATE", state: load() ?? {} });
  }, []);

  // Persist after every change — but only once the initial hydrate has landed,
  // so we never clobber stored data with the empty initial state.
  useEffect(() => {
    if (state.hydrated) save(state);
  }, [state]);

  const resolved = useMemo<ResolvedLine[]>(() => {
    return state.lines
      .map((line) => {
        const dish = getDish(line.slug);
        if (!dish) return null;
        const variant = getVariant(dish, line.variantId);
        const price = unitPrice(dish, line.variantId);
        return {
          ...line,
          dish,
          variant,
          unitPrice: price,
          lineTotal: price * line.quantity,
        } satisfies ResolvedLine;
      })
      .filter((l): l is ResolvedLine => l !== null);
  }, [state.lines]);

  const totalItems = resolved.reduce((sum, l) => sum + l.quantity, 0);
  const totalPrice = resolved.reduce((sum, l) => sum + l.lineTotal, 0);

  const addLine = useCallback<CartContextValue["addLine"]>((input) => {
    dispatch({
      type: "ADD",
      slug: input.slug,
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

  const setTable = useCallback((table: string | null) => {
    dispatch({ type: "SET_TABLE", table });
  }, []);

  const setOrderNote = useCallback((note: string) => {
    dispatch({ type: "SET_ORDER_NOTE", note });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value = useMemo<CartContextValue>(() => {
    const lineFor = (slug: string, variantId?: string | null) =>
      resolved.find((l) => l.id === lineId(slug, variantId ?? null));
    return {
      lines: resolved,
      totalItems,
      totalPrice,
      table: state.table,
      orderNote: state.orderNote,
      hydrated: state.hydrated,
      addLine,
      setQuantity,
      setLineNote,
      removeLine,
      setTable,
      setOrderNote,
      clearCart,
      lineFor,
    };
  }, [
    resolved,
    totalItems,
    totalPrice,
    state.table,
    state.orderNote,
    state.hydrated,
    addLine,
    setQuantity,
    setLineNote,
    removeLine,
    setTable,
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
