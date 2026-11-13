import "server-only";
import { createHash } from "node:crypto";
import { and, asc, eq, gt, inArray, isNull, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { address, order, orderEvent, orderItem, product, productVariant, stockMovement, user } from "@/db/schema";
import { calculateQuote } from "@/lib/checkout/quote";
import { createOrderInput, OrderInputError } from "./input";

/** Chamado exclusivamente após autenticação; a identidade nunca vem do formulário. */
export async function createReservedOrder(db: Db, customerId: string, input: unknown) {
  const data = createOrderInput.parse(input);
  const items = [...data.items].sort((a, b) => a.variantId.localeCompare(b.variantId));
  const requestHash = createHash("sha256").update(JSON.stringify({ items, addressId: data.addressId, subtotal: data.expectedSubtotalCents })).digest("hex");
  const key = `${customerId}:${data.idempotencyKey}`;
  return db.transaction(async (tx) => {
    // Uma ordem de bloqueios compartilhada por criação, expiração, cancelamento e edição de estoque.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('doce-costura:inventory-reservations'))`);
    const [customer] = await tx.select().from(user).where(eq(user.id, customerId)).for("update");
    if (!customer || customer.deletedAt) throw new OrderInputError("Entre novamente na sua conta.");
    await tx.execute(sql`select doce_costura_private.release_order_reservations()`);
    const [existing] = await tx.select().from(order).where(and(eq(order.idempotencyKey, key), eq(order.userId, customerId))).limit(1);
    if (existing) {
      if (existing.requestHash !== requestHash) throw new OrderInputError("Esta tentativa já foi usada com outras escolhas. Volte à revisão para começar um novo pedido.");
      return { id: existing.id, number: existing.number };
    }
    const [active] = await tx.select({ id: order.id }).from(order).where(and(eq(order.userId, customerId), eq(order.status, "awaiting_checkout"), isNull(order.reservationReleasedAt), gt(order.reservationExpiresAt, sql`clock_timestamp()`))).limit(1);
    if (active) throw new OrderInputError("Você já tem um pedido com reserva ativa. Consulte seus pedidos para continuar ou cancelar essa reserva.");
    const [destination] = await tx.select().from(address).where(and(eq(address.id, data.addressId), eq(address.userId, customerId))).limit(1);
    if (!destination) throw new OrderInputError("Selecione um endereço da sua conta.");
    const variants = await tx.select({
      id: productVariant.id, productName: product.name, variantName: productVariant.name, slug: product.slug,
      sku: productVariant.sku, priceCents: productVariant.priceCents, stock: productVariant.stock, reserved: productVariant.reserved,
    }).from(productVariant).innerJoin(product, eq(product.id, productVariant.productId)).where(and(
      inArray(productVariant.id, items.map((item) => item.variantId)), eq(product.status, "active"), eq(productVariant.isActive, true),
    )).orderBy(asc(productVariant.id)).for("update");
    const quote = calculateQuote({ items }, variants);
    if (quote.issues.length || quote.subtotalCents === null) throw new OrderInputError("O preço ou a disponibilidade de uma peça mudou. Revise seu carrinho novamente.");
    if (quote.subtotalCents !== data.expectedSubtotalCents) throw new OrderInputError("Os preços foram atualizados. Confira o novo subtotal antes de criar o pedido.");
    const [created] = await tx.insert(order).values({
      userId: customerId, status: "awaiting_checkout", idempotencyKey: key, requestHash,
      reservationExpiresAt: sql`clock_timestamp() + interval '30 minutes'`,
      customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone,
      shipRecipient: destination.recipient, shipCep: destination.cep, shipStreet: destination.street,
      shipNumber: destination.number, shipComplement: destination.complement, shipNeighborhood: destination.neighborhood,
      shipCity: destination.city, shipState: destination.state,
      subtotalCents: quote.subtotalCents, shippingCents: null, totalCents: null, acceptedTermsAt: sql`clock_timestamp()`,
    }).returning({ id: order.id, number: order.number });
    for (const item of quote.items) {
      const [reserved] = await tx.update(productVariant).set({ reserved: sql`${productVariant.reserved} + ${item.quantity}` }).where(and(eq(productVariant.id, item.variantId), sql`${productVariant.stock} - ${productVariant.reserved} >= ${item.quantity}`)).returning({ id: productVariant.id });
      if (!reserved) throw new OrderInputError("Uma peça acabou de ficar indisponível. Revise seu carrinho.");
      await tx.insert(orderItem).values({ orderId: created.id, variantId: item.variantId, productName: item.productName, variantName: item.variantName, sku: variants.find((v) => v.id === item.variantId)!.sku, unitCents: item.unitCents, quantity: item.quantity, totalCents: item.totalCents });
      await tx.insert(stockMovement).values({ variantId: item.variantId, delta: -item.quantity, reason: "order_reserved", orderId: created.id, actorId: customerId });
    }
    await tx.insert(orderEvent).values({ orderId: created.id, type: "reservation.created", message: "Pedido criado com reserva de 30 minutos. Frete, total final e pagamento ainda não confirmados.", actorId: customerId });
    return created;
  });
}
