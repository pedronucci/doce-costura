import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth, type Role } from "./index";

/** Sessão atual (ou null). */
export async function getSession() {
  // O SDK de sessão usa data/hora internamente; execute-o apenas em uma requisição real.
  await connection();
  const requestHeaders = await headers();
  return auth.api.getSession({ headers: requestHeaders });
}

/**
 * Exige um usuário autenticado com um dos papéis informados.
 * Usado em TODA página e Server Action do painel — o proxy faz apenas
 * um redirecionamento otimista e não substitui esta verificação.
 */
export async function requireRole(...roles: Role[]) {
  const session = await getSession();
  if (!session) redirect("/admin/entrar");
  const role = (session.user as { role?: string }).role as Role | undefined;
  if (!role || !roles.includes(role)) redirect("/admin/entrar?erro=permissao");
  return { ...session, role };
}

export const requireAdmin = () => requireRole("admin");
export const requireStaff = () => requireRole("admin", "staff");
