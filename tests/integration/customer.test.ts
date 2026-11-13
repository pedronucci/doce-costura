import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { auth as Auth } from "../../src/lib/auth";
import type { db as Database } from "../../src/db";
import * as schema from "../../src/db/schema";

vi.mock("server-only", () => ({}));
const identity = vi.hoisted(() => ({ current: { id: "", name: "Cliente sintético", email: "test@example.com", phone: null, deletedAt: null } }));
vi.mock("@/lib/customer/session", () => ({ requireCustomer: vi.fn(async () => identity.current) }));
vi.mock("@/lib/email", async (original) => ({ ...await original<object>(), sendEmail: vi.fn() }));

let auth: typeof Auth;
let db: typeof Database;
let repository: typeof import("../../src/lib/customer/repository");
let orders: typeof import("../../src/lib/orders/customer-repository");
const origin = "http://127.0.0.1:3100";
const password = "Senha-sintetica-de-teste-123";
let userId: string;
let otherUserId: string;
let email: string;
let cookie: string;

async function request(path: string, body?: unknown, cookies?: string) {
  return auth.handler(new Request(`${origin}/api/auth/${path}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", Origin: origin, ...(cookies && { Cookie: cookies }) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  }));
}

beforeAll(async () => {
  const url = process.env.TEST_DATABASE_URL;
  if (!url || new URL(url).hostname !== "127.0.0.1" || new URL(url).pathname !== "/doce_costura_test") throw new Error("Banco de teste local obrigatório.");
  process.env.DATABASE_URL = url;
  process.env.BETTER_AUTH_URL = origin;
  process.env.BETTER_AUTH_SECRET = randomUUID() + randomUUID();
  process.env.RESEND_API_KEY = "somente-simulacao-local";
  process.env.EMAIL_FROM = "teste@example.com";
  ({ db } = await import("../../src/db"));
  ({ auth } = await import("../../src/lib/auth"));
  repository = await import("../../src/lib/customer/repository");
  orders = await import("../../src/lib/orders/customer-repository");
  email = `cliente-${randomUUID()}@example.com`;
  const response = await request("sign-up/email", { name: "Cliente sintético", email, password });
  expect(response.status).toBe(200);
  const data = await response.json();
  userId = data.user.id;
  cookie = response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  identity.current.id = userId;
  otherUserId = randomUUID();
  await db.insert(schema.user).values({ id: otherUserId, name: "Outra conta sintética", email: `outro-${randomUUID()}@example.com` });
});
afterAll(async () => { await db?.$client.end(); });

describe("conta do cliente em PostgreSQL real", () => {
  it("cria conta comum, armazena hash e mantém sessão válida", async () => {
    const [user] = await db.select().from(schema.user).where(eq(schema.user.id, userId));
    expect(user.role).toBe("customer");
    const [credential] = await db.select().from(schema.account).where(eq(schema.account.userId, userId));
    expect(credential.password).not.toBe(password);
    const session = await request("get-session", undefined, cookie);
    expect((await session.json()).user.id).toBe(userId);
  });
  it("não permite forjar papel administrativo no cadastro público", async () => {
    const forgedEmail = `forjado-${randomUUID()}@example.com`;
    await request("sign-up/email", { name: "Teste", email: forgedEmail, password, role: "admin" });
    const [record] = await db.select({ role: schema.user.role }).from(schema.user).where(eq(schema.user.email, forgedEmail));
    expect(record?.role ?? "customer").toBe("customer");
  });
  it("não permite alterar ou remover endereço alheio", async () => {
    const values = { recipient: "Pessoa teste", cep: "01001-000", street: "Rua de teste", number: "1", complement: "", neighborhood: "Centro", city: "Cidade teste", state: "SP" };
    const id = await repository.saveCustomerAddress(values);
    identity.current.id = otherUserId;
    expect(await repository.customerAddresses()).toEqual([]);
    await expect(repository.saveCustomerAddress({ ...values, id })).rejects.toThrow("não encontrado");
    await expect(repository.deleteCustomerAddress(id)).rejects.toThrow("não encontrado");
    identity.current.id = userId;
    expect((await repository.customerAddresses()).some((item) => item.id === id)).toBe(true);
    await repository.deleteCustomerAddress(id);
  });
  it("não altera papel ou e-mail por dados de perfil forjados", async () => {
    await expect(repository.saveCustomerProfile({ name: "Nome", phone: "", role: "admin" })).rejects.toThrow();
    const [record] = await db.select({ role: schema.user.role, email: schema.user.email }).from(schema.user).where(eq(schema.user.id, userId));
    expect(record).toMatchObject({ role: "customer", email });
  });
  it("um cliente não lê detalhes de pedido de outra conta", async () => {
    const [record] = await db.insert(schema.order).values({ userId: userId, idempotencyKey: randomUUID(), status: "awaiting_checkout", customerName: "Pessoa teste", customerEmail: "teste@example.com", shipRecipient: "Pessoa teste", shipCep: "01001000", shipStreet: "Rua de teste", shipNumber: "1", shipNeighborhood: "Centro", shipCity: "Cidade teste", shipState: "SP", subtotalCents: 1990, acceptedTermsAt: new Date() }).returning();
    identity.current.id = otherUserId;
    expect(await orders.customerOrder(record.id)).toBeNull();
    expect((await orders.customerOrders()).orders.some((item) => item.id === record.id)).toBe(false);
    await expect(orders.cancelCustomerOrder(record.id)).rejects.toThrow("cancelável");
    identity.current.id = userId;
    expect((await orders.customerOrder(record.id))?.record.id).toBe(record.id);
  });
  it("recuperação redefine a senha e revoga sessões anteriores sem enviar e-mail real", async () => {
    const { sendEmail } = await import("../../src/lib/email");
    await auth.api.requestPasswordReset({ body: { email, redirectTo: `${origin}/conta/redefinir-senha` } });
    const message = vi.mocked(sendEmail).mock.calls.at(-1)?.[0];
    expect(message).toBeDefined();
    const url = message!.text.match(/http[^\s]+/)![0];
    const token = new URL(url).pathname.split("/").at(-1)!;
    await auth.api.resetPassword({ body: { token, newPassword: password + "-nova" } });
    const response = await request("get-session", undefined, cookie);
    expect(await response.json()).toBeNull();
    const signIn = await request("sign-in/email", { email, password: password + "-nova" });
    expect(signIn.status).toBe(200);
  });
});
