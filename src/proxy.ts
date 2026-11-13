import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Redirecionamento otimista: sem cookie de sessão, /admin vai para o login.
 * A verificação real (sessão válida + papel) acontece no servidor, em cada página e ação.
 */
const PUBLIC_ADMIN = ["/admin/entrar", "/admin/recuperar-senha", "/admin/redefinir-senha", "/admin/primeiro-acesso"];
const PUBLIC_ACCOUNT = ["/conta/entrar", "/conta/criar", "/conta/recuperar-senha", "/conta/redefinir-senha"];

function noStore(response = NextResponse.next()) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/checkout") return noStore();
  if (pathname === "/conta" || pathname.startsWith("/conta/")) {
    if (!PUBLIC_ACCOUNT.includes(pathname) && !getSessionCookie(request)) return noStore(NextResponse.redirect(new URL("/conta/entrar", request.url)));
    return noStore();
  }
  if (PUBLIC_ADMIN.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/admin/entrar", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/conta/:path*", "/checkout"] };
