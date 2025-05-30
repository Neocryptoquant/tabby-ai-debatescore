
import { useState } from 'react';
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

  const fetchTournament = async () => {
    if (!tournamentId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error) {
        console.error('Error fetching tournament:', error);
        throw error;
      }
      
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
  };

  const fetchRounds = async () => {
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
  };

  const fetchTeams = async () => {
    if (!tournamentId) return;
    
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('name');

      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }
      
      const typedTeams: Team[] = (data || []).map(team => ({
        id: team.id,
        tournament_id: team.tournament_id,
        name: team.name,
        institution: team.institution || undefined,
        speaker_1: team.speaker_1 || undefined,
        speaker_2: team.speaker_2 || undefined,
        created_at: team.created_at,
        updated_at: team.updated_at
      }));
      
      setTeams(typedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to fetch teams');
    }
  };

  const fetchDraws = async () => {
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
            speaker_2
          ),
          opp_team:teams!draws_opp_team_id_fkey(
            id,
            name,
            institution,
            tournament_id,
            speaker_1,
            speaker_2
          ),
          round:rounds!draws_round_id_fkey(round_number)
        `)
        .in('round_id', roundIds);

      if (error) {
        console.error('Error fetching draws:', error);
        throw error;
      }
      
      const typedDraws: Draw[] = (data || [])
        .map(draw => {
          if (!draw.gov_team || !draw.opp_team || !draw.round) {
            console.warn('Draw missing required relationships:', draw);
            return null;
          }

          return {
            id: draw.id,
            round_id: draw.round_id,
            room: draw.room,
            gov_team_id: draw.gov_team_id,
            opp_team_id: draw.opp_team_id,
            judge: draw.judge || undefined,
            status: (draw.status as 'pending' | 'in_progress' | 'completed') || 'pending',
            gov_score: draw.gov_score || undefined,
            opp_score: draw.opp_score || undefined,
            gov_team: {
              id: draw.gov_team.id,
              tournament_id: draw.gov_team.tournament_id,
              name: draw.gov_team.name,
              institution: draw.gov_team.institution || undefined,
              speaker_1: draw.gov_team.speaker_1 || undefined,
              speaker_2: draw.gov_team.speaker_2 || undefined
            },
            opp_team: {
              id: draw.opp_team.id,
              tournament_id: draw.opp_team.tournament_id,
              name: draw.opp_team.name,
              institution: draw.opp_team.institution || undefined,
              speaker_1: draw.opp_team.speaker_1 || undefined,
              speaker_2: draw.opp_team.speaker_2 || undefined
            },
            round: { round_number: draw.round.round_number },
            created_at: draw.created_at,
            updated_at: draw.updated_at
          } as Draw;
        })
        .filter((draw): draw is Draw => draw !== null);
      
      setDraws(typedDraws);
    } catch (error) {
      console.error('Error fetching draws:', error);
      toast.error('Failed to fetch draws');
    }
  };

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
