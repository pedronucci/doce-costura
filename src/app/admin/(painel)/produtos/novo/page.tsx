import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guard";
import { listCategoriesForAdmin } from "@/lib/catalog/admin-repo";
import { ProductForm } from "@/components/admin/product-form/product-form";
import { emptyProduct } from "@/components/admin/product-form/mapping";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await listCategoriesForAdmin();
  return <ProductForm initial={emptyProduct()} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />;
}
