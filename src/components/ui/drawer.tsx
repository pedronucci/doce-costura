"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/format";

/**
 * Painel modal acessível baseado em <dialog> nativo:
 * foco preso no painel, Esc fecha, fundo inerte e rolagem bloqueada.
 */
export function Drawer({
  open,
  onClose,
  side = "left",
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "top";
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
    if (!open) document.documentElement.style.overflow = "";
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-0 max-h-none max-w-none bg-transparent p-0 backdrop:bg-cacau/30 backdrop:backdrop-blur-[2px]",
        side === "left" ? "h-dvh w-[min(88vw,380px)]" : "h-auto w-full",
      )}
    >
      <div
        className={cn(
          "relative flex h-full flex-col bg-creme",
          side === "left" ? "animate-[drawer-left_.45s_var(--ease-suave)]" : "animate-[drawer-top_.4s_var(--ease-suave)]",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 grid h-11 w-11 place-items-center rounded-full text-cacau hover:bg-nevoa"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" strokeWidth={1.4} />
        </button>
        {children}
      </div>
    </dialog>
  );
}
