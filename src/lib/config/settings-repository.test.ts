import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/lib/auth/guard", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/db", () => ({ db: { select: vi.fn(), transaction: vi.fn() } }));
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth/guard";
import { getPublicStoreSettings, getSettingsForAdmin, saveStoreSettings } from "./settings-repository";
import { SettingsConflictError } from "./settings-schema";
import { storeSettings } from "./store";

const input = {
  version: null, legalName: "Empresa de teste", cnpj: "", address: "Rua sintética",
  contactEmail: "contato@example.com", contactPhone: "", serviceHours: "",
  whatsappNumber: "", whatsappMessage: "Olá!", instagramUrl: "", originCep: "01001000", announcements: [],
};
const readQuery = (rows: unknown[]) => ({ from: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), limit: vi.fn().mockResolvedValue(rows) });

beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("STOREFRONT_PREVIEW", ""); });

describe("leitura e gravação de configurações", () => {
  it("usa os padrões quando ainda não houve cadastro", async () => {
    vi.mocked(db.select).mockReturnValue(readQuery([]) as never);
    expect(await getPublicStoreSettings()).toEqual(storeSettings);
  });
  it("projeta somente campos públicos e não devolve CEP de origem ou integrações", async () => {
    vi.mocked(db.select).mockReturnValue(readQuery([{ ...input, contactPhone: null, instagramUrl: null, whatsappNumber: null, ga4MeasurementId: "nao-publicar", updatedAt: new Date() }]) as never);
    const settings = await getPublicStoreSettings();
    expect(settings.company.email).toBe("contato@example.com");
    expect(settings).not.toHaveProperty("originCep");
    expect(JSON.stringify(settings)).not.toContain("01001000");
    expect(JSON.stringify(settings)).not.toContain("nao-publicar");
  });
  it("nega leitura administrativa e gravação antes de acessar o banco", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("sem permissão"));
    await expect(getSettingsForAdmin()).rejects.toThrow("sem permissão");
    await expect(saveStoreSettings(input)).rejects.toThrow("sem permissão");
    expect(db.select).not.toHaveBeenCalled();
    expect(db.transaction).not.toHaveBeenCalled();
  });
  it("bloqueia um formulário desatualizado antes de gravar ou auditar", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ user: { id: "admin-teste" } } as never);
    const tx = { execute: vi.fn(), select: vi.fn().mockReturnValue(readQuery([{ updatedAt: new Date("2026-01-01T00:00:00Z") }])), insert: vi.fn() };
    vi.mocked(db.transaction).mockImplementation(async (fn) => fn(tx as never));
    await expect(saveStoreSettings(input)).rejects.toBeInstanceOf(SettingsConflictError);
    expect(tx.insert).not.toHaveBeenCalled();
  });
  it("salva campos permitidos e auditoria na mesma transação, preservando integrações", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ user: { id: "admin-teste" } } as never);
    const upsert = vi.fn().mockResolvedValue([]);
    const settingsValues = vi.fn().mockReturnValue({ onConflictDoUpdate: upsert });
    const auditValues = vi.fn().mockResolvedValue([]);
    const tx = { execute: vi.fn(), select: vi.fn().mockReturnValue(readQuery([])), insert: vi.fn().mockReturnValueOnce({ values: settingsValues }).mockReturnValueOnce({ values: auditValues }) };
    vi.mocked(db.transaction).mockImplementation(async (fn) => fn(tx as never));
    expect(await saveStoreSettings(input)).toMatch(/^\d{4}-/);
    expect(settingsValues.mock.calls[0][0]).toMatchObject({ id: "default", contactEmail: "contato@example.com", originCep: "01001000" });
    expect(upsert.mock.calls[0][0].set).not.toHaveProperty("pixExpirationMin");
    expect(upsert.mock.calls[0][0].set).not.toHaveProperty("ga4MeasurementId");
    expect(auditValues.mock.calls[0][0]).toMatchObject({ actorId: "admin-teste", action: "settings.update" });
    expect(JSON.stringify(auditValues.mock.calls)).not.toContain("contato@example.com");
  });
});
