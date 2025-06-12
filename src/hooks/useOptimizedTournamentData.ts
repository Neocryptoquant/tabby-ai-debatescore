import { useMemo } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { Tournament, Team, Round, Draw, Judge } from '@/types/tournament';

/**
 * Optimized hook for tournament data with proper caching and error handling
 * Implements efficient data fetching patterns and memoization
 */
export const useOptimizedTournamentData = (tournamentId?: string) => {
  // Tournament query with long cache time since tournament details rarely change
  const {
    data: tournament,
    isLoading: tournamentLoading,
    error: tournamentError
  } = useOptimizedQuery(
    ['tournament', tournamentId],
    async () => {
      if (!tournamentId) return null;
      
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error) throw error;
      return data as Tournament;
    },
    {
      enabled: !!tournamentId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      errorContext: 'Failed to load tournament details'
    }
  );

  // Teams query with medium cache time
  const {
    data: teams = [],
    isLoading: teamsLoading,
    refetch: refetchTeams
  } = useOptimizedQuery(
    ['teams', tournamentId],
    async () => {
      if (!tournamentId) return [];
      
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('name');

      if (error) throw error;
      return data as Team[];
    },
    {
      enabled: !!tournamentId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      errorContext: 'Failed to load teams'
    }
  );

  // Rounds query with medium cache time
  const {
    data: rounds = [],
    isLoading: roundsLoading,
    refetch: refetchRounds
  } = useOptimizedQuery(
    ['rounds', tournamentId],
    async () => {
      if (!tournamentId) return [];
      
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number');

      if (error) throw error;
      return data as Round[];
    },
    {
      enabled: !!tournamentId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      errorContext: 'Failed to load rounds'
    }
  );

  // Draws query with shorter cache time for real-time updates
  const {
    data: draws = [],
    isLoading: drawsLoading,
    refetch: refetchDraws
  } = useOptimizedQuery(
    ['draws', tournamentId],
    async () => {
      if (!tournamentId) return [];
      
      const { data, error } = await supabase
        .from('draws')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('room');

      if (error) throw error;
      return data as Draw[];
    },
    {
      enabled: !!tournamentId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      errorContext: 'Failed to load draws'
    }
  );

  // Judges query with medium cache time
  const {
    data: judges = [],
    isLoading: judgesLoading,
    refetch: refetchJudges
  } = useOptimizedQuery(
    ['judges', tournamentId],
    async () => {
      if (!tournamentId) return [];
      
      const { data, error } = await supabase
        .from('judges')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('name');

      if (error) throw error;
      return data as Judge[];
    },
    {
      enabled: !!tournamentId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      errorContext: 'Failed to load judges'
    }
  );

  // Memoized computed values to prevent unnecessary recalculations
  const computedData = useMemo(() => {
    const isLoading = tournamentLoading || teamsLoading || roundsLoading || drawsLoading || judgesLoading;
    const hasError = tournamentError;
    
    // Calculate statistics
    const stats = {
      totalTeams: teams.length,
      totalRounds: rounds.length,
      totalDraws: draws.length,
      totalJudges: judges.length,
      activeRounds: rounds.filter(r => r.status === 'active').length,
      completedRounds: rounds.filter(r => r.status === 'completed').length,
    };

    return {
      isLoading,
      hasError,
      stats,
    };
  }, [
    tournamentLoading, teamsLoading, roundsLoading, drawsLoading, judgesLoading,
    tournamentError, teams.length, rounds.length, draws.length, judges.length,
    rounds
  ]);

  // Memoized refetch function
  const refetchAll = useMemo(() => async () => {
    await Promise.all([
      refetchTeams(),
      refetchRounds(),
      refetchDraws(),
      refetchJudges(),
    ]);
  }, [refetchTeams, refetchRounds, refetchDraws, refetchJudges]);

  return {
    // Data
    tournament,
    teams,
    rounds,
    draws,
    judges,
    
    // Loading states
    isLoading: computedData.isLoading,
    hasError: computedData.hasError,
    
    // Statistics
    stats: computedData.stats,
    
    // Actions
    refetchAll,
    refetchTeams,
    refetchRounds,
    refetchDraws,
    refetchJudges,
  };
};