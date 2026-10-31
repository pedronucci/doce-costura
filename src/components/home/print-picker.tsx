"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/catalog/types";
import { ProductPrice } from "@/components/product/product-price";
import { cn } from "@/lib/format";

/** "Escolha sua estampa favorita" — amostras circulares recortadas das fotos reais. */
export function PrintPicker({ products }: { products: Product[] }) {
  const options = products.filter((p) => p.print?.swatch && p.images[0]);
  const [selected, setSelected] = useState(options[0]?.slug);
  const current = options.find((p) => p.slug === selected) ?? options[0];
  if (!current) return null;
  const image = current.images[0];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
      <div>
        <p className="mb-7 hidden max-w-sm leading-relaxed text-tinta-suave lg:block">
          Toque em uma estampa para ver a peça. Cada barrado traz uma história diferente para a sua cozinha.
        </p>
        <div role="group" aria-label="Estampas disponíveis" className="flex flex-wrap justify-center gap-x-3 gap-y-5 sm:gap-x-5 lg:grid lg:max-w-md lg:grid-cols-3 lg:justify-items-start lg:gap-x-6 lg:gap-y-7">
          {options.map((p) => {
            const active = p.slug === current.slug;
            return (
              <button
                key={p.slug}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(p.slug)}
                className="group flex w-[5.4rem] flex-col items-center gap-2 sm:w-24"
              >
                <span
                  className={cn(
                    "relative block h-[4.6rem] w-[4.6rem] overflow-hidden rounded-full ring-offset-4 ring-offset-linho transition-all duration-500 ease-suave sm:h-20 sm:w-20",
                    active ? "ring-2 ring-rosa-profundo" : "ring-1 ring-dourado/40 group-hover:ring-rosa",
                  )}
                >
                  <Image src={p.print!.swatch!} alt="" fill sizes="80px" className="object-cover" />
                </span>
                <span className={cn("text-center text-[0.78rem] leading-tight", active ? "text-rosa-profundo" : "text-tinta-suave")}>
                  {p.print!.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid items-center gap-6 rounded-[2rem] bg-papel p-4 shadow-[0_24px_50px_-36px_rgba(90,47,20,0.5)] sm:grid-cols-[1fr_1fr] sm:p-5">
        <div key={current.slug} className="relative aspect-square animate-[sobe-suave_.5s_var(--ease-suave)] overflow-hidden rounded-[1.5rem] bg-linho">
          <Image src={image.src} alt={image.alt} fill sizes="(min-width: 640px) 22rem, 90vw" className="object-cover" />
        </div>
        <div className="px-2 pb-3 sm:px-0 sm:pb-0" aria-live="polite">
          <p className="text-[0.7rem] tracking-[0.22em] text-dourado-texto uppercase">Estampa {current.print!.name}</p>
          <h3 className="mt-2 font-serif text-[1.6rem] leading-tight">{current.name}</h3>
          <p className="mt-3 text-[0.92rem] leading-relaxed text-tinta-suave">{current.summary}</p>
          <div className="mt-4">
            <ProductPrice product={current} />
          </div>
          <Link
            href={`/produto/${current.slug}`}
            className="group mt-5 inline-flex min-h-11 items-center gap-2 text-[0.76rem] font-medium tracking-[0.18em] text-rosa-profundo uppercase"
          >
            Ver detalhes
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
