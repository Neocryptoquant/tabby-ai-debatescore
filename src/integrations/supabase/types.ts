export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ballot_sessions: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          judge_id: string
          last_accessed_at: string | null
          round_id: string
          short_url_code: string | null
          tournament_id: string
          user_agent: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          judge_id: string
          last_accessed_at?: string | null
          round_id: string
          short_url_code?: string | null
          tournament_id: string
          user_agent?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          judge_id?: string
          last_accessed_at?: string | null
          round_id?: string
          short_url_code?: string | null
          tournament_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ballot_sessions_judge_id_fkey"
            columns: ["judge_id"]
            isOneToOne: false
            referencedRelation: "judges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ballot_sessions_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ballot_sessions_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      ballots: {
        Row: {
          cg_team_id: string | null
          cg_team_points: number | null
          cg_team_rank: number | null
          co_team_id: string | null
          co_team_points: number | null
          co_team_rank: number | null
          confirmed_by: string | null
          confirmed_time: string | null
          created_at: string | null
          draw_id: string
          feedback: string | null
          gov_team_id: string | null
          gov_team_points: number | null
          gov_team_rank: number | null
          id: string
          judge_id: string
          notes: string | null
          opp_team_id: string | null
          opp_team_points: number | null
          opp_team_rank: number | null
          round_id: string
          status: string
          submission_time: string | null
          tournament_id: string
          updated_at: string | null
        }
        Insert: {
          cg_team_id?: string | null
          cg_team_points?: number | null
          cg_team_rank?: number | null
          co_team_id?: string | null
          co_team_points?: number | null
          co_team_rank?: number | null
          confirmed_by?: string | null
          confirmed_time?: string | null
          created_at?: string | null
          draw_id: string
          feedback?: string | null
          gov_team_id?: string | null
          gov_team_points?: number | null
          gov_team_rank?: number | null
          id?: string
          judge_id: string
          notes?: string | null
          opp_team_id?: string | null
          opp_team_points?: number | null
          opp_team_rank?: number | null
          round_id: string
          status?: string
          submission_time?: string | null
          tournament_id: string
          updated_at?: string | null
        }
        Update: {
          cg_team_id?: string | null
          cg_team_points?: number | null
          cg_team_rank?: number | null
          co_team_id?: string | null
          co_team_points?: number | null
          co_team_rank?: number | null
          confirmed_by?: string | null
          confirmed_time?: string | null
          created_at?: string | null
          draw_id?: string
          feedback?: string | null
          gov_team_id?: string | null
          gov_team_points?: number | null
          gov_team_rank?: number | null
          id?: string
          judge_id?: string
          notes?: string | null
          opp_team_id?: string | null
          opp_team_points?: number | null
          opp_team_rank?: number | null
          round_id?: string
          status?: string
          submission_time?: string | null
          tournament_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ballots_cg_team_id_fkey"
            columns: ["cg_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ballots_co_team_id_fkey"
            columns: ["co_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ballots_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "draws"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ballots_gov_team_id_fkey"
            columns: ["gov_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ballots_judge_id_fkey"
            columns: ["judge_id"]
            isOneToOne: false
            referencedRelation: "judges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ballots_opp_team_id_fkey"
            columns: ["opp_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ballots_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ballots_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      break_debates: {
        Row: {
          break_round_id: string
          cg_team_id: string | null
          chair_judge_id: string | null
          co_team_id: string | null
          created_at: string | null
          gov_team_id: string | null
          id: string
          motion: string | null
          opp_team_id: string | null
          panel_judges: Json | null
          room: string
          status: string
          tournament_id: string
          updated_at: string | null
          winner_team_id: string | null
        }
        Insert: {
          break_round_id: string
          cg_team_id?: string | null
          chair_judge_id?: string | null
          co_team_id?: string | null
          created_at?: string | null
          gov_team_id?: string | null
          id?: string
          motion?: string | null
          opp_team_id?: string | null
          panel_judges?: Json | null
          room: string
          status?: string
          tournament_id: string
          updated_at?: string | null
          winner_team_id?: string | null
        }
        Update: {
          break_round_id?: string
          cg_team_id?: string | null
          chair_judge_id?: string | null
          co_team_id?: string | null
          created_at?: string | null
          gov_team_id?: string | null
          id?: string
          motion?: string | null
          opp_team_id?: string | null
          panel_judges?: Json | null
          room?: string
          status?: string
          tournament_id?: string
          updated_at?: string | null
          winner_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "break_debates_break_round_id_fkey"
            columns: ["break_round_id"]
            isOneToOne: false
            referencedRelation: "break_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "break_debates_cg_team_id_fkey"
            columns: ["cg_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "break_debates_chair_judge_id_fkey"
            columns: ["chair_judge_id"]
            isOneToOne: false
            referencedRelation: "judges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "break_debates_co_team_id_fkey"
            columns: ["co_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "break_debates_gov_team_id_fkey"
            columns: ["gov_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "break_debates_opp_team_id_fkey"
            columns: ["opp_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "break_debates_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "break_debates_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      break_rounds: {
        Row: {
          break_size: number
          created_at: string | null
          id: string
          info_slide: string | null
          is_elimination: boolean | null
          motion: string | null
          name: string
          round_number: number
          start_time: string | null
          status: string
          tournament_id: string
          updated_at: string | null
        }
        Insert: {
          break_size: number
          created_at?: string | null
          id?: string
          info_slide?: string | null
          is_elimination?: boolean | null
          motion?: string | null
          name: string
          round_number: number
          start_time?: string | null
          status?: string
          tournament_id: string
          updated_at?: string | null
        }
        Update: {
          break_size?: number
          created_at?: string | null
          id?: string
          info_slide?: string | null
          is_elimination?: boolean | null
          motion?: string | null
          name?: string
          round_number?: number
          start_time?: string | null
          status?: string
          tournament_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "break_rounds_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      break_teams: {
        Row: {
          break_category: string | null
          created_at: string | null
          id: string
          seed: number
          team_id: string
          total_points: number
          total_speaker_score: number
          tournament_id: string
          wins: number
        }
        Insert: {
          break_category?: string | null
          created_at?: string | null
          id?: string
          seed: number
          team_id: string
          total_points: number
          total_speaker_score: number
          tournament_id: string
          wins: number
        }
        Update: {
          break_category?: string | null
          created_at?: string | null
          id?: string
          seed?: number
          team_id?: string
          total_points?: number
          total_speaker_score?: number
          tournament_id?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "break_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "break_teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_generation_history: {
        Row: {
          generated_at: string | null
          generated_by: string | null
          generation_method: string
          generation_params: Json | null
          id: string
          is_current: boolean | null
          round_id: string
          tournament_id: string
        }
        Insert: {
          generated_at?: string | null
          generated_by?: string | null
          generation_method?: string
          generation_params?: Json | null
          id?: string
          is_current?: boolean | null
          round_id: string
          tournament_id: string
        }
        Update: {
          generated_at?: string | null
          generated_by?: string | null
          generation_method?: string
          generation_params?: Json | null
          id?: string
          is_current?: boolean | null
          round_id?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draw_generation_history_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_generation_history_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      draws: {
        Row: {
          cg_team_id: string | null
          co_team_id: string | null
          created_at: string
          generation_history_id: string | null
          gov_score: number | null
          gov_team_id: string
          id: string
          judge: string | null
          judge_id: string | null
          opp_score: number | null
          opp_team_id: string
          room: string
          round_id: string
          status: string | null
          tournament_id: string | null
          updated_at: string
        }
        Insert: {
          cg_team_id?: string | null
          co_team_id?: string | null
          created_at?: string
          generation_history_id?: string | null
          gov_score?: number | null
          gov_team_id: string
          id?: string
          judge?: string | null
          judge_id?: string | null
          opp_score?: number | null
          opp_team_id: string
          room: string
          round_id: string
          status?: string | null
          tournament_id?: string | null
          updated_at?: string
        }
        Update: {
          cg_team_id?: string | null
          co_team_id?: string | null
          created_at?: string
          generation_history_id?: string | null
          gov_score?: number | null
          gov_team_id?: string
          id?: string
          judge?: string | null
          judge_id?: string | null
          opp_score?: number | null
          opp_team_id?: string
          room?: string
          round_id?: string
          status?: string | null
          tournament_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "draws_cg_team_id_fkey"
            columns: ["cg_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draws_co_team_id_fkey"
            columns: ["co_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draws_generation_history_id_fkey"
            columns: ["generation_history_id"]
            isOneToOne: false
            referencedRelation: "draw_generation_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draws_gov_team_id_fkey"
            columns: ["gov_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draws_judge_id_fkey"
            columns: ["judge_id"]
            isOneToOne: false
            referencedRelation: "judges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draws_opp_team_id_fkey"
            columns: ["opp_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draws_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draws_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      judges: {
        Row: {
          created_at: string
          experience_level: string | null
          id: string
          institution: string | null
          name: string
          tournament_id: string
        }
        Insert: {
          created_at?: string
          experience_level?: string | null
          id?: string
          institution?: string | null
          name: string
          tournament_id: string
        }
        Update: {
          created_at?: string
          experience_level?: string | null
          id?: string
          institution?: string | null
          name?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "judges_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          institution: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          institution?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          institution?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      public_tournament_access: {
        Row: {
          access_token: string
          created_at: string | null
          id: string
          is_active: boolean | null
          show_speaker_scores: boolean | null
          tournament_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          show_speaker_scores?: boolean | null
          tournament_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          show_speaker_scores?: boolean | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_tournament_access_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: true
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      rounds: {
        Row: {
          completion_time: string | null
          created_at: string
          default_rooms: string[] | null
          id: string
          info_slide: string | null
          is_completed: boolean | null
          is_info_slide_public: boolean | null
          is_motion_public: boolean | null
          motion: string
          round_number: number
          start_time: string | null
          status: string | null
          tournament_id: string
          updated_at: string
        }
        Insert: {
          completion_time?: string | null
          created_at?: string
          default_rooms?: string[] | null
          id?: string
          info_slide?: string | null
          is_completed?: boolean | null
          is_info_slide_public?: boolean | null
          is_motion_public?: boolean | null
          motion: string
          round_number: number
          start_time?: string | null
          status?: string | null
          tournament_id: string
          updated_at?: string
        }
        Update: {
          completion_time?: string | null
          created_at?: string
          default_rooms?: string[] | null
          id?: string
          info_slide?: string | null
          is_completed?: boolean | null
          is_info_slide_public?: boolean | null
          is_motion_public?: boolean | null
          motion?: string
          round_number?: number
          start_time?: string | null
          status?: string | null
          tournament_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rounds_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      speaker_scores: {
        Row: {
          ballot_id: string
          content_score: number | null
          created_at: string | null
          delivery_score: number | null
          feedback: string | null
          id: string
          score: number
          speaker_name: string
          speaker_position: number
          strategy_score: number | null
          team_id: string
          updated_at: string | null
        }
        Insert: {
          ballot_id: string
          content_score?: number | null
          created_at?: string | null
          delivery_score?: number | null
          feedback?: string | null
          id?: string
          score: number
          speaker_name: string
          speaker_position: number
          strategy_score?: number | null
          team_id: string
          updated_at?: string | null
        }
        Update: {
          ballot_id?: string
          content_score?: number | null
          created_at?: string | null
          delivery_score?: number | null
          feedback?: string | null
          id?: string
          score?: number
          speaker_name?: string
          speaker_position?: number
          strategy_score?: number | null
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "speaker_scores_ballot_id_fkey"
            columns: ["ballot_id"]
            isOneToOne: false
            referencedRelation: "ballots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "speaker_scores_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          institution: string | null
          name: string
          speaker_1: string | null
          speaker_2: string | null
          speaker_3: string | null
          tournament_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution?: string | null
          name: string
          speaker_1?: string | null
          speaker_2?: string | null
          speaker_3?: string | null
          tournament_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          institution?: string | null
          name?: string
          speaker_1?: string | null
          speaker_2?: string | null
          speaker_3?: string | null
          tournament_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_analytics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          round_id: string | null
          team_id: string | null
          tournament_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          round_id?: string | null
          team_id?: string | null
          tournament_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          round_id?: string | null
          team_id?: string | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_analytics_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_analytics_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_analytics_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          break_generated: boolean | null
          break_generation_time: string | null
          break_type: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          format: string | null
          id: string
          location: string | null
          motions_per_round: number | null
          name: string
          round_count: number | null
          start_date: string | null
          status: string | null
          team_count: number | null
          updated_at: string
        }
        Insert: {
          break_generated?: boolean | null
          break_generation_time?: string | null
          break_type?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          format?: string | null
          id?: string
          location?: string | null
          motions_per_round?: number | null
          name: string
          round_count?: number | null
          start_date?: string | null
          status?: string | null
          team_count?: number | null
          updated_at?: string
        }
        Update: {
          break_generated?: boolean | null
          break_generation_time?: string | null
          break_type?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          format?: string | null
          id?: string
          location?: string | null
          motions_per_round?: number | null
          name?: string
          round_count?: number | null
          start_date?: string | null
          status?: string | null
          team_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          subscription_type: string
          tournaments_limit: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          subscription_type?: string
          tournaments_limit?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          subscription_type?: string
          tournaments_limit?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advance_teams_to_next_break: {
        Args: { p_current_break_id: string; p_next_break_name: string }
        Returns: string
      }
      complete_round: {
        Args: { p_round_id: string }
        Returns: boolean
      }
      create_ballot_session: {
        Args: {
          p_judge_id: string
          p_round_id: string
          p_tournament_id: string
          p_hours_valid?: number
        }
        Returns: string
      }
      generate_break_debates: {
        Args: { p_break_round_id: string }
        Returns: number
      }
      generate_short_code: {
        Args: { length?: number }
        Returns: string
      }
      generate_tournament_breaks: {
        Args: {
          p_tournament_id: string
          p_break_size: number
          p_break_type: string
        }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "tab_master" | "assistant" | "attendee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["tab_master", "assistant", "attendee"],
    },
  },
} as const
