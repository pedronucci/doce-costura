"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guard";
import { productInput, publicationIssues } from "@/lib/catalog/admin-schema";
import { deleteProduct, duplicateProduct, saveProduct, UserFacingError } from "@/lib/catalog/admin-repo";
import { CATALOG_TAG } from "@/lib/catalog/tags";
import { processProductImage } from "@/lib/storage/images";
import { hitRateLimit } from "@/lib/rate-limit";

export type UploadResult =
  | { ok: true; image: { url: string; storageKey: string; width: number; height: number } }
  | { ok: false; error: string };

export async function uploadImageAction(form: FormData): Promise<UploadResult> {
  const session = await requireAdmin();
  const rl = await hitRateLimit(`upload:${session.user.id}`, 120, 10 * 60);
  if (!rl.allowed) return { ok: false, error: "Muitos envios seguidos. Aguarde alguns minutos." };

  const file = form.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Nenhum arquivo recebido." };
  try {
    const img = await processProductImage(file);
    return { ok: true, image: { url: img.url, storageKey: img.key, width: img.width, height: img.height } };
  } catch (e) {
    console.error("[upload]", e instanceof Error ? e.message : e);
    return { ok: false, error: e instanceof Error ? e.message : "Não foi possível enviar a foto." };
  }
}

export type SaveResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; issues?: string[] };

export async function saveProductAction(payload: string): Promise<SaveResult> {
  const session = await requireAdmin();

  let raw: unknown;
  try {
    raw = JSON.parse(payload);
  } catch {
    return { ok: false, error: "Dados inválidos." };
  }
  const parsed = productInput.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, error: "Revise os campos destacados.", fieldErrors };
  }

  const issues = publicationIssues(parsed.data);
  if (issues.length) {
    return { ok: false, error: "Ainda faltam informações para este status.", issues };
  }

  try {
    const id = await saveProduct(parsed.data, session.user.id);
    updateTag(CATALOG_TAG);
    return { ok: true, id };
  } catch (e) {
    if (e instanceof UserFacingError) return { ok: false, error: e.message };
    console.error("[produto]", e);
    return { ok: false, error: "Não foi possível salvar. Tente novamente." };
  }
}

const idSchema = z.uuid();

export async function duplicateProductAction(id: string) {
  const session = await requireAdmin();
  const newId = await duplicateProduct(idSchema.parse(id), session.user.id);
  updateTag(CATALOG_TAG);
  redirect(`/admin/produtos/${newId}?copiado=1`);
}

export async function deleteProductAction(id: string): Promise<{ error?: string }> {
  const session = await requireAdmin();
  try {
    await deleteProduct(idSchema.parse(id), session.user.id);
  } catch (e) {
    if (e instanceof UserFacingError) return { error: e.message };
    throw e;
  }
  updateTag(CATALOG_TAG);
  redirect("/admin/produtos?excluido=1");
}
