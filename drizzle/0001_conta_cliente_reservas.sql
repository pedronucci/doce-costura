ALTER TYPE "public"."order_status" ADD VALUE 'awaiting_checkout' BEFORE 'pending_payment';--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "shipping_cents" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "total_cents" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "request_hash" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "reservation_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "reservation_released_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "order_user_created_idx" ON "order" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "order_reservation_expiry_idx" ON "order" USING btree ("status","reservation_expires_at");--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "variant_stock_integrity" CHECK ("product_variant"."stock" >= 0 and "product_variant"."reserved" >= 0 and "product_variant"."reserved" <= "product_variant"."stock");
--> statement-breakpoint
-- Executado após a migração 0001. Sem SECURITY DEFINER e sem acesso pela API pública.
CREATE SCHEMA IF NOT EXISTS doce_costura_private;
REVOKE ALL ON SCHEMA doce_costura_private FROM PUBLIC;

CREATE OR REPLACE FUNCTION doce_costura_private.release_order_reservations(
  p_order_id uuid DEFAULT NULL, p_user_id text DEFAULT NULL
) RETURNS integer LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog, public AS $$
DECLARE
  target record;
  line record;
  released integer := 0;
  changed integer;
BEGIN
  IF p_order_id IS NOT NULL AND p_user_id IS NULL THEN
    RAISE EXCEPTION 'An owner is required for cancellation';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('doce-costura:inventory-reservations'));
  FOR target IN
    SELECT o.id, o.user_id FROM public."order" o
    WHERE o.status::text = 'awaiting_checkout' AND o.reservation_released_at IS NULL
      AND ((p_order_id IS NULL AND o.reservation_expires_at <= clock_timestamp())
        OR (o.id = p_order_id AND o.user_id = p_user_id))
      AND NOT EXISTS (SELECT 1 FROM public.payment p WHERE p.order_id = o.id AND p.status::text = 'approved')
    ORDER BY o.id LIMIT 1000 FOR UPDATE
  LOOP
    FOR line IN SELECT i.variant_id, i.quantity FROM public.order_item i WHERE i.order_id = target.id ORDER BY i.variant_id
    LOOP
      UPDATE public.product_variant SET reserved = reserved - line.quantity, updated_at = clock_timestamp()
        WHERE id = line.variant_id AND reserved >= line.quantity;
      GET DIAGNOSTICS changed = ROW_COUNT;
      IF changed <> 1 THEN RAISE EXCEPTION 'Reservation integrity violation'; END IF;
      INSERT INTO public.stock_movement (variant_id, delta, reason, order_id, actor_id)
        VALUES (line.variant_id, line.quantity, 'order_released', target.id, p_user_id);
    END LOOP;
    UPDATE public."order" SET status = 'canceled', reservation_released_at = clock_timestamp(), updated_at = clock_timestamp() WHERE id = target.id;
    INSERT INTO public.order_event (order_id, type, message, actor_id)
      VALUES (target.id, CASE WHEN p_order_id IS NULL THEN 'reservation.expired' ELSE 'reservation.canceled' END,
        CASE WHEN p_order_id IS NULL THEN 'Reserva expirada. As unidades foram liberadas.' ELSE 'Reserva cancelada pelo cliente. As unidades foram liberadas.' END, p_user_id);
    released := released + 1;
  END LOOP;
  RETURN released;
END;
$$;
REVOKE ALL ON FUNCTION doce_costura_private.release_order_reservations(uuid,text) FROM PUBLIC;
