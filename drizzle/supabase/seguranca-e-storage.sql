-- =============================================================================
-- Doce Costura — ajustes específicos do Supabase
-- Rodar DEPOIS de drizzle/0000_inicial.sql (e de cada nova migração).
-- =============================================================================

-- 1) Bloqueia o acesso às tabelas pela API pública do Supabase (Data API).
--    A loja acessa o banco apenas pelo servidor, com o usuário "postgres",
--    que não é afetado por RLS. Sem políticas = nenhum acesso via anon/authenticated.
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;

-- 2) Bucket público para as fotos dos produtos.
--    Leitura pública (as fotos aparecem na loja); envio apenas pelo servidor,
--    com a chave service_role, que nunca vai para o navegador.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
