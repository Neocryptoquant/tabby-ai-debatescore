-- Create team_standings table
CREATE TABLE IF NOT EXISTS team_standings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  total_points DECIMAL(5,2) DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_debates INTEGER DEFAULT 0,
  average_points DECIMAL(5,2) DEFAULT 0,
  average_rank DECIMAL(3,2) DEFAULT 0,
  total_ranks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, tournament_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_standings_tournament ON team_standings(tournament_id);
CREATE INDEX IF NOT EXISTS idx_team_standings_team ON team_standings(team_id);
CREATE INDEX IF NOT EXISTS idx_team_standings_points ON team_standings(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_team_standings_wins ON team_standings(total_wins DESC);

-- Add RLS policies
ALTER TABLE team_standings ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to team standings" ON team_standings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert/update for service role (via edge functions)
CREATE POLICY "Allow service role to manage team standings" ON team_standings
  FOR ALL USING (auth.role() = 'service_role');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_standings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_standings_updated_at
  BEFORE UPDATE ON team_standings
  FOR EACH ROW
  EXECUTE FUNCTION update_team_standings_updated_at(); 