import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireStaff } from "@/lib/auth/guard";
import { countProductsByStatus, listCategoriesForAdmin } from "@/lib/catalog/admin-repo";
import { STATUS_HELP, STATUS_LABELS, PRODUCT_STATUSES } from "@/lib/catalog/admin-schema";
import { Card, LinkButton, Notice, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Visão geral" };

export default async function AdminHome() {
  await requireStaff();
  const [counts, categories] = await Promise.all([countProductsByStatus(), listCategoriesForAdmin()]);
  const total = Object.values(counts).reduce((s, n) => s + (n ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Visão geral"
        description="Resumo do catálogo. Indicadores de vendas aparecerão aqui quando houver pedidos reais."
        actions={
          <LinkButton href="/admin/produtos/novo">
            <Plus className="h-4 w-4" /> Novo produto
          </LinkButton>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PRODUCT_STATUSES.map((s) => (
          <Link key={s} href={`/admin/produtos?status=${s}`} className="rounded-2xl border border-[#eadfd3] bg-white p-5 transition-shadow hover:shadow-md">
            <p className="text-[0.8rem] text-tinta-suave">{STATUS_LABELS[s]}</p>
            <p className="mt-1 text-[2rem] font-semibold text-cacau tabular-nums">{counts[s] ?? 0}</p>
            <p className="mt-1 text-[0.74rem] leading-snug text-tinta-suave">{STATUS_HELP[s]}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="Catálogo" description={`${total} produto(s) e ${categories.length} categoria(s) cadastrados.`}>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/admin/produtos" variant="secondary">Gerenciar produtos</LinkButton>
            <LinkButton href="/admin/categorias" variant="secondary">Gerenciar categorias</LinkButton>
          </div>
        </Card>
        <Card title="Antes de vender">
          <Notice>
            Para colocar um produto “À venda” ele precisa de foto, categoria, preço, peso e medidas da embalagem. A finalização
            de compra (carrinho, Mercado Pago e frete) ainda não está ativa — entra nas próximas etapas.
          </Notice>
        </Card>
      </div>
    </>
  );
}
