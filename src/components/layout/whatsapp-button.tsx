import { MessageCircle } from "lucide-react";
import { storeSettings } from "@/lib/config/store";

/** Botão discreto de WhatsApp. Só aparece quando o número estiver configurado. */
export function WhatsAppButton() {
  const { number, message } = storeSettings.whatsapp;
  if (!number) return null;
  const href = `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp"
      className="fixed right-4 bottom-4 z-30 grid h-13 w-13 place-items-center rounded-full border border-salvia/40 bg-papel text-salvia-escuro shadow-[0_10px_30px_-12px_rgba(90,47,20,0.45)] transition-transform duration-300 hover:-translate-y-0.5 sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
    </a>
  );
}
