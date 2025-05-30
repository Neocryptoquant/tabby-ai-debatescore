
import { useEffect } from 'react';
import { useTournamentQueries } from './useTournamentQueries';
import { useTournamentMutations } from './useTournamentMutations';
import { useDrawsOperations } from './useDrawsOperations';

/**
 * Main hook for managing tournament data including rounds, teams, draws, and related operations
 * Provides CRUD operations with proper error handling and user feedback
 */
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

  // Load data when tournament ID changes
  useEffect(() => {
    if (tournamentId) {
      fetchTournament();
      fetchRounds();
      fetchTeams();
      fetchDraws();
    }
  }, [tournamentId]);

  const refetch = () => {
    fetchTournament();
    fetchRounds();
    fetchTeams();
    fetchDraws();
  };

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
