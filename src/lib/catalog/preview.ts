import "server-only";
import type { Category, Product } from "./types";

// Prévia local explícita, sem banco. Nunca utilizada em produção ou como fallback de erro.
export const previewCategories: Category[] = [
  ["panos-de-prato-decorados", "Panos de prato decorados", "Decorados"],
  ["panos-de-prato-com-renda", "Panos de prato com renda", "Com renda"],
  ["panos-de-prato-com-babado", "Panos de prato com babado", "Com babado"],
  ["colecao-floral", "Coleção floral", "Floral"],
  ["colecao-cozinha", "Coleção cozinha", "Cozinha"],
].map(([slug, name, shortName], position) => ({ slug, name, shortName, description: null, position }));

const entries = [
  { slug: "cha-azul", name: "Chá Azul", image: "cha-azul", summary: "Renda branca e babado xadrez azul, com barrado de bules e xícaras.", floral: true, width: 797, height: 637 },
  { slug: "tomates", name: "Tomates", image: "tomates", summary: "Detalhes vermelhos e renda branca, com barrado de tomates.", floral: false, width: 438, height: 422 },
  { slug: "cenoura-e-abobora", name: "Cenoura e Abóbora", image: "cenoura-abobora", summary: "Babado e renda, com barrado de cenouras e abóboras.", floral: false, width: 388, height: 373 },
  { slug: "horta-verde", name: "Horta Verde", image: "horta-verde", summary: "Babado xadrez verde, com barrado de legumes da horta.", floral: false, width: 398, height: 373 },
  { slug: "patinhos-e-lavanda", name: "Patinhos e Lavanda", image: "patinhos-lavanda", summary: "Detalhes florais em lilás, com patinhos e ramos de lavanda.", floral: true, width: 394, height: 373 },
  { slug: "milho-e-pimentao", name: "Milho e Pimentão", image: null, summary: "Acabamento amarelo.", floral: false, width: 0, height: 0 },
];

export const previewProducts: Product[] = entries.map((e) => ({
  id: `preview-${e.slug}`, slug: `pano-de-prato-${e.slug}`, name: `Pano de Prato ${e.name}`,
  status: "coming_soon", isFeatured: false, summary: e.summary, description: null,
  categorySlugs: ["panos-de-prato-decorados", ...(e.image ? ["panos-de-prato-com-renda", "panos-de-prato-com-babado"] : []), e.floral ? "colecao-floral" : "colecao-cozinha"],
  print: { name: e.name, swatch: e.image ? `/images/estampas/${e.image}.jpg` : null },
  images: e.image ? [{ src: `/images/produtos/${e.image}.jpg`, alt: `${e.name}: ${e.summary}`, width: e.width, height: e.height }] : [],
  priceCents: null, compareAtPriceCents: null, stock: null,
  variants: [{ id: `preview-${e.slug}`, name: e.name, priceCents: null, compareAtPriceCents: null, stock: 0 }],
  materials: null, dimensions: null, careInstructions: null, weightGrams: null, createdAt: "2026-10-31T00:00:00.000Z",
}));
