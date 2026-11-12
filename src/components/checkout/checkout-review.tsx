"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ButtonLink, buttonClass } from "@/components/ui/button-link";
import { useShop } from "@/lib/store/shop-context";
import { formatBRL } from "@/lib/format";
import type { CheckoutQuote } from "@/lib/checkout/quote";

export function CheckoutReview() {
  const { cart } = useShop();
  const items = cart.map(({ variantId, quantity }) => ({ variantId, quantity }));
  const cartKey = JSON.stringify(items);
  const requestNumber = useRef(0);
  const [result, setResult] = useState<{ key: string; quote: CheckoutQuote } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const quote = result?.key === cartKey ? result.quote : null;

  async function review() {
    const currentRequest = ++requestNumber.current;
    setPending(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/checkout/revisao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (currentRequest !== requestNumber.current) return;
      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Não foi possível conferir suas peças. Tente novamente.");
        return;
      }
      setResult({ key: cartKey, quote: data as CheckoutQuote });
    } catch {
      if (currentRequest === requestNumber.current) setError("Não foi possível conectar à loja. Seu carrinho está salvo; tente novamente.");
    } finally {
      if (currentRequest === requestNumber.current) setPending(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-center text-xs tracking-[0.2em] text-dourado-texto uppercase">Carinho em cada escolha</p>
      <h1 className="mt-3 text-center text-4xl sm:text-5xl">Revisar suas escolhas</h1>
      <p className="mx-auto mt-5 max-w-xl text-center leading-relaxed text-tinta-suave">Confira o preço e a disponibilidade das suas peças antes de continuar.</p>
      {!cart.length ? (
        <div className="py-16 text-center">
          <h2 className="text-3xl">Seu carrinho ainda está vazio</h2>
          <p className="mt-4 text-tinta-suave">Escolha suas peças favoritas para começar.</p>
          <ButtonLink className="mt-8" href="/colecao">Explorar coleção</ButtonLink>
        </div>
      ) : (
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_21rem]">
          <div className="rounded-2xl border border-dourado/25 bg-papel p-6">
            <h2 className="text-3xl">Peças do carrinho</h2>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">A conferência usa os preços e o estoque atuais. Ela não reserva as peças nem cria um pedido.</p>
            <button type="button" onClick={review} disabled={pending} className={buttonClass("primary", "mt-6 w-full disabled:cursor-wait disabled:opacity-60")}>
              {pending ? "Conferindo…" : quote ? "Conferir novamente" : "Conferir minhas peças"}
            </button>
            <div aria-live="polite" aria-busy={pending}>
              {error && <p role="alert" className="mt-5 rounded-xl bg-nevoa p-4 text-sm text-rosa-profundo">{error}</p>}
              {result && !quote && <p className="mt-5 text-sm">Seu carrinho mudou. Confira as peças novamente.</p>}
              {quote && <>
                {quote.issues.length > 0 && <div role="alert" className="mt-5 rounded-xl bg-nevoa p-4"><p className="font-medium">Precisamos ajustar suas escolhas</p><ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{quote.issues.map((issue) => <li key={issue.variantId}>{issue.message}</li>)}</ul><Link href="/carrinho" className="mt-4 inline-block text-sm underline underline-offset-4">Ajustar carrinho</Link></div>}
                {quote.items.length > 0 && <ul className="mt-6 divide-y divide-dourado/20">{quote.items.map((item) => <li key={item.variantId} className="flex justify-between gap-4 py-4"><div><Link href={`/produto/${item.slug}`} className="font-medium hover:underline">{item.productName}</Link><p className="mt-1 text-sm text-tinta-suave">{item.variantName} · {item.quantity} × {formatBRL(item.unitCents)}</p></div><span className="whitespace-nowrap text-sm">{formatBRL(item.totalCents)}</span></li>)}</ul>}
              </>}
            </div>
          </div>
          <aside aria-label="Resumo da revisão" className="rounded-2xl border border-dourado/25 bg-papel p-6">
            <h2 className="text-3xl">Resumo</h2>
            <dl className="mt-6 space-y-4 text-sm"><div className="flex justify-between gap-3"><dt>Subtotal conferido</dt><dd>{quote?.subtotalCents != null ? formatBRL(quote.subtotalCents) : "A conferir"}</dd></div><div className="flex justify-between gap-3"><dt>Frete</dt><dd>A calcular</dd></div><div className="flex justify-between gap-3 border-t border-dourado/20 pt-4 font-medium"><dt>Total</dt><dd>A confirmar</dd></div></dl>
            <p className="mt-6 rounded-xl bg-linho p-4 text-sm leading-relaxed">Estamos preparando o pagamento e o cálculo de frete. A confirmação da compra será liberada quando estiverem disponíveis.</p>
            <ButtonLink href="/carrinho" variant="outline" className="mt-6 w-full">Voltar ao carrinho</ButtonLink>
          </aside>
        </div>
      )}
    </section>
  );
}
