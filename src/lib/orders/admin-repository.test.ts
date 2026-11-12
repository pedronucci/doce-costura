import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({ db: { select: vi.fn() } }));
vi.mock("@/lib/auth/guard", () => ({ requireStaff: vi.fn() }));
import { db } from "@/db";
import { requireStaff } from "@/lib/auth/guard";
import { getOrderForAdmin, listOrdersForAdmin, orderFilters } from "./admin-repository";

beforeEach(() => vi.resetAllMocks());

describe("permissão de consulta de pedidos", () => {
  it("bloqueia a listagem antes de consultar dados se não houver permissão", async () => {
    vi.mocked(requireStaff).mockRejectedValue(new Error("acesso negado"));
    await expect(listOrdersForAdmin({})).rejects.toThrow("acesso negado");
    expect(db.select).not.toHaveBeenCalled();
  });
  it("bloqueia detalhes de qualquer pedido antes de consultar dados", async () => {
    vi.mocked(requireStaff).mockRejectedValue(new Error("acesso negado"));
    await expect(getOrderForAdmin("13c86a1d-92ec-4634-b03c-91998f68c34e")).rejects.toThrow("acesso negado");
    expect(db.select).not.toHaveBeenCalled();
  });
  it("trata identificador inválido como não encontrado sem consultar o banco", async () => {
    expect(await getOrderForAdmin("id-invalido")).toBeNull();
    expect(requireStaff).toHaveBeenCalled();
    expect(db.select).not.toHaveBeenCalled();
  });
  it("permite a listagem autorizada e limita a página sem omitir o indicador de continuação", async () => {
    const rows = Array.from({ length: 31 }, (_, i) => ({ id: `sintetico-${i}`, number: i + 1, customerName: "Cliente de teste", status: "pending_payment", totalCents: 1990, createdAt: new Date("2026-01-01T12:00:00Z") }));
    const query = { where: vi.fn().mockReturnThis(), orderBy: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), offset: vi.fn().mockResolvedValue(rows) };
    vi.mocked(db.select).mockReturnValue({ from: () => query } as never);
    const result = await listOrdersForAdmin({ page: 1 });
    expect(requireStaff).toHaveBeenCalled();
    expect(result.orders).toHaveLength(30);
    expect(result.orders[0].number).toBe(1);
    expect(result.hasNext).toBe(true);
  });
  it("normaliza filtros e impede paginação negativa ou sem limite", () => {
    expect(orderFilters.parse({ page: -1, number: "texto", status: "inventado" })).toEqual({ page: 1 });
    expect(orderFilters.parse({ page: 999999999, number: "12", status: "paid" })).toEqual({ page: 1, number: 12, status: "paid" });
  });
});
