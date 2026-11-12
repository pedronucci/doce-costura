import { quoteInput } from "@/lib/checkout/quote";
import { quoteCart } from "@/lib/checkout/repository";
import { clientIp, hitRateLimit } from "@/lib/rate-limit";

const headers = { "Cache-Control": "no-store" };
const MAX_BODY_BYTES = 8192;

/** Consulta de preços e disponibilidade. Não cria pedido, reserva nem cobrança. */
export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "Envie o carrinho em formato JSON." }, { status: 415, headers });
  }
  // Leitura limitada também quando Content-Length não foi enviado ou está incorreto.
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "Informe as peças do carrinho." }, { status: 400, headers });
  let input: unknown;
  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return Response.json({ error: "O carrinho enviado é muito grande." }, { status: 413, headers });
      }
      chunks.push(chunk.value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return Response.json({ error: "Não foi possível ler o carrinho. Atualize a página e tente novamente." }, { status: 400, headers });
  }
  const parsed = quoteInput.safeParse(input);
  if (!parsed.success) {
    return Response.json({ error: "Revise seu carrinho: selecione de 1 a 50 modelos, com até 99 unidades de cada." }, { status: 400, headers });
  }
  try {
    const limit = await hitRateLimit(`checkout:quote:${await clientIp()}`, 30, 60);
    if (!limit.allowed) return Response.json({ error: "Aguarde um momento antes de conferir novamente." }, { status: 429, headers: { ...headers, "Retry-After": String(limit.retryAfter) } });
    return Response.json(await quoteCart(parsed.data), { headers });
  } catch {
    return Response.json({ error: "Não foi possível conferir as peças agora. Seu carrinho está salvo; tente novamente em instantes." }, { status: 503, headers });
  }
}
