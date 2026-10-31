"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guard";
import { categoryInput, slugify } from "@/lib/catalog/admin-schema";
import { deleteCategory, moveCategory, saveCategory, UserFacingError } from "@/lib/catalog/admin-repo";
import { CATALOG_TAG } from "@/lib/catalog/tags";

export type CategoryFormState = { error?: string; ok?: boolean; at?: number };

export async function saveCategoryAction(_prev: CategoryFormState, form: FormData): Promise<CategoryFormState> {
  const session = await requireAdmin();
  const name = String(form.get("name") ?? "");
  const parsed = categoryInput.safeParse({
    id: form.get("id") || undefined,
    name,
    shortName: String(form.get("shortName") ?? ""),
    slug: slugify(String(form.get("slug") || name)),
    description: String(form.get("description") ?? ""),
    isActive: form.get("isActive") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await saveCategory(parsed.data, session.user.id);
  } catch (e) {
    if (e instanceof UserFacingError) return { error: e.message };
    throw e;
  }
  updateTag(CATALOG_TAG);
  return { ok: true, at: Date.now() };
}

export async function moveCategoryAction(id: string, direction: "up" | "down") {
  const session = await requireAdmin();
  await moveCategory(z.uuid().parse(id), direction, session.user.id);
  updateTag(CATALOG_TAG);
}

export async function deleteCategoryAction(id: string): Promise<{ error?: string }> {
  const session = await requireAdmin();
  try {
    await deleteCategory(z.uuid().parse(id), session.user.id);
  } catch (e) {
    if (e instanceof UserFacingError) return { error: e.message };
    throw e;
  }
  updateTag(CATALOG_TAG);
  return {};
}
