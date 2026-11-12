# Implementação e publicação

Atualização: 12/11/2026, após aprovação da direção visual.

## O que foi aplicado

- Mantida a logomarca original e a paleta creme, rosa antigo, cacau e sálvia; fontes já existentes, sem nova dependência.
- Homepage com mensagem mais ampla de enxoval, texto e botão antes da imagem no celular, selo original no desktop, descoberta de categorias reais e grade de estampas com quatro colunas no desktop.
- Catálogo e categorias com busca sem acentos, filtro por categoria/disponibilidade e ordenação por nome, data e preço. Itens sem preço ficam depois dos preços cadastrados.
- Busca do cabeçalho agora navega para resultados ao pressionar Enter.
- Produto com galeria, foto ampliada em nova aba, variação, quantidade, ficha técnica e bloqueio de compra para itens em breve ou indisponíveis.
- Favoritos com página própria e persistência no navegador; favoritos da estrutura anterior são preservados.
- Carrinho local com identificação por variação, quantidades, remoção e subtotal em centavos. A estrutura antiga de carrinho era apenas um contador por slug: linhas antigas sem identificação de variação não são reaproveitadas. Quantidade limitada a 99 e disponibilidade apresentada pelo catálogo; dados locais não autorizam pedidos nem definem preço de venda.
- Preferências de cookies podem ser reabertas no rodapé. Newsletter permanece desabilitada e informa isso antes de qualquer preenchimento.
- E-mails sem configuração falham explicitamente, inclusive em desenvolvimento; destinatários, conteúdo e links de recuperação não são registrados pelo módulo de envio.
- Corrigidos posicionamento do contêiner de imagens com `fill` e atributo de rolagem suave apontados pelo Next durante a inspeção.
- `npm run typecheck` gera os tipos do Next antes do TypeScript.

## Prévia local

```text
npm install
npm run dev:preview
```

Abra http://localhost:3000. O script funciona no Windows sem exigir Bash. Para outro endereço de porta: `npm run dev:preview -- --port 3001`.

A prévia exibe um aviso permanente e utiliza as fotografias existentes e uma representação do catálogo inicial, sem inventar preços/estoque. A configuração `STOREFRONT_PREVIEW=1` só é considerada fora de produção. O script recusa ambiente de produção/Vercel. Banco indisponível nunca é convertido silenciosamente em catálogo de demonstração. Painel e login continuam exigindo banco real.

Para usar o Supabase configurado, execute `npm run dev` sem a variável de prévia no ambiente. Siga `.env.example` e `GUIA-SUPABASE-E-PAINEL.md`. Não compartilhe senhas/chaves no chat.

## Evidências

- `npm test`: **19 testes aprovados**, em três arquivos. Incluem validação de produtos, limites e interpretação do carrinho e falha segura do envio de e-mails. Chamadas de e-mail foram simuladas, sem envio real.
- `npm run typecheck`: aprovado.
- `npm run build`: compilação e TypeScript aprovados; geração de produção interrompida por `DATABASE_URL` ausente ao carregar o painel. Não é um build de produção concluído.
- Navegador: busca por `abobora` encontra Cenoura e Abóbora; categoria floral retorna duas peças na prévia; disponibilidade retorna zero; favorito persiste após recarregar; produto em breve tem botão desabilitado; carrinho vazio exibe convite para explorar; preferências de cookies reabrem e salvam; Enter na busca do cabeçalho abre `/busca?q=tomates` com um resultado.
- Menu mobile abre pelo teclado; layout inspecionado em 390 × 844 e 1440 × 1000. Medição em 320 px não apontou conteúdo maior que a largura da tela. Isto não equivale a auditoria completa de acessibilidade.
- Requisições HTTP locais: `/`, `/colecao`, `/produto/pano-de-prato-cha-azul`, `/carrinho`, `/favoritos`, `/busca?q=tomates` e `/categoria/colecao-floral` retornaram 200; `/produto/nao-existe` e `/categoria/nao-existe` retornaram **404**.
- Capturas reais: `propostas/03-home-implementada-desktop.jpg` e `propostas/04-home-implementada-mobile.jpg`. Diferem dos conceitos gerados porque usam fotografias originais e categorias disponíveis no catálogo.

## O que falta para publicar

### Conexão validada e publicação em preparação

O usuário preencheu `.env.local`. A conexão PostgreSQL foi testada a partir da aplicação: **6 produtos e 8 categorias**. A chave secreta foi validada contra a API do Supabase Storage: HTTP 200 e bucket `produtos` encontrado. Credenciais não foram exibidas nem incluídas nos arquivos de publicação.

`npm run build` concluiu compilação, checagem TypeScript, coleta de dados e geração das **43 páginas**. `npm test` aprovou **19 testes**. O runtime foi fixado em Node **24.x** no projeto e no `package.json`, alinhado ao Node 24 usado na validação local; não houve atualização de dependências.

As variáveis de produção `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_SETUP_TOKEN` e `STORAGE_DRIVER=supabase` foram configuradas na Vercel para o novo projeto. O segredo Better Auth de produção anteriormente criado foi preservado. As variáveis da integração antiga que a aplicação não usa não foram removidas.

O usuário confirmou que deseja manter o projeto no GitHub. Foi constatado que `pedronucci/doce-costura` ainda aponta para `d25f83b742a8cefc50e70b6526b491170950aec8`. Uma cópia de sincronização foi criada em `.data/github-sync`, e o acesso de escrita foi verificado com `git push --dry-run`, sem alterar o remoto. A publicação deve usar a fonte atual validada e ser verificada pelo estado final da Vercel.

### Banco novo inicializado com sucesso

Após recarregar a integração, foi confirmado acesso ao projeto `izwduarfzcuapkltuiki`, organização `wxrviutwpvsjavpxridq`, ativo, PostgreSQL 17, região `us-west-2` escolhida na criação pelo usuário. O esquema `public` estava vazio e não havia histórico de migrações.

Foi aplicada a migração `doce_costura_inicial_com_rls_e_storage`, contendo o SQL original `drizzle/0000_inicial.sql`, os ajustes `drizzle/supabase/seguranca-e-storage.sql` e o registro correspondente em `drizzle.__drizzle_migrations`, com hash SHA-256 do arquivo original e timestamp do journal. Esse registro mantém compatibilidade com o migrador Drizzle e evita reaplicar a migração inicial no próximo `db:migrate`. Uma guarda interrompe a inicialização se surgirem tabelas públicas antes da aplicação. Não houve remoção de dados.

O catálogo inicial foi aplicado em transação. Consulta de verificação: **29 tabelas, todas com RLS; 8 categorias; 6 produtos; 6 variações; 5 fotos; 1 migração Drizzle**. Nenhum produto fora de `coming_soon`, nenhum preço preenchido e nenhum estoque inventado. Bucket público `produtos` criado para imagens, limite de 10 MiB, formatos JPG/PNG/WebP; envio continua exclusivo do servidor com chave secreta.

Advisors executados: segurança retornou apenas INFO de RLS sem políticas, comportamento intencional porque a aplicação usa conexão PostgreSQL no servidor e não concede acesso à Data API para visitantes. [Referência do aviso](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). Performance retornou avisos INFO de chaves estrangeiras sem índice e índices ainda sem uso; não foram criados índices extras sem evidência de carga. [Referência](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys).

Foi criado `.env.local` privado, sem sobrescrever arquivo existente, com URL do novo projeto e segredos locais gerados criptograficamente. **Faltam `DATABASE_URL` e `SUPABASE_SECRET_KEY`**, que precisam ser preenchidos pelo usuário diretamente no arquivo. A integração de gerenciamento não fornece a senha criada para o banco. Não enviar esses valores por chat. O arquivo é ignorado pelo Git e não faz parte do pacote de publicação.

A Vercel ainda aponta para o banco antigo. A troca será feita com a conexão nova validada; não publicar apenas o commit antigo do GitHub, que não contém a identidade aprovada. Nenhum novo deploy foi executado até este ponto.

Destino atualizado pelo usuário: projeto Supabase `izwduarfzcuapkltuiki` (`https://supabase.com/dashboard/project/izwduarfzcuapkltuiki`), criado em outra conta após a conta anterior atingir o limite gratuito. O usuário informou que habilitou a integração. A primeira verificação retornou `Unknown tool` para `get_project`, `list_tables` e `list_migrations`; não foi possível confirmar estado/tabelas nem aplicar o esquema. O plugin consta instalado, mas a disponibilidade das chamadas falhou nesta sessão. Vercel segue acessível pela integração. Nenhuma variável foi apontada para o novo banco, nenhuma migração foi aplicada e nenhum deploy novo foi iniciado nesta tentativa. O banco antigo permanece intacto.

O usuário informou que possui contas Vercel e Supabase. Esta pasta ainda não contém `.env.local`, vínculo `.vercel` ou repositório Git. Ainda precisamos identificar os projetos corretos nessas contas e o domínio desejado. Nenhuma conta nova foi criada, nenhum dado de produção foi modificado e nenhum deploy foi executado.

1. Identificar projeto Vercel, projeto Supabase, repositório de origem e domínio. Aproveitar recursos existentes; não criar outro projeto sem necessidade.
2. Configurar variáveis diretamente no ambiente seguro, usando `.env.example`. Configurar URLs reais da aplicação e autenticação. Produção precisa de Storage persistente; a pasta local de uploads não serve para Vercel.
3. Conferir tabelas e dados existentes antes de escolher migração/seed. Não executar SQL às cegas no banco do usuário. Validar permissões, administrador, upload, recuperação de senha e catálogo com o banco.
4. Gerar build completo e publicar uma prévia de homologação. Verificar URLs, fotos, navegação e login com o ambiente remoto.
5. Completar informações comerciais e páginas institucionais; implementar e testar pedidos, reserva de estoque, frete e pagamentos antes de abrir vendas. Os riscos de concorrência na inicialização do administrador e nos ajustes de estoque identificados na análise ainda precisam de correção e teste com banco.
6. Validar backups/restauração, monitoramento, domínio e HTTPS antes da abertura comercial.

## Limitações

### Consulta das contas em 12/11/2026

### Diagnóstico confirmado pelas integrações autenticadas

- Vercel: equipe `pedro-nucci`, projeto `doce-costura` (`prj_4rPwSVlfl097ZeTmodwkmMqi1Dgt`). O deploy `dpl_4SEMdh7M2eW33Kq2amjMVSJGXMWz`, do commit `d25f83b742a8cefc50e70b6526b491170950aec8`, falhou em produção.
- Os logs confirmaram dois bloqueios: Better Auth sem `BETTER_AUTH_SECRET` e erro PostgreSQL `28P01` (autenticação por senha recusada). Também faltava `BETTER_AUTH_URL`.
- Foram criadas e verificadas na Vercel, somente para produção, as variáveis `BETTER_AUTH_SECRET` (valor criptograficamente aleatório, sensível), `BETTER_AUTH_URL` e `NEXT_PUBLIC_SITE_URL`. As URLs apontam para o alias já existente `https://doce-costura-pedro-nucci.vercel.app`. Nenhum valor secreto foi registrado neste documento. A alteração só terá efeito em um novo deploy.
- O `SUPABASE_URL` configurado na Vercel identifica o projeto `piomrsqdqgxbpjrmxdzn`, vinculado pela integração externa Supabase. A organização informada pelo usuário (`myxtnsdqtnpztfrgsags`, Doce Costura) está acessível e no plano gratuito, mas `list_projects` não retornou projetos. A consulta direta ao projeto usado pela Vercel respondeu **sem permissão**.
- Pendente: disponibilizar acesso ao projeto Supabase existente ou decidir por um banco novo. Não trocar a conexão nem aplicar migrações enquanto o destino não estiver confirmado. O erro de senha não será corrigido trocando valores por suposição.
- Fonte local preparada em `.data/deploy/source-files.json` e manifesto em `.data/deploy/source-manifest.json`, com hash do conjunto. O pacote inclui apenas código, configuração de build e imagens públicas; exclui arquivos `.env`, caches, dependências e credenciais locais. Ainda não foi enviado à Vercel. O deploy anterior do GitHub não contém as mudanças visuais locais.

### Registro anterior de consulta pelo navegador

O usuário forneceu o projeto Vercel `https://vercel.com/pedro-nucci/doce-costura` e a organização Supabase `https://supabase.com/dashboard/org/myxtnsdqtnpztfrgsags`. Na sessão já aberta do Chrome, a Vercel mostrou **No Production Deployment**, tentativa anterior em erro e referência ao repositório `https://github.com/pedronucci/doce-costura`. A causa do erro remoto ainda não foi consultada; não se deve presumir que seja idêntica à ausência de banco local. O link Supabase identifica uma organização, e não confirma qual projeto/banco deve ser usado.

As integrações Vercel e Supabase passaram de não instaladas para instaladas durante a consulta, mas suas ferramentas autenticadas ainda não ficaram disponíveis nesta conversa. A instalação não foi tratada como prova de autorização concluída. Não foram lidos valores de segredos, alteradas variáveis, aplicadas migrações ou acionado novo deploy.

Sem banco nesta sessão não foram testados login, administração, Storage ou produtos ativos carregados do Supabase. O carrinho preenchido foi validado por regras unitárias; a inspeção no navegador cobriu o estado vazio, pois a prévia não cria preços nem estoque. Ainda não há checkout, reserva ou pedido; totais locais são estimativas e deverão ser recalculados no servidor na etapa de vendas.

Conta do cliente e conteúdo institucional continuam em preparação. Avisos de fornecedor sem cadastro permanecem visíveis. Não se deve tratar a prévia como loja apta a vender. O aviso do Vitest sobre CommonJS/ESM permanece e não impediu a execução dos testes.
