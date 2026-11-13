import Link from "next/link";
import { customerSignOut } from "@/app/(loja)/conta/auth-actions";

export function AccountNav() {
  return <nav aria-label="Minha conta" className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-dourado/25 pb-5 text-sm text-rosa-profundo">
    <Link href="/conta" className="underline underline-offset-4">Meus dados</Link>
    <Link href="/conta/enderecos" className="underline underline-offset-4">Meus endereços</Link>
    <Link href="/conta/pedidos" className="underline underline-offset-4">Meus pedidos</Link>
    <form action={customerSignOut} className="ml-auto"><button type="submit" className="min-h-10 underline underline-offset-4">Sair da conta</button></form>
  </nav>;
}
