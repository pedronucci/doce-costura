import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("next/cache", () => ({ updateTag: vi.fn() }));
vi.mock("@/lib/auth/guard", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/config/settings-repository", () => ({ saveStoreSettings: vi.fn() }));
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/guard";
import { saveStoreSettings } from "@/lib/config/settings-repository";
import { saveSettingsAction } from "./actions";

function form() {
  const data = new FormData();
  data.set("whatsappMessage", "Olá!");
  data.set("announcements", "Mensagem A\r\n\r\nMensagem B");
  return data;
}
beforeEach(() => vi.resetAllMocks());

describe("salvamento pelo formulário", () => {
  it("nega a ação sem permissão administrativa", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("sem permissão"));
    await expect(saveSettingsAction({}, form())).rejects.toThrow("sem permissão");
    expect(saveStoreSettings).not.toHaveBeenCalled();
  });
  it("não grava dados inválidos e preserva a última versão salva para nova tentativa", async () => {
    const data = form();
    data.set("contactEmail", "invalido");
    const result = await saveSettingsAction({ savedVersion: "2026-01-01T00:00:00.000Z" }, data);
    expect(result.error).toBeTruthy();
    expect(result.savedVersion).toBe("2026-01-01T00:00:00.000Z");
    expect(saveStoreSettings).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });
  it("salva dados permitidos e invalida a vitrine para leitura atualizada", async () => {
    vi.mocked(saveStoreSettings).mockResolvedValue("2026-01-01T00:00:00.000Z");
    const data = form();
    data.set("maxInstallments", "12");
    const result = await saveSettingsAction({}, data);
    expect(result.savedVersion).toBe("2026-01-01T00:00:00.000Z");
    expect(saveStoreSettings).toHaveBeenCalledWith(expect.objectContaining({ announcements: ["Mensagem A", "Mensagem B"] }));
    expect(vi.mocked(saveStoreSettings).mock.calls[0][0]).not.toHaveProperty("maxInstallments");
    expect(updateTag).toHaveBeenCalledWith("store-settings");
  });
  it("não informa sucesso nem renova o cache quando a gravação falha", async () => {
    vi.mocked(saveStoreSettings).mockRejectedValue(new Error("detalhe interno"));
    const result = await saveSettingsAction({}, form());
    expect(result.error).toContain("Não foi possível salvar");
    expect(result.error).not.toContain("detalhe interno");
    expect(result.savedVersion).toBeUndefined();
    expect(updateTag).not.toHaveBeenCalled();
  });
});
