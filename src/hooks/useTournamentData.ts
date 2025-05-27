
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Tournament {
  id: string;
  name: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  format?: string;
}

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
   * Fetches tournament details from the database
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

      if (error) throw error;
      setTournament(data);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      toast.error('Failed to fetch tournament data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches all rounds for the current tournament
   */
  const fetchRounds = async () => {
    if (!tournamentId) return;
    
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number');

      if (error) throw error;
      // Type assertion to ensure status matches our interface
      const typedRounds = (data || []).map(round => ({
        ...round,
        status: round.status as 'upcoming' | 'active' | 'completed'
      }));
      setRounds(typedRounds);
    } catch (error) {
      console.error('Error fetching rounds:', error);
      toast.error('Failed to fetch rounds');
    }
  };

  /**
   * Fetches all teams for the current tournament
   */
  const fetchTeams = async () => {
    if (!tournamentId) return;
    
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to fetch teams');
    }
  };

  /**
   * Fetches all draws for the current tournament with related team and round data
   * Fixed to properly handle multiple foreign key relationships
   */
  const fetchDraws = async () => {
    if (!tournamentId) return;
    
    try {
      // First get round IDs for this tournament
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .select('id')
        .eq('tournament_id', tournamentId);

      if (roundError) throw roundError;
      
      const roundIds = roundData?.map(r => r.id) || [];
      
      if (roundIds.length === 0) {
        setDraws([]);
        return;
      }

      // Fetch draws with proper foreign key hints to avoid ambiguity
      const { data, error } = await supabase
        .from('draws')
        .select(`
          *,
          gov_team:teams!draws_gov_team_id_fkey(id, name, institution, tournament_id, speaker_1, speaker_2),
          opp_team:teams!draws_opp_team_id_fkey(id, name, institution, tournament_id, speaker_1, speaker_2),
          round:rounds!draws_round_id_fkey(round_number)
        `)
        .in('round_id', roundIds);

      if (error) throw error;
      
      // Properly type the draws data with proper error handling
      const typedDraws: Draw[] = (data || []).map(draw => ({
        id: draw.id,
        round_id: draw.round_id,
        room: draw.room,
        gov_team_id: draw.gov_team_id,
        opp_team_id: draw.opp_team_id,
        judge: draw.judge,
        status: draw.status as 'pending' | 'in_progress' | 'completed',
        gov_score: draw.gov_score,
        opp_score: draw.opp_score,
        gov_team: draw.gov_team as Team,
        opp_team: draw.opp_team as Team,
        round: draw.round as { round_number: number },
        created_at: draw.created_at,
        updated_at: draw.updated_at
      }));
      
      setDraws(typedDraws);
    } catch (error) {
      console.error('Error fetching draws:', error);
      toast.error('Failed to fetch draws');
    }
  };

  /**
   * Adds a new round to the tournament with user feedback
   */
  const addRound = async (roundData: Omit<Round, 'id' | 'tournament_id' | 'created_at' | 'updated_at'>) => {
    if (!tournamentId) return;

    try {
      const { data, error } = await supabase
        .from('rounds')
        .insert([{ ...roundData, tournament_id: tournamentId }])
        .select()
        .single();

      if (error) throw error;
      const typedRound = {
        ...data,
        status: data.status as 'upcoming' | 'active' | 'completed'
      };
      setRounds(prev => [...prev, typedRound].sort((a, b) => a.round_number - b.round_number));
      
      // Enhanced success feedback with animation
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
   * Adds a new team to the tournament with user feedback
   */
  const addTeam = async (teamData: Omit<Team, 'id' | 'tournament_id' | 'created_at' | 'updated_at'>) => {
    if (!tournamentId) return;

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{ ...teamData, tournament_id: tournamentId }])
        .select()
        .single();

      if (error) throw error;
      setTeams(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      
      // Enhanced success feedback with animation
      toast.success('👥 Team added successfully!', {
        description: `${teamData.name} from ${teamData.institution} has been registered`,
        duration: 3000,
      });
      
      return data;
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
   * Generates draws for all rounds in the tournament
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
      await supabase
        .from('draws')
        .delete()
        .in('round_id', roundIds);

      const newDraws = [];
      const availableRooms = ['Room A', 'Room B', 'Room C', 'Room D', 'Room E'];

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

      const { error } = await supabase
        .from('draws')
        .insert(newDraws);

      if (error) throw error;
      
      await fetchDraws();
      
      // Enhanced success feedback
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
   * Deletes a round from the tournament
   */
  const deleteRound = async (roundId: string) => {
    try {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId);

      if (error) throw error;
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
   * Deletes a team from the tournament
   */
  const deleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
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
