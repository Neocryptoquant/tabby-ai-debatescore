
import { useEffect, useCallback } from 'react';
import { useTournamentQueries } from './useTournamentQueries';
import { useTournamentMutations } from './useTournamentMutations';
import { useDrawsOperations } from './useDrawsOperations';
import { useJudgesOperations } from './useJudgesOperations';
import { useEnhancedRoundsOperations } from './useEnhancedRoundsOperations';
import { useEnhancedDrawsOperations } from './useEnhancedDrawsOperations';

export const useTournamentData = (tournamentId?: string) => {
  const {
    tournament,
    rounds: basicRounds,
    teams,
    draws,
    isLoading,
    setRounds,
    setTeams,
    fetchTournament,
    fetchRounds: fetchBasicRounds,
    fetchTeams,
    fetchDraws
  } = useTournamentQueries(tournamentId);

  const {
    addRound: addBasicRound,
    addTeam,
    deleteRound: deleteBasicRound,
    deleteTeam
  } = useTournamentMutations(tournamentId, setRounds, setTeams, fetchDraws);

  const { generateDraws } = useDrawsOperations(tournamentId, basicRounds, teams, fetchDraws);

  // Enhanced operations
  const {
    judges,
    isLoading: judgesLoading,
    fetchJudges,
    addJudge,
    deleteJudge
  } = useJudgesOperations(tournamentId);

  const {
    rounds: enhancedRounds,
    isLoading: roundsLoading,
    fetchRounds: fetchEnhancedRounds,
    addRound: addEnhancedRound,
    updateRoundPrivacy,
    deleteRound: deleteEnhancedRound
  } = useEnhancedRoundsOperations(tournamentId);

  const {
    generationHistory,
    isGenerating,
    fetchGenerationHistory,
    generateDrawsWithHistory,
    rollbackToGeneration
  } = useEnhancedDrawsOperations(tournamentId, enhancedRounds, teams, judges, fetchDraws);

  // Memoize the refetch function to prevent unnecessary re-renders
  const refetch = useCallback(() => {
    console.log('Refetching all tournament data');
    if (tournamentId) {
      fetchTournament();
      fetchBasicRounds();
      fetchEnhancedRounds();
      fetchTeams();
      fetchDraws();
      fetchJudges();
      fetchGenerationHistory();
    }
  }, [tournamentId, fetchTournament, fetchBasicRounds, fetchEnhancedRounds, fetchTeams, fetchDraws, fetchJudges, fetchGenerationHistory]);

  // Load data when tournament ID changes
  useEffect(() => {
    if (tournamentId) {
      console.log('Initial loading tournament data for:', tournamentId);
      fetchTournament();
      fetchBasicRounds();
      fetchEnhancedRounds();
      fetchTeams();
      fetchDraws();
      fetchJudges();
      fetchGenerationHistory();
    }
  }, [tournamentId]);

  return {
    // Basic data
    tournament,
    rounds: enhancedRounds.length > 0 ? enhancedRounds : basicRounds,
    teams,
    draws,
    judges,
    isLoading: isLoading || judgesLoading || roundsLoading,
    
    // Basic operations
    addTeam,
    deleteTeam,
    
    // Enhanced operations
    addRound: addEnhancedRound,
    deleteRound: deleteEnhancedRound,
    updateRoundPrivacy,
    addJudge,
    deleteJudge,
    
    // Draw operations
    generateDraws,
    generateDrawsWithHistory,
    rollbackToGeneration,
    generationHistory,
    isGenerating,
    
    // Utility
    refetch
  };
};
