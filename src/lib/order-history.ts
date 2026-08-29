/** Per-device list of placed order ids, newest first (localStorage). */

const KEY = "pho.orderIds.v1";
const MAX = 20;

export function getOrderIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function addOrderId(id: string): void {
  try {
    const next = [id, ...getOrderIds().filter((x) => x !== id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
