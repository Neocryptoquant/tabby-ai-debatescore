-- Add links column to tournaments table for storing info links
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS links JSONB;
-- Optionally, add a comment for documentation
COMMENT ON COLUMN tournaments.links IS 'Optional array of {label, url} objects for tournament info links'; 