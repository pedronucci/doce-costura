import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { FlourishHeart } from "@/components/ui/ornaments";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pt-8 pb-16 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12 lg:pt-12 lg:pb-20">
        {/* Fotografia — arco de boutique com moldura pespontada */}
        <div className="relative order-2 mx-auto w-full max-w-[34rem]">
          <div aria-hidden="true" className="xadrez-rosa absolute -right-3 -bottom-3 left-8 top-10 rounded-t-[12rem] sm:rounded-t-[999px] rounded-b-[2rem] opacity-70 sm:-right-5 sm:-bottom-5" />
          <div className="relative aspect-[4/3] overflow-hidden rounded-t-[12rem] rounded-b-[1rem] bg-linho sm:rounded-t-[999px] shadow-[0_30px_60px_-35px_rgba(90,47,20,0.55)] lg:aspect-[4/4]">
            <Image
              src="/images/marca/hero-cha-azul.jpg"
              alt="Pano de prato Chá Azul pendurado em uma cozinha, com renda branca, barrado de bules e babado xadrez azul"
              fill
              priority
              sizes="(min-width: 1024px) 34rem, 92vw"
              className="object-cover object-[60%_center]"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-t-[11.5rem] sm:rounded-t-[999px] rounded-b-[1.6rem] border border-dashed border-papel/70" />
          </div>
        </div>

        <div className="order-1 flex animate-[sobe-suave_.9s_var(--ease-suave)] flex-col items-center text-center lg:items-start lg:text-left">
          <p className="text-[0.72rem] font-medium tracking-[0.28em] text-salvia-escuro uppercase">Carinho em cada detalhe</p>
          <FlourishHeart className="mt-3 text-dourado" />
          <h1 id="hero-title" className="mt-4 max-w-[15ch] text-[2.6rem] leading-[1.04] sm:text-[3.4rem] lg:text-[4.1rem]">
            <em className="font-medium text-rosa-profundo italic">Delicadeza</em> para viver a sua cozinha.
          </h1>
          <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-tinta-suave sm:text-[1.08rem]">
            Enxovais, estampas e detalhes para deixar sua casa ainda mais sua.
          </p>
          <ButtonLink href="/colecao" className="mt-9">
            Explorar coleção
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
