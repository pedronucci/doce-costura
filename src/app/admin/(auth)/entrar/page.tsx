import type { Metadata } from "next";
import { SignInForm } from "../auth-forms";

export const metadata: Metadata = { title: "Entrar" };

export default async function SignInPage({ searchParams }: PageProps<"/admin/entrar">) {
  const sp = await searchParams;
  const notice =
    sp.senha === "redefinida"
      ? "Senha redefinida. Entre com a nova senha."
      : sp.erro === "permissao"
        ? "Sua conta não tem permissão para esta área."
        : undefined;
  return <SignInForm notice={notice} />;
}
