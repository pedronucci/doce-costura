import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";

/** Já existe administrador? (o primeiro acesso só funciona enquanto não houver) */
export async function adminExists() {
  const rows = await db.select({ id: user.id }).from(user).where(eq(user.role, "admin")).limit(1);
  return rows.length > 0;
}
