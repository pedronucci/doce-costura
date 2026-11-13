import { z } from "zod";

export const customerName = z.string().trim().min(2, "Informe seu nome.").max(80);
export const customerEmail = z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido.").max(254));
export const customerPassword = z.string().min(10, "Use ao menos 10 caracteres na senha.").max(128);
export const customerPhone = z.string().trim().transform((v) => v.replace(/[\s()+.-]/g, "")).refine((v) => !v || /^\d{10,13}$/.test(v), "Informe um telefone com DDD.").transform((v) => v || null);
export const BRAZIL_STATES = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"] as const;
export const addressInput = z.strictObject({
  id: z.uuid().optional(),
  recipient: customerName,
  cep: z.string().trim().transform((v) => v.replace(/[-\s]/g, "")).pipe(z.string().regex(/^\d{8}$/, "Informe um CEP com 8 números.")),
  street: z.string().trim().min(2, "Informe a rua.").max(160),
  number: z.string().trim().min(1, "Informe o número ou S/N.").max(20),
  complement: z.string().trim().max(100).transform((v) => v || null),
  neighborhood: z.string().trim().min(2, "Informe o bairro.").max(100),
  city: z.string().trim().min(2, "Informe a cidade.").max(100),
  state: z.enum(BRAZIL_STATES, "Selecione o estado."),
});
export const profileInput = z.strictObject({ name: customerName, phone: customerPhone });
export class CustomerInputError extends Error {}
