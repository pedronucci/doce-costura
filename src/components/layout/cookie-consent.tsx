"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/format";

/**
 * Consentimento de cookies (LGPD).
 * - Essenciais: sempre ativos (sessão, carrinho, segurança).
 * - Análise (GA4) e marketing (Meta Pixel): desativados até o aceite.
 * Os scripts de terceiros só serão carregados se o consentimento
 * correspondente estiver registrado (implementação na Etapa 3).
 */

export type ConsentState = { analytics: boolean; marketing: boolean; decidedAt: string };
const KEY = "dc:consent:v1";
const listeners = new Set<() => void>();

function readConsent(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function saveConsent(state: ConsentState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* sem armazenamento: o aviso volta a aparecer na próxima visita */
  }
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function CookieConsent() {
  const stored = useSyncExternalStore(subscribe, readConsent, () => "ssr");
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (stored !== null || dismissed) return null;

  const decide = (a: boolean, m: boolean) => {
    saveConsent({ analytics: a, marketing: m, decidedAt: new Date().toISOString() });
    setDismissed(true);
  };

  return (
    <section
      role="region"
      aria-label="Preferências de cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl animate-[sobe-suave_.5s_var(--ease-suave)] rounded-2xl border border-dourado/25 bg-papel p-4 shadow-[0_18px_50px_-20px_rgba(90,47,20,0.45)] sm:inset-x-6 sm:bottom-6 sm:p-6"
    >
      <h2 className="font-serif text-[1.15rem] sm:text-[1.3rem]">Sua privacidade</h2>
      <p className="mt-1.5 text-[0.8rem] leading-relaxed text-tinta-suave sm:text-[0.88rem]">
        Usamos cookies essenciais para a loja funcionar. Com sua permissão, também usaremos cookies de análise e
        marketing. Saiba mais na{" "}
        <Link href="/politica-de-privacidade" className="text-rosa-profundo underline underline-offset-4">
          Política de privacidade
        </Link>
        .
      </p>

      {customizing && (
        <fieldset className="mt-4 space-y-3 border-t border-dourado/20 pt-4 text-[0.88rem]">
          <legend className="sr-only">Categorias de cookies</legend>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked disabled className="mt-1 accent-rosa-profundo" />
            <span>
              <strong className="font-medium">Essenciais</strong> — carrinho, sessão e segurança. Sempre ativos.
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1 accent-rosa-profundo" />
            <span>
              <strong className="font-medium">Análise</strong> — estatísticas de visitas (Google Analytics).
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1 accent-rosa-profundo" />
            <span>
              <strong className="font-medium">Marketing</strong> — anúncios personalizados (Meta Pixel).
            </span>
          </label>
        </fieldset>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {customizing ? (
          <button type="button" onClick={() => decide(analytics, marketing)} className={btn("primary")}>
            Salvar preferências
          </button>
        ) : (
          <>
            <button type="button" onClick={() => decide(true, true)} className={btn("primary")}>
              Aceitar todos
            </button>
            <button type="button" onClick={() => decide(false, false)} className={btn("outline")}>
              Apenas essenciais
            </button>
            <button type="button" onClick={() => setCustomizing(true)} className={btn("ghost")}>
              Personalizar
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function btn(kind: "primary" | "outline" | "ghost") {
  return cn(
    "min-h-10 rounded-full px-4 text-[0.68rem] font-medium tracking-[0.14em] uppercase transition-colors sm:min-h-11 sm:px-5 sm:text-[0.72rem]",
    kind === "primary" && "bg-rosa-profundo text-papel hover:bg-rosa-escuro",
    kind === "outline" && "border border-rosa-profundo/60 text-rosa-profundo hover:bg-nevoa",
    kind === "ghost" && "text-tinta-suave underline-offset-4 hover:underline",
  );
}
