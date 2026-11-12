"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Category, Product } from "@/lib/catalog/types";
import { ProductCard } from "./product-card";
import { useShop } from "@/lib/store/shop-context";

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function CatalogBrowser({ products, categories, title = "Toda a coleção", categorySlug, favoritesOnly = false }: { products: Product[]; categories: Category[]; title?: string; categorySlug?: string; favoritesOnly?: boolean }) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(categorySlug ?? "");
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState("recent");
  const { favorites } = useShop();
  const visible = products.filter((p) => (!favoritesOnly || favorites.includes(p.slug)) && (!category || p.categorySlugs.includes(category)) && (!available || p.status === "active" && (p.stock ?? 0) > 0) && normalize(`${p.name} ${p.summary} ${p.print?.name ?? ""}`).includes(normalize(query.trim()))).sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name, "pt-BR");
    if (sort === "price-asc" || sort === "price-desc") {
      if (a.priceCents === null) return b.priceCents === null ? 0 : 1;
      if (b.priceCents === null) return -1;
      return sort === "price-asc" ? a.priceCents - b.priceCents : b.priceCents - a.priceCents;
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-center text-xs tracking-[0.2em] text-dourado-texto uppercase">Feito de detalhes</p>
      <h1 className="mt-3 text-center text-4xl sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-xl text-center leading-relaxed text-tinta-suave">{favoritesOnly ? "Suas peças favoritas, guardadas neste navegador." : "Encontre a estampa e os detalhes que combinam com a sua cozinha."}</p>
      <div className="mt-10 grid gap-4 rounded-2xl border border-dourado/20 bg-papel p-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">Buscar uma peça<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nome ou estampa" className="mt-2 min-h-12 w-full rounded-xl border border-dourado/40 bg-creme px-3" /></label>
        <label className="text-sm">Categoria<select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-dourado/40 bg-creme px-3"><option value="">Todas as categorias</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
        <label className="text-sm">Ordenar por<select value={sort} onChange={(e) => setSort(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-dourado/40 bg-creme px-3"><option value="recent">Mais recentes</option><option value="name">Nome: A a Z</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option></select></label>
        <label className="flex min-h-12 items-center gap-3 self-end text-sm"><input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="h-5 w-5 accent-rosa-profundo" />Somente disponíveis</label>
      </div>
      <p role="status" className="my-6 text-sm text-tinta-suave">{visible.length} {visible.length === 1 ? "peça encontrada" : "peças encontradas"}</p>
      {visible.length ? <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">{visible.map((p) => <li key={p.id}><ProductCard product={p} sizes="(min-width: 1024px) 23vw, 45vw" /></li>)}</ul> : <div className="rounded-2xl bg-linho/50 px-5 py-16 text-center"><h2 className="text-3xl">Ainda não encontramos uma peça por aqui</h2><p className="mt-3 text-tinta-suave">{favoritesOnly ? "Toque no coração dos produtos para guardar seus favoritos." : "Experimente outra busca ou remova os filtros."}</p><button type="button" onClick={() => { setQuery(""); setCategory(""); setAvailable(false); }} className="mt-5 min-h-11 px-4 text-rosa-profundo underline underline-offset-4">Limpar filtros</button><Link href="/colecao" className="ml-4 inline-flex min-h-11 items-center text-rosa-profundo underline underline-offset-4">Explorar coleção</Link></div>}
    </section>
  );
}
