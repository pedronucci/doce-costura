import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { address, user } from "@/db/schema";
import { requireCustomer } from "./session";
import { addressInput, profileInput, CustomerInputError } from "./schema";
import { z } from "zod";

export async function customerAddresses() {
  const customer = await requireCustomer();
  return db.select().from(address).where(eq(address.userId, customer.id)).orderBy(asc(address.recipient), asc(address.id));
}

export async function saveCustomerAddress(input: unknown) {
  const customer = await requireCustomer();
  const { id, ...values } = addressInput.parse(input);
  return db.transaction(async (tx) => {
    // A linha do usuário serializa alterações de endereço e criação do pedido.
    await tx.execute(sql`select id from "user" where id = ${customer.id} for update`);
    if (id) {
      const [saved] = await tx.update(address).set(values).where(and(eq(address.id, id), eq(address.userId, customer.id))).returning({ id: address.id });
      if (!saved) throw new CustomerInputError("Endereço não encontrado.");
      return saved.id;
    }
    const current = await tx.select({ id: address.id }).from(address).where(eq(address.userId, customer.id)).limit(10);
    if (current.length >= 10) throw new CustomerInputError("Você pode cadastrar até 10 endereços.");
    const [saved] = await tx.insert(address).values({ ...values, userId: customer.id }).returning({ id: address.id });
    return saved.id;
  });
}

export async function deleteCustomerAddress(id: string) {
  const customer = await requireCustomer();
  const parsed = z.uuid().parse(id);
  const deleted = await db.delete(address).where(and(eq(address.id, parsed), eq(address.userId, customer.id))).returning({ id: address.id });
  if (!deleted.length) throw new CustomerInputError("Endereço não encontrado.");
}

export async function saveCustomerProfile(input: unknown) {
  const customer = await requireCustomer();
  const values = profileInput.parse(input);
  await db.update(user).set(values).where(eq(user.id, customer.id));
}
