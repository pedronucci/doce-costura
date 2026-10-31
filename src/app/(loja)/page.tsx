import { Hero } from "@/components/home/hero";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { ProductRail } from "@/components/home/product-rail";
import { PrintPicker } from "@/components/home/print-picker";
import { Details, Essence, GiftKits } from "@/components/home/editorial-sections";
import { Newsletter } from "@/components/home/newsletter";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategories, getStorefrontProducts, productsInCategory } from "@/lib/catalog/queries";
import type { Product } from "@/lib/catalog/types";

/** Mais vendidos e avaliações só aparecem com dados reais (pedidos pagos / avaliações verificadas). */
const bestSellers: Product[] = [];

export default async function HomePage() {
  const [products, categories] = await Promise.all([getStorefrontProducts(), getCategories()]);
  const newest = [...products]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .sort((a, b) => Number(b.images.length > 0) - Number(a.images.length > 0))
    .slice(0, 9);

  return (
    <>
      <Hero />

      {/* 1. Coleção em destaque */}
      <FeaturedCollection products={products} categories={categories} />

      {/* 2. Mais vendidos — oculto até existirem vendas reais */}
      <ProductRail id="mais-vendidos" eyebrow="Queridinhos" title="Mais vendidos" products={bestSellers} />

      {/* 3. Novidades */}
      <ProductRail
        id="novidades"
        eyebrow="Acabaram de chegar"
        title="Novidades"
        description="Conheça as estampas mais recentes da Doce Costura."
        products={newest}
        cta={{ href: "/colecao", label: "Ver toda a coleção" }}
      />

      {/* 4. Escolha sua estampa favorita */}
      <section aria-labelledby="estampas-title" className="bg-linho py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            id="estampas-title"
            eyebrow="Para combinar com a sua cozinha"
            title="Escolha sua estampa favorita"
            className="mb-12"
          />
          <PrintPicker products={products} />
        </div>
      </section>

      {/* 5. Kits especiais */}
      <GiftKits kits={productsInCategory(products, "kits-para-presente")} />

      {/* 6. Nossa essência */}
      <Essence />

      {/* 7. Detalhes que encantam */}
      <Details />

      {/* 8. Avaliações verificadas — exibidas apenas quando houver avaliações de compras confirmadas (Etapa 3) */}

      {/* 9. Newsletter com consentimento */}
      <Newsletter />
    </>
  );
}
