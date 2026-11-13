"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { clientIp, hitRateLimit } from "@/lib/rate-limit";
import { customerEmail, customerName, customerPassword } from "@/lib/customer/schema";

export type CustomerAuthState = { error?: string; success?: string };

async function allowed(action: string, max: number) {
  return (await hitRateLimit(`customer:${action}:${await clientIp()}`, max, 900)).allowed;
}

export async function customerSignIn(_previous: CustomerAuthState, form: FormData): Promise<CustomerAuthState> {
  const parsed = z.object({ email: customerEmail, password: z.string().min(1).max(128) }).safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: "Informe e-mail e senha válidos." };
  if (!await allowed("login", 8)) return { error: "Muitas tentativas. Aguarde 15 minutos e tente novamente." };
  try { await auth.api.signInEmail({ body: parsed.data, headers: await headers() }); }
  catch (error) { if (error instanceof APIError) return { error: "Não foi possível entrar. Confira seu e-mail e sua senha." }; return { error: "Não foi possível entrar agora. Tente novamente em instantes." }; }
  redirect(form.get("next") === "/checkout" ? "/checkout" : "/conta");
}

export async function customerSignUp(_previous: CustomerAuthState, form: FormData): Promise<CustomerAuthState> {
  const parsed = z.object({ name: customerName, email: customerEmail, password: customerPassword, confirm: z.string() }).refine((v) => v.password === v.confirm, { message: "As senhas não conferem." }).safeParse({ name: form.get("name"), email: form.get("email"), password: form.get("password"), confirm: form.get("confirm") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!await allowed("signup", 5)) return { error: "Muitas tentativas. Aguarde 15 minutos para tentar novamente." };
  try {
    await auth.api.signUpEmail({ body: { name: parsed.data.name, email: parsed.data.email, password: parsed.data.password }, headers: await headers() });
  } catch { return { error: "Não foi possível criar a conta. Confira os dados; se já tem cadastro, tente entrar ou recuperar a senha." }; }
  redirect(form.get("next") === "/checkout" ? "/checkout" : "/conta");
}

export async function customerSignOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/conta/entrar");
}

export async function customerRequestReset(_previous: CustomerAuthState, form: FormData): Promise<CustomerAuthState> {
  const email = customerEmail.safeParse(form.get("email"));
  if (!email.success) return { error: "Informe um e-mail válido." };
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return { error: "A recuperação por e-mail ainda não está disponível. Entre em contato com a loja." };
  if (!await allowed("reset", 5)) return { error: "Muitas tentativas. Aguarde antes de tentar novamente." };
  try {
    const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    await auth.api.requestPasswordReset({ body: { email: email.data, redirectTo: `${base}/conta/redefinir-senha` } });
  } catch { return { error: "Não foi possível solicitar a recuperação agora. Tente novamente mais tarde." }; }
  return { success: "Se houver uma conta com esse e-mail, você receberá um link para redefinir a senha." };
}

export async function customerResetPassword(_previous: CustomerAuthState, form: FormData): Promise<CustomerAuthState> {
  const parsed = z.object({ token: z.string().min(10).max(512), password: customerPassword, confirm: z.string() }).refine((v) => v.password === v.confirm, { message: "As senhas não conferem." }).safeParse({ token: form.get("token"), password: form.get("password"), confirm: form.get("confirm") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!await allowed("reset-password", 8)) return { error: "Muitas tentativas. Aguarde antes de tentar novamente." };
  try { await auth.api.resetPassword({ body: { token: parsed.data.token, newPassword: parsed.data.password } }); }
  catch { return { error: "O link é inválido ou expirou. Solicite uma nova recuperação." }; }
  redirect("/conta/entrar?senha=redefinida");
}
