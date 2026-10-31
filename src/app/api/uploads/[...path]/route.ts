import { readLocalFile, storageDriver } from "@/lib/storage";

/** Serve as fotos do armazenamento local (somente desenvolvimento). */
export async function GET(_req: Request, ctx: RouteContext<"/api/uploads/[...path]">) {
  if (storageDriver() !== "local") return new Response("Não encontrado", { status: 404 });
  const { path } = await ctx.params;
  try {
    const body = await readLocalFile(path.join("/"));
    return new Response(new Uint8Array(body), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
}
