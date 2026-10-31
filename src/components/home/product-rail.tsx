import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button-link";
import type { Product } from "@/lib/catalog/types";

/**
 * Vitrine genérica (Novidades, Mais vendidos).
 * Sem produtos reais para exibir, a seção não é renderizada.
 */
export function ProductRail({
  id,
  eyebrow,
  title,
  description,
  products,
  cta,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  products: Product[];
  cta?: { href: string; label: string };
}) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby={`${id}-title`} className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id={`${id}-title`} eyebrow={eyebrow} title={title} description={description} />
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
          {products.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} sizes="(min-width: 1024px) 30vw, 46vw" />
            </li>
          ))}
        </ul>
        {cta && (
          <div className="mt-14 flex justify-center">
            <ButtonLink href={cta.href} variant="outline">
              {cta.label}
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
