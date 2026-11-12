import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || null);
const digits = (value: string) => value.replace(/[\s()+.-]/g, "");
const phone = z.string().trim().transform(digits).refine((v) => !v || /^\d{10,13}$/.test(v), "Informe telefone com DDD, somente números.").transform((v) => v || null);

export const settingsInput = z.strictObject({
  version: z.iso.datetime().nullable(),
  legalName: optionalText(200),
  cnpj: z.string().trim().transform((v) => v.replace(/[./\s-]/g, "").toUpperCase()).refine((v) => !v || /^[A-Z0-9]{12}\d{2}$/.test(v), "Informe os 14 caracteres do CNPJ cadastrado.").transform((v) => v || null),
  address: optionalText(300),
  contactEmail: z.union([z.literal(""), z.email().max(254)]).transform((v) => v || null),
  contactPhone: phone,
  serviceHours: optionalText(160),
  whatsappNumber: z.string().trim().transform(digits).refine((v) => !v || /^55\d{10,11}$/.test(v), "Informe o WhatsApp com 55, DDD e número.").transform((v) => v || null),
  whatsappMessage: z.string().trim().min(1, "Escreva a mensagem inicial do WhatsApp.").max(500),
  instagramUrl: z.string().trim().max(200).refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(url.hostname) && !url.username && !url.password && !url.port && !url.search && !url.hash && /^\/[a-zA-Z0-9._]+\/?$/.test(url.pathname);
    } catch { return false; }
  }, "Informe o link HTTPS do perfil no Instagram, sem parâmetros.").transform((v) => v || null),
  originCep: z.string().trim().transform((v) => v.replace(/[\s-]/g, "")).refine((v) => !v || /^\d{8}$/.test(v), "Informe um CEP com 8 números.").transform((v) => v || null),
  announcements: z.array(z.string().trim().min(1).max(70, "Cada mensagem deve ter até 70 caracteres.")).max(3, "Cadastre até 3 mensagens.").refine((v) => new Set(v).size === v.length, "Não repita mensagens na barra da loja."),
});

export type SettingsData = z.infer<typeof settingsInput>;
export type EditableSettings = Omit<SettingsData, "version"> & { version: string | null };

export const SETTINGS_TAG = "store-settings";
export class SettingsConflictError extends Error {}
