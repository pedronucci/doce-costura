import Link from "next/link";
import { CustomerAuthForm } from "@/components/customer/auth-form";
export const metadata = { title: "Recuperar minha senha" };
export default function Page() {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return <section className="mx-auto max-w-md rounded-2xl bg-papel p-8"><h1 className="text-3xl">Recuperação de senha</h1><p className="mt-5 leading-relaxed text-tinta-suave">A recuperação por e-mail ainda não está disponível. Para ajuda com seu acesso, fale com a loja pelos canais de atendimento.</p><Link href="/contato" className="mt-6 inline-block text-rosa-profundo underline">Ver canais de contato</Link><p className="mt-4"><Link href="/conta/entrar" className="text-sm underline">Voltar para entrar</Link></p></section>;
  return <CustomerAuthForm mode="request" />;
}

// Esta página depende do acesso e/ou dos parâmetros da requisição.
export const instant = false;
