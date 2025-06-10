import { useState, useCallback } from 'react';
import { DrawGenerator } from '@/services/drawGenerator';
import { Team, Draw } from '@/types/tournament';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseDrawGeneratorProps {
  tournamentId: string;
  roundId: string;
  teams: Team[];
  rooms: string[];
}

export function useDrawGenerator({ tournamentId, roundId, teams, rooms }: UseDrawGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<Draw[]>([]);

  const generateDraws = useCallback(async (method: 'power_pairing' | 'random' = 'power_pairing') => {
    console.log('Generating draws with teams:', teams);
    console.log('Number of teams:', teams?.length);
    console.log('Teams array:', teams);

    if (!teams || !Array.isArray(teams)) {
      console.error('Teams is not an array:', teams);
      toast.error('Invalid teams data');
      return;
    }

    if (teams.length === 0) {
      console.error('No teams available');
      toast.error('No teams available for draw generation');
      return;
    }

    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      console.error('No rooms available:', rooms);
      toast.error('No rooms available for draw generation');
      return;
    }

    setIsGenerating(true);
    try {
      // Get the round number from the database
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .select('round_number')
        .eq('id', roundId)
        .single();

      if (roundError) throw roundError;
      if (!roundData) throw new Error('Round not found');

      // Create draw generator instance
      const generator = new DrawGenerator(teams, roundData.round_number, rooms);

      // Generate draws
      const draws = generator.generateDraws();

      // Save draws to database
      const { data, error } = await supabase
        .from('draws')
        .insert(
          draws.map(draw => ({
            round_id: roundId,
            tournament_id: tournamentId,
            room: draw.room,
            gov_team_id: draw.teams.OG.id,
            opp_team_id: draw.teams.OO.id,
            status: 'pending' as const
          }))
        )
        .select();

      if (error) throw error;

      // Update generation history with proper typing
      const newDraws: Draw[] = (data || []).map(draw => ({
        ...draw,
        tournament_id: tournamentId,
        status: draw.status as 'pending' | 'in_progress' | 'completed',
        gov_team: teams.find(t => t.id === draw.gov_team_id),
        opp_team: teams.find(t => t.id === draw.opp_team_id)
      }));
      setGenerationHistory(prev => [...prev, ...newDraws]);

      toast.success('Draws generated successfully!');
      return newDraws;
    } catch (error) {
      console.error('Error generating draws:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate draws');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [tournamentId, roundId, teams, rooms]);

  const regenerateDraws = useCallback(async () => {
    // Delete existing draws
    const { error: deleteError } = await supabase
      .from('draws')
      .delete()
      .eq('round_id', roundId);

    if (deleteError) {
      console.error('Error deleting existing draws:', deleteError);
      toast.error('Failed to delete existing draws');
      return;
    }

    // Generate new draws
    return generateDraws();
  }, [roundId, generateDraws]);

  return {
    generateDraws,
    regenerateDraws,
    isGenerating,
    generationHistory
  };
} 