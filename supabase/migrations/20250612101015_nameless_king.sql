/*
  # Fix British Parliamentary draws table schema

  1. New Tables
    - Update `draws` table to support British Parliamentary format
    - Add missing columns for Closing Government and Closing Opposition teams

  2. Changes
    - Add `cg_team_id` column for Closing Government team
    - Add `co_team_id` column for Closing Opposition team
    - Add foreign key constraints
    - Update existing data if needed

  3. Security
    - Maintain existing RLS policies
    - Ensure data integrity with proper constraints
*/

-- Add missing columns for British Parliamentary format
DO $$
BEGIN
  -- Add cg_team_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'draws' AND column_name = 'cg_team_id'
  ) THEN
    ALTER TABLE draws ADD COLUMN cg_team_id uuid;
    COMMENT ON COLUMN draws.cg_team_id IS 'Closing Government team ID for British Parliamentary format';
  END IF;

  -- Add co_team_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'draws' AND column_name = 'co_team_id'
  ) THEN
    ALTER TABLE draws ADD COLUMN co_team_id uuid;
    COMMENT ON COLUMN draws.co_team_id IS 'Closing Opposition team ID for British Parliamentary format';
  END IF;
END $$;

-- Add foreign key constraints
DO $$
BEGIN
  -- Add foreign key for cg_team_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'draws_cg_team_id_fkey' AND table_name = 'draws'
  ) THEN
    ALTER TABLE draws ADD CONSTRAINT draws_cg_team_id_fkey 
    FOREIGN KEY (cg_team_id) REFERENCES teams(id) ON DELETE SET NULL;
  END IF;

  -- Add foreign key for co_team_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'draws_co_team_id_fkey' AND table_name = 'draws'
  ) THEN
    ALTER TABLE draws ADD CONSTRAINT draws_co_team_id_fkey 
    FOREIGN KEY (co_team_id) REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update the draws table to ensure it has all necessary columns for BP format
DO $$
BEGIN
  -- Ensure tournament_id column exists and has proper constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'draws_tournament_id_fkey' AND table_name = 'draws'
  ) THEN
    ALTER TABLE draws ADD CONSTRAINT draws_tournament_id_fkey 
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for better performance on British Parliamentary queries
CREATE INDEX IF NOT EXISTS idx_draws_bp_teams ON draws(gov_team_id, opp_team_id, cg_team_id, co_team_id);
CREATE INDEX IF NOT EXISTS idx_draws_tournament_round ON draws(tournament_id, round_id);