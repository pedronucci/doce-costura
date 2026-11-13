import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
vi.mock("better-auth/cookies", () => ({ getSessionCookie: vi.fn() }));
import { getSessionCookie } from "better-auth/cookies";
import { proxy } from "./proxy";
beforeEach(() => vi.resetAllMocks());
describe("proteção das páginas de conta", () => {
  it.each(["/conta", "/conta/enderecos", "/conta/pedidos", "/conta/pedidos/id-sintetico"])("direciona %s sem cookie para login e impede cache", (path) => {
    const response = proxy(new NextRequest(`https://loja.example${path}`));
    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toBe("https://loja.example/conta/entrar");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
  it.each(["/conta/entrar", "/conta/criar", "/conta/recuperar-senha", "/conta/redefinir-senha", "/checkout"])("mantém %s acessível sem sessão e sem cache", (path) => {
    const response = proxy(new NextRequest(`https://loja.example${path}`));
    expect(response.headers.get("Location")).toBeNull();
    expect(response.headers.get("Cache-Control")).toContain("private, no-store");
  });
  it("com cookie, encaminha para a verificação real de sessão e dono no servidor", () => {
    vi.mocked(getSessionCookie).mockReturnValue("cookie-sintetico");
    const response = proxy(new NextRequest("https://loja.example/conta/pedidos"));
    expect(response.headers.get("Location")).toBeNull();
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
});
