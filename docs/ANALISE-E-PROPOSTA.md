# Análise e proposta — Doce Costura

Data: 12/11/2026. Etapa entregue: revisão do projeto e proposta visual antes da implementação do novo visual e publicação.

## Diagnóstico

A base é Next.js 16.4.3, React 19, TypeScript, Tailwind 4, PostgreSQL/Drizzle, Better Auth e Supabase Storage. A vitrine consulta o banco no servidor; o painel cadastra produtos, categorias, imagens e variações. Há validação de publicação e auditoria. A arquitetura comporta uma loja própria, mas a jornada de compra ainda não foi implementada.

Esta análise é estática, com testes unitários e tentativa de build. Não constitui validação em navegador, auditoria completa de segurança ou teste do banco. Não há `.env.local`, dependências estavam ausentes e esta pasta não contém metadados Git. As afirmações de testes anteriores em STATUS.md não foram consideradas evidências de execução nesta sessão.

## Achados e prioridades

| Prioridade | Evidência no projeto | Consequência e proposta |
|---|---|---|
| Bloqueador de vendas | `src/app/(loja)/[...rota]/page.tsx` resolve catálogo, categorias, produtos, favoritos, carrinho, conta e páginas institucionais com uma tela de preparação | Os links existem, mas não concluem a tarefa do cliente. Implementar catálogo, produto e carrinho antes de checkout. |
| Bloqueador de vendas | Não há handlers de pagamentos, frete ou webhooks; variáveis em `.env.example` são preparatórias | Implementar integrações em teste, recalcular totais no servidor, reservar estoque e validar assinatura e idempotência de webhooks antes de habilitar venda. As tabelas não substituem esses fluxos. |
| Bloqueador de execução nesta cópia | `src/db/index.ts` exige `DATABASE_URL` no carregamento; não há `.env.local` | O build compila, mas falha ao coletar dados. Configurar banco de desenvolvimento e autenticação; testar migrações e Storage em ambiente separado. Não aplicar migrações em produção nesta etapa. |
| Alta | `setupAdminAction` em `src/app/admin/(auth)/actions.ts` verifica `adminExists()` antes de criar usuário, credencial e auditoria em chamadas separadas | Duas solicitações autorizadas simultâneas podem passar pela verificação; uma falha na criação de credencial também pode deixar administrador incompleto. Tornar inicialização exclusiva e atômica e testar concorrência. Risco identificado no código, sem exploração executada. |
| Alta | `src/lib/email.ts` registra destinatário e conteúdo completo do e-mail no console de desenvolvimento | Links com tokens de recuperação podem ir para logs compartilhados. Substituir por caixa de testes local ou transporte de teste sem registrar tokens e dados pessoais. |
| Alta antes de pedidos | `saveProduct` em `src/lib/catalog/admin-repo.ts` atualiza estoque a partir do formulário sem bloqueio de linha ou verificação de versão | Edições concorrentes podem sobrescrever ajustes; antes de reservas de pedidos, tratar concorrência e impedir estoque inferior ao reservado. |
| Média | `Newsletter` valida o formulário e só informa que o serviço não está ativo após envio | A chamada cria expectativa de inscrição. Persistir consentimento e implementar confirmação por e-mail, ou informar indisponibilidade antes do preenchimento. |
| Média | `CookieConsent` oculta o aviso após decisão e não oferece controle posterior na interface | Adicionar link no rodapé para revisar preferências. Scripts de analytics ainda não estão implementados; testar o bloqueio quando entrarem. |
| Média | `src/lib/config/store.ts` tem identificação da empresa, contato, WhatsApp e Instagram vazios | Completar dados reais e conteúdo de atendimento, entrega, trocas e privacidade antes da abertura. Não preencher com exemplos em produção. |
| Média | Hero, rodapé e descrição de metadados falam principalmente em panos de prato | Ampliar posicionamento para enxoval de cozinha em geral, com categorias somente para produtos realmente existentes. |
| Média | `src/app/sitemap.ts` inclui URLs de produto e coleção que ainda são telas temporárias | Publicar sitemap comercial após as páginas reais; usar prévia restrita durante a construção. Verificar HTTP de URLs inexistentes por requisição real: o código chama `notFound()`, mas o status depende da renderização e não foi medido nesta sessão. |
| Média | `scripts/preview-export.sh` move só sitemap/robots e ativa exportação estática, mantendo painel, Server Actions e API | O procedimento não isola o backend e a vitrine ainda precisa do banco. Preferir prévia com servidor; revisar esse script antes de depender dele. Incompatibilidade identificada na estrutura, sem execução do script. |
| Baixa | `typecheck` executa somente `tsc --noEmit` e usa helpers gerados pelo Next | Em checkout limpo falhou por ausência de `PageProps`, `LayoutProps` e `RouteContext`; passou depois de `npx next typegen`. Propor `next typegen && tsc --noEmit` no script. |
| Baixa | `docs/ARQUITETURA.md` mistura intenção e implementação (Upstash, Playwright e armazenamento alternativo) | Atualizar documento para separar recursos previstos dos existentes; o rate limit atual usa PostgreSQL e o armazenamento atual usa Supabase/local. |

## Identidade visual proposta

Conceito: boutique acolhedora de enxoval de cozinha. Evoluir a marca existente sem substituir seu nome ou a logomarca original. Mensagem principal proposta: **Delicadeza para viver a sua cozinha.** Texto de apoio: **Enxovais, estampas e detalhes para deixar sua casa ainda mais sua.**

| Elemento | Definição |
|---|---|
| Fundo | Creme `#FBF6EF` |
| Superfícies | Papel `#FFFCF8` e linho `#F3E8DC` |
| Ações principais | Rosa antigo profundo `#9E5045`; hover `#84402F` |
| Títulos | Cacau `#5A2F14` |
| Texto | Tinta `#3D2A1E`; secundário `#6B5446` |
| Acento | Sálvia escuro `#5F6644` |
| Ornamentos | Dourado e rosa claro, sem depender deles para leitura |
| Títulos | Cormorant Garamond, já instalada no projeto |
| Interface | Jost, já instalada no projeto |
| Acento caligráfico | Parisienne, em pequenos detalhes |

Usar fotografias de produto com luz, recorte e escala consistentes; fundos claros; pesponto e xadrez discretos. A logomarca original deve ser usada como arquivo original na implementação: a versão gerada nos conceitos é uma aproximação ilustrativa.

Homepage proposta: cabeçalho com busca e ações existentes; apresentação da coleção; acesso por categoria; produtos e estampas; detalhes de acabamento; atendimento e rodapé. No celular, priorizar título legível, botão visível, imagem com altura controlada e grade de duas colunas somente quando a largura permitir. O conceito mobile não fixa a composição final em 390 px: a implementação deverá ser testada em larguras reais.

Não inserir categorias sem produtos, descontos fictícios, avaliações inventadas, promessas de frete ou afirmações de fabricação artesanal sem confirmação. As categorias adicionais e fotografias dos conceitos são ilustrativas; não representam catálogo confirmado. Nomes, textos e cores gerados em imagens podem variar: esta especificação escrita é a referência para implementação.

## Imagens entregues

- `propostas/01-home-desktop.png`: proposta da página inicial.
- `propostas/02-mobile-identidade.png`: direção mobile e painel de identidade.
- `propostas/prompts.json`: prompts completos usados no gerador integrado de imagens (sem API/CLI externo).

São conceitos gerados, não capturas de um site implementado. O código visual da loja foi preservado nesta etapa.

## Validação desta sessão

- Node 24.20.0 e npm 11.19.0 disponíveis.
- Dependências instaladas com `npm install --ignore-scripts --no-audit --no-fund`; `package-lock.json` gerado. Scripts de instalação não foram executados e não houve auditoria de vulnerabilidades.
- `npm test`: **13 testes aprovados**, um arquivo, sobre valores monetários, esquema de produto, publicação e slug. Não cobrem compra, login, banco, uploads ou segurança concorrente. Vitest avisou sobre formato CommonJS/ESM da configuração.
- `npx next typegen`: concluído.
- `npm run typecheck`: aprovado após geração dos tipos.
- `npm run build`: compilação e TypeScript concluídos; **build final falhou** na coleta de dados por ausência de `DATABASE_URL`.
- Sem teste de navegação, responsividade, Lighthouse, checkout, Resend, Supabase ou integração externa. Nenhum deploy nem cobrança executados.

## Caminho para publicação e operação

1. Aplicar a identidade escolhida com os arquivos originais da marca e fotos reais; implementar catálogo, produto, favoritos e carrinho.
2. Configurar banco e Storage de desenvolvimento e validar painel, permissões e recuperação de senha. Corrigir os riscos de inicialização e concorrência.
3. Implementar pedidos, reserva de estoque, frete, pagamentos e conciliação em ambientes de teste. Testar falhas, reenvio de webhooks, pedidos de outros usuários e expiração.
4. Completar dados reais da empresa, políticas, catálogo, preços, estoques e embalagem; revisar conteúdo com o responsável pela loja.
5. Publicar prévia para homologação; verificar mobile, teclado, imagens, links, status HTTP e SEO. Uma prévia não equivale a loja pronta para vender.
6. Preparar publicação comercial com domínio, HTTPS, banco/Storage persistentes, e-mail, credenciais de produção, monitoramento, backups e teste de restauração. Só habilitar venda após validação dos fluxos.

Manter a arquitetura Next.js com servidor. A combinação Vercel + Supabase já prevista no projeto é uma opção compatível a verificar com as contas existentes; não há necessidade de reescrever a loja para hospedagem estática. Nenhuma conta, plano pago ou domínio foi contratado.

Referências oficiais consultadas: [variáveis na Vercel](https://vercel.com/docs/environment-variables), [ambientes e prévias](https://vercel.com/docs/deployments/environments), [conexões PostgreSQL do Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres). Também foram lidos os guias de deploy e exportação estática da versão instalada em `node_modules/next/dist/docs/`.

Para a próxima etapa faltam o retorno sobre a direção visual e a informação sobre domínio e contas Vercel/Supabase já existentes. Segredos devem ser configurados no ambiente, nunca enviados pelo chat.
