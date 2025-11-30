-- Fix ALL potential missing columns
-- Run this in Supabase SQL Editor

-- 1. Ensure 'generations' table has all columns
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS input_context jsonb,
ADD COLUMN IF NOT EXISTS output_copy jsonb,
ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;

-- 2. Ensure 'transactions' table has all columns
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS reason text;

-- 3. Force schema cache reload
NOTIFY pgrst, 'reload config';
