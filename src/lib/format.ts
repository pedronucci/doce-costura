const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Formata centavos em reais. Valores sempre trafegam em centavos (inteiros). */
export function formatBRL(cents: number) {
  return brl.format(cents / 100);
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
