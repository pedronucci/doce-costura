import { Wordmark } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <Wordmark compact />
      <p className="mt-2 text-[0.72rem] tracking-[0.24em] text-dourado-texto uppercase">Painel administrativo</p>
      <div className="mt-8 w-full max-w-sm rounded-2xl border border-[#eadfd3] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(90,47,20,0.35)] sm:p-7">
        {children}
      </div>
    </main>
  );
}
