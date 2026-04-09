-- ============================================================
-- AniKo — Order Delivery Enhancement Migration
-- Run this AFTER supabase_migration.sql and supabase_functions.sql
-- ============================================================

-- ============================================================
-- 1. Add delivery info columns to orders table
-- ============================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_name    VARCHAR(200),
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS delivery_phone   VARCHAR(30),
  ADD COLUMN IF NOT EXISTS delivery_notes   TEXT;

-- ============================================================
-- 2. Replace place_order function — auto-accepts valid orders
--    and stores delivery information
-- ============================================================

CREATE OR REPLACE FUNCTION public.place_order(
  p_items            JSONB,
  p_delivery_name    TEXT DEFAULT NULL,
  p_delivery_address TEXT DEFAULT NULL,
  p_delivery_phone   TEXT DEFAULT NULL,
  p_delivery_notes   TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_buyer_id   UUID := auth.uid();
  v_order_id   UUID;
  v_total      NUMERIC(12,2) := 0;
  v_item       RECORD;
  v_crop       RECORD;
  v_crop_id    UUID;
  v_qty        INTEGER;
  v_line_price NUMERIC(12,2);
  v_result     JSONB;
BEGIN
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF (SELECT role FROM public.profiles WHERE id = v_buyer_id) != 'buyer' THEN
    RAISE EXCEPTION 'Only buyers can place orders';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  -- First pass: validate all items and compute total
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(crop_id UUID, quantity INTEGER)
  LOOP
    v_crop_id := v_item.crop_id;
    v_qty     := v_item.quantity;

    IF v_qty IS NULL OR v_qty <= 0 THEN
      RAISE EXCEPTION 'Quantity must be positive for crop %', v_crop_id;
    END IF;

    SELECT * INTO v_crop FROM public.crops WHERE id = v_crop_id FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Crop % not found', v_crop_id;
    END IF;

    IF v_crop.quantity < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for %. Available: %, Requested: %', v_crop.name, v_crop.quantity, v_qty;
    END IF;

    v_total := v_total + (v_crop.price * v_qty);
  END LOOP;

  -- Create the order — auto-accepted since all validations passed
  INSERT INTO public.orders (buyer_id, status, total_price, delivery_name, delivery_address, delivery_phone, delivery_notes)
  VALUES (v_buyer_id, 'accepted', v_total, p_delivery_name, p_delivery_address, p_delivery_phone, p_delivery_notes)
  RETURNING id INTO v_order_id;

  -- Second pass: insert items and decrement stock
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(crop_id UUID, quantity INTEGER)
  LOOP
    v_crop_id := v_item.crop_id;
    v_qty     := v_item.quantity;

    SELECT price INTO v_line_price FROM public.crops WHERE id = v_crop_id;

    INSERT INTO public.order_items (order_id, crop_id, quantity, price)
    VALUES (v_order_id, v_crop_id, v_qty, v_line_price);

    UPDATE public.crops
    SET quantity = quantity - v_qty
    WHERE id = v_crop_id;
  END LOOP;

  -- Build result
  SELECT jsonb_build_object(
    'id', o.id,
    'buyer_id', o.buyer_id,
    'status', o.status,
    'total_price', o.total_price,
    'delivery_name', o.delivery_name,
    'delivery_address', o.delivery_address,
    'delivery_phone', o.delivery_phone,
    'delivery_notes', o.delivery_notes,
    'created_at', o.created_at,
    'updated_at', o.updated_at,
    'items', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id', oi.id,
        'order_id', oi.order_id,
        'crop_id', oi.crop_id,
        'quantity', oi.quantity,
        'price', oi.price
      )) FROM public.order_items oi WHERE oi.order_id = o.id),
      '[]'::jsonb
    )
  ) INTO v_result
  FROM public.orders o
  WHERE o.id = v_order_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
