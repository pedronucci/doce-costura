import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, Plus, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { listProductsForAdmin } from "@/lib/catalog/admin-repo";
import { PRODUCT_STATUSES, STATUS_LABELS, type ProductStatus } from "@/lib/catalog/admin-schema";
import { Badge, inputClass, LinkButton, Notice, PageHeader } from "@/components/admin/ui";
import { cn, formatBRL } from "@/lib/format";

export const metadata: Metadata = { title: "Produtos" };

const tone: Record<ProductStatus, "neutral" | "gold" | "green" | "rose"> = {
  draft: "neutral",
  coming_soon: "gold",
  active: "green",
  archived: "rose",
};

function priceLabel(min: number | null, max: number | null) {
  if (min === null || max === null) return <span className="text-tinta-suave">Sem preço</span>;
  return min === max ? formatBRL(min) : `${formatBRL(min)} – ${formatBRL(max)}`;
}

export default async function ProductsPage({ searchParams }: PageProps<"/admin/produtos">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const status = (PRODUCT_STATUSES as readonly string[]).includes(String(sp.status)) ? (sp.status as ProductStatus) : "all";
  const products = await listProductsForAdmin({ q, status });

  const tabs: Array<{ value: ProductStatus | "all"; label: string }> = [
    { value: "all", label: "Todos" },
    ...PRODUCT_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
  ];
  const href = (s: string) => `/admin/produtos?${new URLSearchParams({ ...(s !== "all" && { status: s }), ...(q && { q }) })}`;

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Cadastre, edite e publique os produtos da loja."
        actions={
          <LinkButton href="/admin/produtos/novo">
            <Plus className="h-4 w-4" /> Novo produto
          </LinkButton>
        }
      />
      {sp.excluido && <div className="mb-4"><Notice tone="success">Produto excluído.</Notice></div>}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filtrar por status" className="flex gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <Link
              key={t.value}
              href={href(t.value)}
              aria-current={status === t.value ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-[0.82rem] transition-colors",
                status === t.value ? "bg-cacau text-papel" : "bg-white text-tinta-suave hover:text-cacau",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <form role="search" className="relative lg:w-80">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-tinta-suave" />
          <label htmlFor="q" className="sr-only">Buscar por nome ou SKU</label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Buscar por nome ou SKU" className={cn(inputClass, "pl-9")} />
        </form>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#dccbb9] bg-white px-6 py-14 text-center">
          <p className="font-medium text-cacau">{q || status !== "all" ? "Nenhum produto encontrado." : "Nenhum produto cadastrado ainda."}</p>
          <p className="mt-1 text-[0.86rem] text-tinta-suave">Comece pelo botão “Novo produto”.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#f0e6dc] overflow-hidden rounded-2xl border border-[#eadfd3] bg-white">
          {products.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/produtos/${p.id}`} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[#fdf9f5] sm:px-5">
                <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-linho">
                  {p.thumb ? (
                    <Image src={p.thumb.url} alt="" fill sizes="56px" className="object-cover" />
                  ) : (
                    <ImageOff className="h-5 w-5 text-tinta-suave/60" strokeWidth={1.5} aria-label="Sem foto" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-cacau">{p.name}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem] text-tinta-suave">
                    <Badge tone={tone[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                    <span>{p.variantCount} variação(ões)</span>
                    <span className="sm:hidden">{priceLabel(p.minPrice, p.maxPrice)}</span>
                  </span>
                </span>
                <span className="hidden w-40 text-right text-[0.88rem] tabular-nums sm:block">{priceLabel(p.minPrice, p.maxPrice)}</span>
                <span className="hidden w-24 text-right text-[0.88rem] tabular-nums md:block">
                  {p.stock} <span className="text-tinta-suave">em estoque</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
