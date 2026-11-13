import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { order, orderItem, orderEvent } from "@/db/schema";
import { requireCustomer } from "@/lib/customer/session";
import { createReservedOrder } from "./service";
import { OrderInputError } from "./input";

export async function createCustomerOrder(input: unknown) {
  const customer = await requireCustomer();
  return createReservedOrder(db, customer.id, input);
}

export async function customerOrders(page = 1) {
  const customer = await requireCustomer();
  await db.execute(sql`select doce_costura_private.release_order_reservations()`);
  const currentPage = z.number().int().min(1).max(10000).catch(1).parse(page);
  const rows = await db.select({ id: order.id, number: order.number, status: order.status, subtotalCents: order.subtotalCents, totalCents: order.totalCents, reservationExpiresAt: order.reservationExpiresAt, createdAt: order.createdAt }).from(order).where(eq(order.userId, customer.id)).orderBy(desc(order.createdAt), desc(order.id)).limit(21).offset((currentPage - 1) * 20);
  return { orders: rows.slice(0, 20), hasNext: rows.length > 20, page: currentPage };
}

export async function customerOrder(id: string) {
  const customer = await requireCustomer();
  if (!z.uuid().safeParse(id).success) return null;
  await db.execute(sql`select doce_costura_private.release_order_reservations()`);
  const [record] = await db.select().from(order).where(and(eq(order.id, id), eq(order.userId, customer.id))).limit(1);
  if (!record) return null;
  const [items, events] = await Promise.all([
    db.select().from(orderItem).where(eq(orderItem.orderId, record.id)),
    db.select({ id: orderEvent.id, message: orderEvent.message, createdAt: orderEvent.createdAt }).from(orderEvent).where(eq(orderEvent.orderId, record.id)).orderBy(desc(orderEvent.createdAt)).limit(50),
  ]);
  return { record, items, events };
}

export async function cancelCustomerOrder(id: string) {
  const customer = await requireCustomer();
  z.uuid().parse(id);
  const [released] = await db.execute<{ count: number }>(sql`select doce_costura_private.release_order_reservations(${id}::uuid, ${customer.id}) as count`);
  if (!Number(released.count)) {
    const [record] = await db.select({ status: order.status }).from(order).where(and(eq(order.id, id), eq(order.userId, customer.id))).limit(1);
    if (record?.status !== "canceled") throw new OrderInputError("Não há uma reserva cancelável para este pedido.");
  }
}
