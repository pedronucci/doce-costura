"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Wordmark } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { SearchDialog } from "./search-dialog";
import { useShop } from "@/lib/store/shop-context";
import { categoryNav } from "@/lib/catalog/navigation";
import { cn } from "@/lib/format";

function CountBadge({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null;
  return (
    <span
      aria-label={`${count} ${label}`}
      className="absolute -top-1 -right-1.5 grid h-[1.1rem] min-w-[1.1rem] place-items-center rounded-full bg-rosa-profundo px-1 text-[0.62rem] font-medium text-papel"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

const iconBtn =
  "relative grid h-11 w-11 place-items-center rounded-full text-cacau transition-colors duration-300 hover:bg-nevoa/70 hover:text-rosa-profundo";

export function Header() {
  const { cartCount, favorites } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-creme/92 backdrop-blur-md transition-[border-color,box-shadow] duration-500",
          scrolled ? "border-dourado/25 shadow-[0_8px_24px_-18px_rgba(90,47,20,0.35)]" : "border-transparent",
        )}
      >
        <div className="mx-auto grid h-[4.5rem] max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-1.5 sm:px-6 lg:h-24 lg:px-8">
          <div className="flex items-center gap-0.5">
            <button type="button" className={cn(iconBtn, "lg:hidden")} onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
              <Menu className="h-[1.35rem] w-[1.35rem]" strokeWidth={1.4} />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={cn(iconBtn, "lg:flex lg:w-auto lg:gap-2.5 lg:px-4 lg:hover:bg-transparent")}
              aria-label="Buscar produtos"
            >
              <Search className="h-[1.2rem] w-[1.2rem]" strokeWidth={1.4} />
              <span className="hidden text-[0.72rem] tracking-[0.2em] text-tinta-suave uppercase lg:inline">Buscar</span>
            </button>
          </div>

          <Wordmark />

          <div className="flex items-center justify-end gap-0.5">
            <Link href="/conta" className={cn(iconBtn, "hidden sm:grid")} aria-label="Minha conta">
              <User className="h-[1.2rem] w-[1.2rem]" strokeWidth={1.4} />
            </Link>
            <Link href="/favoritos" className={iconBtn} aria-label="Favoritos">
              <Heart className="h-[1.2rem] w-[1.2rem]" strokeWidth={1.4} />
              <CountBadge count={favorites.length} label="favoritos" />
            </Link>
            <Link href="/carrinho" className={iconBtn} aria-label="Carrinho">
              <ShoppingBag className="h-[1.2rem] w-[1.2rem]" strokeWidth={1.4} />
              <CountBadge count={cartCount} label="itens no carrinho" />
            </Link>
          </div>
        </div>

        <nav aria-label="Categorias" className="hidden border-t border-dourado/15 lg:block">
          <ul className="mx-auto flex h-12 max-w-7xl items-center justify-center gap-9 px-8">
            <li>
              <Link href="/colecao" className="nav-link">
                Toda a coleção
              </Link>
            </li>
            {categoryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/sobre" className="nav-link">
                Nossa essência
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
