import { describe, expect, it } from "vitest";
import { createOrderInput } from "./input";
const data = { items: [{ variantId: "13c86a1d-92ec-4634-b03c-91998f68c34e", quantity: 1 }], addressId: "3a44c0f7-d867-4ec7-aacf-f5f37037c7c5", idempotencyKey: "822fd9ad-72fb-400e-936a-ece60f561ede", expectedSubtotalCents: 1990, acceptedTerms: true };
describe("entrada de pedido", () => {
  it.each(["userId", "status", "shippingCents", "totalCents", "discountCents"])("rejeita campo de autoridade %s", (key) => {
    expect(createOrderInput.safeParse({ ...data, [key]: 1 }).success).toBe(false);
  });
  it("exige aceite e impede duplicar linhas para contornar o estoque", () => {
    expect(createOrderInput.safeParse({ ...data, acceptedTerms: false }).success).toBe(false);
    expect(createOrderInput.safeParse({ ...data, items: [...data.items, ...data.items] }).success).toBe(false);
  });
});
