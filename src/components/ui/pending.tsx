import { cn } from "@/lib/format";

/**
 * Exibe o valor cadastrado ou um marcador "pendente de cadastro".
 * Usado para que nenhuma informação comercial seja inventada.
 */
export function Pending({ value, label = "pendente de cadastro", className }: { value: string | null; label?: string; className?: string }) {
  if (value) return <>{value}</>;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-dashed border-dourado/60 px-2 py-px text-[0.7rem] tracking-wide text-dourado-texto",
        className,
      )}
    >
      {label}
    </span>
  );
}
