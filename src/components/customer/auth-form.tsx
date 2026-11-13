"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Field, inputClass, Notice } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/button-link";
import { customerRequestReset, customerResetPassword, customerSignIn, customerSignUp, type CustomerAuthState } from "@/app/(loja)/conta/auth-actions";

export function CustomerAuthForm({ mode, next, token = "", resetNotice = false }: { mode: "signin" | "signup" | "request" | "reset"; next?: string; token?: string; resetNotice?: boolean }) {
  const action = { signin: customerSignIn, signup: customerSignUp, request: customerRequestReset, reset: customerResetPassword }[mode];
  const [state, submit, pending] = useActionState<CustomerAuthState, FormData>(action, {});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const title = { signin: "Entre na sua conta", signup: "Crie sua conta", request: "Recupere sua senha", reset: "Escolha uma nova senha" }[mode];
  return <section className="mx-auto max-w-md rounded-2xl border border-dourado/25 bg-papel p-6 sm:p-8">
    <h1 className="text-3xl">{title}</h1>
    <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{mode === "signup" ? "Salve seus endereços e acompanhe seus pedidos. A conta não cria uma compra nem uma cobrança." : "Um espaço para cuidar dos seus dados e das suas escolhas."}</p>
    <form action={submit} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next === "/checkout" ? "/checkout" : "/conta"} />
      {mode === "reset" && <input type="hidden" name="token" value={token} />}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      {resetNotice && !state.error && <Notice tone="success">Senha alterada. Entre com sua nova senha.</Notice>}
      <fieldset disabled={pending} className="space-y-4">
        <legend className="sr-only">Dados de acesso</legend>
        {mode === "signup" && <Field label="Seu nome" htmlFor="customer-name" required><input id="customer-name" name="name" required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputClass} /></Field>}
        {mode !== "reset" && <Field label="E-mail" htmlFor="customer-email" required><input id="customer-email" name="email" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" className={inputClass} /></Field>}
        {mode !== "request" && <Field label="Senha" htmlFor="customer-password" required hint={mode !== "signin" ? "Use pelo menos 10 caracteres." : undefined}><input id="customer-password" name="password" type="password" required minLength={mode === "signin" ? 1 : 10} maxLength={128} autoComplete={mode === "signin" ? "current-password" : "new-password"} className={inputClass} /></Field>}
        {(mode === "signup" || mode === "reset") && <Field label="Confirme a senha" htmlFor="customer-confirm" required><input id="customer-confirm" name="confirm" type="password" required maxLength={128} autoComplete="new-password" className={inputClass} /></Field>}
      </fieldset>
      <button type="submit" disabled={pending || !!state.success} className={buttonClass("primary", "w-full disabled:opacity-60")}>{pending ? "Aguarde…" : { signin: "Entrar", signup: "Criar conta", request: "Enviar link", reset: "Redefinir senha" }[mode]}</button>
    </form>
    <div className="mt-6 space-y-3 text-center text-sm text-rosa-profundo">
      {mode === "signin" ? <><p><Link href={`/conta/criar${next === "/checkout" ? "?next=checkout" : ""}`} className="underline underline-offset-4">Ainda não tenho uma conta</Link></p><p><Link href="/conta/recuperar-senha" className="underline underline-offset-4">Esqueci minha senha</Link></p></> : <p><Link href={`/conta/entrar${next === "/checkout" ? "?next=checkout" : ""}`} className="underline underline-offset-4">Voltar para entrar</Link></p>}
      <p className="text-xs leading-relaxed text-tinta-suave">Consulte nossa <Link href="/politica-de-privacidade" className="underline">política de privacidade</Link> para saber como usamos seus dados.</p>
    </div>
  </section>;
}
