
/**
 * Tournament-related type definitions
 */
export interface Tournament {
  id: string;
  name: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  format?: string;
  created_by: string;
  team_count?: number;
  round_count?: number;
  motions_per_round?: number;
  break_type?: 'finals' | 'semis' | 'quarters' | 'none';
  break_categories?: BreakCategory[];
  created_at?: string;
  updated_at?: string;
}

export interface Round {
  id: string;
  tournament_id: string;
  round_number: number;
  motion: string;
  info_slide?: string;
  start_time?: string;
  status: 'upcoming' | 'active' | 'completed';
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  tournament_id: string;
  name: string;
  institution?: string;
  speaker_1?: string;
  speaker_2?: string;
  speaker1_name?: string;
  speaker2_name?: string;
  experience_level?: ExperienceLevel;
  break_category?: string;
  created_at?: string;
  updated_at?: string;
}

// Database Draw interface (matches actual database schema)
export interface Draw {
  id: string;
  round_id: string;
  tournament_id?: string;
  room: string;
  gov_team_id: string;
  opp_team_id: string;
  cg_team_id?: string;
  co_team_id?: string;
  judge_id?: string;
  judge?: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

// Enhanced Draw interface for UI (includes populated relationships)
export interface EnhancedDraw extends Draw {
  gov_team?: Team;
  opp_team?: Team;
  cg_team?: Team;
  co_team?: Team;
  judge_obj?: Judge;
}

export type ExperienceLevel = 'novice' | 'intermediate' | 'open' | 'pro';

export interface BreakCategory {
  id: string;
  name: string;
  experience_levels: ExperienceLevel[];
  min_teams?: number;
  max_teams?: number;
}

export interface TournamentRegistration {
  team_name: string;
  institution?: string;
  speaker_1: string;
  speaker_2?: string;
  experience_level: ExperienceLevel;
  break_category?: string;
}

export interface Judge {
  id: string;
  tournament_id: string;
  name: string;
  institution?: string;
  experience_level: ExperienceLevel;
  created_at: string;
}

export interface JudgeFormData {
  name: string;
  institution?: string;
  experience_level: ExperienceLevel;
}
