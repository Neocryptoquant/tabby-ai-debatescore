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
  links?: { label: string; url: string }[]; // Optional links for info page
}

export interface Round {
  id: string;
  tournament_id: string;
  round_number: number;
  motion: string;
  info_slide?: string;
  start_time?: string;
  status: 'upcoming' | 'active' | 'completed';
  rooms?: string[]; // Array of room names for this round
  is_motion_public?: boolean;
  is_info_slide_public?: boolean;
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
  speaker_3?: string;
  speaker1_name?: string;
  speaker2_name?: string;
  speaker3_name?: string;
  experience_level?: ExperienceLevel;
  break_category?: string;
  created_at?: string;
  updated_at?: string;
}

// Database Draw interface (matches actual database schema with correct BP mapping)
export interface Draw {
  id: string;
  round_id: string;
  tournament_id?: string;
  room: string;
  // British Parliamentary positions mapped to database columns:
  gov_team_id: string;    // Opening Government (OG)
  opp_team_id: string;    // Opening Opposition (OO)
  cg_team_id?: string;    // Closing Government (CG)
  co_team_id?: string;    // Closing Opposition (CO)
  judge_id?: string;
  judge?: string;
  status: 'pending' | 'in_progress' | 'completed';
  gov_score?: number | null;
  opp_score?: number | null;
  generation_history_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Enhanced Draw interface for UI (includes populated relationships)
export interface EnhancedDraw extends Draw {
  // British Parliamentary teams with clear naming
  og_team?: Team;  // Opening Government (maps to gov_team_id)
  oo_team?: Team;  // Opening Opposition (maps to opp_team_id)
  cg_team?: Team;  // Closing Government (maps to cg_team_id)
  co_team?: Team;  // Closing Opposition (maps to co_team_id)
  judge_obj?: Judge;
}

export type ExperienceLevel = 'novice' | 'intermediate' | 'open' | 'pro';

export type DebateFormat = 'bp' | 'wsdc' | 'ap' | 'cp' | 'pf' | 'ld' | 'policy';

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
  speaker_3?: string;
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