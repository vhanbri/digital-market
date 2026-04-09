-- ============================================================
-- AniKo — Crop Images Migration
-- Run this in the Supabase SQL Editor
-- Prerequisite: Create a public 'crop-images' bucket in Storage
-- ============================================================

ALTER TABLE public.crops
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================================
-- Link uploaded images to crop records
-- Run this in the Supabase SQL Editor after the ALTER TABLE above
-- ============================================================

UPDATE public.crops SET image_url = 'https://hcsngtrhscsntoazapuo.supabase.co/storage/v1/object/public/crop-images/fresh-tomatoes.jpg' WHERE name = 'Organic Tomatoes';
UPDATE public.crops SET image_url = 'https://hcsngtrhscsntoazapuo.supabase.co/storage/v1/object/public/crop-images/fresh-strawberries.jpg' WHERE name = 'Highland Strawberries';
UPDATE public.crops SET image_url = 'https://hcsngtrhscsntoazapuo.supabase.co/storage/v1/object/public/crop-images/lettuce.jpg' WHERE name = 'Fresh Lettuce';
UPDATE public.crops SET image_url = 'https://hcsngtrhscsntoazapuo.supabase.co/storage/v1/object/public/crop-images/carrots.jpg' WHERE name = 'Carrots';
UPDATE public.crops SET image_url = 'https://hcsngtrhscsntoazapuo.supabase.co/storage/v1/object/public/crop-images/rice-grain.jpg' WHERE name = 'Basmati Rice';
UPDATE public.crops SET image_url = 'https://hcsngtrhscsntoazapuo.supabase.co/storage/v1/object/public/crop-images/jasmine-rice.jpg' WHERE name = 'Jasmine Rice';
UPDATE public.crops SET image_url = 'https://hcsngtrhscsntoazapuo.supabase.co/storage/v1/object/public/crop-images/sweet-corn.jpg' WHERE name = 'Sweet Corn';
UPDATE public.crops SET image_url = 'https://hcsngtrhscsntoazapuo.supabase.co/storage/v1/object/public/crop-images/red-onions.jpg' WHERE name = 'Red Onions';
UPDATE public.crops SET image_url = 'https://hcsngtrhscsntoazapuo.supabase.co/storage/v1/object/public/crop-images/bangus.jpg' WHERE name = 'Bangus (Milkfish)';
UPDATE public.crops SET image_url = 'https://hcsngtrhscsntoazapuo.supabase.co/storage/v1/object/public/crop-images/mango.jpg' WHERE name = 'Mangoes';
UPDATE public.crops SET image_url = 'https://hcsngtrhscsntoazapuo.supabase.co/storage/v1/object/public/crop-images/garlic.jpg' WHERE name = 'Garlic';
UPDATE public.crops SET image_url = 'https://hcsngtrhscsntoazapuo.supabase.co/storage/v1/object/public/crop-images/eggplant.jpg' WHERE name = 'Eggplant';
