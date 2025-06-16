ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS links JSONB;
COMMENT ON COLUMN tournaments.links IS 'Optional array of {label, url} objects for tournament info links'; 