-- Add rooms support to rounds table
-- First rename default_rooms to rooms if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rounds' AND column_name = 'default_rooms') THEN
        ALTER TABLE rounds RENAME COLUMN default_rooms TO rooms;
    END IF;
END $$;

-- Add rooms column if it doesn't exist
ALTER TABLE rounds 
ADD COLUMN IF NOT EXISTS rooms jsonb DEFAULT '["Room A"]'::jsonb,
ADD COLUMN IF NOT EXISTS is_motion_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_info_slide_public boolean DEFAULT false;

-- Add index for rooms queries
CREATE INDEX IF NOT EXISTS idx_rounds_rooms ON rounds USING GIN (rooms);

-- Add comments for documentation
COMMENT ON COLUMN rounds.rooms IS 'Array of room names for this round';
COMMENT ON COLUMN rounds.is_motion_public IS 'Whether the motion is visible to public access';
COMMENT ON COLUMN rounds.is_info_slide_public IS 'Whether the info slide is visible to public access'; 