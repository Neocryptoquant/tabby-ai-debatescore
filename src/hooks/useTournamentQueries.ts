import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tournament, Round, Team, Draw } from '@/types/tournament';

/**
 * Custom hook for tournament data fetching operations
 */
export const useTournamentQueries = (tournamentId?: string) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Set up real-time subscription for teams
  useEffect(() => {
    if (!tournamentId) return;

    console.log('Setting up teams subscription for tournament:', tournamentId);
    const teamsSubscription = supabase
      .channel('teams-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
          filter: `tournament_id=eq.${tournamentId}`
        },
        (payload) => {
          console.log('Teams changed event received:', payload);
          console.log('Current teams state:', teams);
          fetchTeams();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up teams subscription');
      teamsSubscription.unsubscribe();
    };
  }, [tournamentId]);

  // Memoize fetch functions to prevent infinite loops
  const fetchTournament = useCallback(async () => {
    if (!tournamentId) return;
    
    setIsLoading(true);
    try {
      console.log('Fetching tournament:', tournamentId);
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error) {
        console.error('Error fetching tournament:', error);
        throw error;
      }
      
      console.log('Tournament data received:', data);
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
  }, [tournamentId]);

  const fetchRounds = useCallback(async () => {
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
  }, [tournamentId]);

  const fetchTeams = useCallback(async () => {
    if (!tournamentId) return;
    
    try {
      console.log('Fetching teams for tournament:', tournamentId);
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('name');

      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }
      
      console.log('Raw teams data from database:', data);
      if (!data || !Array.isArray(data)) {
        console.error('Invalid teams data:', data);
        setTeams([]);
        return;
      }

      const typedTeams: Team[] = data.map(team => ({
        id: team.id,
        tournament_id: team.tournament_id,
        name: team.name,
        institution: team.institution || undefined,
        speaker_1: team.speaker_1 || undefined,
        speaker_2: team.speaker_2 || undefined,
        experience_level: team.experience_level || 'novice',
        break_category: team.break_category || undefined,
        created_at: team.created_at,
        updated_at: team.updated_at
      }));
      
      console.log('Typed teams after processing:', typedTeams);
      console.log('Number of teams:', typedTeams.length);
      setTeams(typedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to fetch teams');
      setTeams([]);
    }
  }, [tournamentId]);

  const fetchDraws = useCallback(async () => {
    if (!tournamentId) return;
    
    try {
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
            speaker_2,
            experience_level,
            break_category
          ),
          opp_team:teams!draws_opp_team_id_fkey(
            id,
            name,
            institution,
            tournament_id,
            speaker_1,
            speaker_2,
            experience_level,
            break_category
          )
        `)
        .in('round_id', roundIds)
        .order('room');

      if (error) {
        console.error('Error fetching draws:', error);
        throw error;
      }
      
      const typedDraws: Draw[] = (data || []).map(draw => ({
        id: draw.id,
        round_id: draw.round_id,
        tournament_id: tournamentId,
        room: draw.room,
        gov_team_id: draw.gov_team_id,
        opp_team_id: draw.opp_team_id,
        status: (draw.status as 'pending' | 'in_progress' | 'completed') || 'pending',
        created_at: draw.created_at,
        updated_at: draw.updated_at,
        gov_team: draw.gov_team,
        opp_team: draw.opp_team
      }));
      
      setDraws(typedDraws);
    } catch (error) {
      console.error('Error fetching draws:', error);
      toast.error('Failed to fetch draws');
      setDraws([]);
    }
  }, [tournamentId]);

  return {
    tournament,
    rounds,
    teams,
    draws,
    isLoading,
    setTournament,
    setRounds,
    setTeams,
    setDraws,
    fetchTournament,
    fetchRounds,
    fetchTeams,
    fetchDraws
  };
};
