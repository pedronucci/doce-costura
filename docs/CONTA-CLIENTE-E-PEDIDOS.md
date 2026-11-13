# Conta do cliente e criação de pedidos — 13/11/2026

## Entrega

- `/conta/criar`, `/conta/entrar`, saída, perfil, telefone e até 10 endereços por conta. O e-mail de acesso não é alterável no formulário de perfil.
- `/conta/pedidos` com paginação e detalhes acessíveis somente ao dono. Tentativas de acessar pedido ou endereço alheio são negadas no servidor.
- Recuperação e redefinição de senha implementadas pelo Better Auth; sem Resend/EMAIL_FROM, a recuperação é explicitamente indicada como indisponível. O fluxo completo foi testado com e-mail simulado. Nenhuma mensagem real foi enviada.
- Checkout autenticado escolhe endereço da própria conta, exige leitura das condições e cria pedido `awaiting_checkout` com reserva de 30 minutos. Não cria pagamento, entrega contratada ou venda concluída. Frete e total final ficam nulos e são exibidos como “a confirmar”, não como grátis.
- Preços vêm do banco, e a versão do subtotal vista na revisão precisa coincidir com a atual. Pedido guarda cópias de produto, preço e endereço. Atualizações no cadastro não mudam o histórico.
- Idempotência vinculada ao usuário e ao conteúdo evita reservas repetidas; cada conta pode ter uma reserva ativa por vez. Carrinho só remove as quantidades pedidas depois da resposta de sucesso, preservando outras escolhas.
- Bloqueio transacional compartilhado e atualização condicional impedem disputar a mesma unidade. A edição administrativa não pode reduzir estoque abaixo do reservado; uma restrição do banco também protege essa regra.
- Cancelamento pelo dono e expiração liberam unidades uma única vez, gerando histórico e movimentação de estoque. Reservas associadas a pagamento aprovado não são liberadas automaticamente.

## Migração e implantação

1. `drizzle/0001_conta_cliente_reservas.sql`: acrescenta estado/campos/índices de reserva e restrição de estoque; permite frete e total indefinidos. Inclui função privada de expiração/cancelamento com SECURITY INVOKER. Sem exclusão de dados; RLS existente mantida.
2. `drizzle/supabase/reservation-cron.sql`: habilita pg_cron e agenda a expiração a cada minuto. Processa até 1.000 reservas por execução. Também há conferência de expiração nas consultas/criação de pedido.
3. Publicar o código após aplicar os scripts. O histórico Drizzle precisa receber o SHA256 e timestamp da entrada 0001 quando a migração for aplicada pelo painel/MCP, para que `db:migrate` não a repita.

A função fica no schema `doce_costura_private`, sem execução/uso por PUBLIC, anon ou authenticated. A aplicação acessa o PostgreSQL exclusivamente pelo servidor; não foi criado RPC público nem política que libere dados de clientes.

Recuperação de implantação: preferir correção adiante. O enum e as cópias de pedidos devem ser preservados. Uma versão antiga que presuma total não nulo não deve ser restaurada sem adaptação, pois pedidos em preparação não têm frete ou total final. Desabilitar novas criações antes de qualquer intervenção e preservar reservas/histórico.

## Evidências

- 77 testes de regras e 18 testes de integração passaram.
- Integração usa PostgreSQL 17 local exclusivo, com dependência de desenvolvimento fixa `embedded-postgres`. Nunca usa a URL do Supabase. O cluster é encerrado e seu diretório exclusivo é removido após a execução.
- Testes incluem última unidade disputada, solicitações simultâneas repetidas, conteúdo adulterado, endereço alheio, snapshot, rollback em falha, expiração/cancelamento repetidos, pagamento aprovado, isolamento de pedidos, papel administrativo forjado e redefinição que revoga sessões anteriores.
- Navegador local com dados sintéticos: cadastro, endereço, adição ao carrinho, revisão, criação, cancelamento, saída e novo login passaram. Tela de pedido mobile sem transbordamento horizontal. Ajustados os limites de renderização/cache do Next 16 para conteúdo de sessão.
- Build, TypeScript e lint passaram. A vitrine revalida o catálogo a cada 30 segundos, com conferência autoritativa sem cache antes de reservar.
- Nenhum cliente/endereço/pedido de teste foi criado em produção. A conta administrativa do responsável não foi utilizada.

## Próximas dependências

Resend e domínio remetente para recuperação real; verificação do e-mail antes dos próximos fluxos financeiros; cotação de frete, criação e reconciliação de pagamentos e tratamento de aprovação após expiração. A etapa atual não aceita cobranças, webhooks ou liberação manual de mercadoria. CPF, cupons, favoritos sincronizados e exclusão/exportação de conta não foram acrescentados.
