import { describe, expect, it } from "vitest";
import { addCartLine, parseCart } from "./cart";

const line = { slug: "produto-teste", variantId: "variante-a", quantity: 2 };
describe("carrinho local por variação", () => {
  it("soma a mesma variação sem ultrapassar estoque ou limite", () => {
    expect(addCartLine([line], { ...line, quantity: 4 }, 5)).toEqual([{ ...line, quantity: 5 }]);
    expect(addCartLine([{ ...line, quantity: 98 }], line, 200)[0].quantity).toBe(99);
  });
  it("mantém variações diferentes separadas", () => {
    expect(addCartLine([line], { ...line, variantId: "variante-b" }, 5)).toHaveLength(2);
  });
  it("rejeita quantidades inválidas e falta de estoque", () => {
    for (const quantity of [-1, 0, 1.5, 100, NaN, Infinity]) expect(addCartLine([], { ...line, quantity }, 5)).toEqual([]);
    expect(addCartLine([], line, 0)).toEqual([]);
  });
  it("ignora dados adulterados, duplicados e linhas antigas sem variação", () => {
    expect(parseCart([line, line, { slug: line.slug, quantity: 2 }, { ...line, quantity: 999 }, null])).toEqual([line]);
    expect(parseCart({ cart: [line] })).toEqual([]);
  });
});
