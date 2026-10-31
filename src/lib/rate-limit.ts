import "server-only";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";

/**
 * Limite de tentativas por chave (janela fixa), guardado no PostgreSQL —
 * funciona igual em várias instâncias serverless. Atualização atômica (upsert).
 */
export async function hitRateLimit(key: string, max: number, windowSeconds: number) {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const fullKey = `dc:${key}`;
  const rows = await db.execute<{ count: number; last_request: string }>(sql`
    insert into rate_limit (id, key, count, last_request)
    values (gen_random_uuid()::text, ${fullKey}, 1, ${now})
    on conflict (key) do update set
      count = case when rate_limit.last_request < ${windowStart} then 1 else rate_limit.count + 1 end,
      last_request = case when rate_limit.last_request < ${windowStart} then ${now} else rate_limit.last_request end
    returning count, last_request
  `);
  const row = rows[0];
  const count = Number(row.count);
  const retryAfter = Math.max(0, Math.ceil((Number(row.last_request) + windowSeconds * 1000 - now) / 1000));
  return { allowed: count <= max, retryAfter };
}

/** IP do cliente (Vercel envia x-forwarded-for). */
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconhecido";
}
