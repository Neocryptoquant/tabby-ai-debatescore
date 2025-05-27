
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Tournament interface matching the database schema
 */
interface Tournament {
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
  created_at?: string;
  updated_at?: string;
}

/**
 * Round interface with proper status typing
 */
interface Round {
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

/**
 * Team interface matching database schema
 */
interface Team {
  id: string;
  tournament_id: string;
  name: string;
  institution?: string;
  speaker_1?: string;
  speaker_2?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Draw interface with proper relationships
 */
interface Draw {
  id: string;
  round_id: string;
  room: string;
  gov_team_id: string;
  opp_team_id: string;
  judge?: string;
  status: 'pending' | 'in_progress' | 'completed';
  gov_score?: number;
  opp_score?: number;
  gov_team: Team;
  opp_team: Team;
  round: { round_number: number };
  created_at?: string;
  updated_at?: string;
}

/**
 * Custom hook for managing tournament data including rounds, teams, draws, and related operations
 * Provides CRUD operations with proper error handling and user feedback
 */
export const useTournamentData = (tournamentId?: string) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetches tournament details from the database with proper error handling
   */
  const fetchTournament = async () => {
    if (!tournamentId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error) {
        console.error('Error fetching tournament:', error);
        throw error;
      }
      
      // Type assertion with proper validation
      const typedTournament: Tournament = {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        status: data.status || undefined,
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
        location: data.location || undefined,
        format: data.format || undefined,
        created_by: data.created_by,
        team_count: data.team_count || undefined,
        round_count: data.round_count || undefined,
        motions_per_round: data.motions_per_round || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setTournament(typedTournament);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      toast.error('Failed to fetch tournament data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches all rounds for the current tournament with proper typing
   */
  const fetchRounds = async () => {
    if (!tournamentId) return;
    
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number');

      if (error) {
        console.error('Error fetching rounds:', error);
        throw error;
      }
      
      // Proper type casting with validation
      const typedRounds: Round[] = (data || []).map(round => ({
        id: round.id,
        tournament_id: round.tournament_id,
        round_number: round.round_number,
        motion: round.motion,
        info_slide: round.info_slide || undefined,
        start_time: round.start_time || undefined,
        status: (round.status as 'upcoming' | 'active' | 'completed') || 'upcoming',
        created_at: round.created_at,
        updated_at: round.updated_at
      }));
      
      setRounds(typedRounds);
    } catch (error) {
      console.error('Error fetching rounds:', error);
      toast.error('Failed to fetch rounds');
    }
  };

  /**
   * Fetches all teams for the current tournament with proper typing
   */
  const fetchTeams = async () => {
    if (!tournamentId) return;
    
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('name');

      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }
      
      // Proper type mapping
      const typedTeams: Team[] = (data || []).map(team => ({
        id: team.id,
        tournament_id: team.tournament_id,
        name: team.name,
        institution: team.institution || undefined,
        speaker_1: team.speaker_1 || undefined,
        speaker_2: team.speaker_2 || undefined,
        created_at: team.created_at,
        updated_at: team.updated_at
      }));
      
      setTeams(typedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to fetch teams');
    }
  };

  /**
   * Fetches all draws for the current tournament with related team and round data
   * Uses explicit foreign key relationships to avoid Supabase ambiguity
   */
  const fetchDraws = async () => {
    if (!tournamentId) return;
    
    try {
      // First get round IDs for this tournament
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .select('id')
        .eq('tournament_id', tournamentId);

      if (roundError) {
        console.error('Error fetching round IDs:', roundError);
        throw roundError;
      }
      
      const roundIds = roundData?.map(r => r.id) || [];
      
      if (roundIds.length === 0) {
        setDraws([]);
        return;
      }

      // Fetch draws with explicit foreign key references to avoid ambiguity
      const { data, error } = await supabase
        .from('draws')
        .select(`
          id,
          round_id,
          room,
          gov_team_id,
          opp_team_id,
          judge,
          status,
          gov_score,
          opp_score,
          created_at,
          updated_at,
          gov_team:teams!draws_gov_team_id_fkey(
            id,
            name,
            institution,
            tournament_id,
            speaker_1,
            speaker_2
          ),
          opp_team:teams!draws_opp_team_id_fkey(
            id,
            name,
            institution,
            tournament_id,
            speaker_1,
            speaker_2
          ),
          round:rounds!draws_round_id_fkey(round_number)
        `)
        .in('round_id', roundIds);

      if (error) {
        console.error('Error fetching draws:', error);
        throw error;
      }
      
      // Properly type the draws data with validation - Fixed type predicate
      const typedDraws: Draw[] = (data || [])
        .map(draw => {
          // Validate that required relationships exist
          if (!draw.gov_team || !draw.opp_team || !draw.round) {
            console.warn('Draw missing required relationships:', draw);
            return null;
          }

          return {
            id: draw.id,
            round_id: draw.round_id,
            room: draw.room,
            gov_team_id: draw.gov_team_id,
            opp_team_id: draw.opp_team_id,
            judge: draw.judge || undefined,
            status: (draw.status as 'pending' | 'in_progress' | 'completed') || 'pending',
            gov_score: draw.gov_score || undefined,
            opp_score: draw.opp_score || undefined,
            gov_team: {
              id: draw.gov_team.id,
              tournament_id: draw.gov_team.tournament_id,
              name: draw.gov_team.name,
              institution: draw.gov_team.institution || undefined,
              speaker_1: draw.gov_team.speaker_1 || undefined,
              speaker_2: draw.gov_team.speaker_2 || undefined
            },
            opp_team: {
              id: draw.opp_team.id,
              tournament_id: draw.opp_team.tournament_id,
              name: draw.opp_team.name,
              institution: draw.opp_team.institution || undefined,
              speaker_1: draw.opp_team.speaker_1 || undefined,
              speaker_2: draw.opp_team.speaker_2 || undefined
            },
            round: { round_number: draw.round.round_number },
            created_at: draw.created_at,
            updated_at: draw.updated_at
          } as Draw;
        })
        .filter((draw): draw is Draw => draw !== null);
      
      setDraws(typedDraws);
    } catch (error) {
      console.error('Error fetching draws:', error);
      toast.error('Failed to fetch draws');
    }
  };

  /**
   * Adds a new round to the tournament with enhanced user feedback
   */
  const addRound = async (roundData: Omit<Round, 'id' | 'tournament_id' | 'created_at' | 'updated_at'>) => {
    if (!tournamentId) return;

    try {
      const { data, error } = await supabase
        .from('rounds')
        .insert([{ ...roundData, tournament_id: tournamentId }])
        .select()
        .single();

      if (error) {
        console.error('Error adding round:', error);
        throw error;
      }
      
      const typedRound: Round = {
        id: data.id,
        tournament_id: data.tournament_id,
        round_number: data.round_number,
        motion: data.motion,
        info_slide: data.info_slide || undefined,
        start_time: data.start_time || undefined,
        status: (data.status as 'upcoming' | 'active' | 'completed') || 'upcoming',
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setRounds(prev => [...prev, typedRound].sort((a, b) => a.round_number - b.round_number));
      
      toast.success('🎯 Round added successfully!', {
        description: `Round ${roundData.round_number} has been created`,
        duration: 3000,
      });
      
      return typedRound;
    } catch (error) {
      console.error('Error adding round:', error);
      toast.error('❌ Failed to add round', {
        description: 'Please check your data and try again',
        duration: 4000,
      });
      throw error;
    }
  };

  /**
   * Adds a new team to the tournament with enhanced user feedback
   */
  const addTeam = async (teamData: Omit<Team, 'id' | 'tournament_id' | 'created_at' | 'updated_at'>) => {
    if (!tournamentId) return;

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{ ...teamData, tournament_id: tournamentId }])
        .select()
        .single();

      if (error) {
        console.error('Error adding team:', error);
        throw error;
      }
      
      const typedTeam: Team = {
        id: data.id,
        tournament_id: data.tournament_id,
        name: data.name,
        institution: data.institution || undefined,
        speaker_1: data.speaker_1 || undefined,
        speaker_2: data.speaker_2 || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setTeams(prev => [...prev, typedTeam].sort((a, b) => a.name.localeCompare(b.name)));
      
      toast.success('👥 Team added successfully!', {
        description: `${teamData.name} ${teamData.institution ? `from ${teamData.institution}` : ''} has been registered`,
        duration: 3000,
      });
      
      return typedTeam;
    } catch (error) {
      console.error('Error adding team:', error);
      toast.error('❌ Failed to add team', {
        description: 'Please check team details and try again',
        duration: 4000,
      });
      throw error;
    }
  };

  /**
   * Generates draws for all rounds in the tournament with proper validation
   */
  const generateDraws = async () => {
    if (!tournamentId || teams.length < 2 || rounds.length === 0) {
      toast.error('⚠️ Cannot generate draws', {
        description: 'Need at least 2 teams and 1 round to generate draws',
        duration: 4000,
      });
      return;
    }

    try {
      // Delete existing draws for this tournament
      const roundIds = rounds.map(r => r.id);
      const { error: deleteError } = await supabase
        .from('draws')
        .delete()
        .in('round_id', roundIds);

      if (deleteError) {
        console.error('Error deleting existing draws:', deleteError);
        throw deleteError;
      }

      const newDraws = [];
      const availableRooms = ['Room A', 'Room B', 'Room C', 'Room D', 'Room E', 'Room F', 'Room G', 'Room H'];

      for (const round of rounds) {
        const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < shuffledTeams.length; i += 2) {
          if (i + 1 < shuffledTeams.length) {
            newDraws.push({
              round_id: round.id,
              room: availableRooms[Math.floor(i / 2)] || `Room ${Math.floor(i / 2) + 1}`,
              gov_team_id: shuffledTeams[i].id,
              opp_team_id: shuffledTeams[i + 1].id,
              status: 'pending' as const
            });
          }
        }
      }

      const { error: insertError } = await supabase
        .from('draws')
        .insert(newDraws);

      if (insertError) {
        console.error('Error inserting new draws:', insertError);
        throw insertError;
      }
      
      await fetchDraws();
      
      toast.success('🎲 Draws generated successfully!', {
        description: `Generated ${newDraws.length} pairings across ${rounds.length} rounds`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error generating draws:', error);
      toast.error('❌ Failed to generate draws', {
        description: 'Please try again or contact support',
        duration: 4000,
      });
    }
  };

  /**
   * Deletes a round from the tournament with confirmation
   */
  const deleteRound = async (roundId: string) => {
    try {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId);

      if (error) {
        console.error('Error deleting round:', error);
        throw error;
      }
      
      setRounds(prev => prev.filter(round => round.id !== roundId));
      
      toast.success('🗑️ Round deleted successfully!', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Error deleting round:', error);
      toast.error('❌ Failed to delete round', {
        duration: 3000,
      });
    }
  };

  /**
   * Deletes a team from the tournament with confirmation
   */
  const deleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) {
        console.error('Error deleting team:', error);
        throw error;
      }
      
      setTeams(prev => prev.filter(team => team.id !== teamId));
      
      toast.success('🗑️ Team deleted successfully!', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('❌ Failed to delete team', {
        duration: 3000,
      });
    }
  };

  // Load data when tournament ID changes
  useEffect(() => {
    if (tournamentId) {
      fetchTournament();
      fetchRounds();
      fetchTeams();
      fetchDraws();
    }
  }, [tournamentId]);

  return {
    tournament,
    rounds,
    teams,
    draws,
    isLoading,
    addRound,
    addTeam,
    generateDraws,
    deleteRound,
    deleteTeam,
    refetch: () => {
      fetchTournament();
      fetchRounds();
      fetchTeams();
      fetchDraws();
    }
  };
};
