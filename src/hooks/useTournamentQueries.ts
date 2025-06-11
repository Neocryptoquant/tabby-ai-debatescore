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
      // Simplified query that doesn't rely on foreign key relationships that might not exist
      const { data, error } = await supabase
        .from('draws')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('room');

      if (error) throw error;
      
      // Manually fetch related data
      const enhancedDraws = await enhanceDrawsWithRelations(data || []);
      setDraws(enhancedDraws);
    } catch (error) {
      console.error('Error fetching draws:', error);
    }
  };
  
  // Manually fetch related data for draws
  const enhanceDrawsWithRelations = async (draws: Draw[]) => {
    if (draws.length === 0) return [];
    
    try {
      // Get all team IDs from draws
      const teamIds = new Set<string>();
      const judgeIds = new Set<string>();
      
      draws.forEach(draw => {
        if (draw.gov_team_id) teamIds.add(draw.gov_team_id);
        if (draw.opp_team_id) teamIds.add(draw.opp_team_id);
        if (draw.judge_id) judgeIds.add(draw.judge_id);
      });
      
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', Array.from(teamIds));
        
      if (teamsError) throw teamsError;
      
      // Fetch judges
      const { data: judgesData, error: judgesError } = await supabase
        .from('judges')
        .select('*')
        .in('id', Array.from(judgeIds));
        
      if (judgesError) throw judgesError;
      
      // Create lookup maps
      const teamsMap = new Map();
      teamsData?.forEach(team => teamsMap.set(team.id, team));
      
      const judgesMap = new Map();
      judgesData?.forEach(judge => judgesMap.set(judge.id, judge));
      
      // Enhance draws with related data
      return draws.map(draw => ({
        ...draw,
        gov_team: teamsMap.get(draw.gov_team_id),
        opp_team: teamsMap.get(draw.opp_team_id),
        judge_obj: judgesMap.get(draw.judge_id)
      }));
    } catch (error) {
      console.error('Error enhancing draws:', error);
      return draws;
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