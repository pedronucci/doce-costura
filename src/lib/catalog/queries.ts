import "server-only";
import { asc, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { category, product, productImage, productVariant } from "@/db/schema";
import { CATALOG_TAG } from "./tags";
import type { Category, Product } from "./types";

/**
 * Consultas da vitrine. Ficam em cache e são renovadas sempre que o painel
 * salva algo (updateTag(CATALOG_TAG)). Só aparecem produtos "Em breve" e "À venda".
 */
const VISIBLE = ["coming_soon", "active"] as const;

export async function getStorefrontProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("days");

  const rows = await db.query.product.findMany({
    where: inArray(product.status, [...VISIBLE]),
    orderBy: [asc(product.createdAt)],
    with: {
      images: { orderBy: [asc(productImage.position)] },
      variants: { orderBy: [asc(productVariant.position)] },
      categories: { with: { category: true } },
    },
  });

  const mapped = rows.map((p): Product => {
    const variants = p.variants.filter((v) => v.isActive);
    const forSale = p.status === "active";
    const priced = forSale ? variants.filter((v) => v.priceCents !== null) : [];
    const cheapest = priced.sort((a, b) => a.priceCents! - b.priceCents!)[0];
    const withSwatch = variants.find((v) => v.swatchUrl);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      summary: p.summary ?? "",
      status: p.status as Product["status"],
      isFeatured: p.isFeatured,
      categorySlugs: p.categories.filter((c) => c.category.isActive).map((c) => c.category.slug),
      print: withSwatch ? { name: withSwatch.name, swatch: withSwatch.swatchUrl } : null,
      images: p.images.map((i) => ({ src: i.url, alt: i.alt, width: i.width, height: i.height })),
      priceCents: cheapest?.priceCents ?? null,
      compareAtPriceCents: cheapest?.compareAtPriceCents ?? null,
      stock: forSale ? variants.reduce((s, v) => s + Math.max(0, v.stock - v.reserved), 0) : null,
      materials: p.materials,
      dimensions: p.dimensions,
      careInstructions: p.careInstructions,
      weightGrams: cheapest?.weightGrams ?? null,
      createdAt: p.createdAt.toISOString(),
    };
  });
  // Produtos com foto aparecem antes dos que ainda aguardam fotografia.
  return mapped.sort((a, b) => Number(b.images.length > 0) - Number(a.images.length > 0));
}

/** Categorias ativas, na ordem definida no painel. */
export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("days");
  const rows = await db.select().from(category).orderBy(asc(category.position), asc(category.name));
  return rows
    .filter((c) => c.isActive)
    .map((c) => ({ slug: c.slug, name: c.name, shortName: c.shortName, description: c.description, position: c.position }));
}

export function productsInCategory(products: Product[], slug: string) {
  return products.filter((p) => p.categorySlugs.includes(slug));
}

export type NavLink = { href: string; label: string };

/** Menu: só categorias ativas que têm produtos visíveis. */
export async function getCategoryNav(): Promise<NavLink[]> {
  const [cats, products] = await Promise.all([getCategories(), getStorefrontProducts()]);
  return cats
    .filter((c) => productsInCategory(products, c.slug).length > 0)
    .map((c) => ({ href: `/categoria/${c.slug}`, label: c.shortName ?? c.name }));
}
