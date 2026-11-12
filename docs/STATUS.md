# Status das funcionalidades

Legenda: ✔ concluída · ◐ simulada/provisória · ○ pendente

## Etapa 1 — Arquitetura e homepage

| Item | Status | Observação |
|---|---|---|
| Arquitetura, mapa do site, identidade visual | ✔ | `docs/ARQUITETURA.md` |
| Homepage navegável (mobile e desktop) | ✔ | Agora lê os produtos do banco |
| Cabeçalho, menu mobile, busca instantânea | ✔ | Busca sobre o catálogo visível |
| Favoritos com contador | ◐ | Salvo no navegador; sincronização com a conta na Etapa 3 |
| Carrinho local por variação | ◐ | Quantidades, remoção e subtotal estimado; sem pedido, reserva ou checkout |
| Barra de benefícios configurável | ✔ | Sem benefícios cadastrados, mostra o slogan |
| Preferências de cookies | ◐ | Aceite/rejeição e reabertura pelo rodapé; scripts de analytics ainda não implementados |
| Newsletter com consentimento | ◐ | Formulário desabilitado com aviso prévio; gravação e double opt-in pendentes |
| Botão de WhatsApp | ◐ | Oculto até o número ser informado |
| Sitemap, robots, metadados, cabeçalhos de segurança | ✔ | Sitemap a partir do banco |
| Catálogo, categorias, busca, produto e favoritos | ✔ / ◐ | Publicados com Supabase; catálogo, busca e detalhes verificados no site público. Favoritos permanecem locais |
| Revisão da compra | ◐ | `/checkout` confere preços e estoque no servidor; sem confirmação, reserva ou cobrança. Ver `docs/CHECKOUT-E-PEDIDOS.md` |
| Páginas institucionais | ✔ / ◐ | Sobre, Contato, FAQ e políticas implementados; identidade empresarial e revisão operacional/jurídica antes das vendas pendentes. Ver `docs/PAGINAS-INSTITUCIONAIS.md` |
| Conta do cliente | ○ | Continua em preparação |

## Antecipado da Etapa 3 — Painel de produtos

| Item | Status | Observação |
|---|---|---|
| Banco de dados (Drizzle + PostgreSQL) | ✔ | 29 tabelas; migração SQL e catálogo inicial testados em banco limpo |
| Login de administrador (Better Auth) | ✔ | Primeiro acesso protegido por código, papéis admin/equipe, bloqueio por tentativas |
| Recuperação de senha | ◐ | Fluxo pronto; envio de e-mail depende do Resend (não configurado) |
| Cadastro e edição de produtos | ✔ | Fotos, dados, ficha técnica, variações, preço, promoção, estoque, peso/medidas, status, destaque, SEO |
| Regras de publicação | ✔ | “À venda” exige foto, categoria, preço, peso e medidas |
| Duplicar, excluir, arquivar | ✔ | Exclusão bloqueada para produtos com pedidos |
| Categorias (criar, editar, ocultar, ordenar, excluir) | ✔ | |
| Upload de fotos | ✔ / ◐ | Testado com armazenamento local; **Supabase Storage implementado, mas não testado daqui** (o Supabase não é acessível do ambiente de desenvolvimento) |
| Histórico de estoque e auditoria | ✔ | |
| Vitrine atualizada ao salvar | ✔ | Cache renovado a cada alteração |
| Consulta de pedidos | ◐ | Lista paginada e detalhes protegidos para equipe/admin; criação, pagamento e operação de envio pendentes |
| Configurações da loja | ✔ / ◐ | Empresa, contatos, WhatsApp, Instagram, mensagens e CEP de origem editáveis por admin; dados reais aguardam preenchimento. Ver `docs/CONFIGURACOES-DA-LOJA.md` |
| Importação por planilha (ex.: exportação da Shopee) | ○ | Aguardando o arquivo exportado |

## Próximas etapas

| Etapa | Itens | Status |
|---|---|---|
| 2 — Interface | Catálogo com filtros, produto com galeria/ampliação/variações, favoritos e carrinho local implementados; frete, institucionais e dados estruturados pendentes | ◐ |
| 3 — Backend (restante) | Área do cliente, pedidos, cupons, configurações da loja, e-mails | ○ |
| 4 — Pagamentos e logística | Mercado Pago (testes), webhooks, Melhor Envio (sandbox) | ○ |
| 5 — Testes | Fluxos de compra, segurança, webhooks, responsividade | ○ |
| 6 — Publicação | Vitrine publicada na Vercel com HTTPS, GitHub e Supabase. Domínio próprio e configuração/verificação de backups pendentes | ◐ |

**A loja não está pronta para vendas reais** até a conclusão e validação das Etapas 2 a 5.
