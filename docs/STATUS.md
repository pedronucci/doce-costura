# Status das funcionalidades

Legenda: ✔ concluída · ◐ simulada/provisória · ○ pendente

## Etapa 1 — Arquitetura e homepage

| Item | Status | Observação |
|---|---|---|
| Arquitetura, mapa do site, identidade visual | ✔ | `docs/ARQUITETURA.md` |
| Homepage navegável (mobile e desktop) | ✔ | Agora lê os produtos do banco |
| Cabeçalho, menu mobile, busca instantânea | ✔ | Busca sobre o catálogo visível |
| Favoritos com contador | ◐ | Salvo no navegador; sincronização com a conta na Etapa 3 |
| Contador do carrinho | ◐ | Estrutura pronta; carrinho completo na Etapa 2 |
| Barra de benefícios configurável | ✔ | Sem benefícios cadastrados, mostra o slogan |
| Consentimento de cookies (LGPD) | ✔ | |
| Newsletter com consentimento | ◐ | Valida; gravação e double opt-in pendentes |
| Botão de WhatsApp | ◐ | Oculto até o número ser informado |
| Sitemap, robots, metadados, cabeçalhos de segurança | ✔ | Sitemap a partir do banco |
| Páginas internas (catálogo, produto, carrinho, institucionais) | ○ | Rotas exibem “Em preparação” (Etapa 2). Endereços inexistentes mostram “Página não encontrada”, mas ainda com código HTTP 200 — corrigido quando as rotas definitivas entrarem. |

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
| Importação por planilha (ex.: exportação da Shopee) | ○ | Aguardando o arquivo exportado |

## Próximas etapas

| Etapa | Itens | Status |
|---|---|---|
| 2 — Interface | Catálogo com filtros, página de produto (galeria, zoom, variações, frete), carrinho, páginas institucionais, dados estruturados | ○ |
| 3 — Backend (restante) | Área do cliente, pedidos, cupons, configurações da loja, e-mails | ○ |
| 4 — Pagamentos e logística | Mercado Pago (testes), webhooks, Melhor Envio (sandbox) | ○ |
| 5 — Testes | Fluxos de compra, segurança, webhooks, responsividade | ○ |
| 6 — Publicação | Deploy, domínio, HTTPS, banco de produção, backups | ○ |

**A loja não está pronta para vendas reais** até a conclusão e validação das Etapas 2 a 5.
