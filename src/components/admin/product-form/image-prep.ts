/**
 * Prepara a foto no navegador antes do envio:
 * - fotos grandes (ou em formatos como HEIC) são redimensionadas para no máximo 2400 px
 *   e convertidas para JPEG de alta qualidade, ficando abaixo do limite de 4 MB;
 * - fotos já leves em JPG/PNG/WebP seguem como estão.
 * A orientação da câmera é respeitada. O servidor ainda valida tudo novamente.
 */
const MAX_SIDE = 2400;
const SAFE_BYTES = 3.5 * 1024 * 1024;
const PASSTHROUGH = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function prepareImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => null);
  if (!bitmap) throw new Error(`Não foi possível abrir “${file.name}”. Envie JPG, PNG ou WebP.`);

  const fits = bitmap.width <= MAX_SIDE && bitmap.height <= MAX_SIDE;
  if (fits && file.size <= SAFE_BYTES && PASSTHROUGH.has(file.type)) {
    bitmap.close();
    return file;
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não conseguiu preparar a foto.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.92, 0.86, 0.8]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (blob && blob.size <= SAFE_BYTES) {
      return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
    }
  }
  throw new Error(`“${file.name}” continua grande demais depois de reduzida.`);
}
