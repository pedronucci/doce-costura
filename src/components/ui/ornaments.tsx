import { cn } from "@/lib/format";

/** Raminho com coração — inspirado no ornamento inferior da logomarca. */
export function SprigHeart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 24" aria-hidden="true" className={cn("h-5 w-28", className)} fill="none">
      <path d="M8 12h34M78 12h34" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <path
        d="M44 12c4-5 9-6 12-3M44 12c4 5 9 6 12 3M76 12c-4-5-9-6-12-3M76 12c-4 5-9 6-12 3"
        stroke="var(--color-salvia)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M60 17.5s-5.5-3.3-5.5-7a3 3 0 0 1 5.5-1.7A3 3 0 0 1 65.5 10.5c0 3.7-5.5 7-5.5 7Z"
        fill="var(--color-rosa)"
        opacity="0.85"
      />
    </svg>
  );
}

/** Linha com arabesco e coração — inspirado no ornamento superior da logomarca. */
export function FlourishHeart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 20" aria-hidden="true" className={cn("h-4 w-36", className)} fill="none">
      <path
        d="M4 12c14 0 18-7 26-7s9 7 3 7-4-7 6-7h28M156 12c-14 0-18-7-26-7s-9 7-3 7 4-7-6-7H93"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path d="M80 15s-4.5-2.7-4.5-5.6a2.4 2.4 0 0 1 4.5-1.3 2.4 2.4 0 0 1 4.5 1.3C84.5 12.3 80 15 80 15Z" fill="currentColor" />
    </svg>
  );
}

/** Laço simplificado, usado em detalhes pequenos (não substitui a logomarca). */
export function Bow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 28" aria-hidden="true" className={cn("h-5 w-8", className)} fill="none">
      <path
        d="M24 13C18 4 6 2 4 8s4 11 20 5Zm0 0c6-9 18-11 20-5s-4 11-20 5Z"
        fill="var(--color-nevoa)"
        stroke="var(--color-rosa)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M22 15l-6 11M26 15l6 11" stroke="var(--color-rosa)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="24" cy="13" r="3" fill="var(--color-dourado)" />
    </svg>
  );
}
