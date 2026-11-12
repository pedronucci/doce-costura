"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { Product } from "@/lib/catalog/types";
import { useShop } from "@/lib/store/shop-context";
import { formatBRL } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button-link";
import { MAX_CART_QUANTITY } from "@/lib/store/cart";

export function CartView({ products }: { products: Product[] }) {
  const { cart, setQuantity, removeFromCart } = useShop();
  const lines = cart.map((line) => {
    const product = products.find((p) => p.slug === line.slug);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    const valid = product?.status === "active" && variant?.priceCents != null && variant.stock >= line.quantity;
    return { line, product, variant, valid };
  });
  const total = lines.reduce((sum, { line, variant, valid }) => sum + (valid ? variant!.priceCents! * line.quantity : 0), 0);
  const allValid = lines.every((l) => l.valid);
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-center text-xs tracking-[0.2em] text-dourado-texto uppercase">Suas escolhas</p>
      <h1 className="mt-3 text-center text-4xl sm:text-5xl">Meu carrinho</h1>
      {!cart.length ? <div className="py-20 text-center"><h2 className="text-3xl">Seu carrinho espera por um carinho</h2><p className="mt-4 text-tinta-suave">Conheça as peças e encontre seus detalhes favoritos.</p><ButtonLink className="mt-8" href="/colecao">Explorar coleção</ButtonLink></div> : <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
        <ul className="divide-y divide-dourado/20">{lines.map(({ line, product, variant, valid }) => <li key={line.variantId} className="flex gap-4 py-6 first:pt-0">
          {product?.images[0] && <Link href={`/produto/${product.slug}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-linho"><Image src={product.images[0].src} alt={product.images[0].alt} fill sizes="96px" className="object-cover" /></Link>}
          <div className="min-w-0 flex-1"><h2 className="text-xl">{product ? <Link href={`/produto/${product.slug}`}>{product.name}</Link> : "Peça indisponível"}</h2><p className="mt-1 text-sm text-tinta-suave">{variant?.name ?? "Modelo removido do catálogo"}</p>
            {variant?.priceCents != null && <p className="mt-2 text-sm">{formatBRL(variant.priceCents)} por unidade</p>}
            {!valid && <p role="status" className="mt-2 text-sm text-rosa-profundo">{variant && variant.stock > 0 ? `Disponibilidade atual: ${variant.stock} unidade(s). Ajuste a quantidade.` : "Esta opção não está disponível. Remova-a para atualizar seu carrinho."}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3"><label className="text-sm">Quantidade<select aria-label={`Quantidade de ${product?.name ?? "peça indisponível"} — ${variant?.name ?? "modelo removido"}`} value={line.quantity} onChange={(e) => setQuantity(line.variantId, Number(e.target.value))} className="ml-2 min-h-11 rounded-lg border border-dourado/40 bg-papel px-3">{Array.from({ length: Math.min(MAX_CART_QUANTITY, Math.max(line.quantity, variant?.stock ?? 0)) }, (_, i) => i + 1).map((n) => <option key={n} value={n} disabled={n > (variant?.stock ?? 0) && n !== line.quantity}>{n}</option>)}</select></label><button type="button" onClick={() => removeFromCart(line.variantId)} aria-label={`Remover ${product?.name ?? "peça indisponível"} — ${variant?.name ?? "modelo removido"}`} className="inline-flex min-h-11 items-center gap-2 px-3 text-sm text-rosa-profundo"><Trash2 className="h-4 w-4" />Remover</button></div>
          </div>
          {valid && <p className="hidden text-sm font-medium sm:block">{formatBRL(variant!.priceCents! * line.quantity)}</p>}
        </li>)}</ul>
        <aside aria-label="Resumo do carrinho" className="rounded-2xl border border-dourado/25 bg-papel p-6"><h2 className="text-3xl">Resumo das escolhas</h2><p className="mt-6 flex justify-between gap-3"><span>{allValid ? "Subtotal estimado" : "Subtotal das peças disponíveis"}</span><strong className="whitespace-nowrap font-medium">{formatBRL(total)}</strong></p><p className="mt-4 text-sm leading-relaxed text-tinta-suave">Frete ainda não calculado. Preços e disponibilidade serão conferidos antes da compra.</p><p className="mt-6 rounded-xl bg-linho p-4 text-sm leading-relaxed">Suas escolhas ficam salvas neste navegador. Confira os preços e a disponibilidade na próxima etapa; ainda não há pedido ou reserva de estoque.</p>{allValid && <ButtonLink href="/checkout" className="mt-6 w-full">Revisar escolhas</ButtonLink>}<ButtonLink href="/colecao" variant="outline" className="mt-6 w-full">Continuar escolhendo</ButtonLink></aside>
      </div>}
    </section>
  );
}
