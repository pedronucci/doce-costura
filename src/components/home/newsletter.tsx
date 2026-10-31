"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { FlourishHeart } from "@/components/ui/ornaments";

/**
 * Newsletter com consentimento explícito (LGPD, art. 7º, I).
 * O envio ao servidor (Server Action + double opt-in por e-mail) entra na Etapa 3;
 * até lá o formulário valida os dados e informa que o cadastro ainda não está ativo.
 */
const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  consent: z.literal(true, { message: "É preciso autorizar o envio para continuar." }),
});

export function Newsletter() {
  const [status, setStatus] = useState<{ kind: "idle" | "error" | "info"; message?: string }>({ kind: "idle" });

  return (
    <section id="newsletter" aria-labelledby="newsletter-title" className="scroll-mt-32 px-5 py-20 sm:px-8 sm:py-24">
      <div className="moldura-pesponto mx-auto max-w-3xl rounded-[2rem] bg-papel px-6 py-14 text-center shadow-[0_24px_60px_-40px_rgba(90,47,20,0.5)] sm:px-14">
        <p className="font-script text-[1.8rem] leading-none text-rosa-profundo">Cartinhas da Doce Costura</p>
        <h2 id="newsletter-title" className="mt-3 text-[2.1rem] leading-tight sm:text-[2.5rem]">
          Novidades com carinho no seu e-mail
        </h2>
        <FlourishHeart className="mx-auto mt-4 text-dourado" />
        <p className="mx-auto mt-5 max-w-md leading-relaxed text-tinta-suave">
          Receba lançamentos de estampas e coleções. Você pode cancelar quando quiser.
        </p>

        <form
          noValidate
          className="mx-auto mt-8 max-w-lg text-left"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const parsed = schema.safeParse({ email: data.get("email"), consent: data.get("consent") === "on" });
            if (!parsed.success) {
              setStatus({ kind: "error", message: parsed.error.issues[0]?.message });
              return;
            }
            setStatus({
              kind: "info",
              message: "Obrigada pelo interesse! O cadastro na newsletter ainda não está ativo nesta versão de pré-visualização.",
            });
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Seu e-mail
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder="seu@email.com"
              aria-invalid={status.kind === "error"}
              aria-describedby="newsletter-status"
              className="min-h-12 flex-1 rounded-full border border-dourado/40 bg-creme px-5 text-[0.98rem] placeholder:text-tinta-suave/60 focus:border-rosa-profundo focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-12 rounded-full bg-rosa-profundo px-7 text-[0.78rem] font-medium tracking-[0.18em] text-papel uppercase transition-colors hover:bg-rosa-escuro"
            >
              Quero receber
            </button>
          </div>
          <label className="mt-4 flex items-start gap-3 text-[0.82rem] leading-relaxed text-tinta-suave">
            <input type="checkbox" name="consent" className="mt-1 h-4 w-4 shrink-0 accent-rosa-profundo" />
            <span>
              Autorizo a Doce Costura a me enviar comunicações por e-mail, conforme a{" "}
              <Link href="/politica-de-privacidade" className="text-rosa-profundo underline underline-offset-4">
                Política de privacidade
              </Link>
              .
            </span>
          </label>
          <p
            id="newsletter-status"
            role="status"
            className={`mt-3 min-h-5 text-[0.84rem] ${status.kind === "error" ? "text-rosa-escuro" : "text-salvia-escuro"}`}
          >
            {status.message}
          </p>
        </form>
      </div>
    </section>
  );
}
