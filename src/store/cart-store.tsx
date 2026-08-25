"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { Dish } from "@/data/menu";

/* ─── Types ─────────────────────────────────────────────── */

export interface CartItem {
  dish: Dish;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; dish: Dish }
  | { type: "REMOVE_ITEM"; slug: string }
  | { type: "UPDATE_QUANTITY"; slug: string; quantity: number }
  | { type: "CLEAR_CART" };

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (dish: Dish) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
}

/* ─── Reducer ───────────────────────────────────────────── */

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.dish.slug === action.dish.slug,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.dish.slug === action.dish.slug
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return { items: [...state.items, { dish: action.dish, quantity: 1 }] };
    }
    case "REMOVE_ITEM":
      return { items: state.items.filter((i) => i.dish.slug !== action.slug) };
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          items: state.items.filter((i) => i.dish.slug !== action.slug),
        };
      }
      return {
        items: state.items.map((i) =>
          i.dish.slug === action.slug
            ? { ...i, quantity: action.quantity }
            : i,
        ),
      };
    }
    case "CLEAR_CART":
      return { items: [] };
    default:
      return state;
  }
}

/* ─── Context ───────────────────────────────────────────── */

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = useCallback(
    (dish: Dish) => dispatch({ type: "ADD_ITEM", dish }),
    [],
  );
  const removeItem = useCallback(
    (slug: string) => dispatch({ type: "REMOVE_ITEM", slug }),
    [],
  );
  const updateQuantity = useCallback(
    (slug: string, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", slug, quantity }),
    [],
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, i) => sum + i.dish.price * i.quantity,
    0,
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [state.items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return ctx;
}
