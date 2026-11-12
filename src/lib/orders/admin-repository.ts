import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { order, orderItem, payment, shipment, orderEvent } from "@/db/schema";
import { requireStaff } from "@/lib/auth/guard";
import { ORDER_STATUSES } from "./status";

export const orderFilters = z.object({
  status: z.enum(ORDER_STATUSES).optional().catch(undefined),
  number: z.coerce.number().int().positive().max(2_147_483_647).optional().catch(undefined),
  page: z.coerce.number().int().positive().max(10000).default(1).catch(1),
});
const PAGE_SIZE = 30;

export async function listOrdersForAdmin(input: unknown) {
  await requireStaff();
  const filters = orderFilters.parse(input);
  const rows = await db.select({
    id: order.id, number: order.number, customerName: order.customerName,
    status: order.status, totalCents: order.totalCents, createdAt: order.createdAt,
  }).from(order).where(and(
    filters.status ? eq(order.status, filters.status) : undefined,
    filters.number ? eq(order.number, filters.number) : undefined,
  )).orderBy(desc(order.createdAt), desc(order.id)).limit(PAGE_SIZE + 1).offset((filters.page - 1) * PAGE_SIZE);
  return { orders: rows.slice(0, PAGE_SIZE), hasNext: rows.length > PAGE_SIZE, filters };
}

/** A autorização vem antes de consultar o identificador; IDs não substituem permissão. */
export async function getOrderForAdmin(id: string) {
  await requireStaff();
  if (!z.uuid().safeParse(id).success) return null;
  const [record] = await db.select().from(order).where(eq(order.id, id)).limit(1);
  if (!record) return null;
  const [items, payments, shipments, events] = await Promise.all([
    db.select().from(orderItem).where(eq(orderItem.orderId, id)),
    db.select({ id: payment.id, provider: payment.provider, method: payment.method, status: payment.status, amountCents: payment.amountCents, refundedCents: payment.refundedCents }).from(payment).where(eq(payment.orderId, id)).orderBy(desc(payment.createdAt)),
    db.select({ serviceName: shipment.serviceName, status: shipment.status, trackingCode: shipment.trackingCode, quotedDays: shipment.quotedDays }).from(shipment).where(eq(shipment.orderId, id)),
    db.select({ id: orderEvent.id, message: orderEvent.message, createdAt: orderEvent.createdAt }).from(orderEvent).where(eq(orderEvent.orderId, id)).orderBy(desc(orderEvent.createdAt), desc(orderEvent.id)).limit(100),
  ]);
  return { record, items, payments, shipments, events };
}
