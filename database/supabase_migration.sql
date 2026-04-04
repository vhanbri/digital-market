-- ============================================================
-- AniKo — Supabase Migration
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ============================================================
-- 1. Custom ENUM types
-- ============================================================

CREATE TYPE public.user_role AS ENUM ('farmer', 'buyer', 'admin');
CREATE TYPE public.order_status AS ENUM ('pending', 'accepted', 'rejected', 'delivered');

-- ============================================================
-- 2. Utility: auto-update updated_at on row modification
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. Profiles (replaces the old users table)
--    Linked 1:1 to auth.users via id
-- ============================================================

CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        VARCHAR(120)  NOT NULL,
  email       VARCHAR(255)  NOT NULL,
  role        public.user_role NOT NULL DEFAULT 'buyer',
  location    VARCHAR(255),
  phone       VARCHAR(30),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_profiles_email UNIQUE (email)
);

CREATE INDEX idx_profiles_role ON public.profiles (role);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 4. Auto-create a profile row when a new auth user signs up
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, location, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'buyer'),
    NEW.raw_user_meta_data ->> 'location',
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. Helper: get the current user's role
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 6. Crops
-- ============================================================

CREATE TABLE public.crops (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id    UUID           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         VARCHAR(200)   NOT NULL,
  description  TEXT,
  price        NUMERIC(12,2)  NOT NULL CHECK (price >= 0),
  quantity     INTEGER        NOT NULL CHECK (quantity >= 0),
  harvest_date DATE,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crops_farmer_id ON public.crops (farmer_id);
CREATE INDEX idx_crops_name      ON public.crops (name);

CREATE TRIGGER trg_crops_updated_at
  BEFORE UPDATE ON public.crops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 7. Orders
-- ============================================================

CREATE TABLE public.orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id    UUID           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      public.order_status NOT NULL DEFAULT 'pending',
  total_price NUMERIC(12,2)  NOT NULL CHECK (total_price >= 0),
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer_id ON public.orders (buyer_id);
CREATE INDEX idx_orders_status   ON public.orders (status);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 8. Order Items
-- ============================================================

CREATE TABLE public.order_items (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID          NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  crop_id  UUID          NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
  quantity INTEGER       NOT NULL CHECK (quantity > 0),
  price    NUMERIC(12,2) NOT NULL CHECK (price >= 0)
);

CREATE INDEX idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX idx_order_items_crop_id  ON public.order_items (crop_id);

-- ============================================================
-- 9. Row Level Security Policies
-- ============================================================

-- Profiles ---------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Crops ------------------------------------------------------
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read crops"
  ON public.crops FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert crops"
  ON public.crops FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update crops"
  ON public.crops FOR UPDATE
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can delete crops"
  ON public.crops FOR DELETE
  USING (public.get_user_role() = 'admin');

-- Orders -----------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Admins can read all orders"
  ON public.orders FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Buyers can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- Order Items ------------------------------------------------
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can read own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.buyer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all order items"
  ON public.order_items FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Order items insertable via place_order function"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.buyer_id = auth.uid()
    )
  );
