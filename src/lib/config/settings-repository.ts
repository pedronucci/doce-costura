import "server-only";
import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { auditLog, storeSettings as table } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guard";
import { storeSettings as defaults, type StoreSettings } from "./store";
import { settingsInput, SETTINGS_TAG, SettingsConflictError, type EditableSettings } from "./settings-schema";

const editableColumns = {
  legalName: table.legalName, cnpj: table.cnpj, address: table.address,
  contactEmail: table.contactEmail, contactPhone: table.contactPhone, serviceHours: table.serviceHours,
  whatsappNumber: table.whatsappNumber, whatsappMessage: table.whatsappMessage,
  instagramUrl: table.instagramUrl, originCep: table.originCep, announcements: table.announcements,
};

export async function getPublicStoreSettings(): Promise<StoreSettings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("days");
  if (process.env.STOREFRONT_PREVIEW === "1" && process.env.NODE_ENV !== "production") return defaults;
  const { db } = await import("@/db");
  // Projeção explícita: CEP de origem e configurações de integrações não chegam à vitrine.
  const [row] = await db.select({
    legalName: table.legalName, cnpj: table.cnpj, address: table.address,
    contactEmail: table.contactEmail, contactPhone: table.contactPhone, serviceHours: table.serviceHours,
    whatsappNumber: table.whatsappNumber, whatsappMessage: table.whatsappMessage,
    instagramUrl: table.instagramUrl, announcements: table.announcements,
  }).from(table).where(eq(table.id, "default")).limit(1);
  if (!row) return defaults;
  return {
    ...defaults,
    company: { legalName: row.legalName, cnpj: row.cnpj, address: row.address, email: row.contactEmail, phone: row.contactPhone, serviceHours: row.serviceHours },
    whatsapp: { number: row.whatsappNumber, message: row.whatsappMessage },
    social: { instagram: row.instagramUrl },
    announcements: row.announcements,
  };
}

export async function getSettingsForAdmin(): Promise<EditableSettings> {
  await requireAdmin();
  const { db } = await import("@/db");
  const [row] = await db.select({ ...editableColumns, updatedAt: table.updatedAt }).from(table).where(eq(table.id, "default")).limit(1);
  if (row) {
    const { updatedAt, ...values } = row;
    return { ...values, version: updatedAt.toISOString() };
  }
  return {
    version: null, legalName: null, cnpj: null, address: null, contactEmail: null, contactPhone: null,
    serviceHours: null, whatsappNumber: null, whatsappMessage: defaults.whatsapp.message,
    instagramUrl: null, originCep: null, announcements: [],
  };
}

export async function saveStoreSettings(input: unknown) {
  const session = await requireAdmin();
  const { version, ...values } = settingsInput.parse(input);
  const { db } = await import("@/db");
  return db.transaction(async (tx) => {
    // Serializa também o primeiro cadastro, quando a linha ainda não existe.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('doce-costura:store-settings'))`);
    const [current] = await tx.select({ updatedAt: table.updatedAt }).from(table).where(eq(table.id, "default")).limit(1);
    if ((current?.updatedAt.toISOString() ?? null) !== version) throw new SettingsConflictError("As configurações foram alteradas em outra aba. Recarregue a página antes de salvar.");
    const updatedAt = new Date(Math.max(Date.now(), (current?.updatedAt.getTime() ?? 0) + 1));
    await tx.insert(table).values({ id: "default", ...values, updatedAt }).onConflictDoUpdate({ target: table.id, set: { ...values, updatedAt } });
    // Audita autoria e campos editáveis, sem duplicar endereço/contatos nos logs.
    await tx.insert(auditLog).values({ actorId: session.user.id, action: "settings.update", entity: "store_settings", entityId: "default", diff: { fields: Object.keys(values) } });
    return updatedAt.toISOString();
  });
}
