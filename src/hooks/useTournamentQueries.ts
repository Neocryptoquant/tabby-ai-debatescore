import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tournament, Round, Team, Draw } from '@/types/tournament';
import { toast } from 'sonner';

interface TournamentQueriesState {
  tournament: Tournament | null;
  rounds: Round[];
  teams: Team[];
  draws: Draw[];
  isLoading: boolean;
  error: string | null;
}

export const useTournamentQueries = (tournamentId?: string) => {
  const [state, setState] = useState<TournamentQueriesState>({
    tournament: null,
    rounds: [],
    teams: [],
    draws: [],
    isLoading: true,
    error: null
  });

  const updateState = (updates: Partial<TournamentQueriesState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const fetchTournament = async () => {
    if (!tournamentId) return;
    
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error) throw error;
      updateState({ tournament: data as Tournament, error: null });
    } catch (error) {
      console.error('Error fetching tournament:', error);
      updateState({ error: 'Failed to fetch tournament details' });
      toast.error('Failed to fetch tournament details');
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
      updateState({ rounds: (data || []) as Round[], error: null });
    } catch (error) {
      console.error('Error fetching rounds:', error);
      updateState({ error: 'Failed to fetch rounds' });
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
      updateState({ teams: data || [], error: null });
    } catch (error) {
      console.error('Error fetching teams:', error);
      updateState({ error: 'Failed to fetch teams' });
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
          gov_team:teams!gov_team_id(*),
          opp_team:teams!opp_team_id(*),
          cg_team:teams!cg_team_id(*),
          co_team:teams!co_team_id(*),
          judge:judges!judge_id(*)
        `)
        .eq('tournament_id', tournamentId)
        .order('room');

      if (error) throw error;
      updateState({ draws: (data || []) as Draw[], error: null });
    } catch (error) {
      console.error('Error fetching draws:', error);
      updateState({ error: 'Failed to fetch draws' });
      toast.error('Failed to fetch draws');
    }
  };

  const refreshAll = async () => {
    if (!tournamentId) return;
    
    updateState({ isLoading: true, error: null });
    
    try {
      await Promise.all([
        fetchTournament(),
        fetchRounds(),
        fetchTeams(),
        fetchDraws()
      ]);
    } catch (error) {
      console.error('Error refreshing tournament data:', error);
      updateState({ error: 'Failed to refresh tournament data' });
      toast.error('Failed to refresh tournament data');
    } finally {
      updateState({ isLoading: false });
    }
  };

  useEffect(() => {
    if (tournamentId) {
      refreshAll();
    } else {
      updateState({
        tournament: null,
        rounds: [],
        teams: [],
        draws: [],
        isLoading: false,
        error: null
      });
    }
  }, [tournamentId]);

  return {
    ...state,
    refreshAll,
    setRounds: (updater: (prev: Round[]) => Round[]) => updateState({ rounds: updater(state.rounds) }),
    setTeams: (updater: (prev: Team[]) => Team[]) => updateState({ teams: updater(state.teams) }),
    setDraws: (updater: (prev: Draw[]) => Draw[]) => updateState({ draws: updater(state.draws) }),
    fetchTournament,
    fetchRounds,
    fetchTeams,
    fetchDraws
  };
};
