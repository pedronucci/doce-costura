import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Conexão com o PostgreSQL.
 * - Supabase: use a string do "Transaction pooler" (porta 6543). Por isso
 *   `prepare: false` — o pooler em modo transação não suporta prepared statements.
 * - Local: qualquer Postgres 15+ (ver README).
 */
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL não configurada. Copie .env.example para .env.local e preencha.");
}

const globalForDb = globalThis as unknown as { __dcSql?: ReturnType<typeof postgres> };

const client =
  globalForDb.__dcSql ??
  postgres(url, {
    prepare: false,
    max: process.env.NODE_ENV === "production" ? 5 : 10,
    idle_timeout: 20,
    ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require",
  });

if (process.env.NODE_ENV !== "production") globalForDb.__dcSql = client;

export const db = drizzle(client, { schema, casing: "snake_case" });
export type Db = typeof db;
export { schema };
