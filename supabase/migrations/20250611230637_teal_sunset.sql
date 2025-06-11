/*
  # Add missing columns to draws table

  1. Changes
    - Add cg_team_id and co_team_id columns to draws table for British Parliamentary format
*/

-- Check if columns exist before adding them
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'draws' AND column_name = 'cg_team_id'
  ) THEN
    -- Add cg_team_id column
    ALTER TABLE draws ADD COLUMN cg_team_id UUID REFERENCES teams(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'draws' AND column_name = 'co_team_id'
  ) THEN
    -- Add co_team_id column
    ALTER TABLE draws ADD COLUMN co_team_id UUID REFERENCES teams(id);
  END IF;
END $$;