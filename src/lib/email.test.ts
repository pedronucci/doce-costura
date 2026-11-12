import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { sendEmail } from "./email";

const message = { to: "cliente@example.com", subject: "Teste", html: "<p>Teste</p>", text: "Teste" };
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("envio de e-mail", () => {
  it("sem configuração falha sem registrar conteúdo ou chamar API", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", "");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(sendEmail(message)).rejects.toThrow("Envio de e-mail não configurado");
    expect(info).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("não informa sucesso se o provedor rejeitar o envio", async () => {
    vi.stubEnv("RESEND_API_KEY", "chave-sintetica-de-teste");
    vi.stubEnv("EMAIL_FROM", "teste@example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(sendEmail(message)).rejects.toThrow("Falha ao enviar e-mail (503)");
  });
});
