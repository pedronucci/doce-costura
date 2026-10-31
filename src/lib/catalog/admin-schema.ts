import { z } from "zod";

/**
 * Validação do cadastro de produtos (painel).
 * Os mesmos esquemas rodam no servidor — o navegador nunca é a fonte da verdade.
 */

export const PRODUCT_STATUSES = ["draft", "coming_soon", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "Rascunho",
  coming_soon: "Em breve",
  active: "À venda",
  archived: "Arquivado",
};

export const STATUS_HELP: Record<ProductStatus, string> = {
  draft: "Invisível na loja. Use enquanto cadastra.",
  coming_soon: "Aparece na loja com “Preço em breve”, sem botão de compra.",
  active: "À venda. Exige foto, preço, peso e medidas da embalagem.",
  archived: "Sai da loja, mas fica no histórico de pedidos.",
};

/** "29,90" | "1.234,56" | "29.90" | "" → centavos (ou null). */
export function parseBRLToCents(raw: string): number | null {
  const s = raw.trim().replace(/^R\$\s*/i, "");
  if (s === "") return null;
  if (!/^\d{1,3}(\.?\d{3})*(,\d{1,2})?$|^\d+([.,]\d{1,2})?$/.test(s)) return NaN;
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  return Math.round(Number(normalized) * 100);
}

/** "12,5" | "12.5" | "" → número (ou null). */
export function parseDecimal(raw: string): number | null {
  const s = raw.trim().replace(",", ".");
  if (s === "") return null;
  return /^\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres.`)
    .transform((v) => (v === "" ? null : v))
    .nullable();

const money = z.string().transform((v, ctx) => {
  const cents = parseBRLToCents(v);
  if (Number.isNaN(cents)) {
    ctx.addIssue({ code: "custom", message: "Valor inválido. Exemplo: 49,90" });
    return z.NEVER;
  }
  if (cents !== null && (cents <= 0 || cents > 10_000_000)) {
    ctx.addIssue({ code: "custom", message: "Informe um valor entre R$ 0,01 e R$ 100.000,00." });
    return z.NEVER;
  }
  return cents;
});

const decimal = (max: number) =>
  z.string().transform((v, ctx) => {
    const n = parseDecimal(v);
    if (Number.isNaN(n) || (n !== null && (n <= 0 || n > max))) {
      ctx.addIssue({ code: "custom", message: `Informe um número entre 0 e ${max}.` });
      return z.NEVER;
    }
    return n;
  });

const intField = (min: number, max: number, label: string) =>
  z.string().transform((v, ctx) => {
    const s = v.trim();
    if (s === "") return null;
    if (!/^\d+$/.test(s) || Number(s) < min || Number(s) > max) {
      ctx.addIssue({ code: "custom", message: `${label}: informe um número inteiro entre ${min} e ${max}.` });
      return z.NEVER;
    }
    return Number(s);
  });

/** Apenas fotos do próprio site, do armazenamento local ou do bucket do Supabase. */
export function isAllowedImageUrl(url: string) {
  if (url.startsWith("/images/") || url.startsWith("/api/uploads/")) return !url.includes("..");
  const base = process.env.SUPABASE_URL;
  return Boolean(base && url.startsWith(`${base.replace(/\/$/, "")}/storage/v1/object/public/`));
}

export const imageInput = z.object({
  id: z.uuid().optional(),
  url: z.string().max(500).refine(isAllowedImageUrl, "Endereço de foto não permitido."),
  storageKey: z.string().max(300).nullable(),
  alt: z.string().trim().min(3, "Descreva a foto (texto alternativo).").max(200),
  width: z.number().int().positive().max(10000),
  height: z.number().int().positive().max(10000),
});

export const variantInput = z
  .object({
    id: z.uuid().optional(),
    name: z.string().trim().min(1, "Dê um nome à variação (ex.: a estampa).").max(80),
    sku: z
      .string()
      .trim()
      .toUpperCase()
      .min(2, "Informe o código (SKU).")
      .max(40)
      .regex(/^[A-Z0-9][A-Z0-9-_.]*$/, "Use letras, números e hífens no SKU."),
    price: money,
    compareAtPrice: money,
    stock: intField(0, 100000, "Estoque").transform((v) => v ?? 0),
    weightGrams: intField(1, 30000, "Peso"),
    heightCm: decimal(200),
    widthCm: decimal(200),
    lengthCm: decimal(200),
    swatchUrl: z.string().max(500).refine(isAllowedImageUrl, "Endereço de imagem não permitido.").nullable(),
    isActive: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.compareAtPrice !== null && v.price === null) {
      ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: "Informe o preço de venda antes do preço “de”." });
    }
    if (v.compareAtPrice !== null && v.price !== null && v.compareAtPrice <= v.price) {
      ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: "O preço “de” deve ser maior que o preço de venda." });
    }
  });

export const productInput = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(3, "Informe o nome do produto.").max(120),
  slug: z
    .string()
    .trim()
    .min(3, "Informe o endereço (slug).")
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use letras minúsculas, números e hífens."),
  summary: optionalText(200),
  description: optionalText(5000),
  materials: optionalText(500),
  dimensions: optionalText(200),
  careInstructions: optionalText(1000),
  status: z.enum(PRODUCT_STATUSES),
  isFeatured: z.boolean(),
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
  categoryIds: z.array(z.uuid()).max(20),
  images: z.array(imageInput).max(12, "Use no máximo 12 fotos."),
  variants: z.array(variantInput).min(1, "Cadastre ao menos uma variação.").max(30),
});

export type ProductInput = z.input<typeof productInput>;
export type ProductData = z.output<typeof productInput>;

/**
 * Regras para publicar. Rascunho e "Em breve" exigem pouco; "À venda" exige
 * tudo o que a compra e o frete precisam — nada é preenchido por suposição.
 */
export function publicationIssues(p: ProductData): string[] {
  const issues: string[] = [];
  const skus = p.variants.map((v) => v.sku);
  if (new Set(skus).size !== skus.length) issues.push("Há variações com o mesmo SKU.");
  if (p.status !== "active") return issues;

  if (p.images.length === 0) issues.push("Adicione ao menos uma foto.");
  if (p.categoryIds.length === 0) issues.push("Escolha ao menos uma categoria.");
  const active = p.variants.filter((v) => v.isActive);
  if (active.length === 0) issues.push("Ative ao menos uma variação.");
  for (const v of active) {
    const label = `Variação “${v.name}”`;
    if (v.price === null) issues.push(`${label}: falta o preço.`);
    if (v.weightGrams === null) issues.push(`${label}: falta o peso da embalagem.`);
    if (v.heightCm === null || v.widthCm === null || v.lengthCm === null)
      issues.push(`${label}: faltam as medidas da embalagem (altura, largura e comprimento).`);
  }
  return issues;
}

export const categoryInput = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Informe o nome.").max(60),
  shortName: optionalText(30),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use letras minúsculas, números e hífens."),
  description: optionalText(500),
  isActive: z.boolean(),
});
