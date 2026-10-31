import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireStaff } from "@/lib/auth/guard";
import { Wordmark } from "@/components/layout/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { signOutAction } from "../(auth)/actions";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-[#eadfd3] bg-[#f3ebe1] px-4 pt-4 pb-3 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0 lg:px-4 lg:py-6">
        <div className="mb-3 flex items-center justify-between lg:mb-8 lg:block">
          <Wordmark compact />
          <p className="hidden text-[0.66rem] tracking-[0.22em] text-dourado-texto uppercase lg:mt-1 lg:block lg:text-center">Painel</p>
          <form action={signOutAction} className="lg:hidden">
            <button type="submit" className="flex items-center gap-1.5 text-[0.8rem] text-tinta-suave" aria-label="Sair">
              <LogOut className="h-4 w-4" strokeWidth={1.6} /> Sair
            </button>
          </form>
        </div>
        <AdminNav />
        <div className="mt-6 hidden border-t border-[#e3d6c8] pt-4 text-[0.8rem] lg:block">
          <p className="truncate font-medium text-cacau">{session.user.name}</p>
          <p className="truncate text-tinta-suave">{session.user.email}</p>
          <div className="mt-3 flex flex-col gap-1.5">
            <Link href="/" target="_blank" className="flex items-center gap-1.5 text-tinta-suave hover:text-rosa-profundo">
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.6} /> Ver a loja
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="flex items-center gap-1.5 text-tinta-suave hover:text-rosa-profundo">
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.6} /> Sair
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}
