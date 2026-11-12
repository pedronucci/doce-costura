# Revisão da compra e consulta de pedidos

Entrega de 12/11/2026. O administrador já foi criado pelo responsável pela loja.

## Fluxo entregue

1. No carrinho, peças disponíveis permitem abrir **Revisar escolhas** (`/checkout`).
2. **Conferir minhas peças** envia somente IDs das variações e quantidades à API `/api/checkout/revisao`.
3. O servidor consulta produtos ativos e variações ativas diretamente no PostgreSQL, sem usar o cache da vitrine. Recalcula o subtotal em centavos e confere estoque descontando unidades reservadas.
4. Peça indisponível, quantidade excessiva ou preço pendente exigem ajuste do carrinho. Com qualquer erro, não há subtotal consolidado. Frete e total final ficam indefinidos, nunca tratados como gratuitos.
5. O painel ganha **Pedidos** (`/admin/pedidos`), com filtro por número e situação, paginação e detalhes de itens, cliente, endereço, pagamento, entrega e histórico.

O painel exibe os dados registrados no pedido, preservando o histórico quando o catálogo mudar. Não possui ações de aprovação manual de pagamento, reembolso ou compra de etiqueta. Listagem e detalhes exigem sessão de equipe/admin antes de acessar os dados. Dados de pagamento sensíveis e CPF não são exibidos nesta consulta.

## Proteções e limites

- API aceita de 1 a 50 modelos distintos e de 1 a 99 unidades por modelo. Rejeita preços, frete e totais enviados pelo navegador.
- Corpo limitado a 8 KiB, inclusive sem Content-Length. Limite de 30 revisões por minuto por IP pelo mecanismo PostgreSQL já existente.
- Respostas sem cache. Falhas internas retornam mensagem genérica e preservam o carrinho.
- A revisão é uma fotografia da disponibilidade, não uma reserva. A futura confirmação deverá verificar novamente preço/estoque e reservar atomicamente.
- Sem novas tabelas, migrações, dependências ou mudanças nas permissões do Supabase.

## Verificações

- 49 testes automatizados passaram, incluindo centavos, preço alterado, estoque reservado, itens repetidos, limites de entrada, falha de banco, limitação de requisições e autorização permitida/negada nos pedidos.
- `npm run typecheck`, `npm run lint` e `npm run build` passaram.
- Build local servido em modo de produção: `/checkout` respondeu 200; páginas de pedidos anônimas redirecionaram para login; revisão de produto real “em breve” retornou impedimento de compra e total indefinido; envio de total adulterado foi rejeitado com 400.
- Navegador: página de revisão com carrinho vazio e navegação renderizadas sem erros de console.
- A consulta autenticada no banco real não foi exercitada com a conta do usuário. Permissões foram verificadas com testes simulados e acesso anônimo real.
- A tela com carrinho disponível foi implementada; cálculo e falhas foram verificados por testes automatizados. Como os produtos atuais estão “em breve”, não foram ativados produtos nem alterados preços/estoque para forçar uma compra de teste.

## Próximas partes

O responsável informou que ainda não tem Mercado Pago nem Melhor Envio. Após criar essas contas, integrar primeiro os ambientes de teste; cadastrar credenciais diretamente no ambiente, nunca no código/chat.

Continuam pendentes: cadastro do cliente/endereço, criação idempotente de pedido, reserva transacional com expiração, confirmação e reconciliação por webhook, frete, pagamento, conta do cliente, configurações empresariais e textos institucionais. Nenhum pedido, cobrança, reserva ou etiqueta foi criado nesta entrega. A loja permanece como vitrine.
