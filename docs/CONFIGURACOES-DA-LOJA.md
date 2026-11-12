# Configurações da loja

O painel `/admin/configuracoes` permite cadastrar razão social, CNPJ, endereço público, e-mail, telefone, horários de atendimento, WhatsApp, mensagem inicial, Instagram, até três mensagens da barra e CEP de origem dos envios.

- Somente administradores podem ler o formulário e salvar. A página, a ação e a camada de persistência exigem autorização no servidor.
- Reutiliza a linha `default` da tabela `store_settings`, sem migrações. Atualiza somente os campos do formulário; preserva configurações de pagamento, analytics e integrações existentes.
- A gravação e a auditoria usam a mesma transação. O controle de versão e um bloqueio transacional impedem a sobrescrita silenciosa entre duas abas.
- Somente dados públicos são projetados para a vitrine. O CEP de origem fica restrito ao painel e não ativa frete.
- Após salvar, o cache da vitrine é invalidado. Rodapé, WhatsApp, Instagram e barra passam a usar as informações cadastradas. Campos vazios removem contatos opcionais; dados empresariais ausentes continuam identificados como pendentes.
- O formulário preserva os campos digitados quando ocorre erro. Não inclui campos para senhas ou chaves.
- A validação de CNPJ confere formato; não consulta situação cadastral. O endereço público pode ser diferente do local de postagem.

## Validação

70 testes automatizados passaram, incluindo entrada inválida, links maliciosos, autorização negada, gravação permitida, conflito de versão, auditoria e atualização do cache. TypeScript, ESLint e build de produção foram executados com sucesso. O build confirmou a leitura da tabela real existente.

O salvamento autenticado foi verificado com banco e sessão simulados nos testes; a conta real do administrador não foi utilizada. Nenhum dado empresarial ou contato fictício foi gravado em produção. O responsável deve preencher os dados reais pelo painel após publicar.
