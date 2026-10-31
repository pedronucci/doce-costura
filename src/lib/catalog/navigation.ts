export type NavLink = { href: string; label: string };

export const institutionalNav: NavLink[] = [
  { href: "/sobre", label: "Sobre nós" },
  { href: "/contato", label: "Contato" },
  { href: "/perguntas-frequentes", label: "Perguntas frequentes" },
];

export const policyNav: NavLink[] = [
  { href: "/politica-de-privacidade", label: "Política de privacidade" },
  { href: "/trocas-e-devolucoes", label: "Trocas e devoluções" },
  { href: "/politica-de-entrega", label: "Política de entrega" },
  { href: "/termos-de-uso", label: "Termos de uso" },
];
