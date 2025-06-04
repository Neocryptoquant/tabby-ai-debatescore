
import { useEffect } from 'react';
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

  // Load data when tournament ID changes
  useEffect(() => {
    if (tournamentId) {
      console.log('Loading tournament data for:', tournamentId);
      fetchTournament();
      fetchRounds();
      fetchTeams();
      fetchDraws();
    }
  }, [tournamentId, fetchTournament, fetchRounds, fetchTeams, fetchDraws]);

  const refetch = () => {
    console.log('Refetching all tournament data');
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
