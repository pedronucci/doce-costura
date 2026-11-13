import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { product, productVariant } from "@/db/schema";
import { calculateQuote, type QuoteInput } from "./quote";

export async function quoteCart(input: QuoteInput) {
  await db.execute(sql`select doce_costura_private.release_order_reservations()`);
  const variants = await db.select({
    id: productVariant.id,
    productName: product.name,
    variantName: productVariant.name,
    slug: product.slug,
    priceCents: productVariant.priceCents,
    stock: productVariant.stock,
    reserved: productVariant.reserved,
  }).from(productVariant).innerJoin(product, eq(product.id, productVariant.productId)).where(and(
    inArray(productVariant.id, input.items.map((item) => item.variantId)),
    eq(product.status, "active"),
    eq(productVariant.isActive, true),
  ));
  return calculateQuote(input, variants);
}
