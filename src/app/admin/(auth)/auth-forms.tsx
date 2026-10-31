"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, inputClass, Notice } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";
import {
  requestResetAction,
  resetPasswordAction,
  setupAdminAction,
  signInAction,
  type FormState,
} from "./actions";

const initial: FormState = {};

export function SignInForm({ notice }: { notice?: string }) {
  const [state, action] = useActionState(signInAction, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <h1 className="font-sans text-[1.15rem] font-semibold text-cacau">Entrar</h1>
      {notice && !state.error && <Notice tone="success">{notice}</Notice>}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="E-mail" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.fields?.email} className={inputClass} />
      </Field>
      <Field label="Senha" htmlFor="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <SubmitButton pendingText="Entrando…" className="w-full">
        Entrar
      </SubmitButton>
      <p className="text-center text-[0.82rem]">
        <Link href="/admin/recuperar-senha" className="text-rosa-profundo hover:underline">
          Esqueci minha senha
        </Link>
      </p>
    </form>
  );
}

export function RequestResetForm() {
  const [state, action] = useActionState(requestResetAction, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <h1 className="font-sans text-[1.15rem] font-semibold text-cacau">Recuperar senha</h1>
      <p className="text-[0.86rem] text-tinta-suave">Informe o e-mail da sua conta. Enviaremos um link para criar uma nova senha.</p>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success ? (
        <Notice tone="success">{state.success}</Notice>
      ) : (
        <>
          <Field label="E-mail" htmlFor="email">
            <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
          </Field>
          <SubmitButton pendingText="Enviando…" className="w-full">
            Enviar link
          </SubmitButton>
        </>
      )}
      <p className="text-center text-[0.82rem]">
        <Link href="/admin/entrar" className="text-rosa-profundo hover:underline">
          Voltar para a entrada
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <h1 className="font-sans text-[1.15rem] font-semibold text-cacau">Nova senha</h1>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <input type="hidden" name="token" value={token} />
      <Field label="Nova senha" htmlFor="newPassword" hint="Mínimo de 10 caracteres. Prefira uma frase longa.">
        <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required className={inputClass} />
      </Field>
      <Field label="Repita a nova senha" htmlFor="confirm">
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={inputClass} />
      </Field>
      <SubmitButton pendingText="Salvando…" className="w-full">
        Salvar nova senha
      </SubmitButton>
    </form>
  );
}

export function SetupForm() {
  const [state, action] = useActionState(setupAdminAction, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <h1 className="font-sans text-[1.15rem] font-semibold text-cacau">Primeiro acesso</h1>
      <p className="text-[0.86rem] leading-relaxed text-tinta-suave">
        Crie a conta de administrador. Esta tela fica disponível apenas até a primeira conta ser criada.
      </p>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Código de configuração" htmlFor="token" hint="O valor de ADMIN_SETUP_TOKEN definido nas variáveis de ambiente.">
        <input id="token" name="token" type="password" autoComplete="off" required className={inputClass} />
      </Field>
      <Field label="Seu nome" htmlFor="name">
        <input id="name" name="name" autoComplete="name" required defaultValue={state.fields?.name} className={inputClass} />
      </Field>
      <Field label="E-mail" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.fields?.email} className={inputClass} />
      </Field>
      <Field label="Senha" htmlFor="password" hint="Mínimo de 10 caracteres.">
        <input id="password" name="password" type="password" autoComplete="new-password" required className={inputClass} />
      </Field>
      <Field label="Repita a senha" htmlFor="confirm">
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={inputClass} />
      </Field>
      <SubmitButton pendingText="Criando…" className="w-full">
        Criar administrador
      </SubmitButton>
    </form>
  );
}
