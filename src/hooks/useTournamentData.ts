
import { useEffect, useCallback } from 'react';
import { useTournamentQueries } from './useTournamentQueries';
import { useTournamentMutations } from './useTournamentMutations';
import { useDrawsOperations } from './useDrawsOperations';

export const useTournamentData = (tournamentId?: string) => {
  const {
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
  } = useTournamentQueries(tournamentId);

  const {
    addRound,
    addTeam,
    deleteRound,
    deleteTeam
  } = useTournamentMutations(tournamentId, setRounds, setTeams, fetchDraws);

  const { generateDraws } = useDrawsOperations(tournamentId, rounds, teams, fetchDraws);

  // Memoize the refetch function to prevent unnecessary re-renders
  const refetch = useCallback(() => {
    console.log('Refetching all tournament data');
    if (tournamentId) {
      fetchTournament();
      fetchRounds();
      fetchTeams();
      fetchDraws();
    }
  }, [tournamentId, fetchTournament, fetchRounds, fetchTeams, fetchDraws]);

  // Load data when tournament ID changes - use a ref to prevent infinite loops
  useEffect(() => {
    if (tournamentId) {
      console.log('Initial loading tournament data for:', tournamentId);
      fetchTournament();
      fetchRounds();
      fetchTeams();
      fetchDraws();
    }
  }, [tournamentId]); // Only depend on tournamentId, not the fetch functions

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
    refetch
  };
};
