/*
  # Add British Parliamentary columns to draws table

  1. Changes
    - Add `cg_team_id` column for Closing Government team
    - Add `co_team_id` column for Closing Opposition team
    - Add foreign key constraints for the new columns
    - Update existing draws to have proper structure

  2. Security
    - Maintain existing RLS policies
    - Ensure foreign key integrity
*/

-- Add the missing columns for British Parliamentary format
DO $$
BEGIN
  -- Add cg_team_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'draws' AND column_name = 'cg_team_id'
  ) THEN
    ALTER TABLE draws ADD COLUMN cg_team_id uuid;
  END IF;

  -- Add co_team_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'draws' AND column_name = 'co_team_id'
  ) THEN
    ALTER TABLE draws ADD COLUMN co_team_id uuid;
  END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  -- Add foreign key for cg_team_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'draws_cg_team_id_fkey'
  ) THEN
    ALTER TABLE draws ADD CONSTRAINT draws_cg_team_id_fkey 
    FOREIGN KEY (cg_team_id) REFERENCES teams(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for co_team_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'draws_co_team_id_fkey'
  ) THEN
    ALTER TABLE draws ADD CONSTRAINT draws_co_team_id_fkey 
    FOREIGN KEY (co_team_id) REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
END $$;