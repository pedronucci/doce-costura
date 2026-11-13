"use client";

import { useActionState, useState } from "react";
import { Field, inputClass, Notice } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/button-link";
import { BRAZIL_STATES } from "@/lib/customer/schema";
import { cancelOrderAction, deleteAddressAction, saveAddressAction, saveProfileAction, type CustomerFormState } from "@/app/(loja)/conta/actions";

export function ProfileForm({ profile }: { profile: { name: string; email: string; phone: string | null } }) {
  const [state, action, pending] = useActionState<CustomerFormState, FormData>(saveProfileAction, {});
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  return <form action={action} className="max-w-xl space-y-5 rounded-2xl border border-dourado/25 bg-papel p-6">
    {state.error && <Notice tone="error">{state.error}</Notice>}{state.success && <Notice tone="success">{state.success}</Notice>}
    <Field label="Nome" htmlFor="profile-name" required><input id="profile-name" name="name" required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputClass} /></Field>
    <Field label="E-mail de acesso" htmlFor="profile-email" hint="O e-mail de acesso não pode ser alterado por este formulário."><input id="profile-email" type="email" readOnly value={profile.email} className={inputClass} /></Field>
    <Field label="Telefone com DDD" htmlFor="profile-phone"><input id="profile-phone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={25} autoComplete="tel" className={inputClass} /></Field>
    <button type="submit" disabled={pending} className={buttonClass("primary", "disabled:opacity-60")}>{pending ? "Salvando…" : "Salvar meus dados"}</button>
  </form>;
}

export type AddressFields = { id?: string; recipient: string; cep: string; street: string; number: string; complement: string | null; neighborhood: string; city: string; state: string };
export function AddressForm({ initial }: { initial?: AddressFields }) {
  const [state, action, pending] = useActionState<CustomerFormState, FormData>(saveAddressAction, {});
  const [values, setValues] = useState(initial ?? { recipient: "", cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" });
  const field = (name: keyof Omit<AddressFields, "id">) => ({ value: values[name] ?? "", onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const value = event.target.value; setValues((current) => ({ ...current, [name]: value })); } });
  return <form action={action} className="space-y-5 rounded-2xl border border-dourado/25 bg-papel p-6">
    <h2 className="text-3xl">{initial ? "Editar endereço" : "Adicionar endereço"}</h2>
    {initial?.id && <input type="hidden" name="id" value={initial.id} />}
    {state.error && <Notice tone="error">{state.error}</Notice>}
    <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2"><legend className="sr-only">Dados do endereço</legend>
      <Field label="Destinatário" htmlFor="address-recipient" required><input id="address-recipient" name="recipient" required maxLength={80} autoComplete="shipping name" {...field("recipient")} className={inputClass} /></Field>
      <Field label="CEP" htmlFor="address-cep" required><input id="address-cep" name="cep" required maxLength={9} inputMode="numeric" autoComplete="shipping postal-code" {...field("cep")} className={inputClass} /></Field>
      <Field label="Rua / avenida" htmlFor="address-street" required><input id="address-street" name="street" required maxLength={160} autoComplete="shipping address-line1" {...field("street")} className={inputClass} /></Field>
      <Field label="Número" htmlFor="address-number" required hint="Use S/N quando não houver número."><input id="address-number" name="number" required maxLength={20} {...field("number")} className={inputClass} /></Field>
      <Field label="Complemento" htmlFor="address-complement"><input id="address-complement" name="complement" maxLength={100} autoComplete="shipping address-line2" {...field("complement")} className={inputClass} /></Field>
      <Field label="Bairro" htmlFor="address-neighborhood" required><input id="address-neighborhood" name="neighborhood" required maxLength={100} {...field("neighborhood")} className={inputClass} /></Field>
      <Field label="Cidade" htmlFor="address-city" required><input id="address-city" name="city" required maxLength={100} autoComplete="shipping address-level2" {...field("city")} className={inputClass} /></Field>
      <Field label="Estado" htmlFor="address-state" required><select id="address-state" name="state" required autoComplete="shipping address-level1" {...field("state")} className={inputClass}><option value="">Selecione</option>{BRAZIL_STATES.map((state) => <option key={state} value={state}>{state}</option>)}</select></Field>
    </fieldset>
    <button type="submit" disabled={pending} className={buttonClass("primary", "disabled:opacity-60")}>{pending ? "Salvando…" : "Salvar endereço"}</button>
  </form>;
}

export function CustomerRowAction({ id, mode }: { id: string; mode: "address" | "order" }) {
  const [state, action, pending] = useActionState<CustomerFormState, FormData>(mode === "address" ? deleteAddressAction : cancelOrderAction, {});
  return <form action={action} className="space-y-3">
    <input type="hidden" name="id" value={id} />
    {state.error && <Notice tone="error">{state.error}</Notice>}{state.success && <Notice tone="success">{state.success}</Notice>}
    <button disabled={pending || !!state.success} type="submit" className="min-h-11 text-sm text-rosa-profundo underline underline-offset-4">{pending ? "Aguarde…" : mode === "address" ? "Excluir endereço" : "Cancelar reserva e liberar peças"}</button>
  </form>;
}
