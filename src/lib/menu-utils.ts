import type { DishVariant, MenuItem } from "./types";

export function defaultVariant(item: MenuItem): DishVariant | undefined {
  return item.variants[0];
}

export function getVariant(
  item: MenuItem,
  variantId?: string | null,
): DishVariant | undefined {
  if (item.variants.length === 0) return undefined;
  return item.variants.find((v) => v.id === variantId) ?? item.variants[0];
}

/** Unit price for an item + optional chosen variant. */
export function unitPrice(item: MenuItem, variantId?: string | null): number {
  const variant = getVariant(item, variantId);
  return variant?.price ?? item.price;
}

export function priceRange(item: MenuItem): { min: number; max: number } {
  if (item.variants.length === 0) return { min: item.price, max: item.price };
  const prices = item.variants.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Index a menu list by id for O(1) cart resolution. */
export function indexMenu(items: MenuItem[]): Map<string, MenuItem> {
  return new Map(items.map((i) => [i.id, i]));
}
