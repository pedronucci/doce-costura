"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { addCartLine, parseCart, validQuantity, type CartLine } from "./cart";

/**
 * Estado do visitante no navegador (Etapa 1–2): favoritos e itens do carrinho.
 *
 * Importante: o carrinho local é apenas uma conveniência de interface.
 * Na Etapa 3 o carrinho passa a ser persistido no servidor e todo preço,
 * estoque e total é recalculado no backend — o navegador nunca define valores.
 */

type ShopState = { favorites: string[]; cart: CartLine[] };

const STORAGE_KEY = "dc:shop:v2";
const EMPTY: ShopState = { favorites: [], cart: [] };

let memoryState: ShopState = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): ShopState {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem("dc:shop:v1");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ShopState>;
        memoryState = {
          favorites: Array.isArray(parsed.favorites) ? parsed.favorites.filter((s) => typeof s === "string") : [],
          cart: parseCart(parsed.cart),
        };
      }
    } catch {
      memoryState = EMPTY;
    }
  }
  return memoryState;
}

function write(next: ShopState) {
  memoryState = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* armazenamento indisponível: mantém apenas em memória */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      memoryState = EMPTY;
      hydrated = false;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

type ShopContextValue = {
  favorites: string[];
  cartCount: number;
  cart: CartLine[];
  addToCart: (line: CartLine, available: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, read, () => EMPTY);

  const toggleFavorite = useCallback((slug: string) => {
    const current = read();
    const favorites = current.favorites.includes(slug)
      ? current.favorites.filter((s) => s !== slug)
      : [...current.favorites, slug];
    write({ ...current, favorites });
  }, []);

  const value = useMemo<ShopContextValue>(
    () => ({
      favorites: state.favorites,
      cartCount: state.cart.reduce((sum, l) => sum + l.quantity, 0),
      cart: state.cart,
      addToCart: (line, available) => {
        const current = read();
        write({ ...current, cart: addCartLine(current.cart, line, available) });
      },
      setQuantity: (variantId, quantity) => {
        if (!validQuantity(quantity)) return;
        const current = read();
        write({ ...current, cart: current.cart.map((l) => l.variantId === variantId ? { ...l, quantity } : l) });
      },
      removeFromCart: (variantId) => {
        const current = read();
        write({ ...current, cart: current.cart.filter((l) => l.variantId !== variantId) });
      },
      isFavorite: (slug) => state.favorites.includes(slug),
      toggleFavorite,
    }),
    [state, toggleFavorite],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop deve ser usado dentro de <ShopProvider>");
  return ctx;
}
