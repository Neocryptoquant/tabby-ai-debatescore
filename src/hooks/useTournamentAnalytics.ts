import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TournamentAnalytic {
  id: string;
  tournament_id: string;
  team_id?: string;
  round_id?: string;
  metric_type: string;
  metric_value: number;
  metadata?: unknown;
  created_at: string;
}

export interface TeamPerformance {
  team_id: string;
  team_name: string;
  institution?: string;
  wins: number;
  losses: number;
  total_speaker_score: number;
  average_speaker_score: number;
  rounds_participated: number;
}

export interface SpeakerRanking {
  team_id: string;
  team_name: string;
  speaker_name: string;
  speaker_position: 1 | 2;
  total_score: number;
  average_score: number;
  rounds_spoken: number;
}

export const useTournamentAnalytics = (tournamentId?: string) => {
  const [analytics, setAnalytics] = useState<TournamentAnalytic[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [speakerRankings, setSpeakerRankings] = useState<SpeakerRanking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      fetchAnalytics();
      calculateTeamPerformance();
      calculateSpeakerRankings();
    }
  }, [tournamentId]);

  const fetchAnalytics = async () => {
    if (!tournamentId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournament_analytics')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching analytics:', error);
        return;
      }

      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTeamPerformance = async () => {
    if (!tournamentId) return;

    try {
      // Fetch all draws with team information
      const { data: draws, error: drawsError } = await supabase
        .from('draws')
        .select(`
          *,
          gov_team:teams!draws_gov_team_id_fkey(id, name, institution),
          opp_team:teams!draws_opp_team_id_fkey(id, name, institution),
          round:rounds!draws_round_id_fkey(tournament_id)
        `)
        .eq('round.tournament_id', tournamentId)
        .eq('status', 'completed');

      if (drawsError) {
        console.error('Error fetching draws for analytics:', drawsError);
        return;
      }

      // Calculate team performance
      const teamStats: { [key: string]: TeamPerformance } = {};

      draws?.forEach(draw => {
        if (!draw.gov_team || !draw.opp_team) return;

        const govScore = draw.gov_score || 0;
        const oppScore = draw.opp_score || 0;
        const govWins = govScore > oppScore ? 1 : 0;
        const oppWins = oppScore > govScore ? 1 : 0;

        // Government team stats
        if (!teamStats[draw.gov_team.id]) {
          teamStats[draw.gov_team.id] = {
            team_id: draw.gov_team.id,
            team_name: draw.gov_team.name,
            institution: draw.gov_team.institution,
            wins: 0,
            losses: 0,
            total_speaker_score: 0,
            average_speaker_score: 0,
            rounds_participated: 0
          };
        }
        teamStats[draw.gov_team.id].wins += govWins;
        teamStats[draw.gov_team.id].losses += (1 - govWins);
        teamStats[draw.gov_team.id].total_speaker_score += govScore;
        teamStats[draw.gov_team.id].rounds_participated += 1;

        // Opposition team stats
        if (!teamStats[draw.opp_team.id]) {
          teamStats[draw.opp_team.id] = {
            team_id: draw.opp_team.id,
            team_name: draw.opp_team.name,
            institution: draw.opp_team.institution,
            wins: 0,
            losses: 0,
            total_speaker_score: 0,
            average_speaker_score: 0,
            rounds_participated: 0
          };
        }
        teamStats[draw.opp_team.id].wins += oppWins;
        teamStats[draw.opp_team.id].losses += (1 - oppWins);
        teamStats[draw.opp_team.id].total_speaker_score += oppScore;
        teamStats[draw.opp_team.id].rounds_participated += 1;
      });

      // Calculate averages and sort by performance
      const performance = Object.values(teamStats)
        .map(team => ({
          ...team,
          average_speaker_score: team.rounds_participated > 0 
            ? team.total_speaker_score / team.rounds_participated 
            : 0
        }))
        .sort((a, b) => {
          // Sort by wins first, then by average speaker score
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.average_speaker_score - a.average_speaker_score;
        });

      setTeamPerformance(performance);
    } catch (error) {
      console.error('Error calculating team performance:', error);
    }
  };

  const calculateSpeakerRankings = async () => {
    if (!tournamentId) return;

    try {
      // This is a simplified calculation - in a real system, you'd need individual speaker scores
      // For now, we'll use team scores divided by 2 as an approximation
      const { data: teams, error } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId);

      if (error) {
        console.error('Error fetching teams for speaker rankings:', error);
        return;
      }

      const speakers: SpeakerRanking[] = [];
      
      teamPerformance.forEach(team => {
        const teamData = teams?.find(t => t.id === team.team_id);
        if (!teamData) return;

        // Create entries for both speakers
        if (teamData.speaker_1) {
          speakers.push({
            team_id: team.team_id,
            team_name: team.team_name,
            speaker_name: teamData.speaker_1,
            speaker_position: 1,
            total_score: team.total_speaker_score / 2, // Simplified calculation
            average_score: team.average_speaker_score / 2,
            rounds_spoken: team.rounds_participated
          });
        }

        if (teamData.speaker_2) {
          speakers.push({
            team_id: team.team_id,
            team_name: team.team_name,
            speaker_name: teamData.speaker_2,
            speaker_position: 2,
            total_score: team.total_speaker_score / 2, // Simplified calculation
            average_score: team.average_speaker_score / 2,
            rounds_spoken: team.rounds_participated
          });
        }
      });

      speakers.sort((a, b) => b.total_score - a.total_score);
      setSpeakerRankings(speakers);
    } catch (error) {
      console.error('Error calculating speaker rankings:', error);
    }
  };

  const recordAnalytic = async (
    metric_type: string,
    metric_value: number,
    metadata?: unknown,
    team_id?: string,
    round_id?: string
  ) => {
    if (!tournamentId) return;

    try {
      const { error } = await supabase
        .from('tournament_analytics')
        .insert({
          tournament_id: tournamentId,
          team_id,
          round_id,
          metric_type,
          metric_value,
          metadata
        });

      if (error) {
        console.error('Error recording analytic:', error);
        return;
      }

      fetchAnalytics();
    } catch (error) {
      console.error('Error recording analytic:', error);
    }
  };

  const exportAnalytics = () => {
    const csvData = [
      ['Team', 'Institution', 'Wins', 'Losses', 'Total Score', 'Average Score', 'Rounds'],
      ...teamPerformance.map(team => [
        team.team_name,
        team.institution || '',
        team.wins.toString(),
        team.losses.toString(),
        team.total_speaker_score.toString(),
        team.average_speaker_score.toFixed(2),
        team.rounds_participated.toString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tournament-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    analytics,
    teamPerformance,
    speakerRankings,
    isLoading,
    recordAnalytic,
    exportAnalytics,
    refetch: () => {
      fetchAnalytics();
      calculateTeamPerformance();
      calculateSpeakerRankings();
    }
  };
};
