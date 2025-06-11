
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tournament, Round, Team, Draw } from '@/types/tournament';

export const useTournamentQueries = (tournamentId?: string) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTournament = async () => {
    if (!tournamentId) return;
    
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
      setRounds(data || []);
    } catch (error) {
      console.error('Error fetching rounds:', error);
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
    }
  };

  const fetchDraws = async () => {
    if (!tournamentId) return;
    
    try {
      const { data, error } = await supabase
        .from('draws')
        .select(`
          *,
          gov_team:teams!gov_team_id(*),
          opp_team:teams!opp_team_id(*),
          cg_team:teams!cg_team_id(*),
          co_team:teams!co_team_id(*),
          judge_obj:judges!judge_id(*)
        `)
        .eq('tournament_id', tournamentId)
        .order('room');

      if (error) throw error;
      setDraws(data || []);
    } catch (error) {
      console.error('Error fetching draws:', error);
    }
  };

  useEffect(() => {
    if (tournamentId) {
      setIsLoading(true);
      Promise.all([
        fetchTournament(),
        fetchRounds(),
        fetchTeams(),
        fetchDraws()
      ]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [tournamentId]);

  return {
    tournament,
    rounds,
    teams,
    draws,
    isLoading,
    setRounds,
    setTeams,
    fetchTournament,
    fetchRounds,
    fetchTeams,
    fetchDraws
  };
};
