import { z } from "zod";

export const quoteInput = z.strictObject({
  items: z.array(z.strictObject({
    variantId: z.uuid(),
    quantity: z.number().int().min(1).max(99),
  })).min(1).max(50),
}).refine(({ items }) => new Set(items.map((i) => i.variantId)).size === items.length, {
  message: "Cada modelo deve aparecer uma única vez no carrinho.",
});

export type QuoteInput = z.infer<typeof quoteInput>;
export type QuoteVariant = {
  id: string;
  productName: string;
  variantName: string;
  slug: string;
  priceCents: number | null;
  stock: number;
  reserved: number;
};
export type QuoteIssue = { variantId: string; message: string };
export type CheckoutQuote = {
  currency: "BRL";
  items: Array<{ variantId: string; productName: string; variantName: string; slug: string; quantity: number; unitCents: number; totalCents: number }>;
  issues: QuoteIssue[];
  subtotalCents: number | null;
  shippingCents: null;
  totalCents: null;
};

// Os totais precisam caber nos campos integer do pedido, além de serem inteiros exatos.
const MAX_CENTS = 2_147_483_647;

/** Recebe exclusivamente linhas de produtos ativos obtidas do banco, sem cache da vitrine. */
export function calculateQuote(input: QuoteInput, variants: QuoteVariant[]): CheckoutQuote {
  const items: CheckoutQuote["items"] = [];
  const issues: QuoteIssue[] = [];
  const byId = new Map(variants.map((v) => [v.id, v]));
  let subtotal = 0;
  for (const item of input.items) {
    const variant = byId.get(item.variantId);
    if (!variant) {
      issues.push({ variantId: item.variantId, message: "Esta peça não está disponível para compra. Remova-a do carrinho." });
      continue;
    }
    const { priceCents, stock, reserved } = variant;
    if (!Number.isInteger(priceCents) || priceCents === null || priceCents <= 0 || priceCents > MAX_CENTS) {
      issues.push({ variantId: item.variantId, message: "O preço desta peça ainda não está disponível." });
      continue;
    }
    if (!Number.isInteger(stock) || !Number.isInteger(reserved) || reserved < 0 || stock < reserved || stock - reserved < item.quantity) {
      issues.push({ variantId: item.variantId, message: `${variant.productName}: a quantidade escolhida não está disponível. Ajuste seu carrinho.` });
      continue;
    }
    const totalCents = priceCents * item.quantity;
    if (totalCents > MAX_CENTS || subtotal + totalCents > MAX_CENTS) {
      issues.push({ variantId: item.variantId, message: "O valor das peças excede o limite de uma compra. Reduza a quantidade." });
      continue;
    }
    subtotal += totalCents;
    items.push({ variantId: item.variantId, productName: variant.productName, variantName: variant.variantName, slug: variant.slug, quantity: item.quantity, unitCents: priceCents, totalCents });
  }
  // Frete desconhecido nunca é representado como grátis ou incluído num total final.
  return { currency: "BRL", items, issues, subtotalCents: issues.length ? null : subtotal, shippingCents: null, totalCents: null };
}
