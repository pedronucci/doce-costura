import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { getCategory, getProductsByCategory } from "@/lib/catalog/data";
import { SprigHeart } from "@/components/ui/ornaments";

/** Coleção em destaque — definida pelo administrador (Etapa 3). Hoje: Coleção cozinha. */
const FEATURED_CATEGORY = "colecao-cozinha";

export function FeaturedCollection() {
  const category = getCategory(FEATURED_CATEGORY);
  const items = getProductsByCategory(FEATURED_CATEGORY);
  if (!category || items.length === 0) return null;

  return (
    <section aria-labelledby="destaque-title" className="bg-papel py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
        <header className="flex flex-col items-center text-center lg:sticky lg:top-40 lg:items-start lg:self-start lg:text-left">
          <p className="font-script text-[1.7rem] leading-none text-rosa-profundo">Coleção em destaque</p>
          <h2 id="destaque-title" className="mt-3 text-[2.4rem] leading-[1.05] sm:text-[3rem]">
            Coleção Cozinha
          </h2>
          <SprigHeart className="mt-4 text-dourado" />
          <p className="mt-5 max-w-sm leading-relaxed text-tinta-suave">
            Tomates, cenouras, abóboras e legumes da horta estampados em barrados delicados, com rendas e babados.
          </p>
          <Link
            href={`/categoria/${category.slug}`}
            className="group mt-7 inline-flex min-h-11 items-center gap-2 text-[0.78rem] font-medium tracking-[0.18em] text-rosa-profundo uppercase"
          >
            Ver a coleção
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </header>

        <ul className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-4">
          {items.map((p) => (
            <li key={p.slug} className="w-[72vw] max-w-[19rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <ProductCard product={p} sizes="(min-width: 1280px) 20vw, (min-width: 640px) 40vw, 72vw" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
