import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

/**
 * Armazenamento das fotos.
 * - "supabase" (produção): bucket público "produtos" no Supabase Storage.
 *   A chave secreta fica só no servidor e nunca vai para o navegador.
 * - "local" (desenvolvimento): pasta .data/uploads, servida por /api/uploads.
 */
export type StoredFile = { key: string; url: string };

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "produtos";
const LOCAL_DIR = path.join(process.cwd(), ".data", "uploads");

export function storageDriver(): "supabase" | "local" {
  const driver = process.env.STORAGE_DRIVER ?? (process.env.SUPABASE_URL ? "supabase" : "local");
  if (driver === "local" && process.env.VERCEL) {
    throw new Error("Armazenamento local não funciona na Vercel. Configure SUPABASE_URL e SUPABASE_SECRET_KEY.");
  }
  return driver === "supabase" ? "supabase" : "local";
}

function supabase() {
  const url = process.env.SUPABASE_URL;
  // Chave secreta nova (sb_secret_...) ou a antiga service_role — ambas só no servidor.
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL e SUPABASE_SECRET_KEY são obrigatórias para o Storage.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Chaves aceitas: letras minúsculas, números, hífens e barras (sem "..") */
function assertSafeKey(key: string) {
  if (!/^[a-z0-9][a-z0-9/_-]*\.[a-z0-9]+$/.test(key) || key.includes("..")) {
    throw new Error("Caminho de arquivo inválido.");
  }
}

export async function putFile(key: string, body: Buffer, contentType: string): Promise<StoredFile> {
  assertSafeKey(key);
  if (storageDriver() === "supabase") {
    const client = supabase();
    const { error } = await client.storage.from(BUCKET).upload(key, body, {
      contentType,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw new Error(`Falha ao enviar a foto: ${error.message}`);
    const { data } = client.storage.from(BUCKET).getPublicUrl(key);
    return { key, url: data.publicUrl };
  }
  const file = path.join(LOCAL_DIR, key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
  return { key, url: `/api/uploads/${key}` };
}

export async function deleteFile(key: string) {
  assertSafeKey(key);
  if (storageDriver() === "supabase") {
    const { error } = await supabase().storage.from(BUCKET).remove([key]);
    if (error) throw new Error(`Falha ao remover a foto: ${error.message}`);
    return;
  }
  await rm(path.join(LOCAL_DIR, key), { force: true });
}

/** Leitura local (somente driver "local", usado pela rota /api/uploads). */
export async function readLocalFile(key: string) {
  assertSafeKey(key);
  return readFile(path.join(LOCAL_DIR, key));
}
