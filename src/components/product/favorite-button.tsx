"use client";

import { Heart } from "lucide-react";
import { useShop } from "@/lib/store/shop-context";
import { cn } from "@/lib/format";

export function FavoriteButton({ slug, name, className }: { slug: string; name: string; className?: string }) {
  const { isFavorite, toggleFavorite } = useShop();
  const active = isFavorite(slug);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      aria-pressed={active}
      aria-label={active ? `Remover ${name} dos favoritos` : `Adicionar ${name} aos favoritos`}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full bg-papel/90 text-rosa-profundo shadow-sm backdrop-blur transition-transform duration-300 hover:scale-105",
        className,
      )}
    >
      <Heart className={cn("h-[1.1rem] w-[1.1rem] transition-colors", active && "fill-rosa-profundo")} strokeWidth={1.5} />
    </button>
  );
}
