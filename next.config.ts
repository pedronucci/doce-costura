import type { NextConfig } from "next";

/**
 * PREVIEW_EXPORT=1 gera uma exportação estática apenas para pré-visualização
 * da interface (Etapas 1–2). A loja real roda com servidor (Vercel), pois
 * checkout, webhooks e painel administrativo exigem backend.
 */
const isPreviewExport = process.env.PREVIEW_EXPORT === "1";

// Fotos enviadas pelo painel ficam no Supabase Storage (bucket público).
const supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : null;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // Cache Components (PPR) não é compatível com exportação estática; a prévia roda sem ele.
  cacheComponents: !isPreviewExport,
  partialPrefetching: !isPreviewExport,
  poweredByHeader: false,
  experimental: {
    // Fotos são reduzidas no navegador antes do envio; 4 MB respeita o limite da Vercel (4,5 MB).
    serverActions: { bodySizeLimit: "4mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/api/uploads/**" }],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
    ...(isPreviewExport ? { unoptimized: true } : {}),
  },
  ...(isPreviewExport
    ? { output: "export" as const, trailingSlash: true }
    : {
        async headers() {
          return [{ source: "/:path*", headers: securityHeaders }];
        },
      }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
