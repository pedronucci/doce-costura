import { Bow } from "@/components/ui/ornaments";

/** Espaço reservado para produtos sem fotografia — nunca substituída por imagem genérica. */
export function PhotoPending() {
  return (
    <div className="moldura-pesponto absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linho px-6 text-center">
      <Bow className="h-7 w-12 opacity-80" />
      <p className="font-serif text-[1.15rem] text-cacau">Fotografia em breve</p>
      <p className="text-[0.72rem] tracking-[0.18em] text-dourado-texto uppercase">pendente de cadastro</p>
    </div>
  );
}
