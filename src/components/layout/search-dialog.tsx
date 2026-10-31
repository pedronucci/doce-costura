"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";

export type SearchItem = { slug: string; name: string; summary: string; printName: string; image: string | null };

const normalize = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/**
 * Busca instantânea sobre o catálogo visível (carregado do banco pelo layout).
 * Com catálogo grande, trocar por busca no servidor (PostgreSQL full-text).
 */
export function SearchDialog({ open, onClose, items }: { open: boolean; onClose: () => void; items: SearchItem[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (q.length < 2) return [];
    return items.filter((p) => normalize(`${p.name} ${p.summary} ${p.printName}`).includes(q));
  }, [query, items]);

  return (
    <Drawer open={open} onClose={onClose} title="Buscar produtos" side="top">
      <div className="mx-auto w-full max-w-3xl px-5 pt-14 pb-8 sm:px-8">
        <form role="search" action="/busca" className="relative" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="busca" className="sr-only">
            Buscar produtos
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-0 h-5 w-5 -translate-y-1/2 text-dourado" strokeWidth={1.4} />
          <input
            id="busca"
            name="q"
            type="search"
            autoFocus
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O que você procura? Ex.: renda, babado, tomates"
            className="w-full border-b border-dourado/50 bg-transparent py-4 pr-2 pl-9 font-serif text-[1.45rem] text-cacau placeholder:text-tinta-suave/60 focus:border-rosa-profundo focus:outline-none sm:text-[1.7rem]"
          />
        </form>

        <div className="mt-6 min-h-16" aria-live="polite">
          {query.trim().length >= 2 && results.length === 0 && (
            <p className="text-tinta-suave">Nenhum produto encontrado para “{query}”.</p>
          )}
          {results.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {results.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/produto/${p.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-papel"
                  >
                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-linho">
                      {p.image && <Image src={p.image} alt="" fill sizes="64px" className="object-cover" />}
                    </span>
                    <span>
                      <span className="block font-serif text-[1.1rem] text-cacau">{p.name}</span>
                      <span className="line-clamp-1 text-[0.82rem] text-tinta-suave">{p.summary}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Drawer>
  );
}
