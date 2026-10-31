import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guard";
import { listCategoriesForAdmin } from "@/lib/catalog/admin-repo";
import { Card, PageHeader } from "@/components/admin/ui";
import { CategoryList, NewCategoryForm } from "./category-editor";

export const metadata: Metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await listCategoriesForAdmin();
  return (
    <>
      <PageHeader title="Categorias" description="A ordem aqui é a ordem do menu da loja. Categorias sem produtos não aparecem no menu." />
      <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <CategoryList categories={categories} />
        <Card title="Nova categoria">
          <NewCategoryForm />
        </Card>
      </div>
    </>
  );
}
