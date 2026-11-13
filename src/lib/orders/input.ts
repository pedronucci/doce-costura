import { z } from "zod";
import { quoteInput } from "@/lib/checkout/quote";

export const createOrderInput = quoteInput.safeExtend({
  addressId: z.uuid(),
  idempotencyKey: z.uuid(),
  expectedSubtotalCents: z.number().int().positive().max(2_147_483_647),
  acceptedTerms: z.literal(true, "Confirme a leitura das condições para criar o pedido."),
});
export type CreateOrderInput = z.infer<typeof createOrderInput>;
export class OrderInputError extends Error {}
