-- Migration: Add favorite feature to generations table
-- Run this in your Supabase SQL Editor

-- Add is_favorite column
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;

-- Add update policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'generations' 
    AND policyname = 'Users can update own generations'
  ) THEN
    CREATE POLICY "Users can update own generations" ON public.generations
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add delete policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'generations' 
    AND policyname = 'Users can delete own generations'
  ) THEN
    CREATE POLICY "Users can delete own generations" ON public.generations
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add reason column to transactions for refunds
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS reason text;
