import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { putFile } from "./index";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // limite das funções da Vercel: 4,5 MB
const ACCEPTED_FORMATS = new Set(["jpeg", "png", "webp"]);
const MAX_SIDE = 2000;

export type ProcessedImage = { key: string; url: string; width: number; height: number };

/**
 * Valida e prepara uma foto de produto:
 * - confere o formato pelo conteúdo do arquivo (não pela extensão);
 * - aplica a orientação da câmera e remove metadados (localização, aparelho);
 * - limita o maior lado a 2000 px e salva em WebP de alta qualidade.
 * Cores, estampas e acabamentos não são alterados.
 */
export async function processProductImage(file: File): Promise<ProcessedImage> {
  if (file.size === 0) throw new Error("Arquivo vazio.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("A foto passa de 4 MB.");

  const input = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(input).metadata().catch(() => null);
  if (!meta?.format || !ACCEPTED_FORMATS.has(meta.format)) {
    throw new Error("Formato não aceito. Envie JPG, PNG ou WebP.");
  }
  if ((meta.width ?? 0) < 400 || (meta.height ?? 0) < 400) {
    throw new Error("A foto é pequena demais (mínimo de 400 × 400 px).");
  }

  const { data, info } = await sharp(input)
    .rotate()
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .toColourspace("srgb")
    .webp({ quality: 86 })
    .toBuffer({ resolveWithObject: true });

  const now = new Date();
  const key = `produtos/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${randomUUID()}.webp`;
  const stored = await putFile(key, data, "image/webp");
  return { ...stored, width: info.width, height: info.height };
}
