import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { ShopProvider } from "@/lib/store/shop-context";
import { getCategoryNav, getStorefrontProducts } from "@/lib/catalog/queries";

export default async function LojaLayout({ children }: LayoutProps<"/">) {
  const [categoryNav, products] = await Promise.all([getCategoryNav(), getStorefrontProducts()]);
  const searchItems = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    summary: p.summary,
    printName: p.print?.name ?? "",
    image: p.images[0]?.src ?? null,
  }));
  return (
    <ShopProvider>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-papel focus:px-5 focus:py-3"
      >
        Pular para o conteúdo
      </a>
      <AnnouncementBar />
      <Header categoryNav={categoryNav} searchItems={searchItems} />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <CookieConsent />
    </ShopProvider>
  );
}
