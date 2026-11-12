import { describe, expect, it } from "vitest";
import { settingsInput } from "./settings-schema";

export const sampleSettings = {
  version: null, legalName: "Empresa de teste", cnpj: "", address: "",
  contactEmail: "contato@example.com", contactPhone: "(11) 2345-6789", serviceHours: "",
  whatsappNumber: "+55 (11) 99999-9999", whatsappMessage: "Olá!", instagramUrl: "https://www.instagram.com/perfil_teste/",
  originCep: "01001-000", announcements: ["Mensagem de teste"],
};

describe("configurações da loja", () => {
  it("normaliza contatos e CEP sem preencher dados empresariais ausentes", () => {
    expect(settingsInput.parse(sampleSettings)).toMatchObject({ cnpj: null, address: null, contactPhone: "1123456789", whatsappNumber: "5511999999999", originCep: "01001000" });
  });
  it("permite remover contatos opcionais", () => {
    expect(settingsInput.parse({ ...sampleSettings, whatsappNumber: "", instagramUrl: "", contactEmail: "", originCep: "" })).toMatchObject({ whatsappNumber: null, instagramUrl: null, contactEmail: null, originCep: null });
  });
  it.each(["javascript:alert(1)", "https://instagram.com.evil.example/perfil", "https://evil.example/perfil", "http://instagram.com/perfil", "https://user:pass@instagram.com/perfil", "https://instagram.com/perfil?redirect=evil", "https://instagram.com/"])("rejeita link de Instagram inseguro ou inválido %s", (instagramUrl) => {
    expect(settingsInput.safeParse({ ...sampleSettings, instagramUrl }).success).toBe(false);
  });
  it("rejeita CEP e WhatsApp incompletos", () => {
    expect(settingsInput.safeParse({ ...sampleSettings, originCep: "123" }).success).toBe(false);
    expect(settingsInput.safeParse({ ...sampleSettings, whatsappNumber: "11999999999" }).success).toBe(false);
  });
  it("não aceita configurações de pagamento ou analytics por este formulário", () => {
    expect(settingsInput.safeParse({ ...sampleSettings, maxInstallments: 12 }).success).toBe(false);
    expect(settingsInput.safeParse({ ...sampleSettings, ga4MeasurementId: "teste" }).success).toBe(false);
  });
  it("limita e evita repetição das mensagens públicas", () => {
    expect(settingsInput.safeParse({ ...sampleSettings, announcements: ["a", "b", "c", "d"] }).success).toBe(false);
    expect(settingsInput.safeParse({ ...sampleSettings, announcements: ["a".repeat(71)] }).success).toBe(false);
    expect(settingsInput.safeParse({ ...sampleSettings, announcements: ["a", "a"] }).success).toBe(false);
  });
});
