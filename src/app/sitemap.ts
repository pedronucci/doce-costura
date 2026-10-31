import type { MetadataRoute } from "next";
import { categories, getProductsByCategory, products } from "@/lib/catalog/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, priority: 1 },
    { url: `${siteUrl}/colecao`, priority: 0.9 },
    ...categories
      .filter((c) => getProductsByCategory(c.slug).length > 0)
      .map((c) => ({ url: `${siteUrl}/categoria/${c.slug}`, priority: 0.8 })),
    ...products.map((p) => ({ url: `${siteUrl}/produto/${p.slug}`, priority: 0.7 })),
  ];
}
