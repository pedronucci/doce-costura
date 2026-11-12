"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/guard";
import { saveStoreSettings } from "@/lib/config/settings-repository";
import { settingsInput, SETTINGS_TAG, SettingsConflictError } from "@/lib/config/settings-schema";

export type SettingsFormState = { error?: string; savedVersion?: string };

export async function saveSettingsAction(_previous: SettingsFormState, form: FormData): Promise<SettingsFormState> {
  await requireAdmin();
  const fail = (error: string): SettingsFormState => ({ error, savedVersion: _previous.savedVersion });
  const text = (key: string) => String(form.get(key) ?? "").trim();
  const input = {
    version: text("version") || null,
    legalName: text("legalName"), cnpj: text("cnpj"), address: text("address"),
    contactEmail: text("contactEmail"), contactPhone: text("contactPhone"), serviceHours: text("serviceHours"),
    whatsappNumber: text("whatsappNumber"), whatsappMessage: text("whatsappMessage"),
    instagramUrl: text("instagramUrl"), originCep: text("originCep"),
    announcements: text("announcements").split(/\r?\n/).map((v) => v.trim()).filter(Boolean),
  };
  const parsed = settingsInput.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  try {
    const savedVersion = await saveStoreSettings(input);
    updateTag(SETTINGS_TAG);
    return { savedVersion };
  } catch (error) {
    if (error instanceof SettingsConflictError) return fail(error.message);
    return fail("Não foi possível salvar agora. Suas alterações continuam no formulário; tente novamente.");
  }
}
