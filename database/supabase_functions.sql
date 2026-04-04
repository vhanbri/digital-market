-- ============================================================
-- AniKo — Supabase Database Functions
-- Run this AFTER supabase_migration.sql
-- ============================================================

-- ============================================================
-- 1. place_order — Transactional order creation
--    Called via: supabase.rpc('place_order', { p_items: [...] })
--    p_items is a JSONB array: [{ "crop_id": "uuid", "quantity": 1 }, ...]
-- ============================================================

CREATE OR REPLACE FUNCTION public.place_order(p_items JSONB)
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

  -- Create the order
  INSERT INTO public.orders (buyer_id, status, total_price)
  VALUES (v_buyer_id, 'pending', v_total)
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

-- ============================================================
-- 2. admin_update_order_status — Admin-only status update
--    Called via: supabase.rpc('admin_update_order_status', { ... })
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_update_order_status(
  p_order_id UUID,
  p_status   TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_admin_id UUID := auth.uid();
  v_role     TEXT;
  v_order    RECORD;
  v_result   JSONB;
BEGIN
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role::TEXT INTO v_role FROM public.profiles WHERE id = v_admin_id;
  IF v_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can update order status';
  END IF;

  IF p_status NOT IN ('pending', 'accepted', 'rejected', 'delivered') THEN
    RAISE EXCEPTION 'Invalid status: %', p_status;
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  UPDATE public.orders
  SET status = p_status::public.order_status
  WHERE id = p_order_id;

  SELECT jsonb_build_object(
    'id', o.id,
    'buyer_id', o.buyer_id,
    'status', o.status,
    'total_price', o.total_price,
    'created_at', o.created_at,
    'updated_at', o.updated_at
  ) INTO v_result
  FROM public.orders o
  WHERE o.id = p_order_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
