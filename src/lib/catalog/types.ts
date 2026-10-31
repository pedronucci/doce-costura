/**
 * Tipos do catálogo usados pela interface.
 *
 * Na Etapa 3 estes dados passam a vir do PostgreSQL (Prisma). Os tipos
 * foram desenhados para espelhar o schema em `prisma/schema.prisma`,
 * para que a troca da fonte de dados não altere os componentes.
 *
 * Regra de negócio: informação comercial não fornecida é `null` e a
 * interface mostra "pendente de cadastro" — nunca um valor inventado.
 */

export type ProductImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Category = {
  slug: string;
  name: string;
  description: string | null;
  position: number;
};

export type Product = {
  slug: string;
  name: string;
  /** Descrição curta exibida em cards. Baseada apenas no que é visível na foto. */
  summary: string;
  categorySlugs: string[];
  /** Estampa/tema, usado no seletor "Escolha sua estampa favorita". */
  print: { name: string; swatch: string | null } | null;
  images: ProductImage[];

  /** Preço em centavos. `null` = ainda não cadastrado. */
  priceCents: number | null;
  compareAtPriceCents: number | null;
  /** Estoque. `null` = ainda não cadastrado. */
  stock: number | null;

  materials: string | null;
  dimensions: string | null;
  careInstructions: string | null;
  weightGrams: number | null;

  createdAt: string;
};
