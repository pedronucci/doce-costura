import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guard";
import { getProductForEdit, listCategoriesForAdmin } from "@/lib/catalog/admin-repo";
import { ProductForm } from "@/components/admin/product-form/product-form";
import { toFormValues } from "@/components/admin/product-form/mapping";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/produtos/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const sp = await searchParams;
  const [product, categories] = await Promise.all([getProductForEdit(id), listCategoriesForAdmin()]);
  if (!product) notFound();

  const notice = sp.copiado
    ? "Cópia criada como rascunho. O estoque não é copiado."
    : sp.salvo
      ? "Produto criado."
      : sp.atualizado
        ? "Alterações salvas."
        : undefined;
  return (
    <ProductForm
      // remonta o formulário com os dados (e IDs) salvos após cada gravação
      key={product.updatedAt.toISOString()}
      initial={toFormValues(product)}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      notice={notice}
    />
  );
}
