import { formatBRL } from "@/lib/format";
import type { Product } from "@/lib/catalog/types";

/** Preço do produto. Sem preço cadastrado, informa que o preço está em definição. */
export function ProductPrice({ product }: { product: Pick<Product, "priceCents" | "compareAtPriceCents"> }) {
  const { priceCents, compareAtPriceCents } = product;
  if (priceCents === null) {
    return <p className="text-[0.8rem] tracking-[0.12em] text-dourado-texto uppercase">Preço em breve</p>;
  }
  const onSale = compareAtPriceCents !== null && compareAtPriceCents > priceCents;
  return (
    <p className="flex items-baseline gap-2">
      {onSale && (
        <s className="text-[0.85rem] text-tinta-suave">
          <span className="sr-only">De </span>
          {formatBRL(compareAtPriceCents)}
        </s>
      )}
      <span className="text-[1.02rem] font-medium text-cacau">
        {onSale && <span className="sr-only">Por </span>}
        {formatBRL(priceCents)}
      </span>
    </p>
  );
}
