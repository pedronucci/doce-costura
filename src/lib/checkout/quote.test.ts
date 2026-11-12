import { describe, expect, it } from "vitest";
import { calculateQuote, quoteInput, type QuoteVariant } from "./quote";

const id = "13c86a1d-92ec-4634-b03c-91998f68c34e";
const id2 = "3a44c0f7-d867-4ec7-aacf-f5f37037c7c5";
const variant: QuoteVariant = { id, productName: "Peça de teste", variantName: "Modelo A", slug: "peca-teste", priceCents: 1990, stock: 5, reserved: 2 };
const input = { items: [{ variantId: id, quantity: 3 }] };

describe("revisão da compra", () => {
  it("calcula centavos com os valores do servidor e mantém frete e total indefinidos", () => {
    expect(calculateQuote(input, [variant])).toMatchObject({ subtotalCents: 5970, shippingCents: null, totalCents: null, issues: [], items: [{ unitCents: 1990, totalCents: 5970 }] });
  });
  it("usa o preço atualizado em vez do preço previamente visto no carrinho", () => {
    expect(calculateQuote(input, [{ ...variant, priceCents: 2190 }]).subtotalCents).toBe(6570);
  });
  it("desconta unidades reservadas e rejeita quantidade indisponível", () => {
    const quote = calculateQuote({ items: [{ variantId: id, quantity: 4 }] }, [variant]);
    expect(quote.subtotalCents).toBeNull();
    expect(quote.items).toEqual([]);
    expect(quote.issues).toHaveLength(1);
  });
  it("não vaza dados de produto oculto ou removido e invalida o subtotal inteiro", () => {
    const quote = calculateQuote({ items: [...input.items, { variantId: id2, quantity: 1 }] }, [variant]);
    expect(quote.items).toHaveLength(1);
    expect(quote.subtotalCents).toBeNull();
    expect(quote.issues[0].variantId).toBe(id2);
  });
  it.each([null, 0, -10, 1.5, 2_147_483_648])("rejeita preço inválido %s", (priceCents) => {
    expect(calculateQuote(input, [{ ...variant, priceCents }]).subtotalCents).toBeNull();
  });
  it("recusa valores que ultrapassam a capacidade monetária do pedido", () => {
    expect(calculateQuote(input, [{ ...variant, priceCents: 1_000_000_000 }]).subtotalCents).toBeNull();
    expect(calculateQuote({ items: [{ variantId: id, quantity: 1 }, { variantId: id2, quantity: 1 }] }, [{ ...variant, priceCents: 2_000_000_000 }, { ...variant, id: id2, priceCents: 2_000_000_000 }]).subtotalCents).toBeNull();
  });
  it("não aceita preço, frete ou total enviados pelo navegador", () => {
    expect(quoteInput.safeParse({ ...input, totalCents: 1 }).success).toBe(false);
    expect(quoteInput.safeParse({ items: [{ ...input.items[0], priceCents: 1 }] }).success).toBe(false);
  });
  it("recusa linhas repetidas para impedir contornar o limite de estoque", () => {
    expect(quoteInput.safeParse({ items: [...input.items, ...input.items] }).success).toBe(false);
  });
  it.each([0, -1, 1.5, 100, "2", null])("recusa quantidade %s", (quantity) => {
    expect(quoteInput.safeParse({ items: [{ variantId: id, quantity }] }).success).toBe(false);
  });
  it("limita o número de modelos por requisição", () => {
    expect(quoteInput.safeParse({ items: [] }).success).toBe(false);
    expect(quoteInput.safeParse({ items: Array.from({ length: 51 }, (_, i) => ({ variantId: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`, quantity: 1 })) }).success).toBe(false);
  });
});
