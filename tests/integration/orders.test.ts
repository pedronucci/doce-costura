import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../../src/db/schema";
import { createReservedOrder } from "../../src/lib/orders/service";

vi.mock("server-only", () => ({}));
const url = process.env.TEST_DATABASE_URL;
if (!url || !["127.0.0.1", "localhost"].includes(new URL(url).hostname) || new URL(url).pathname !== "/doce_costura_test") throw new Error("Os testes exigem um PostgreSQL local exclusivo.");
const sql = postgres(url, { prepare: false, max: 6 });
const db = drizzle(sql, { schema, casing: "snake_case" });
const variantId = randomUUID();
let addressA: string;
let addressB: string;
let productId: string;
const destination = { recipient: "Cliente sintético", cep: "01001000", street: "Rua de Teste", number: "1", neighborhood: "Centro", city: "Cidade de Teste", state: "SP" };
const input = (addressId = addressA, quantity = 1, idempotencyKey = randomUUID()) => ({ items: [{ variantId, quantity }], addressId, idempotencyKey, expectedSubtotalCents: 1990 * quantity, acceptedTerms: true });

beforeAll(async () => {
  await db.insert(schema.user).values([{ id: "customer-a", name: "Cliente A", email: "a@example.com" }, { id: "customer-b", name: "Cliente B", email: "b@example.com" }]);
  const [a] = await db.insert(schema.address).values({ ...destination, userId: "customer-a" }).returning(); addressA = a.id;
  const [b] = await db.insert(schema.address).values({ ...destination, userId: "customer-b" }).returning(); addressB = b.id;
  const [product] = await db.insert(schema.product).values({ slug: "peca-teste", name: "Peça sintética", status: "active" }).returning(); productId = product.id;
  await db.insert(schema.productVariant).values({ id: variantId, productId, name: "Modelo teste", sku: "TEST-1", priceCents: 1990, stock: 1 });
});
beforeEach(async () => {
  await sql`truncate table order_event, stock_movement, order_item, payment, shipment, "order" restart identity cascade`;
  await db.update(schema.productVariant).set({ stock: 1, reserved: 0, priceCents: 1990, isActive: true }).where(eq(schema.productVariant.id, variantId));
  await db.update(schema.product).set({ status: "active" }).where(eq(schema.product.id, productId));
});
afterAll(async () => { await sql.end(); });

describe("pedidos em PostgreSQL real", () => {
  it("dois clientes disputando a última unidade geram somente um pedido e uma reserva", async () => {
    const result = await Promise.allSettled([createReservedOrder(db, "customer-a", input()), createReservedOrder(db, "customer-b", input(addressB))]);
    expect(result.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const [stock] = await sql`select stock,reserved from product_variant where id=${variantId}`;
    expect(stock).toMatchObject({ stock: 1, reserved: 1 });
    const [count] = await sql`select count(*)::int as count from "order"`; expect(count.count).toBe(1);
  });
  it("repetições simultâneas da mesma solicitação devolvem o mesmo pedido", async () => {
    const data = input();
    const [a, b] = await Promise.all([createReservedOrder(db, "customer-a", data), createReservedOrder(db, "customer-a", data)]);
    expect(a.id).toBe(b.id);
    const [stock] = await sql`select reserved from product_variant where id=${variantId}`; expect(stock.reserved).toBe(1);
  });
  it("rejeita troca de conteúdo ao reutilizar a chave e não duplica a reserva", async () => {
    const data = input(); await createReservedOrder(db, "customer-a", data);
    await expect(createReservedOrder(db, "customer-a", { ...data, expectedSubtotalCents: 1 })).rejects.toThrow("outras escolhas");
    const [stock] = await sql`select reserved from product_variant where id=${variantId}`; expect(stock.reserved).toBe(1);
  });
  it("não aceita endereço de outro cliente", async () => {
    await expect(createReservedOrder(db, "customer-a", input(addressB))).rejects.toThrow("endereço da sua conta");
    const [stock] = await sql`select reserved from product_variant where id=${variantId}`; expect(stock.reserved).toBe(0);
  });
  it("não aceita preço adulterado ou peça ainda não liberada", async () => {
    await expect(createReservedOrder(db, "customer-a", { ...input(), expectedSubtotalCents: 1 })).rejects.toThrow("preços foram atualizados");
    await db.update(schema.product).set({ status: "coming_soon" }).where(eq(schema.product.id, productId));
    await expect(createReservedOrder(db, "customer-a", input())).rejects.toThrow("disponibilidade");
    const [count] = await sql`select count(*)::int as count from "order"`; expect(count.count).toBe(0);
  });
  it("expira uma reserva uma única vez e mantém frete e total indefinidos", async () => {
    const created = await createReservedOrder(db, "customer-a", input());
    await sql`update "order" set reservation_expires_at=clock_timestamp()-interval '1 second' where id=${created.id}`;
    await Promise.all([sql`select doce_costura_private.release_order_reservations()`, sql`select doce_costura_private.release_order_reservations()`]);
    const [record] = await sql`select status,shipping_cents,total_cents,reservation_released_at from "order" where id=${created.id}`;
    expect(record).toMatchObject({ status: "canceled", shipping_cents: null, total_cents: null });
    expect(record.reservation_released_at).not.toBeNull();
    const [stock] = await sql`select reserved from product_variant where id=${variantId}`; expect(stock.reserved).toBe(0);
    const [events] = await sql`select count(*)::int as count from stock_movement where reason='order_released'`; expect(events.count).toBe(1);
  });
  it("cancelamento por outro cliente não libera estoque; cancelamento repetido do dono não duplica efeitos", async () => {
    const created = await createReservedOrder(db, "customer-a", input());
    const [other] = await sql`select doce_costura_private.release_order_reservations(${created.id}::uuid,'customer-b') as count`; expect(other.count).toBe(0);
    await Promise.all([sql`select doce_costura_private.release_order_reservations(${created.id}::uuid,'customer-a')`, sql`select doce_costura_private.release_order_reservations(${created.id}::uuid,'customer-a')`]);
    const [stock] = await sql`select reserved from product_variant where id=${variantId}`; expect(stock.reserved).toBe(0);
    const [events] = await sql`select count(*)::int as count from stock_movement where reason='order_released'`; expect(events.count).toBe(1);
  });
  it("mantém os dados do pedido mesmo após alterar endereço e preço", async () => {
    const created = await createReservedOrder(db, "customer-a", input());
    await db.update(schema.address).set({ street: "Outra rua" }).where(eq(schema.address.id, addressA));
    await db.update(schema.productVariant).set({ priceCents: 9990 }).where(eq(schema.productVariant.id, variantId));
    const [record] = await sql`select ship_street,subtotal_cents from "order" where id=${created.id}`;
    expect(record).toMatchObject({ ship_street: "Rua de Teste", subtotal_cents: 1990 });
    await db.update(schema.address).set({ street: destination.street }).where(eq(schema.address.id, addressA));
  });
  it("uma falha durante a criação reverte pedido, itens e estoque", async () => {
    await sql.unsafe(`CREATE FUNCTION public.test_reject_event() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic failure'; END $$; CREATE TRIGGER test_fail BEFORE INSERT ON order_event FOR EACH ROW EXECUTE FUNCTION public.test_reject_event();`);
    try { await expect(createReservedOrder(db, "customer-a", input())).rejects.toMatchObject({ cause: { message: "synthetic failure" } }); }
    finally { await sql.unsafe("DROP TRIGGER test_fail ON order_event; DROP FUNCTION public.test_reject_event();"); }
    const [record] = await sql`select (select count(*)::int from "order") as orders,(select reserved from product_variant where id=${variantId}) as reserved`;
    expect(record).toMatchObject({ orders: 0, reserved: 0 });
  });
  it("não libera reserva associada a pagamento aprovado", async () => {
    const created = await createReservedOrder(db, "customer-a", input());
    await db.insert(schema.payment).values({ orderId: created.id, status: "approved", method: "pix", amountCents: 1990 });
    await sql`update "order" set reservation_expires_at=clock_timestamp()-interval '1 second' where id=${created.id}`;
    const [result] = await sql`select doce_costura_private.release_order_reservations() as count`;
    expect(result.count).toBe(0);
    const [stock] = await sql`select reserved from product_variant where id=${variantId}`;
    expect(stock.reserved).toBe(1);
  });
  it("a integridade do banco impede baixar estoque abaixo do reservado", async () => {
    await createReservedOrder(db, "customer-a", input());
    await expect(sql`update product_variant set stock=0 where id=${variantId}`).rejects.toMatchObject({ code: "23514" });
  });
  it("expira a reserva anterior antes de permitir novo pedido para a mesma conta", async () => {
    const created = await createReservedOrder(db, "customer-a", input());
    await sql`update "order" set reservation_expires_at=clock_timestamp()-interval '1 second' where id=${created.id}`;
    const next = await createReservedOrder(db, "customer-a", input());
    expect(next.id).not.toBe(created.id);
    const [stock] = await sql`select reserved from product_variant where id=${variantId}`;
    expect(stock.reserved).toBe(1);
  });
});
