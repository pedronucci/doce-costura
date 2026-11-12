import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/product/catalog-browser";
import { ProductDetail } from "@/components/product/product-detail";
import { CartView } from "@/components/product/cart-view";
import { ButtonLink } from "@/components/ui/button-link";
import { FlourishHeart } from "@/components/ui/ornaments";
import { getCategories, getStorefrontProducts } from "@/lib/catalog/queries";

/**
 * Espaço reservado para as páginas das próximas etapas.
 * Cada rota listada aqui ganha sua implementação própria e este arquivo é removido.
 */
const planned: Record<string, { title: string; stage: string }> = {
  colecao: { title: "Toda a coleção", stage: "Etapa 2 — Interface" },
  busca: { title: "Busca", stage: "Etapa 2 — Interface" },
  carrinho: { title: "Carrinho", stage: "Etapa 2 — Interface" },
  favoritos: { title: "Favoritos", stage: "Etapa 2 — Interface" },
  conta: { title: "Minha conta", stage: "Etapa 3 — Backend" },
  sobre: { title: "Sobre nós", stage: "Etapa 2 — Interface" },
  contato: { title: "Contato", stage: "Etapa 2 — Interface" },
  "perguntas-frequentes": { title: "Perguntas frequentes", stage: "Etapa 2 — Interface" },
  "politica-de-privacidade": { title: "Política de privacidade", stage: "texto jurídico para revisão" },
  "trocas-e-devolucoes": { title: "Trocas e devoluções", stage: "texto jurídico para revisão" },
  "politica-de-entrega": { title: "Política de entrega", stage: "texto jurídico para revisão" },
  "termos-de-uso": { title: "Termos de uso", stage: "texto jurídico para revisão" },
};

async function resolve(rota: string[]) {
  const path = rota.join("/");
  if (planned[path]) return planned[path];
  const [categories, products] = await Promise.all([getCategories(), getStorefrontProducts()]);
  if (rota[0] === "categoria" && rota.length === 2) {
    const c = categories.find((x) => x.slug === rota[1]);
    if (c) return { title: c.name, stage: "Etapa 2 — Interface" };
  }
  if (rota[0] === "produto" && rota.length === 2) {
    const p = products.find((x) => x.slug === rota[1]);
    if (p) return { title: p.name, stage: "Etapa 2 — Interface" };
  }
  return null;
}

// Páginas temporárias: produtos criados depois do build são renderizados sob demanda.
export const instant = false;

export async function generateStaticParams() {
  const [categories, products] = await Promise.all([getCategories(), getStorefrontProducts()]);
  return [
    ...Object.keys(planned).map((k) => ({ rota: k.split("/") })),
    ...categories.map((c) => ({ rota: ["categoria", c.slug] })),
    ...products.map((p) => ({ rota: ["produto", p.slug] })),
  ];
}

export default async function PlannedPage({ params }: PageProps<"/[...rota]">) {
  const { rota } = await params;
  const path = rota.join("/");
  if (["colecao", "busca", "favoritos"].includes(path) || rota[0] === "categoria" && rota.length === 2) {
    const [products, categories] = await Promise.all([getStorefrontProducts(), getCategories()]);
    const category = rota[0] === "categoria" ? categories.find((c) => c.slug === rota[1]) : undefined;
    if (rota[0] === "categoria" && !category) notFound();
    return <Suspense fallback={<p role="status" className="p-12 text-center">Preparando sua coleção…</p>}><CatalogBrowser key={path} products={products} categories={categories} categorySlug={category?.slug} title={category?.name ?? (path === "favoritos" ? "Meus favoritos" : path === "busca" ? "Encontre sua peça" : "Toda a coleção")} favoritesOnly={path === "favoritos"} /></Suspense>;
  }
  if (rota[0] === "produto" && rota.length === 2) {
    const product = (await getStorefrontProducts()).find((p) => p.slug === rota[1]);
    if (!product) notFound();
    return <ProductDetail product={product} />;
  }
  if (path === "carrinho") return <CartView products={await getStorefrontProducts()} />;
  const page = await resolve(rota);
  if (!page) notFound();

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-script text-[1.8rem] leading-none text-rosa-profundo">Em preparação</p>
      <h1 className="mt-3 text-[2.4rem] leading-tight sm:text-[3rem]">{page.title}</h1>
      <FlourishHeart className="mt-4 text-dourado" />
      <p className="mt-6 leading-relaxed text-tinta-suave">
        Estamos preparando este espaço para receber você. Enquanto isso, conheça as peças da nossa coleção.
      </p>
      <ButtonLink href="/" variant="outline" className="mt-9">
        Voltar à página inicial
      </ButtonLink>
    </section>
  );
}

export async function generateMetadata({ params }: PageProps<"/[...rota]">): Promise<Metadata> {
  const { rota } = await params;
  const page = await resolve(rota);
  const isProduct = rota[0] === "produto";
  const product = isProduct ? (await getStorefrontProducts()).find((p) => p.slug === rota[1]) : null;
  const implemented = ["colecao", "busca", "favoritos", "carrinho", "categoria", "produto"].includes(rota[0]);
  return { title: page?.title ?? "Página não encontrada", description: product?.summary || undefined, robots: !implemented || ["busca", "favoritos", "carrinho"].includes(rota[0]) ? { index: false, follow: true } : undefined };
}
