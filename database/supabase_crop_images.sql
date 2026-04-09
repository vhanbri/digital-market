-- ============================================================
-- AniKo — Crop Images Migration
-- Run this in the Supabase SQL Editor
-- Prerequisite: Create a public 'crop-images' bucket in Storage
-- ============================================================

ALTER TABLE public.crops
  ADD COLUMN IF NOT EXISTS image_url TEXT;
