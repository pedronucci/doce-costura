# Doce Costura — loja virtual

Enxovais e detalhes para sua cozinha. Next.js 16 + TypeScript + Tailwind CSS 4 + PostgreSQL (Supabase) + Drizzle ORM + Better Auth.

> **Status:** Etapa 1 concluída e painel de produtos antecipado. A loja **não está pronta para vendas reais**. Veja `docs/STATUS.md`.

## Começar

- **Ligar ao Supabase e usar o painel:** `docs/GUIA-SUPABASE-E-PAINEL.md`
- Arquitetura e identidade visual: `docs/ARQUITETURA.md`

## Desenvolvimento local

Requisitos: Node.js 22+, npm 10+ e um PostgreSQL 15+ (o do Supabase ou um local).

```bash
npm install
cp .env.example .env.local   # preencha DATABASE_URL, BETTER_AUTH_SECRET, ADMIN_SETUP_TOKEN
npm run db:migrate           # cria as tabelas
npm run db:seed              # categorias e produtos iniciais
npm run dev                  # http://localhost:3000 — painel em /admin
```

Sem `SUPABASE_URL`, as fotos enviadas pelo painel ficam em `.data/uploads` (apenas desenvolvimento).

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run lint` · `npm run typecheck` · `npm test` | Qualidade e testes |
| `npm run db:generate` | Gera uma nova migração SQL após alterar `src/db/schema.ts` |
| `npm run db:migrate` | Aplica as migrações no banco de `DATABASE_URL` |
| `npm run db:seed` | Executa o catálogo inicial (idempotente) |
| `npm run db:studio` | Visualizador do banco (Drizzle Studio) |

## Onde está cada coisa

- `src/app/(loja)` — páginas públicas · `src/app/admin` — painel
- `src/db/schema.ts` — modelo de dados · `drizzle/` — migrações SQL, catálogo inicial e ajustes do Supabase
- `src/lib/catalog` — consultas da vitrine, validação e regras de publicação
- `src/lib/auth` — login, papéis e proteção do painel
- `src/lib/storage` — fotos (Supabase Storage / local)
- `src/app/globals.css` — identidade visual (cores, fontes)

## Segurança (resumo)

- Toda página e ação do painel verifica sessão e papel no servidor; o `proxy.ts` só faz o redirecionamento inicial.
- Senhas com hash (scrypt) pelo Better Auth; limite de tentativas no login, recuperação de senha, primeiro acesso e upload.
- Fotos validadas pelo conteúdo (não pela extensão), sem metadados de localização, com limite de tamanho.
- Tabelas com RLS ativado no Supabase (sem acesso pela API pública); chave secreta só no servidor.
- Cada alteração de produto, categoria e estoque fica registrada em auditoria.
