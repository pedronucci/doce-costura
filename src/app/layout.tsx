import type { Metadata, Viewport } from "next";
import "@fontsource-variable/cormorant-garamond";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "@fontsource-variable/jost";
import "@fontsource/parisienne/latin-400.css";
import "./globals.css";
import { storeSettings } from "@/lib/config/store";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${storeSettings.name} — Enxovais e detalhes para sua cozinha`,
    template: `%s | ${storeSettings.name}`,
  },
  description:
    "Panos de prato decorados com renda, babados e estampas delicadas. Enxovais e detalhes para sua cozinha.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: storeSettings.name,
    images: [{ url: "/images/marca/hero-cha-azul.jpg", width: 826, height: 652 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf6ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
