import Link from "next/link";
import { cn } from "@/lib/format";

/** Componentes visuais do painel: sóbrios, legíveis e consistentes com a marca. */

export const inputClass =
  "block w-full rounded-lg border border-[#e3d6c8] bg-white px-3.5 py-2.5 text-[0.95rem] text-tinta shadow-[inset_0_1px_0_rgba(90,47,20,0.03)] placeholder:text-tinta-suave/50 focus:border-rosa-profundo focus:ring-2 focus:ring-rosa-profundo/15 focus:outline-none disabled:bg-linho/60 aria-[invalid=true]:border-rosa-escuro";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[0.82rem] font-medium text-tinta">
        {label}
        {required && <span className="text-rosa-profundo"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[0.76rem] leading-snug text-tinta-suave">{hint}</p>}
      {error && (
        <p role="alert" className="text-[0.78rem] text-rosa-escuro">
          {error}
        </p>
      )}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-cacau text-papel hover:bg-[#46240f]",
  secondary: "border border-[#dccbb9] bg-white text-cacau hover:bg-linho/60",
  ghost: "text-tinta-suave hover:bg-linho/70 hover:text-cacau",
  danger: "border border-rosa-escuro/30 bg-white text-rosa-escuro hover:bg-nevoa/60",
};
export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-[0.86rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    buttonStyles[variant],
    className,
  );
}

export function LinkButton({ href, variant = "primary", className, children }: { href: string; variant?: ButtonVariant; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}

export function Card({ title, description, children, className, actions }: { title?: string; description?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-[#eadfd3] bg-white p-5 shadow-[0_1px_2px_rgba(90,47,20,0.04)] sm:p-6", className)}>
      {(title || actions) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-sans text-[1rem] font-semibold tracking-normal text-cacau">{title}</h2>}
            {description && <p className="mt-1 text-[0.82rem] leading-relaxed text-tinta-suave">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, description, actions, back }: { title: string; description?: string; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-[0.8rem] text-tinta-suave hover:text-rosa-profundo">
            ← {back.label}
          </Link>
        )}
        <h1 className="font-sans text-[1.5rem] font-semibold tracking-tight text-cacau">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[0.88rem] text-tinta-suave">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const badgeTones = {
  neutral: "bg-linho text-tinta-suave",
  rose: "bg-nevoa text-rosa-escuro",
  green: "bg-[#e8eedc] text-salvia-escuro",
  gold: "bg-[#f4e9d6] text-dourado-texto",
};
export function Badge({ tone = "neutral", children }: { tone?: keyof typeof badgeTones; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.72rem] font-medium", badgeTones[tone])}>{children}</span>;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-[0.86rem] leading-relaxed",
        tone === "error" && "border-rosa-escuro/25 bg-nevoa/50 text-rosa-escuro",
        tone === "success" && "border-salvia/40 bg-[#eef2e6] text-salvia-escuro",
        tone === "info" && "border-[#eadfd3] bg-linho/50 text-tinta",
      )}
    >
      {children}
    </div>
  );
}
