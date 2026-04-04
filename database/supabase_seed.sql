-- ============================================================
-- AniKo — Supabase Seed Data
-- Run this AFTER supabase_migration.sql and supabase_functions.sql
--
-- IMPORTANT: You must first create users via Supabase Auth.
-- This file only seeds crops and sample orders.
--
-- Step 1: Create users via Supabase Dashboard > Authentication:
--   - Admin:  admin@aniko.ph / admin123  (then run the admin role update below)
--   - Buyer:  ana@buyer.com  / buyer123
--   - Buyer:  carlos@buyer.com / buyer123
--   - Buyer:  sofia@buyer.com / buyer123
--
-- Step 2: After users are created, update the admin's role:
-- ============================================================

-- Update admin role (must be run after creating admin@aniko.ph via Auth)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@aniko.ph';

-- ============================================================
-- Seed Crops (linked to admin user as farmer_id)
-- ============================================================

INSERT INTO public.crops (farmer_id, name, description, price, quantity, harvest_date) VALUES
  ((SELECT id FROM public.profiles WHERE email = 'admin@aniko.ph'),
   'Organic Tomatoes', 'Vine-ripened organic tomatoes grown without pesticides.', 4.50, 120, '2026-04-15'),
  ((SELECT id FROM public.profiles WHERE email = 'admin@aniko.ph'),
   'Highland Strawberries', 'Sweet strawberries from the highlands of Cebu.', 8.00, 80, '2026-04-01'),
  ((SELECT id FROM public.profiles WHERE email = 'admin@aniko.ph'),
   'Fresh Lettuce', 'Crisp iceberg and romaine lettuce mix.', 3.00, 200, '2026-03-25'),
  ((SELECT id FROM public.profiles WHERE email = 'admin@aniko.ph'),
   'Carrots', 'Fresh orange carrots, naturally grown.', 2.50, 300, '2026-04-10'),
  ((SELECT id FROM public.profiles WHERE email = 'admin@aniko.ph'),
   'Basmati Rice', 'Premium long-grain basmati rice from local paddies.', 6.00, 500, NULL),
  ((SELECT id FROM public.profiles WHERE email = 'admin@aniko.ph'),
   'Jasmine Rice', 'Fragrant jasmine rice, freshly milled.', 5.50, 600, NULL),
  ((SELECT id FROM public.profiles WHERE email = 'admin@aniko.ph'),
   'Sweet Corn', 'Fresh sweet corn harvested at peak sweetness.', 2.00, 300, '2026-04-20'),
  ((SELECT id FROM public.profiles WHERE email = 'admin@aniko.ph'),
   'Red Onions', 'Locally grown red onions, perfect for cooking.', 3.50, 250, '2026-04-05'),
  ((SELECT id FROM public.profiles WHERE email = 'admin@aniko.ph'),
   'Bangus (Milkfish)', 'Fresh bangus from Cebu fish farms.', 12.00, 100, '2026-03-30'),
  ((SELECT id FROM public.profiles WHERE email = 'admin@aniko.ph'),
   'Mangoes', 'Sweet Carabao mangoes, the best in the Philippines.', 7.00, 150, '2026-05-01'),
  ((SELECT id FROM public.profiles WHERE email = 'admin@aniko.ph'),
   'Garlic', 'Pungent garlic bulbs, sun-dried and ready for market.', 4.00, 400, '2026-04-12'),
  ((SELECT id FROM public.profiles WHERE email = 'admin@aniko.ph'),
   'Eggplant', 'Long purple eggplants, freshly harvested.', 2.80, 180, '2026-04-08');
