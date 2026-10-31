/**
 * Configurações da loja.
 *
 * Na Etapa 3 estes valores passam a ser editados no painel administrativo
 * (tabela `StoreSettings`). Campos `null` estão pendentes de informação
 * da Doce Costura e a interface não exibe valores inventados no lugar.
 */
export type StoreSettings = {
  name: string;
  slogan: string;
  /** Mensagens da barra de benefícios. Somente benefícios reais e cadastrados. */
  announcements: string[];
  whatsapp: { number: string | null; message: string };
  company: {
    legalName: string | null;
    cnpj: string | null;
    address: string | null;
    email: string | null;
    phone: string | null;
    serviceHours: string | null;
  };
  social: { instagram: string | null };
};

export const storeSettings: StoreSettings = {
  name: "Doce Costura",
  slogan: "Enxovais e detalhes para sua cozinha.",
  // Nenhum benefício comercial (frete, desconto, parcelamento) foi cadastrado.
  // A barra mostra apenas o slogan até que o administrador cadastre benefícios reais.
  announcements: [],
  whatsapp: {
    number: null, // ex.: "5511999999999" — a ser informado
    message: "Olá! Gostaria de conhecer melhor os produtos da Doce Costura.",
  },
  company: {
    legalName: null,
    cnpj: null,
    address: null,
    email: null,
    phone: null,
    serviceHours: null,
  },
  social: { instagram: null },
};
