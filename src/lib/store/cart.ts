export type CartLine = { slug: string; variantId: string; quantity: number };
export const MAX_CART_QUANTITY = 99;

export function validQuantity(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= MAX_CART_QUANTITY;
}

export function parseCart(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const lines: CartLine[] = [];
  for (const row of value.slice(0, 100)) {
    if (!row || typeof row.slug !== "string" || typeof row.variantId !== "string" || !row.slug || !row.variantId || !validQuantity(row.quantity)) continue;
    if (!lines.some((l) => l.variantId === row.variantId)) lines.push({ slug: row.slug, variantId: row.variantId, quantity: row.quantity });
  }
  return lines;
}

export function addCartLine(cart: CartLine[], line: CartLine, available: number): CartLine[] {
  if (!validQuantity(line.quantity) || !Number.isInteger(available) || available < 1) return cart;
  const old = cart.find((l) => l.variantId === line.variantId);
  const quantity = Math.min((old?.quantity ?? 0) + line.quantity, available, MAX_CART_QUANTITY);
  return old ? cart.map((l) => l.variantId === line.variantId ? { ...l, quantity } : l) : [...cart, { ...line, quantity }];
}
