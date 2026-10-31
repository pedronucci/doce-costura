"use client";

import Link from "next/link";
import { ChevronRight, Heart, User } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Wordmark } from "./logo";
import { SprigHeart } from "@/components/ui/ornaments";
import { categoryNav, institutionalNav } from "@/lib/catalog/navigation";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} title="Menu" side="left">
      <div className="flex flex-col items-center gap-2 border-b border-dourado/20 px-6 pt-8 pb-6">
        <Wordmark compact />
      </div>
      <nav aria-label="Menu principal" className="flex-1 overflow-y-auto px-6 py-4">
        <p className="mb-2 text-[0.68rem] tracking-[0.24em] text-dourado-texto uppercase">Coleção</p>
        <ul className="divide-y divide-dourado/15">
          {[{ href: "/colecao", label: "Toda a coleção" }, ...categoryNav].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="flex min-h-13 items-center justify-between font-serif text-[1.35rem] text-cacau"
              >
                {item.label}
                <ChevronRight className="h-4 w-4 text-dourado" strokeWidth={1.4} />
              </Link>
            </li>
          ))}
        </ul>

        <SprigHeart className="mx-auto my-6 text-dourado" />

        <ul className="space-y-1">
          <li>
            <Link href="/conta" onClick={onClose} className="flex min-h-11 items-center gap-3 text-[0.95rem]">
              <User className="h-4 w-4 text-rosa-profundo" strokeWidth={1.5} /> Minha conta
            </Link>
          </li>
          <li>
            <Link href="/favoritos" onClick={onClose} className="flex min-h-11 items-center gap-3 text-[0.95rem]">
              <Heart className="h-4 w-4 text-rosa-profundo" strokeWidth={1.5} /> Favoritos
            </Link>
          </li>
          {institutionalNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={onClose} className="flex min-h-11 items-center pl-7 text-[0.95rem] text-tinta-suave">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Drawer>
  );
}
