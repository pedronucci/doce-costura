import type { Category, Product } from "./types";

/**
 * Catálogo inicial (seed) — Etapa 1.
 *
 * Preços, estoque, materiais, dimensões, peso e instruções de lavagem
 * NÃO foram fornecidos e permanecem `null` até o cadastro pelo painel.
 * As fotos foram recortadas das imagens enviadas, sem alteração de cor,
 * estampa ou acabamento.
 */

export const categories: Category[] = [
  { slug: "panos-de-prato-decorados", name: "Panos de prato decorados", description: null, position: 1 },
  { slug: "panos-de-prato-com-renda", name: "Panos de prato com renda", description: null, position: 2 },
  { slug: "panos-de-prato-com-babado", name: "Panos de prato com babado", description: null, position: 3 },
  { slug: "colecao-floral", name: "Coleção floral", description: null, position: 4 },
  { slug: "colecao-cozinha", name: "Coleção cozinha", description: null, position: 5 },
  { slug: "kits-para-presente", name: "Kits para presente", description: null, position: 6 },
  { slug: "novidades", name: "Novidades", description: null, position: 7 },
  { slug: "promocoes", name: "Promoções", description: null, position: 8 },
];

const pending = {
  priceCents: null,
  compareAtPriceCents: null,
  stock: null,
  materials: null,
  dimensions: null,
  careInstructions: null,
  weightGrams: null,
} as const;

export const products: Product[] = [
  {
    slug: "pano-de-prato-cha-azul",
    name: "Pano de Prato Chá Azul",
    summary: "Renda branca e babado xadrez azul, com barrado de bules e xícaras.",
    categorySlugs: ["panos-de-prato-decorados", "panos-de-prato-com-renda", "panos-de-prato-com-babado", "colecao-floral"],
    print: { name: "Chá Azul", swatch: "/images/estampas/cha-azul.jpg" },
    images: [
      { src: "/images/produtos/cha-azul.jpg", alt: "Pano de prato branco com renda, faixa amarela estampada com bules azuis e babado xadrez azul", width: 797, height: 637 },
    ],
    ...pending,
    createdAt: "2026-10-31",
  },
  {
    slug: "pano-de-prato-milho-e-pimentao",
    name: "Pano de Prato Milho e Pimentão",
    summary: "Acabamento amarelo.",
    categorySlugs: ["panos-de-prato-decorados", "colecao-cozinha"],
    print: null,
    images: [], // fotografia ainda não enviada
    ...pending,
    createdAt: "2026-10-31",
  },
  {
    slug: "pano-de-prato-tomates",
    name: "Pano de Prato Tomates",
    summary: "Detalhes vermelhos e renda branca, com barrado de tomates.",
    categorySlugs: ["panos-de-prato-decorados", "panos-de-prato-com-renda", "colecao-cozinha"],
    print: { name: "Tomates", swatch: "/images/estampas/tomates.jpg" },
    images: [
      { src: "/images/produtos/tomates.jpg", alt: "Pano de prato branco com faixas vermelhas, rendas brancas e barrado estampado com tomates", width: 438, height: 422 },
    ],
    ...pending,
    createdAt: "2026-10-31",
  },
  {
    slug: "pano-de-prato-cenoura-e-abobora",
    name: "Pano de Prato Cenoura e Abóbora",
    summary: "Babado e renda, com barrado de cenouras e abóboras.",
    categorySlugs: ["panos-de-prato-decorados", "panos-de-prato-com-renda", "panos-de-prato-com-babado", "colecao-cozinha"],
    print: { name: "Cenoura e Abóbora", swatch: "/images/estampas/cenoura-abobora.jpg" },
    images: [
      { src: "/images/produtos/cenoura-abobora.jpg", alt: "Pano de prato branco com barrado de cenouras e abóboras, babado de laise branca e xadrez laranja", width: 388, height: 373 },
    ],
    ...pending,
    createdAt: "2026-10-31",
  },
  {
    slug: "pano-de-prato-horta-verde",
    name: "Pano de Prato Horta Verde",
    summary: "Babado xadrez verde, com barrado de legumes da horta.",
    categorySlugs: ["panos-de-prato-decorados", "panos-de-prato-com-babado", "colecao-cozinha"],
    print: { name: "Horta Verde", swatch: "/images/estampas/horta-verde.jpg" },
    images: [
      { src: "/images/produtos/horta-verde.jpg", alt: "Pano de prato branco com barrado de alfaces, abobrinhas e aspargos e babado xadrez verde", width: 398, height: 373 },
    ],
    ...pending,
    createdAt: "2026-10-31",
  },
  {
    slug: "pano-de-prato-patinhos-e-lavanda",
    name: "Pano de Prato Patinhos e Lavanda",
    summary: "Detalhes florais em lilás, com patinhos e ramos de lavanda.",
    categorySlugs: ["panos-de-prato-decorados", "panos-de-prato-com-renda", "panos-de-prato-com-babado", "colecao-floral"],
    print: { name: "Patinhos e Lavanda", swatch: "/images/estampas/patinhos-lavanda.jpg" },
    images: [
      { src: "/images/produtos/patinhos-lavanda.jpg", alt: "Pano de prato branco com faixa amarela, barrado lilás com patinhos e babado estampado com lavanda", width: 394, height: 373 },
    ],
    ...pending,
    createdAt: "2026-10-31",
  },
];

/** Em vitrines, produtos com fotografia aparecem antes dos que ainda aguardam foto. */
export function withPhotosFirst<T extends { images: unknown[] }>(list: T[]) {
  return [...list].sort((a, b) => Number(b.images.length > 0) - Number(a.images.length > 0));
}

export function getProductsByCategory(slug: string) {
  return withPhotosFirst(products.filter((p) => p.categorySlugs.includes(slug)));
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug) ?? null;
}
