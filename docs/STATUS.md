# Status das funcionalidades

Legenda: ✔ concluída · ◐ simulada/provisória · ○ pendente

## Etapa 1 — Arquitetura e homepage

| Item | Status | Observação |
|---|---|---|
| Arquitetura, mapa do site, identidade visual | ✔ | `docs/ARQUITETURA.md` |
| Schema do banco de dados | ✔ | `prisma/schema.prisma` — validado; migração na Etapa 3 |
| Homepage navegável (mobile e desktop) | ✔ | |
| Cabeçalho, menu mobile, busca instantânea | ✔ | Busca sobre o catálogo em código; banco na Etapa 3 |
| Favoritos com contador | ◐ | Salvo no navegador; sincronização com a conta na Etapa 3 |
| Contador do carrinho | ◐ | Estrutura pronta; adicionar ao carrinho exige preço cadastrado |
| Barra de benefícios configurável | ✔ | Sem benefícios cadastrados, mostra o slogan |
| Consentimento de cookies (LGPD) | ✔ | Essenciais / análise / marketing; scripts de terceiros só após aceite (Etapa 3) |
| Newsletter com consentimento | ◐ | Valida e-mail e aceite; envio ao servidor e double opt-in na Etapa 3 |
| Botão de WhatsApp | ◐ | Implementado; oculto até o número ser informado |
| Sitemap, robots, metadados, Open Graph, ícones | ✔ | Dados estruturados de produto na Etapa 2 |
| Cabeçalhos de segurança HTTP | ✔ | HSTS, nosniff, frame-deny, referrer, permissions |
| Páginas internas | ○ | Rotas existem com aviso "Em preparação" |

## Próximas etapas

| Etapa | Itens | Status |
|---|---|---|
| 2 — Interface | Catálogo, filtros, página de produto (galeria, zoom, variações, frete), carrinho completo, páginas institucionais, dados estruturados | ○ |
| 3 — Backend | Banco, autenticação, área do cliente, painel administrativo, estoque, pedidos, cupons, upload de imagens, e-mails | ○ |
| 4 — Pagamentos e logística | Mercado Pago (sandbox), webhooks, Melhor Envio (sandbox) | ○ |
| 5 — Testes | Vitest + Playwright, segurança, webhooks, responsividade | ○ |
| 6 — Publicação | Deploy, domínio, HTTPS, banco de produção, backups, documentação | ○ |

**A loja não está pronta para vendas reais** até a conclusão e validação das Etapas 3 a 5.
