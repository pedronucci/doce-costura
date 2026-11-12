"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/catalog/types";
import { useShop } from "@/lib/store/shop-context";
import { MAX_CART_QUANTITY } from "@/lib/store/cart";
import { FavoriteButton } from "./favorite-button";
import { ProductPrice } from "./product-price";
import { PhotoPending } from "./photo-pending";
import { buttonClass } from "@/components/ui/button-link";

export function ProductDetail({ product }: { product: Product }) {
  const [photo, setPhoto] = useState(0);
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const { addToCart, cart } = useShop();
  const variant = product.variants.find((v) => v.id === variantId);
  const available = variant ? Math.min(variant.stock, MAX_CART_QUANTITY) - (cart.find((l) => l.variantId === variant.id)?.quantity ?? 0) : 0;
  const canAdd = product.status === "active" && variant?.priceCents != null && available > 0;
  const image = product.images[photo];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
      <nav aria-label="Você está em" className="mb-8 text-sm text-tinta-suave"><Link href="/">Início</Link><span aria-hidden="true"> / </span><Link href="/colecao">Coleção</Link><span aria-hidden="true"> / </span><span>{product.name}</span></nav>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-linho">
            {image ? <a href={image.src} target="_blank" rel="noreferrer" aria-label="Ampliar fotografia em nova aba" className="relative block h-full w-full"><Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 1024px) 45vw, 92vw" className="object-contain" /></a> : <PhotoPending />}
          </div>
          {product.images.length > 1 && <div className="mt-4 flex flex-wrap gap-3">{product.images.map((img, i) => <button type="button" key={img.src} onClick={() => setPhoto(i)} aria-label={`Ver fotografia ${i + 1}`} aria-pressed={photo === i} className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 ${photo === i ? "border-rosa-profundo" : "border-transparent"}`}><Image src={img.src} alt={img.alt} fill sizes="80px" className="object-cover" /></button>)}</div>}
          <p className="mt-3 text-sm text-tinta-suave">{image ? "Toque na foto para ampliar. As cores podem variar conforme a tela." : "Estamos preparando a fotografia desta peça."}</p>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] text-dourado-texto uppercase">Carinho em cada detalhe</p>
          <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-5 leading-relaxed text-tinta-suave">{product.summary}</p>
          <div className="my-7"><ProductPrice product={variant ?? product} /></div>
          {product.variants.length > 0 && <label className="block text-sm">Estampa / modelo<select value={variantId} onChange={(e) => { setVariantId(e.target.value); setQuantity(1); setMessage(""); }} className="mt-2 min-h-12 w-full rounded-xl border border-dourado/40 bg-papel px-4">{product.variants.map((v) => <option key={v.id} value={v.id}>{v.name}{product.status === "active" && v.stock === 0 ? " — esgotado" : ""}</option>)}</select></label>}
          <form className="mt-5" onSubmit={(e) => {
            e.preventDefault();
            if (!canAdd || !variant || !Number.isInteger(quantity) || quantity < 1 || quantity > available) { setMessage("Confira a quantidade disponível para esta opção."); return; }
            addToCart({ slug: product.slug, variantId: variant.id, quantity }, variant.stock);
            setQuantity(1);
            setMessage("Peça adicionada ao carrinho.");
          }}>
            <div className="flex flex-wrap items-end gap-3">
              {canAdd && <label className="text-sm">Quantidade<input aria-label="Quantidade" type="number" required min={1} max={available} value={quantity} onChange={(e) => setQuantity(e.target.valueAsNumber)} className="mt-2 block min-h-12 w-24 rounded-xl border border-dourado/40 bg-papel px-4" /></label>}
              <button type="submit" disabled={!canAdd} className={buttonClass("primary", "flex-1 disabled:cursor-not-allowed disabled:opacity-60")}>{canAdd ? "Adicionar ao carrinho" : product.status === "coming_soon" ? "Disponível em breve" : available <= 0 && variant?.stock ? "Limite no carrinho" : "Indisponível"}</button>
              <FavoriteButton slug={product.slug} name={product.name} />
            </div>
            <p role="status" className="mt-3 min-h-6 text-sm text-salvia-escuro">{message} {message === "Peça adicionada ao carrinho." && <Link className="underline underline-offset-4" href="/carrinho">Ver carrinho</Link>}</p>
          </form>
          <p className="rounded-xl bg-linho/60 p-4 text-sm leading-relaxed text-tinta-suave">A compra online ainda está em preparação. Pagamento e cálculo de frete estarão disponíveis após a abertura da loja.</p>
          <div className="mt-8 divide-y divide-dourado/20 border-y border-dourado/20">
            {[{ title: "Sobre a peça", text: product.description }, { title: "Materiais", text: product.materials }, { title: "Medidas", text: product.dimensions }, { title: "Cuidados com sua peça", text: product.careInstructions }].map((item) => <details key={item.title} className="py-4" open={item.title === "Sobre a peça"}><summary className="cursor-pointer font-medium text-cacau">{item.title}</summary><p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-tinta-suave">{item.text || "Informação em preparação. Consulte novamente antes de comprar."}</p></details>)}
          </div>
        </div>
      </div>
    </div>
  );
}
