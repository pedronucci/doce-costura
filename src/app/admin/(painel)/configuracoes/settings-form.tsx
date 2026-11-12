"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { Card, Field, inputClass, Notice } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";
import type { EditableSettings } from "@/lib/config/settings-schema";
import { saveSettingsAction, type SettingsFormState } from "./actions";

export function SettingsForm({ settings }: { settings: EditableSettings }) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(saveSettingsAction, {});
  // Campos controlados preservam o que foi digitado mesmo quando a ação retorna erro.
  const [values, setValues] = useState(() => ({ ...settings, announcements: settings.announcements.join("\n") }));
  function field(name: Exclude<keyof EditableSettings, "version">) {
    return {
      value: values[name] ?? "",
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value;
        setValues((current) => ({ ...current, [name]: value }));
      },
    };
  }
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="version" value={state.savedVersion ?? settings.version ?? ""} />
      <Notice>Os dados de empresa e atendimento abaixo serão exibidos publicamente na loja. O CEP de origem é restrito ao painel. Preencha somente informações que você deseja publicar.</Notice>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.savedVersion && !state.error && <Notice tone="success">Configurações salvas. O site já pode exibir as informações atualizadas.</Notice>}
      <fieldset disabled={pending} className="min-w-0 space-y-5 disabled:opacity-70">
        <legend className="sr-only">Dados e contatos da loja</legend>
        <Card title="Dados da empresa" description="Aparecem na identificação da loja, no rodapé. Campos vazios permanecem pendentes de cadastro.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Razão social" htmlFor="legalName"><input id="legalName" name="legalName" maxLength={200} {...field("legalName")} className={inputClass} autoComplete="organization" /></Field>
            <Field label="CNPJ" htmlFor="cnpj" hint="Informe o CNPJ exatamente como cadastrado."><input id="cnpj" name="cnpj" maxLength={20} {...field("cnpj")} className={inputClass} /></Field>
            <Field label="Endereço público da empresa" htmlFor="address" className="sm:col-span-2" hint="Inclua logradouro, número, bairro, cidade, estado e CEP que serão divulgados."><textarea id="address" name="address" maxLength={300} rows={3} {...field("address")} className={inputClass} /></Field>
          </div>
        </Card>
        <Card title="Atendimento" description="Os contatos e horários aparecerão no rodapé da loja.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="E-mail de contato" htmlFor="contactEmail"><input id="contactEmail" name="contactEmail" type="email" maxLength={254} {...field("contactEmail")} className={inputClass} autoComplete="email" /></Field>
            <Field label="Telefone com DDD" htmlFor="contactPhone"><input id="contactPhone" name="contactPhone" type="tel" maxLength={25} {...field("contactPhone")} className={inputClass} autoComplete="tel" /></Field>
            <Field label="Horários de atendimento" htmlFor="serviceHours" className="sm:col-span-2"><input id="serviceHours" name="serviceHours" maxLength={160} {...field("serviceHours")} className={inputClass} placeholder="Informe os dias e horários reais de atendimento" /></Field>
          </div>
        </Card>
        <Card title="WhatsApp e Instagram" description="O botão de WhatsApp e o link do Instagram aparecem somente quando cadastrados. Apague o campo para ocultá-los.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp" htmlFor="whatsappNumber" hint="Inclua 55, DDD e número. Exemplo de formato: +55 (11) 99999-9999."><input id="whatsappNumber" name="whatsappNumber" type="tel" maxLength={25} {...field("whatsappNumber")} className={inputClass} /></Field>
            <Field label="Link do perfil no Instagram" htmlFor="instagramUrl" hint="Use https://www.instagram.com/seu_perfil/"><input id="instagramUrl" name="instagramUrl" type="url" maxLength={200} {...field("instagramUrl")} className={inputClass} /></Field>
            <Field label="Mensagem inicial do WhatsApp" htmlFor="whatsappMessage" className="sm:col-span-2" required><textarea id="whatsappMessage" name="whatsappMessage" required maxLength={500} rows={3} {...field("whatsappMessage")} className={inputClass} /></Field>
          </div>
        </Card>
        <Card title="Barra de mensagens" description="Opcional: até 3 mensagens curtas, uma por linha, com até 70 caracteres cada. Cadastre somente benefícios reais. Sem mensagens, a barra mostra o slogan da marca.">
          <Field label="Mensagens da barra" htmlFor="announcements"><textarea id="announcements" name="announcements" maxLength={220} rows={4} {...field("announcements")} className={inputClass} /></Field>
        </Card>
        <Card title="Origem dos envios" description="Informação interna, preparada para a futura integração de frete. Salvar o CEP ainda não habilita cotações nem compra etiquetas.">
          <Field label="CEP de origem" htmlFor="originCep" hint="CEP de onde as encomendas sairão."><input id="originCep" name="originCep" inputMode="numeric" maxLength={9} {...field("originCep")} className={inputClass} autoComplete="off" /></Field>
        </Card>
      </fieldset>
      <div className="sticky bottom-0 flex justify-end rounded-xl border border-dourado/25 bg-papel p-4 shadow-sm"><SubmitButton>Salvar configurações</SubmitButton></div>
    </form>
  );
}
