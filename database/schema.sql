-- ============================================================
-- AniKo Database Schema
-- PostgreSQL 13+
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Custom ENUM types
-- ============================================================

CREATE TYPE user_role AS ENUM ('farmer', 'buyer', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'rejected', 'delivered');

-- ============================================================
-- Utility: auto-update updated_at on row modification
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Users
-- ============================================================

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(120)  NOT NULL,
  email       VARCHAR(255)  NOT NULL,
  password_hash TEXT        NOT NULL,
  role        user_role     NOT NULL DEFAULT 'buyer',
  location    VARCHAR(255),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX idx_users_role ON users (role);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Crops
-- ============================================================

CREATE TABLE crops (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id    UUID           NOT NULL,
  name         VARCHAR(200)   NOT NULL,
  description  TEXT,
  price        NUMERIC(12,2)  NOT NULL CHECK (price >= 0),
  quantity     INTEGER        NOT NULL CHECK (quantity >= 0),
  harvest_date DATE,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_crops_farmer
    FOREIGN KEY (farmer_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE INDEX idx_crops_farmer_id ON crops (farmer_id);
CREATE INDEX idx_crops_name      ON crops (name);

CREATE TRIGGER trg_crops_updated_at
  BEFORE UPDATE ON crops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Orders
-- ============================================================

CREATE TABLE orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id    UUID           NOT NULL,
  status      order_status   NOT NULL DEFAULT 'pending',
  total_price NUMERIC(12,2)  NOT NULL CHECK (total_price >= 0),
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_orders_buyer
    FOREIGN KEY (buyer_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE INDEX idx_orders_buyer_id ON orders (buyer_id);
CREATE INDEX idx_orders_status   ON orders (status);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Order Items
-- ============================================================

CREATE TABLE order_items (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID          NOT NULL,
  crop_id  UUID          NOT NULL,
  quantity INTEGER       NOT NULL CHECK (quantity > 0),
  price    NUMERIC(12,2) NOT NULL CHECK (price >= 0),

  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE,

  CONSTRAINT fk_order_items_crop
    FOREIGN KEY (crop_id) REFERENCES crops (id)
    ON DELETE RESTRICT
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_crop_id  ON order_items (crop_id);
