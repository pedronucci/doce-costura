import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/admin/ui";
import { ResetPasswordForm } from "../auth-forms";

export const metadata: Metadata = { title: "Nova senha" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/admin/redefinir-senha">) {
  const { token, error } = await searchParams;
  if (typeof token !== "string" || error) {
    return (
      <div className="space-y-4">
        <Notice tone="error">Link inválido ou expirado.</Notice>
        <Link href="/admin/recuperar-senha" className="text-[0.86rem] text-rosa-profundo hover:underline">
          Pedir um novo link
        </Link>
      </div>
    );
  }
  return <ResetPasswordForm token={token} />;
}
