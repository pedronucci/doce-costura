import { storeSettings } from "@/lib/config/store";

/**
 * Barra discreta de benefícios. Exibe somente mensagens cadastradas pelo
 * administrador; sem cadastro, mostra apenas o slogan da marca.
 */
export function AnnouncementBar() {
  const messages = storeSettings.announcements.length > 0 ? storeSettings.announcements : [storeSettings.slogan];
  return (
    <div className="bg-cacau text-[0.7rem] tracking-[0.22em] text-creme/90 uppercase">
      <ul className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-10 px-4 text-center">
        {messages.map((m, i) => (
          <li key={m} className={i > 0 ? "hidden md:block" : undefined}>
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}
