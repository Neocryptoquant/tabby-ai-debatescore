
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

export const useTournamentData = (tournamentId?: string) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchDraws = async () => {
    if (!tournamentId) return;
    
    try {
      const { data, error } = await supabase
        .from('draws')
        .select(`
          *,
          gov_team:gov_team_id(id, name, institution),
          opp_team:opp_team_id(id, name, institution),
          round:round_id(round_number)
        `)
        .in('round_id', 
          await supabase
            .from('rounds')
            .select('id')
            .eq('tournament_id', tournamentId)
            .then(({ data }) => data?.map(r => r.id) || [])
        );

      if (error) throw error;
      // Type assertion to ensure status matches our interface
      const typedDraws = (data || []).map(draw => ({
        ...draw,
        status: draw.status as 'pending' | 'in_progress' | 'completed'
      }));
      setDraws(typedDraws);
    } catch (error) {
      console.error('Error fetching draws:', error);
      toast.error('Failed to fetch draws');
    }
  };

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
      toast.success('Round added successfully!');
      return typedRound;
    } catch (error) {
      console.error('Error adding round:', error);
      toast.error('Failed to add round');
      throw error;
    }
  };

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
      toast.success('Team added successfully!');
      return data;
    } catch (error) {
      console.error('Error adding team:', error);
      toast.error('Failed to add team');
      throw error;
    }
  };

  const generateDraws = async () => {
    if (!tournamentId || teams.length < 2 || rounds.length === 0) {
      toast.error('Need at least 2 teams and 1 round to generate draws');
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
      toast.success('Draws generated successfully!');
    } catch (error) {
      console.error('Error generating draws:', error);
      toast.error('Failed to generate draws');
    }
  };

  const deleteRound = async (roundId: string) => {
    try {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId);

      if (error) throw error;
      setRounds(prev => prev.filter(round => round.id !== roundId));
      toast.success('Round deleted successfully!');
    } catch (error) {
      console.error('Error deleting round:', error);
      toast.error('Failed to delete round');
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      setTeams(prev => prev.filter(team => team.id !== teamId));
      toast.success('Team deleted successfully!');
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    }
  };

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
