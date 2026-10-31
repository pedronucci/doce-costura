import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/admin/ui";
import { adminExists } from "@/lib/auth/admin";
import { SetupForm } from "../auth-forms";

export const metadata: Metadata = { title: "Primeiro acesso" };

export default async function SetupPage() {
  if (await adminExists()) {
    return (
      <div className="space-y-4">
        <Notice>O painel já está configurado.</Notice>
        <Link href="/admin/entrar" className="text-[0.86rem] text-rosa-profundo hover:underline">
          Ir para a entrada
        </Link>
      </div>
    );
  }
  return <SetupForm />;
}
