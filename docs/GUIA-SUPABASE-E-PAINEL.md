# Guia: ligar o Supabase e usar o painel de produtos

Tempo estimado: 20 a 30 minutos. Nenhuma senha ou chave precisa ser enviada a ninguém — tudo fica no Supabase e nas variáveis de ambiente.

## 1. Criar as tabelas no Supabase

1. Abra o projeto no Supabase → menu **SQL Editor** → **New query**.
2. Cole o conteúdo de `drizzle/0000_inicial.sql` e clique em **Run**. Cria todas as tabelas da loja.
3. Nova query com `drizzle/supabase/seguranca-e-storage.sql` → **Run**. Isso:
   - bloqueia o acesso às tabelas pela API pública do Supabase (a loja acessa só pelo servidor);
   - cria o bucket público **produtos** para as fotos (até 10 MB, JPG/PNG/WebP).
4. Nova query com `drizzle/seed/catalogo-inicial.sql` → **Run**. Cadastra as 8 categorias e os 6 produtos iniciais como “Em breve”, sem preços nem estoque.

Os três arquivos podem ser executados de novo sem duplicar nada.

## 2. Pegar os valores de conexão

| Variável | Onde encontrar |
|---|---|
| `DATABASE_URL` | Botão **Connect** (topo do projeto) → **Transaction pooler** (porta **6543**). Troque `[YOUR-PASSWORD]` pela senha do banco. |
| `SUPABASE_URL` | Project Settings → API → **Project URL** (`https://xxxx.supabase.co`) |
| `SUPABASE_SECRET_KEY` | Project Settings → API Keys → **secret key** (`sb_secret_…`). Se o projeto for antigo, a chave **service_role** também funciona. **Nunca** use essa chave no navegador nem a compartilhe. |

Gere também:

- `BETTER_AUTH_SECRET`: `openssl rand -base64 32` (ou um gerador de senhas com 40+ caracteres).
- `ADMIN_SETUP_TOKEN`: um código só seu, com 12+ caracteres, para criar o primeiro administrador.

## 3. Rodar a loja

**No seu computador** (Node.js 22+):

```bash
npm install
cp .env.example .env.local   # preencha DATABASE_URL, SUPABASE_URL, SUPABASE_SECRET_KEY,
                             # BETTER_AUTH_SECRET, BETTER_AUTH_URL=http://localhost:3000, ADMIN_SETUP_TOKEN
npm run dev                  # http://localhost:3000
```

**Na Vercel** (recomendado para usar de qualquer lugar): importe o repositório do GitHub, cadastre as mesmas variáveis em *Settings → Environment Variables* com `BETTER_AUTH_URL` e `NEXT_PUBLIC_SITE_URL` iguais ao endereço do site, e publique.

## 4. Criar o administrador

1. Acesse `/admin/primeiro-acesso`.
2. Informe o código `ADMIN_SETUP_TOKEN`, seu nome, e-mail e uma senha de 10+ caracteres.
3. A tela se desativa sozinha depois que o primeiro administrador existe.

Entradas seguintes: `/admin/entrar`. Após 8 tentativas erradas em 15 minutos, o login é bloqueado temporariamente.

> **Recuperação de senha:** só envia e-mail depois de configurar o Resend (`RESEND_API_KEY` e `EMAIL_FROM` com domínio verificado). Até lá, guarde bem a senha.

## 5. Cadastrar produtos

Painel → **Produtos** → **Novo produto** (ou clique em um existente):

1. **Fotos** — arraste ou escolha até 12. A primeira é a capa; use as setas para reordenar. Fotos grandes do celular são reduzidas automaticamente (máx. 2000 px, sem alterar cores). Descreva cada foto no campo abaixo dela (acessibilidade e Google).
2. **Informações básicas** — nome, endereço (gerado sozinho), resumo para os cards, descrição e categorias.
3. **Ficha técnica** — materiais, medidas e lavagem. O que ficar em branco aparece na loja como “pendente de cadastro”.
4. **Variações** — uma por estampa/modelo vendido separadamente, cada uma com SKU, preço, preço “de” (promoção), estoque, peso e medidas **da embalagem** (usadas no cálculo do frete) e a amostra da estampa.
5. **Status**:
   - *Rascunho*: invisível na loja.
   - *Em breve*: aparece com “Preço em breve”, sem compra.
   - *À venda*: exige foto, categoria, preço, peso e medidas — o painel mostra o que falta.
   - *Arquivado*: sai da loja, mantém o histórico.
6. **Destacar na página inicial** — os produtos marcados ocupam a seção “Coleção em destaque”.

Outras ações: **Duplicar** (cria um rascunho com as mesmas informações, sem estoque) e **Excluir** (bloqueado se o produto já tiver pedidos — use Arquivar).

Cada alteração de estoque fica registrada com data e usuário, e toda edição entra no registro de auditoria.

**Categorias:** menu **Categorias** → criar, renomear, ocultar, reordenar (a ordem é a do menu da loja) e excluir (só sem produtos).

## O que ainda não está ativo

Carrinho, checkout, Mercado Pago, frete, área do cliente, pedidos, cupons e configurações da loja entram nas próximas etapas. A loja **não está pronta para vendas reais**.
