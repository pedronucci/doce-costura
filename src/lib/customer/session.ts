import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getSession } from "@/lib/auth/guard";

export async function requireCustomer() {
  const session = await getSession();
  if (!session) redirect("/conta/entrar");
  const [customer] = await db.select({ id: user.id, name: user.name, email: user.email, phone: user.phone, deletedAt: user.deletedAt }).from(user).where(eq(user.id, session.user.id)).limit(1);
  if (!customer || customer.deletedAt) redirect("/conta/entrar");
  return customer;
}
