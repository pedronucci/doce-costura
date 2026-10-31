import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel Doce Costura" },
  robots: { index: false, follow: false },
};

// O painel depende da sessão em cada requisição; não é pré-renderizado.
export const instant = false;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[#faf6f1] font-sans text-tinta">{children}</div>;
}
