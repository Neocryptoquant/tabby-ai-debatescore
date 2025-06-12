/*
  # Ballot System Implementation

  1. New Tables
    - `ballot_sessions` - Unique check-in sessions for judges
    - `ballots` - Individual ballot submissions for each draw
    - `speaker_scores` - Individual speaker scores and feedback
    - `judge_feedback` - Feedback between judges on panels
    - `ballot_templates` - Format-specific scoring templates
    - `adjudication_panels` - Panel composition for each draw

  2. Security
    - Enable RLS on all new tables
    - Add policies for judges to access their own ballots
    - Add policies for tournament organizers to view all ballots
    - Secure ballot submission process

  3. Features
    - Support for multiple debate formats (BP, WSDC, AP, CP)
    - Speaker scoring with detailed feedback
    - Judge panel feedback system
    - Ballot validation and submission tracking
    - Anonymous ballot access via secure tokens
*/

-- Create ballot templates for different formats
CREATE TABLE IF NOT EXISTS ballot_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  format text NOT NULL, -- 'bp', 'wsdc', 'ap', 'cp'
  name text NOT NULL,
  speaker_positions jsonb NOT NULL, -- Array of speaker positions
  scoring_criteria jsonb NOT NULL, -- Scoring rules and ranges
  feedback_fields jsonb NOT NULL, -- Required feedback fields
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ballot sessions for secure judge access
CREATE TABLE IF NOT EXISTS ballot_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  judge_id uuid NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  round_id uuid NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  access_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(judge_id, round_id)
);

-- Create adjudication panels
CREATE TABLE IF NOT EXISTS adjudication_panels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id uuid NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  chair_judge_id uuid REFERENCES judges(id) ON DELETE SET NULL,
  panel_judges jsonb DEFAULT '[]'::jsonb, -- Array of judge IDs
  panel_composition text DEFAULT 'solo', -- 'solo', 'panel', 'trainee'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(draw_id)
);

-- Create ballots table
CREATE TABLE IF NOT EXISTS ballots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id uuid NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  judge_id uuid NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  session_id uuid REFERENCES ballot_sessions(id) ON DELETE SET NULL,
  template_id uuid REFERENCES ballot_templates(id) ON DELETE SET NULL,
  
  -- Ballot metadata
  status text DEFAULT 'draft', -- 'draft', 'submitted', 'confirmed', 'discarded'
  submission_time timestamptz,
  is_chair_ballot boolean DEFAULT false,
  
  -- Team rankings and results
  team_rankings jsonb DEFAULT '[]'::jsonb, -- Ordered array of team IDs
  winning_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  
  -- Motion and debate info
  motion_text text,
  info_slide text,
  
  -- Overall feedback
  debate_quality_score integer CHECK (debate_quality_score >= 1 AND debate_quality_score <= 10),
  general_feedback text,
  
  -- Technical details
  ip_address inet,
  user_agent text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(draw_id, judge_id)
);

-- Create speaker scores table
CREATE TABLE IF NOT EXISTS speaker_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ballot_id uuid NOT NULL REFERENCES ballots(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  speaker_name text NOT NULL,
  speaker_position integer NOT NULL, -- 1, 2, 3 (for WSDC)
  team_position text NOT NULL, -- 'OG', 'OO', 'CG', 'CO' for BP; 'Prop', 'Opp' for others
  
  -- Scoring
  score numeric(4,1) NOT NULL,
  rank integer, -- Speaker rank within the debate
  
  -- Detailed feedback
  content_score numeric(3,1),
  style_score numeric(3,1),
  strategy_score numeric(3,1),
  
  -- Feedback text
  strengths text,
  areas_for_improvement text,
  specific_feedback text,
  
  -- POI feedback (for formats that use them)
  poi_offered integer DEFAULT 0,
  poi_accepted integer DEFAULT 0,
  poi_quality_score numeric(3,1),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create judge feedback table (for panel feedback)
CREATE TABLE IF NOT EXISTS judge_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ballot_id uuid NOT NULL REFERENCES ballots(id) ON DELETE CASCADE,
  from_judge_id uuid NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  to_judge_id uuid NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  
  -- Feedback categories
  decision_quality_score integer CHECK (decision_quality_score >= 1 AND decision_quality_score <= 5),
  feedback_quality_score integer CHECK (feedback_quality_score >= 1 AND feedback_quality_score <= 5),
  time_management_score integer CHECK (time_management_score >= 1 AND time_management_score <= 5),
  
  -- Text feedback
  strengths text,
  areas_for_improvement text,
  overall_comments text,
  
  -- Recommendation
  recommend_for_promotion boolean,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(ballot_id, from_judge_id, to_judge_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ballot_sessions_token ON ballot_sessions(access_token);
CREATE INDEX IF NOT EXISTS idx_ballot_sessions_judge_round ON ballot_sessions(judge_id, round_id);
CREATE INDEX IF NOT EXISTS idx_ballots_draw ON ballots(draw_id);
CREATE INDEX IF NOT EXISTS idx_ballots_judge ON ballots(judge_id);
CREATE INDEX IF NOT EXISTS idx_ballots_status ON ballots(status);
CREATE INDEX IF NOT EXISTS idx_speaker_scores_ballot ON speaker_scores(ballot_id);
CREATE INDEX IF NOT EXISTS idx_speaker_scores_team ON speaker_scores(team_id);
CREATE INDEX IF NOT EXISTS idx_judge_feedback_ballot ON judge_feedback(ballot_id);

-- Enable Row Level Security
ALTER TABLE ballot_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ballot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjudication_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE ballots ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ballot_templates
CREATE POLICY "Anyone can read ballot templates"
  ON ballot_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tab masters can manage ballot templates"
  ON ballot_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'tab_master'
    )
  );

-- RLS Policies for ballot_sessions
CREATE POLICY "Judges can read their own sessions"
  ON ballot_sessions FOR SELECT
  TO authenticated
  USING (
    judge_id IN (
      SELECT id FROM judges WHERE tournament_id IN (
        SELECT id FROM tournaments WHERE created_by = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('tab_master', 'assistant')
    )
  );

CREATE POLICY "Tab masters can manage ballot sessions"
  ON ballot_sessions FOR ALL
  TO authenticated
  USING (
    tournament_id IN (
      SELECT id FROM tournaments WHERE created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('tab_master', 'assistant')
    )
  );

-- RLS Policies for adjudication_panels
CREATE POLICY "Tournament organizers can manage panels"
  ON adjudication_panels FOR ALL
  TO authenticated
  USING (
    draw_id IN (
      SELECT d.id FROM draws d
      JOIN rounds r ON d.round_id = r.id
      JOIN tournaments t ON r.tournament_id = t.id
      WHERE t.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('tab_master', 'assistant')
    )
  );

-- RLS Policies for ballots
CREATE POLICY "Judges can read their own ballots"
  ON ballots FOR SELECT
  TO authenticated
  USING (
    judge_id IN (
      SELECT id FROM judges WHERE tournament_id IN (
        SELECT id FROM tournaments WHERE created_by = auth.uid()
      )
    )
    OR
    draw_id IN (
      SELECT d.id FROM draws d
      JOIN rounds r ON d.round_id = r.id
      JOIN tournaments t ON r.tournament_id = t.id
      WHERE t.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('tab_master', 'assistant')
    )
  );

CREATE POLICY "Judges can insert their own ballots"
  ON ballots FOR INSERT
  TO authenticated
  WITH CHECK (
    judge_id IN (
      SELECT id FROM judges WHERE tournament_id IN (
        SELECT id FROM tournaments WHERE created_by = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('tab_master', 'assistant')
    )
  );

CREATE POLICY "Judges can update their own ballots"
  ON ballots FOR UPDATE
  TO authenticated
  USING (
    judge_id IN (
      SELECT id FROM judges WHERE tournament_id IN (
        SELECT id FROM tournaments WHERE created_by = auth.uid()
      )
    )
    OR
    draw_id IN (
      SELECT d.id FROM draws d
      JOIN rounds r ON d.round_id = r.id
      JOIN tournaments t ON r.tournament_id = t.id
      WHERE t.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('tab_master', 'assistant')
    )
  );

-- RLS Policies for speaker_scores
CREATE POLICY "Ballot owners can manage speaker scores"
  ON speaker_scores FOR ALL
  TO authenticated
  USING (
    ballot_id IN (
      SELECT id FROM ballots WHERE judge_id IN (
        SELECT id FROM judges WHERE tournament_id IN (
          SELECT id FROM tournaments WHERE created_by = auth.uid()
        )
      )
    )
    OR
    ballot_id IN (
      SELECT b.id FROM ballots b
      JOIN draws d ON b.draw_id = d.id
      JOIN rounds r ON d.round_id = r.id
      JOIN tournaments t ON r.tournament_id = t.id
      WHERE t.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('tab_master', 'assistant')
    )
  );

-- RLS Policies for judge_feedback
CREATE POLICY "Judges can manage their feedback"
  ON judge_feedback FOR ALL
  TO authenticated
  USING (
    from_judge_id IN (
      SELECT id FROM judges WHERE tournament_id IN (
        SELECT id FROM tournaments WHERE created_by = auth.uid()
      )
    )
    OR
    to_judge_id IN (
      SELECT id FROM judges WHERE tournament_id IN (
        SELECT id FROM tournaments WHERE created_by = auth.uid()
      )
    )
    OR
    ballot_id IN (
      SELECT b.id FROM ballots b
      JOIN draws d ON b.draw_id = d.id
      JOIN rounds r ON d.round_id = r.id
      JOIN tournaments t ON r.tournament_id = t.id
      WHERE t.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('tab_master', 'assistant')
    )
  );

-- Insert default ballot templates
INSERT INTO ballot_templates (format, name, speaker_positions, scoring_criteria, feedback_fields) VALUES
(
  'bp',
  'British Parliamentary Standard',
  '["PM", "DPM", "LO", "DLO", "MG", "GW", "MO", "OW"]'::jsonb,
  '{
    "speaker_score_range": {"min": 60, "max": 80},
    "team_positions": ["OG", "OO", "CG", "CO"],
    "ranking_required": true,
    "poi_tracking": true
  }'::jsonb,
  '{
    "required": ["strengths", "areas_for_improvement"],
    "optional": ["specific_feedback", "poi_quality_score"],
    "debate_feedback": ["general_feedback", "debate_quality_score"]
  }'::jsonb
),
(
  'wsdc',
  'World Schools Standard',
  '["First Speaker", "Second Speaker", "Third Speaker"]'::jsonb,
  '{
    "speaker_score_range": {"min": 60, "max": 80},
    "team_positions": ["Proposition", "Opposition"],
    "ranking_required": true,
    "poi_tracking": true,
    "reply_speech": true
  }'::jsonb,
  '{
    "required": ["content_score", "style_score", "strategy_score"],
    "optional": ["poi_feedback", "reply_speech_feedback"],
    "debate_feedback": ["general_feedback", "debate_quality_score"]
  }'::jsonb
),
(
  'ap',
  'American Parliamentary Standard',
  '["Prime Minister", "Member of Government", "Leader of Opposition", "Member of Opposition"]'::jsonb,
  '{
    "speaker_score_range": {"min": 16, "max": 20},
    "team_positions": ["Government", "Opposition"],
    "ranking_required": true,
    "poi_tracking": false
  }'::jsonb,
  '{
    "required": ["strengths", "areas_for_improvement"],
    "optional": ["specific_feedback"],
    "debate_feedback": ["general_feedback"]
  }'::jsonb
),
(
  'cp',
  'Canadian Parliamentary Standard',
  '["Prime Minister", "Deputy Prime Minister", "Leader of Opposition", "Deputy Leader of Opposition"]'::jsonb,
  '{
    "speaker_score_range": {"min": 60, "max": 80},
    "team_positions": ["Government", "Opposition"],
    "ranking_required": true,
    "poi_tracking": true
  }'::jsonb,
  '{
    "required": ["content_score", "style_score", "strategy_score"],
    "optional": ["poi_feedback"],
    "debate_feedback": ["general_feedback", "debate_quality_score"]
  }'::jsonb
);

-- Create function to generate secure ballot access tokens
CREATE OR REPLACE FUNCTION generate_ballot_session(
  p_tournament_id uuid,
  p_judge_id uuid,
  p_round_id uuid,
  p_expires_hours integer DEFAULT 24
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token text;
  v_session_id uuid;
BEGIN
  -- Generate a secure random token
  v_token := encode(gen_random_bytes(32), 'base64url');
  
  -- Insert or update the session
  INSERT INTO ballot_sessions (
    tournament_id,
    judge_id,
    round_id,
    access_token,
    expires_at
  ) VALUES (
    p_tournament_id,
    p_judge_id,
    p_round_id,
    v_token,
    now() + (p_expires_hours || ' hours')::interval
  )
  ON CONFLICT (judge_id, round_id)
  DO UPDATE SET
    access_token = v_token,
    expires_at = now() + (p_expires_hours || ' hours')::interval,
    is_active = true,
    created_at = now()
  RETURNING id INTO v_session_id;
  
  RETURN v_token;
END;
$$;

-- Create function to validate ballot session
CREATE OR REPLACE FUNCTION validate_ballot_session(p_token text)
RETURNS TABLE (
  session_id uuid,
  tournament_id uuid,
  judge_id uuid,
  round_id uuid,
  judge_name text,
  tournament_name text,
  round_number integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bs.id,
    bs.tournament_id,
    bs.judge_id,
    bs.round_id,
    j.name,
    t.name,
    r.round_number
  FROM ballot_sessions bs
  JOIN judges j ON bs.judge_id = j.id
  JOIN tournaments t ON bs.tournament_id = t.id
  JOIN rounds r ON bs.round_id = r.id
  WHERE bs.access_token = p_token
    AND bs.is_active = true
    AND bs.expires_at > now();
END;
$$;

-- Create function to calculate speaker rankings
CREATE OR REPLACE FUNCTION calculate_speaker_rankings(p_ballot_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update speaker ranks based on scores within this ballot
  WITH ranked_speakers AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY score DESC, id) as new_rank
    FROM speaker_scores
    WHERE ballot_id = p_ballot_id
  )
  UPDATE speaker_scores
  SET rank = ranked_speakers.new_rank
  FROM ranked_speakers
  WHERE speaker_scores.id = ranked_speakers.id;
END;
$$;

-- Create trigger to automatically calculate rankings when scores are updated
CREATE OR REPLACE FUNCTION trigger_calculate_speaker_rankings()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM calculate_speaker_rankings(NEW.ballot_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER speaker_scores_ranking_trigger
  AFTER INSERT OR UPDATE OF score ON speaker_scores
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_speaker_rankings();

-- Add comments for documentation
COMMENT ON TABLE ballot_templates IS 'Templates defining scoring criteria for different debate formats';
COMMENT ON TABLE ballot_sessions IS 'Secure access sessions for judges to submit ballots';
COMMENT ON TABLE adjudication_panels IS 'Panel composition for each debate room';
COMMENT ON TABLE ballots IS 'Individual ballot submissions from judges';
COMMENT ON TABLE speaker_scores IS 'Individual speaker scores and detailed feedback';
COMMENT ON TABLE judge_feedback IS 'Feedback between judges on adjudication panels';

COMMENT ON FUNCTION generate_ballot_session IS 'Generates secure access token for judge ballot submission';
COMMENT ON FUNCTION validate_ballot_session IS 'Validates ballot session token and returns session details';
COMMENT ON FUNCTION calculate_speaker_rankings IS 'Calculates speaker rankings within a ballot based on scores';