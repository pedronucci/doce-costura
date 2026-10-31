import Image from "next/image";
import { Gift } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button-link";
import { FlourishHeart, SprigHeart } from "@/components/ui/ornaments";
import { getProductsByCategory } from "@/lib/catalog/data";
import { ProductCard } from "@/components/product/product-card";

/** Kits especiais: mostra os kits cadastrados; sem kits, um aviso honesto de "em preparação". */
export function GiftKits() {
  const kits = getProductsByCategory("kits-para-presente");
  return (
    <section aria-labelledby="kits-title" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {kits.length > 0 ? (
          <>
            <SectionHeading id="kits-title" eyebrow="Para presentear" title="Kits especiais" />
            <ul className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-3">
              {kits.map((k) => (
                <li key={k.slug}>
                  <ProductCard product={k} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="relative overflow-hidden rounded-[2rem] border border-dourado/25 bg-nevoa/60 px-6 py-14 text-center sm:px-12">
            <div aria-hidden="true" className="xadrez-rosa absolute inset-y-0 left-0 w-3 opacity-80 sm:w-4" />
            <div aria-hidden="true" className="xadrez-rosa absolute inset-y-0 right-0 w-3 opacity-80 sm:w-4" />
            <Gift className="mx-auto h-7 w-7 text-rosa-profundo" strokeWidth={1.2} />
            <p className="mt-4 font-script text-[1.7rem] leading-none text-rosa-profundo">Para presentear</p>
            <h2 id="kits-title" className="mt-2 text-[2.2rem] sm:text-[2.6rem]">
              Kits especiais
            </h2>
            <SprigHeart className="mx-auto mt-3 text-dourado" />
            <p className="mx-auto mt-5 max-w-lg leading-relaxed text-tinta-suave">
              Estamos preparando combinações especiais para presentear quem você ama. Inscreva-se na nossa newsletter para
              saber quando chegarem.
            </p>
            <ButtonLink href="#newsletter" variant="outline" className="mt-8">
              Avise-me
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}

/** Nossa essência — texto institucional provisório, sujeito à revisão da marca. */
export function Essence() {
  return (
    <section aria-labelledby="essencia-title" className="bg-[#faf3ea] py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="relative mx-auto w-full max-w-[22rem]">
          <Image
            src="/images/marca/logo-doce-costura.webp"
            alt="Selo Doce Costura com laço xadrez rosa, botão em forma de coração e agulha"
            width={720}
            height={695}
            sizes="(min-width: 1024px) 22rem, 80vw"
            className="h-auto w-full"
          />
        </div>
        <div className="text-center lg:text-left">
          <p className="font-script text-[1.8rem] leading-none text-rosa-profundo">Nossa essência</p>
          <h2 id="essencia-title" className="mt-3 text-[2.3rem] leading-[1.08] sm:text-[2.9rem]">
            A cozinha é o coração da casa
          </h2>
          <FlourishHeart className="mx-auto mt-4 text-dourado lg:mx-0" />
          <div className="mt-6 space-y-4 text-[1.02rem] leading-relaxed text-tinta-suave">
            <p>
              Acreditamos que ela merece peças tão bonitas quanto úteis. Por isso, cada pano de prato Doce Costura reúne
              rendas, babados e estampas escolhidos com carinho para trazer delicadeza ao dia a dia.
            </p>
            <p>São detalhes que transformam um gesto simples em um momento de cuidado — para a sua casa ou para presentear.</p>
          </div>
          <ButtonLink href="/sobre" variant="ghost" className="mt-6 px-0">
            Conheça nossa história
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

const details = [
  { src: "/images/detalhes/renda.jpg", title: "Rendas delicadas", text: "Aplicadas entre faixas e barrados." },
  { src: "/images/detalhes/babado.jpg", title: "Babados", text: "Xadrez e laise que dão movimento à peça." },
  { src: "/images/detalhes/estampa.jpg", title: "Estampas", text: "Bules, flores, legumes e lavandas." },
  { src: "/images/detalhes/acabamento.jpg", title: "Acabamentos", text: "Fitas, passamanarias e vivos coloridos." },
  { src: "/images/detalhes/tecido.jpg", title: "Toque do tecido", text: "Base branca com textura marcante." },
];

export function Details() {
  return (
    <section aria-labelledby="detalhes-title" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="detalhes-title"
          eyebrow="Feito de detalhes"
          title="Detalhes que encantam"
          description="Olhe de perto: cada elemento foi pensado para deixar a sua cozinha mais charmosa."
        />
        <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-8">
          {details.map((d, i) => (
            <li key={d.title} className={i === 4 ? "col-span-2 sm:col-span-1" : undefined}>
              <figure className="flex flex-col items-center text-center">
                <div className="relative aspect-square w-full max-w-[8.5rem] sm:max-w-[11rem] overflow-hidden rounded-full ring-1 ring-dourado/40 ring-offset-[6px] ring-offset-creme">
                  <Image src={d.src} alt="" fill sizes="(min-width: 1024px) 11rem, 40vw" className="object-cover" />
                </div>
                <figcaption className="mt-5">
                  <span className="block font-serif text-[1.25rem] text-cacau">{d.title}</span>
                  <span className="mt-1 block text-[0.84rem] leading-snug text-tinta-suave">{d.text}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
