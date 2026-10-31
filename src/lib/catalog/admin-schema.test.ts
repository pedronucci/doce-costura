import { describe, expect, it } from "vitest";
import { parseBRLToCents, productInput, publicationIssues, slugify } from "./admin-schema";

const variant = {
  name: "Chá Azul",
  sku: "dc-cha-azul",
  price: "49,90",
  compareAtPrice: "",
  stock: "10",
  weightGrams: "120",
  heightCm: "3",
  widthCm: "20",
  lengthCm: "25",
  swatchUrl: null,
  isActive: true,
};
const base = {
  name: "Pano de Prato Chá Azul",
  slug: "pano-de-prato-cha-azul",
  summary: "",
  description: "",
  materials: "",
  dimensions: "",
  careInstructions: "",
  status: "active" as const,
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
  categoryIds: ["0b8f8a8e-5d7e-4a43-9b0e-2f6f2b6b3c11"],
  images: [{ url: "/images/produtos/cha-azul.jpg", storageKey: null, alt: "Pano de prato", width: 800, height: 600 }],
  variants: [variant],
};

describe("parseBRLToCents", () => {
  it.each([
    ["49,90", 4990],
    ["1.234,56", 123456],
    ["49.90", 4990],
    ["R$ 10", 1000],
    ["", null],
  ])("%s → %s", (input, expected) => expect(parseBRLToCents(input)).toBe(expected));
  it("rejeita texto inválido", () => expect(parseBRLToCents("abc")).toBeNaN());
});

describe("productInput", () => {
  it("converte valores e normaliza o SKU", () => {
    const p = productInput.parse(base);
    expect(p.variants[0]).toMatchObject({ price: 4990, sku: "DC-CHA-AZUL", stock: 10, heightCm: 3 });
    expect(p.summary).toBeNull();
  });
  it("recusa preço 'de' menor que o preço de venda", () => {
    const r = productInput.safeParse({ ...base, variants: [{ ...variant, compareAtPrice: "40,00" }] });
    expect(r.success).toBe(false);
  });
  it("recusa foto de endereço externo", () => {
    const r = productInput.safeParse({ ...base, images: [{ ...base.images[0], url: "https://evil.example/x.jpg" }] });
    expect(r.success).toBe(false);
  });
});

describe("publicationIssues", () => {
  it("produto completo pode ser publicado", () => {
    expect(publicationIssues(productInput.parse(base))).toEqual([]);
  });
  it("à venda exige preço, peso e medidas", () => {
    const p = productInput.parse({ ...base, variants: [{ ...variant, price: "", weightGrams: "", heightCm: "" }] });
    expect(publicationIssues(p)).toHaveLength(3);
  });
  it("'em breve' não exige preço nem foto", () => {
    const p = productInput.parse({ ...base, status: "coming_soon", images: [], variants: [{ ...variant, price: "" }] });
    expect(publicationIssues(p)).toEqual([]);
  });
});

describe("slugify", () => {
  it("remove acentos e símbolos", () => expect(slugify("Pano de Prato Cenoura & Abóbora!")).toBe("pano-de-prato-cenoura-abobora"));
});
