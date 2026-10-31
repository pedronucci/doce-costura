# Doce Costura — Arquitetura e identidade visual (Etapa 1)

## 1. Visão geral

Loja virtual própria, com frontend, backend, banco de dados, painel administrativo, checkout com Mercado Pago e frete via Melhor Envio, tudo em um único projeto Next.js hospedado na Vercel.

```
Navegador (mobile-first)
   │  HTTPS
   ▼
Next.js 16 (App Router, Vercel)
   ├─ Páginas da loja (Server Components + Cache Components)
   ├─ Server Actions (carrinho, checkout, conta, painel) — validação Zod
   ├─ Route Handlers  /api/webhooks/mercadopago · /api/webhooks/melhorenvio · /api/frete
   └─ Middleware de proteção (/admin, /conta)
        │
        ├─ PostgreSQL gerenciado (Neon ou Supabase) ── Prisma 7
        ├─ Armazenamento de imagens (Vercel Blob ou Cloudflare R2)
        ├─ Upstash Redis (rate limiting)
        ├─ Resend (e-mails transacionais)
        ├─ Mercado Pago (Checkout Bricks + API de pagamentos + webhooks)
        └─ Melhor Envio (cotação, etiquetas, rastreio + webhooks)
```

## 2. Tecnologias e justificativas

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js 16.4**, App Router, TypeScript | Conforme solicitado. Cache Components (PPR) entrega o "esqueleto" estático da página instantaneamente e transmite preço/estoque atualizados em seguida. |
| Estilo | **Tailwind CSS 4** com tokens da marca | Paleta, tipografia e espaçamentos centralizados em `globals.css` (`@theme`). |
| Validação | **Zod 4** | Mesmo esquema valida formulário no navegador e dados no servidor. |
| Banco | **PostgreSQL gerenciado** (Neon ou Supabase) | Backups automáticos e restauração por ponto no tempo (PITR). |
| ORM | **Prisma 7** | Schema tipado, migrações versionadas. O rascunho completo está em `prisma/schema.prisma` (validado). |
| Autenticação | **Better Auth** (proposta) | Biblioteca TypeScript consolidada, adaptador Prisma, e-mail/senha com verificação, recuperação de senha, papéis (cliente/equipe/admin), sessões em banco e rate limiting nativo. *Mudança em relação a "solução consolidada" genérica — a confirmar na Etapa 3.* |
| Imagens | **Vercel Blob** (ou Cloudflare R2) | Upload pelo painel, URLs públicas otimizadas pelo `next/image` (AVIF/WebP). |
| E-mail | **Resend** | Confirmação de pedido, instruções de Pix, recuperação de senha, double opt-in da newsletter. |
| Rate limiting | **Upstash Redis** | Login, cadastro, recuperação de senha, cupom, cotação de frete e criação de pagamento. |
| Pagamentos | **Mercado Pago** — Checkout Bricks (Payment Brick + Status Screen Brick) | Tokenização do cartão feita pelo componente do Mercado Pago; dados de cartão nunca passam pelo nosso servidor. Pix com QR Code e copia-e-cola, boleto e cartões conforme a conta. |
| Frete | **Melhor Envio** | Cotação de várias transportadoras por peso/dimensões, compra de etiqueta, rastreio e webhooks. Possui ambiente sandbox. |
| Testes | Vitest (regras de negócio) + Playwright (fluxos de compra em celular e desktop) | |
| Hospedagem | **Vercel** | HTTPS automático, variáveis de ambiente protegidas, prévias por branch. |

**Ponto de atenção — Mercado Pago:** a documentação oficial anuncia uma nova **API Orders** além da API clássica de pagamentos (`/v1/payments`). Na Etapa 4 vou comparar as duas na documentação vigente e escolher a recomendada para Checkout Bricks com Pix, cartão e boleto. A estrutura de dados (`Payment`, `WebhookEvent`) já comporta qualquer uma.

## 3. Fluxo de pagamento seguro (resumo)

1. Cliente revisa o carrinho → o **servidor** recalcula preços, estoque, cupom e frete (o navegador nunca envia valores).
2. Servidor cria o `Order` (status `PENDING_PAYMENT`) com `idempotencyKey` único e reserva estoque.
3. Payment Brick coleta e tokeniza os dados no navegador; o token vai para uma Server Action.
4. Servidor cria o pagamento no Mercado Pago com `X-Idempotency-Key` e valor lido **do pedido no banco**.
5. Pix: exibe QR Code, copia-e-cola e prazo de expiração (Status Screen Brick).
6. Webhook `/api/webhooks/mercadopago`: valida a assinatura (`x-signature`), registra o evento (`WebhookEvent`, chave única → idempotente), **consulta o pagamento na API** e concilia valor, moeda, pedido e ID antes de mudar o status.
7. Aprovado → `PAID`, baixa definitiva do estoque, e-mail de confirmação. Recusado/expirado/cancelado → libera a reserva. Estorno/chargeback → `REFUNDED` com registro em `OrderEvent`.
8. O retorno do navegador ("pagamento concluído") apenas mostra o status; nunca marca pedido como pago.

## 4. Mapa do site

**Loja**
- `/` — página inicial
- `/colecao` — todos os produtos (filtros por categoria, estampa, preço, disponibilidade)
- `/categoria/[slug]` — categorias administráveis
- `/produto/[slug]` — página do produto
- `/busca?q=` — resultados de busca
- `/favoritos` · `/carrinho`
- `/checkout` → `/checkout/pagamento` → `/checkout/pedido/[id]` (status, Pix)

**Conta do cliente** (`/conta`)
- entrar · criar conta · recuperar senha
- dados pessoais · endereços · pedidos e pagamentos · rastreio · favoritos · atendimento · privacidade (exportar/excluir dados)

**Institucional**
- `/sobre` · `/contato` · `/perguntas-frequentes`
- `/politica-de-privacidade` · `/trocas-e-devolucoes` · `/politica-de-entrega` · `/termos-de-uso`

**Painel administrativo** (`/admin`, papéis ADMIN/STAFF)
- Visão geral (faturamento bruto, pedidos, pagos, pendentes, ticket médio, mais vendidos, evolução)
- Produtos · variações/estampas · estoque · categorias · coleções
- Pedidos (filtros por status, pagamentos, andamento, rastreio, cancelamento, reembolso)
- Cupons · banners · avaliações (moderação)
- Clientes · solicitações LGPD
- Configurações (dados da empresa, WhatsApp, barra de benefícios, origem do frete, Pix, GA4, Meta Pixel, Search Console)

**Técnico**
- `/sitemap.xml` · `/robots.txt` · `/api/webhooks/*` · `/api/frete`

## 5. Estrutura de pastas

```
src/
  app/
    (loja)/            páginas públicas + layout com cabeçalho/rodapé
    (conta)/           área do cliente (Etapa 3)
    admin/             painel (Etapa 3)
    api/webhooks/      Mercado Pago e Melhor Envio (Etapa 4)
    sitemap.ts · robots.ts · icon.png
  components/
    layout/  home/  product/  ui/
  lib/
    catalog/   (dados → Prisma na Etapa 3)
    config/    (configurações da loja → tabela StoreSettings)
    store/     (estado do navegador: favoritos, contador do carrinho)
    format.ts
prisma/schema.prisma
docs/
```

## 6. Identidade visual

**Paleta** (extraída da logomarca e ajustada para contraste WCAG AA):

| Token | Hex | Origem / uso |
|---|---|---|
| creme | `#FBF6EF` | fundo da logomarca — fundo principal |
| papel | `#FFFCF8` | cards e superfícies |
| linho | `#F3E8DC` | seções alternadas |
| névoa | `#F6E3DC` | rosa-claro, fundos suaves |
| rosa | `#C77B6E` | laço xadrez — somente decorativo |
| rosa-profundo | `#9E5045` | "Costura" — botões e links (5,3:1 sobre creme) |
| dourado | `#B88A57` | borda e coração — fios e ornamentos |
| dourado-texto | `#8A6434` | sobretítulos (4,9:1) |
| cacau | `#5A2F14` | "Doce" — títulos (10,5:1) |
| tinta | `#3D2A1E` | texto principal |
| sálvia | `#8C9168` | folhas — detalhes |

Ajustes em relação à paleta sugerida: o rosa da logomarca é mais quente (coral antigo) que `#C9848A`, e o rosa sugerido não atinge contraste suficiente para texto; por isso há um rosa decorativo e um rosa profundo para texto e botões. O mesmo vale para o dourado.

**Tipografia:** Cormorant Garamond (títulos, ecoa o "Doce" serifado), Jost (texto, leitura limpa no celular) e Parisienne (acentos caligráficos, ecoa o "Costura"). Fontes auto-hospedadas — sem chamadas ao Google Fonts, melhor para LGPD e desempenho.

**Elementos:** arco de boutique nas fotos principais, pesponto tracejado dourado, xadrez rosa como faixa decorativa, raminho com coração e laço simplificado como ornamentos. Ícones lineares (Lucide), sem emojis.

## 7. Regras de conteúdo aplicadas

- Nenhum preço, estoque, frete, desconto, parcelamento ou benefício foi inventado: aparecem como "Preço em breve" ou "pendente de cadastro".
- "Mais vendidos" e "Avaliações" ficam ocultos até existirem vendas e avaliações verificadas.
- "Kits especiais" exibe aviso honesto de "em preparação" enquanto não houver kits cadastrados.
- O botão de WhatsApp só aparece quando o número for configurado.
- O produto Milho e Pimentão aparece com espaço "Fotografia em breve" — nenhuma imagem genérica.
- Os textos de "Nossa essência" são provisórios e não afirmam fatos sobre a empresa (história, produção artesanal, origem dos tecidos).
