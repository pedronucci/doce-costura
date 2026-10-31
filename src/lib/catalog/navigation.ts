import { categories, getProductsByCategory } from "./data";

/** Rótulos curtos para o menu (o nome completo continua na página da categoria). */
const shortLabels: Record<string, string> = {
  "panos-de-prato-decorados": "Decorados",
  "panos-de-prato-com-renda": "Com renda",
  "panos-de-prato-com-babado": "Com babado",
  "colecao-floral": "Floral",
  "colecao-cozinha": "Cozinha",
  "kits-para-presente": "Kits para presente",
  novidades: "Novidades",
  promocoes: "Promoções",
};

export type NavLink = { href: string; label: string };

/** Categorias sem produtos ficam fora do menu até receberem itens. */
export const categoryNav: NavLink[] = categories
  .filter((c) => getProductsByCategory(c.slug).length > 0)
  .sort((a, b) => a.position - b.position)
  .map((c) => ({ href: `/categoria/${c.slug}`, label: shortLabels[c.slug] ?? c.name }));

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
