-- Fix missing columns in generations table
-- Run this in Supabase SQL Editor

-- 1. Add image_url if it doesn't exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Add is_favorite if it doesn't exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;

-- 3. Force schema cache reload by notifying (optional, but good practice)
NOTIFY pgrst, 'reload config';
