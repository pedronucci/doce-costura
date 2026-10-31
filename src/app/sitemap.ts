import type { MetadataRoute } from "next";
import { getCategories, getStorefrontProducts, productsInCategory } from "@/lib/catalog/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getStorefrontProducts()]);
  return [
    { url: siteUrl, priority: 1 },
    { url: `${siteUrl}/colecao`, priority: 0.9 },
    ...categories
      .filter((c) => productsInCategory(products, c.slug).length > 0)
      .map((c) => ({ url: `${siteUrl}/categoria/${c.slug}`, priority: 0.8 })),
    ...products.map((p) => ({ url: `${siteUrl}/produto/${p.slug}`, priority: 0.7 })),
  ];
}
