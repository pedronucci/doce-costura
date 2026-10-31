import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Redirecionamento otimista: sem cookie de sessão, /admin vai para o login.
 * A verificação real (sessão válida + papel) acontece no servidor, em cada página e ação.
 */
const PUBLIC_ADMIN = ["/admin/entrar", "/admin/recuperar-senha", "/admin/redefinir-senha", "/admin/primeiro-acesso"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ADMIN.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/admin/entrar", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
