-- ============================================================
-- Seed Users
-- Passwords: admin123, farmer123, buyer123
-- ============================================================

INSERT INTO users (name, email, password_hash, role, location) VALUES
  ('Admin User',      'image.png@aniko.ph',        '$2b$10$8v3q9YT6jtf5OdXQrJcvHugDm6HAfFTEFUpRTnRvkyvISZ/Tr/BuO', 'admin',  'Cebu City'),
  ('Juan dela Cruz',  'juan@farm.com',         '$2b$10$esuipom5Bi2GlNZ2vxJVUOl8VKfJr/O.oUzFR/47biVDwLwqvtY7q', 'farmer', 'Dalaguete'),
  ('Maria Santos',    'maria@farm.com',        '$2b$10$esuipom5Bi2GlNZ2vxJVUOl8VKfJr/O.oUzFR/47biVDwLwqvtY7q', 'farmer', 'Argao'),
  ('Pedro Reyes',     'pedro@farm.com',        '$2b$10$esuipom5Bi2GlNZ2vxJVUOl8VKfJr/O.oUzFR/47biVDwLwqvtY7q', 'farmer', 'Barili'),
  ('Ana Garcia',      'ana@buyer.com',         '$2b$10$BkxBcspriQWx54pkSckcy.BAm/tRGdzehxQk97LwxroH9YYAyeRYG', 'buyer',  'Cebu City'),
  ('Carlos Lim',      'carlos@buyer.com',      '$2b$10$BkxBcspriQWx54pkSckcy.BAm/tRGdzehxQk97LwxroH9YYAyeRYG', 'buyer',  'Mandaue'),
  ('Sofia Tan',       'sofia@buyer.com',       '$2b$10$BkxBcspriQWx54pkSckcy.BAm/tRGdzehxQk97LwxroH9YYAyeRYG', 'buyer',  'Lapu-Lapu')
ON CONFLICT (email) DO NOTHING;
