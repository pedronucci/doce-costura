import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category, Product } from "@/lib/catalog/types";
import { SectionHeading } from "@/components/ui/section-heading";

export function CategoryDiscovery({ categories, products }: { categories: Category[]; products: Product[] }) {
  const tiles = categories.map((category, index) => {
    const matching = products.filter((p) => p.categorySlugs.includes(category.slug) && p.images.length);
    return { category, photo: matching[index % matching.length]?.images[0] };
  }).filter((t) => t.photo).slice(0, 4);
  if (!tiles.length) return null;
  return <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20" aria-labelledby="categorias-title"><SectionHeading id="categorias-title" title="Encontre seu próximo carinho" /><ul className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">{tiles.map(({ category, photo }) => <li key={category.slug}><Link href={`/categoria/${category.slug}`} className="group block overflow-hidden rounded-2xl bg-linho"><div className="relative aspect-[4/3] overflow-hidden"><Image src={photo!.src} alt={photo!.alt} fill sizes="(min-width: 1024px) 23vw, 44vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /></div><span className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 font-serif text-lg text-cacau sm:text-xl">{category.name}<ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" /></span></Link></li>)}</ul></section>;
}
