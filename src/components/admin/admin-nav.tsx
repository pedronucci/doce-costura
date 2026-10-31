"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderTree, LayoutDashboard, Package, Receipt, Settings, Tag } from "lucide-react";
import { cn } from "@/lib/format";

const items = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
];
const soon = [
  { label: "Pedidos", icon: Receipt },
  { label: "Cupons", icon: Tag },
  { label: "Configurações", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Painel" className="flex gap-1 overflow-x-auto scrollbar-none lg:flex-col lg:overflow-visible">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[0.88rem] transition-colors",
              active ? "bg-white font-medium text-cacau shadow-sm" : "text-tinta-suave hover:bg-white/60 hover:text-cacau",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.6} />
            {label}
          </Link>
        );
      })}
      <div className="hidden lg:mt-4 lg:block">
        <p className="px-3 pb-1 text-[0.68rem] tracking-[0.18em] text-dourado-texto uppercase">Próximas etapas</p>
        {soon.map(({ label, icon: Icon }) => (
          <span key={label} className="flex items-center gap-2.5 px-3 py-2 text-[0.86rem] text-tinta-suave/60">
            <Icon className="h-4 w-4" strokeWidth={1.6} />
            {label}
          </span>
        ))}
      </div>
    </nav>
  );
}
