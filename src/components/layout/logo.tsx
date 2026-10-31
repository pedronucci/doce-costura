import Link from "next/link";
import { cn } from "@/lib/format";
import { Bow } from "@/components/ui/ornaments";

/**
 * Assinatura tipográfica para o cabeçalho, derivada da logomarca:
 * "Doce" em serifa marrom e "Costura" em caligrafia rosa.
 * A logomarca completa (selo) é usada no rodapé e em "Nossa essência".
 */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Doce Costura — página inicial"
      className={cn("group inline-flex flex-col items-center leading-none", className)}
    >
      <Bow className={cn("mb-0.5 h-3.5 w-6 transition-transform duration-500 ease-suave group-hover:-rotate-3", !compact && "lg:h-4 lg:w-7")} />
      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className={cn("font-serif text-[1.45rem] font-semibold tracking-tight text-cacau", !compact && "sm:text-[1.6rem] lg:text-[1.9rem]")}>
          Doce
        </span>
        <span className={cn("font-script text-[1.6rem] text-rosa-profundo", !compact && "sm:text-[1.75rem] lg:text-[2.1rem]")}>
          Costura
        </span>
      </span>
    </Link>
  );
}
