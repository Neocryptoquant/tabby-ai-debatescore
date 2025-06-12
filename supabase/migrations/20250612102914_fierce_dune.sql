/*
  # Fix British Parliamentary draws schema

  1. New Tables
    - Update `draws` table to properly support British Parliamentary format
    - Add missing columns for Closing Government and Closing Opposition teams

  2. Changes
    - Add `cg_team_id` column for Closing Government team (if not exists)
    - Add `co_team_id` column for Closing Opposition team (if not exists)
    - Add proper foreign key constraints
    - Add indexes for better performance

  3. Security
    - Maintain existing RLS policies
    - Ensure data integrity with proper constraints
*/

-- First, let's check the current structure and add missing columns
DO $$
BEGIN
  -- Add cg_team_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'draws' 
    AND column_name = 'cg_team_id'
  ) THEN
    ALTER TABLE public.draws ADD COLUMN cg_team_id uuid;
    RAISE NOTICE 'Added cg_team_id column to draws table';
  ELSE
    RAISE NOTICE 'cg_team_id column already exists in draws table';
  END IF;

  -- Add co_team_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'draws' 
    AND column_name = 'co_team_id'
  ) THEN
    ALTER TABLE public.draws ADD COLUMN co_team_id uuid;
    RAISE NOTICE 'Added co_team_id column to draws table';
  ELSE
    RAISE NOTICE 'co_team_id column already exists in draws table';
  END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  -- Add foreign key for cg_team_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
    AND table_name = 'draws'
    AND constraint_name = 'draws_cg_team_id_fkey'
  ) THEN
    ALTER TABLE public.draws ADD CONSTRAINT draws_cg_team_id_fkey 
    FOREIGN KEY (cg_team_id) REFERENCES public.teams(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added foreign key constraint for cg_team_id';
  ELSE
    RAISE NOTICE 'Foreign key constraint for cg_team_id already exists';
  END IF;

  -- Add foreign key for co_team_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
    AND table_name = 'draws'
    AND constraint_name = 'draws_co_team_id_fkey'
  ) THEN
    ALTER TABLE public.draws ADD CONSTRAINT draws_co_team_id_fkey 
    FOREIGN KEY (co_team_id) REFERENCES public.teams(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added foreign key constraint for co_team_id';
  ELSE
    RAISE NOTICE 'Foreign key constraint for co_team_id already exists';
  END IF;
END $$;

-- Create indexes for better performance on British Parliamentary queries
CREATE INDEX IF NOT EXISTS idx_draws_bp_teams ON public.draws(gov_team_id, opp_team_id, cg_team_id, co_team_id);
CREATE INDEX IF NOT EXISTS idx_draws_tournament_round ON public.draws(tournament_id, round_id);
CREATE INDEX IF NOT EXISTS idx_draws_cg_team ON public.draws(cg_team_id) WHERE cg_team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_draws_co_team ON public.draws(co_team_id) WHERE co_team_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.draws.cg_team_id IS 'Closing Government team ID for British Parliamentary format';
COMMENT ON COLUMN public.draws.co_team_id IS 'Closing Opposition team ID for British Parliamentary format';

-- Verify the schema changes
DO $$
DECLARE
  cg_exists boolean;
  co_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'draws' 
    AND column_name = 'cg_team_id'
  ) INTO cg_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'draws' 
    AND column_name = 'co_team_id'
  ) INTO co_exists;
  
  IF cg_exists AND co_exists THEN
    RAISE NOTICE 'SUCCESS: Both cg_team_id and co_team_id columns are now present in the draws table';
  ELSE
    RAISE EXCEPTION 'FAILED: Missing columns - cg_team_id: %, co_team_id: %', cg_exists, co_exists;
  END IF;
END $$;