-- Add confirmation tracking columns to ballots table
ALTER TABLE ballots 
ADD COLUMN IF NOT EXISTS confirmed_by TEXT,
ADD COLUMN IF NOT EXISTS confirmed_time TIMESTAMP WITH TIME ZONE;

-- Add index for confirmation queries
CREATE INDEX IF NOT EXISTS idx_ballots_confirmed_by ON ballots(confirmed_by);
CREATE INDEX IF NOT EXISTS idx_ballots_confirmed_time ON ballots(confirmed_time);

-- Add comment for documentation
COMMENT ON COLUMN ballots.confirmed_by IS 'Name or identifier of the person who confirmed this ballot';
COMMENT ON COLUMN ballots.confirmed_time IS 'Timestamp when the ballot was confirmed'; 