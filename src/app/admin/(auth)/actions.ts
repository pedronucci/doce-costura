"use server";

import { timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { z } from "zod";
import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { adminExists } from "@/lib/auth/admin";
import { auth, MIN_PASSWORD_LENGTH } from "@/lib/auth";
import { clientIp, hitRateLimit } from "@/lib/rate-limit";

export type FormState = { error?: string; success?: string; fields?: Record<string, string> };

const email = z.email("Informe um e-mail válido.").trim().toLowerCase();
const password = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`)
  .max(128);

function tooMany(retryAfter: number): FormState {
  const min = Math.max(1, Math.ceil(retryAfter / 60));
  return { error: `Muitas tentativas. Tente novamente em ${min} minuto${min > 1 ? "s" : ""}.` };
}

export async function signInAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = z.object({ email, password: z.string().min(1, "Informe a senha.") }).safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields: { email: String(form.get("email") ?? "") } };

  const ip = await clientIp();
  for (const key of [`login:ip:${ip}`, `login:email:${parsed.data.email}`]) {
    const rl = await hitRateLimit(key, 8, 15 * 60);
    if (!rl.allowed) return tooMany(rl.retryAfter);
  }

  try {
    const res = await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
    const role = (res.user as { role?: string }).role;
    if (role !== "admin" && role !== "staff") {
      await auth.api.signOut({ headers: await headers() });
      return { error: "Esta conta não tem acesso ao painel.", fields: { email: parsed.data.email } };
    }
  } catch (e) {
    if (e instanceof APIError) return { error: "E-mail ou senha incorretos.", fields: { email: parsed.data.email } };
    throw e;
  }
  redirect("/admin");
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/entrar");
}

export async function requestResetAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = email.safeParse(form.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const ip = await clientIp();
  const rl = await hitRateLimit(`reset:ip:${ip}`, 5, 15 * 60);
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  try {
    await auth.api.requestPasswordReset({ body: { email: parsed.data, redirectTo: `${base}/admin/redefinir-senha` } });
  } catch (e) {
    console.error("[recuperar-senha]", e instanceof Error ? e.message : e);
  }
  // Mesma resposta exista ou não a conta (não revela quem tem cadastro).
  return { success: "Se houver uma conta com este e-mail, enviamos um link para criar uma nova senha. Ele vale por 1 hora." };
}

export async function resetPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({ token: z.string().min(10), newPassword: password, confirm: z.string() })
    .refine((d) => d.newPassword === d.confirm, { message: "As senhas não conferem.", path: ["confirm"] })
    .safeParse({ token: form.get("token"), newPassword: form.get("newPassword"), confirm: form.get("confirm") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await auth.api.resetPassword({ body: { token: parsed.data.token, newPassword: parsed.data.newPassword } });
  } catch (e) {
    if (e instanceof APIError) return { error: "Link inválido ou expirado. Peça um novo." };
    throw e;
  }
  redirect("/admin/entrar?senha=redefinida");
}

function sameToken(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function setupAdminAction(_prev: FormState, form: FormData): Promise<FormState> {
  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected || expected.length < 12) return { error: "Primeiro acesso desativado: configure ADMIN_SETUP_TOKEN (mínimo de 12 caracteres)." };
  if (await adminExists()) return { error: "O painel já tem um administrador. Use a tela de entrada." };

  const ip = await clientIp();
  const rl = await hitRateLimit(`setup:ip:${ip}`, 5, 15 * 60);
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const parsed = z
    .object({
      token: z.string(),
      name: z.string().trim().min(2, "Informe seu nome.").max(80),
      email,
      password,
      confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, { message: "As senhas não conferem.", path: ["confirm"] })
    .safeParse(Object.fromEntries(form));
  const fields = { name: String(form.get("name") ?? ""), email: String(form.get("email") ?? "") };
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };
  if (!sameToken(parsed.data.token, expected)) return { error: "Código de configuração incorreto.", fields };

  const ctx = await auth.$context;
  const existing = await ctx.internalAdapter.findUserByEmail(parsed.data.email);
  if (existing) return { error: "Já existe uma conta com este e-mail.", fields };

  const created = await ctx.internalAdapter.createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    emailVerified: true,
    role: "admin",
  }, { method: "admin" });
  await ctx.internalAdapter.linkAccount({
    userId: created.id,
    providerId: "credential",
    accountId: created.id,
    password: await ctx.password.hash(parsed.data.password),
  });
  await db.insert(auditLog).values({ actorId: created.id, action: "admin.setup", entity: "user", entityId: created.id, ip });

  await auth.api.signInEmail({ body: { email: parsed.data.email, password: parsed.data.password }, headers: await headers() });
  redirect("/admin");
}
