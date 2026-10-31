import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-creme px-6 text-center">
      <p className="font-script text-[2rem] text-rosa-profundo">Ops!</p>
      <h1 className="mt-2 text-[2.4rem]">Página não encontrada</h1>
      <p className="mt-4 text-tinta-suave">O endereço pode ter mudado ou o produto não está mais disponível.</p>
      <Link href="/" className="mt-8 text-[0.8rem] tracking-[0.18em] text-rosa-profundo uppercase underline underline-offset-8">
        Ir para a página inicial
      </Link>
    </main>
  );
}
