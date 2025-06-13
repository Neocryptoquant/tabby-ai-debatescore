
-- Add missing email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Update ballots table to support automatic position calculation
ALTER TABLE public.ballots ADD COLUMN IF NOT EXISTS auto_calculate_positions boolean DEFAULT true;

-- Create an index on speaker_scores for faster calculations
CREATE INDEX IF NOT EXISTS idx_speaker_scores_ballot_team ON public.speaker_scores(ballot_id, team_id);

-- Add a function to calculate team positions based on speaker scores
CREATE OR REPLACE FUNCTION calculate_team_positions_by_speaker_scores(p_ballot_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  team_score RECORD;
  position_counter INTEGER := 1;
BEGIN
  -- Calculate total speaker scores for each team and update positions
  FOR team_score IN (
    SELECT 
      CASE 
        WHEN b.gov_team_id = ss.team_id THEN 'gov'
        WHEN b.opp_team_id = ss.team_id THEN 'opp'
        WHEN b.cg_team_id = ss.team_id THEN 'cg'
        WHEN b.co_team_id = ss.team_id THEN 'co'
      END as team_position,
      ss.team_id,
      SUM(ss.score) as total_score
    FROM ballots b
    LEFT JOIN speaker_scores ss ON b.id = ss.ballot_id
    WHERE b.id = p_ballot_id
    AND ss.team_id IS NOT NULL
    GROUP BY ss.team_id, b.gov_team_id, b.opp_team_id, b.cg_team_id, b.co_team_id
    ORDER BY SUM(ss.score) DESC
  )
  LOOP
    -- Update the appropriate team rank based on team position
    IF team_score.team_position = 'gov' THEN
      UPDATE ballots SET gov_team_rank = position_counter WHERE id = p_ballot_id;
    ELSIF team_score.team_position = 'opp' THEN
      UPDATE ballots SET opp_team_rank = position_counter WHERE id = p_ballot_id;
    ELSIF team_score.team_position = 'cg' THEN
      UPDATE ballots SET cg_team_rank = position_counter WHERE id = p_ballot_id;
    ELSIF team_score.team_position = 'co' THEN
      UPDATE ballots SET co_team_rank = position_counter WHERE id = p_ballot_id;
    END IF;
    
    position_counter := position_counter + 1;
  END LOOP;
END;
$$;

-- Create trigger to automatically calculate positions when speaker scores change
CREATE OR REPLACE FUNCTION trigger_calculate_positions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the ballot has auto_calculate_positions enabled
  IF EXISTS (
    SELECT 1 FROM ballots 
    WHERE id = COALESCE(NEW.ballot_id, OLD.ballot_id) 
    AND auto_calculate_positions = true
  ) THEN
    PERFORM calculate_team_positions_by_speaker_scores(COALESCE(NEW.ballot_id, OLD.ballot_id));
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for speaker_scores table
DROP TRIGGER IF EXISTS speaker_scores_update_positions ON speaker_scores;
CREATE TRIGGER speaker_scores_update_positions
  AFTER INSERT OR UPDATE OR DELETE ON speaker_scores
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_positions();
