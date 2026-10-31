import Link from "next/link";
import { cn } from "@/lib/format";

type Variant = "primary" | "outline" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-rosa-profundo text-papel hover:bg-rosa-escuro shadow-[0_1px_0_rgba(90,47,20,0.08)]",
  outline:
    "border border-rosa-profundo/60 text-rosa-profundo hover:bg-rosa-profundo hover:text-papel",
  ghost: "text-rosa-profundo underline-offset-[6px] hover:underline",
};

export const buttonBase =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-[0.8rem] font-medium uppercase tracking-[0.18em] transition-colors duration-300 ease-suave focus-visible:outline-offset-4";

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(buttonBase, styles[variant], className)}>
      {children}
    </Link>
  );
}

export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(buttonBase, styles[variant], className);
}
