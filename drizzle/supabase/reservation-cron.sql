-- Infraestrutura Supabase: aplicar depois da migração 0001 e da função privada.
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('doce-costura-expire-reservations', '* * * * *', 'select doce_costura_private.release_order_reservations()');
