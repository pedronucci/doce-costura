import type { Metadata } from "next";
import { Suspense } from "react";
export const metadata: Metadata = { robots: { index: false, follow: false } };
// Dados privados sempre exigem uma requisição autenticada, como no painel.
export const instant = false;
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16"><Suspense fallback={<p role="status">Preparando sua conta…</p>}>{children}</Suspense></div>;
}
