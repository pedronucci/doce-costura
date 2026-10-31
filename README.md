# Doce Costura — loja virtual

Enxovais e detalhes para sua cozinha. E-commerce em Next.js 16 + TypeScript + Tailwind CSS 4.

> **Status:** Etapa 1 (arquitetura + homepage). A loja **não está pronta para vendas reais**. Veja `docs/STATUS.md`.

## Requisitos

- Node.js 22 LTS ou superior
- npm 10+
- (Etapa 3 em diante) PostgreSQL 16+

## Instalação

```bash
npm install
cp .env.example .env.local   # preencha conforme as etapas avançarem
npm run dev                  # http://localhost:3000
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificação de tipos |
| `npm run preview:export` | Exportação estática apenas para pré-visualizar a interface (sem backend) |

## Onde está cada coisa

- `src/app/(loja)` — páginas públicas
- `src/components` — componentes (layout, home, produto, ui)
- `src/lib/catalog/data.ts` — catálogo inicial (sem preços/estoque inventados)
- `src/lib/config/store.ts` — dados da empresa, WhatsApp, barra de benefícios
- `src/app/globals.css` — identidade visual (cores, fontes)
- `prisma/schema.prisma` — modelo de dados
- `docs/ARQUITETURA.md` — arquitetura, mapa do site, identidade visual
- `docs/STATUS.md` — funcionalidades concluídas, simuladas e pendentes

## Imagens

As fotos em `public/images/produtos` foram recortadas das artes enviadas, sem alteração de cor ou estampa. Para a loja em produção, recomenda-se fotografar cada peça individualmente (fundo neutro, 1600 px ou mais, várias vistas) — o painel administrativo (Etapa 3) fará o upload.
