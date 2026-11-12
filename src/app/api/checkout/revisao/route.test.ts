import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/checkout/repository", () => ({ quoteCart: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ clientIp: vi.fn().mockResolvedValue("ip-sintetico"), hitRateLimit: vi.fn() }));
import { quoteCart } from "@/lib/checkout/repository";
import { hitRateLimit } from "@/lib/rate-limit";
import { POST } from "./route";

const payload = { items: [{ variantId: "13c86a1d-92ec-4634-b03c-91998f68c34e", quantity: 1 }] };
const request = (data: unknown) => new Request("https://loja.example/api/checkout/revisao", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });

beforeEach(() => { vi.resetAllMocks(); vi.mocked(hitRateLimit).mockResolvedValue({ allowed: true, retryAfter: 0 }); });

describe("API de revisão", () => {
  it("rejeita valores adulterados antes de acessar o banco", async () => {
    expect((await POST(request({ ...payload, shippingCents: 0 }))).status).toBe(400);
    expect(quoteCart).not.toHaveBeenCalled();
    expect(hitRateLimit).not.toHaveBeenCalled();
  });
  it("rejeita corpo maior que o limite mesmo sem content-length", async () => {
    const response = await POST(request({ content: "x".repeat(9000) }));
    expect(response.status).toBe(413);
    expect(quoteCart).not.toHaveBeenCalled();
  });
  it("recusa JSON inválido e tipo de conteúdo incorreto", async () => {
    expect((await POST(new Request("https://loja.example", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" }))).status).toBe(400);
    expect((await POST(new Request("https://loja.example", { method: "POST", body: "texto" }))).status).toBe(415);
  });
  it("limita requisições sem executar a consulta de produtos", async () => {
    vi.mocked(hitRateLimit).mockResolvedValue({ allowed: false, retryAfter: 12 });
    const response = await POST(request(payload));
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("12");
    expect(quoteCart).not.toHaveBeenCalled();
  });
  it("responde sem cache e com dados recalculados pelo servidor", async () => {
    const quote = { currency: "BRL" as const, items: [], issues: [], subtotalCents: 1990, shippingCents: null, totalCents: null };
    vi.mocked(quoteCart).mockResolvedValue(quote);
    const response = await POST(request(payload));
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual(quote);
    expect(quoteCart).toHaveBeenCalledWith(payload);
  });
  it("oculta falhas internas e mantém possibilidade de tentar novamente", async () => {
    vi.mocked(quoteCart).mockRejectedValue(new Error("detalhe interno sintético"));
    const response = await POST(request(payload));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("detalhe interno");
  });
});
