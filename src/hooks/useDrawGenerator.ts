import { useState, useCallback } from 'react';
import { Team, Draw, Judge } from '@/types/tournament';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EnhancedDrawGenerator } from '@/services/enhancedDrawGenerator';

interface UseDrawGeneratorProps {
  tournamentId: string;
  roundId: string;
  teams: Team[];
  judges: Judge[];
  rooms: string[];
}

export function useDrawGenerator({ tournamentId, roundId, teams, judges, rooms }: UseDrawGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<Draw[]>([]);

  const generateDraws = useCallback(async (method: 'random' | 'power_pairing' | 'swiss' | 'balanced' = 'random') => {
    console.log('Generating draws with teams:', teams);
    console.log('Number of teams:', teams?.length);
    console.log('Number of judges:', judges?.length);
    console.log('Round ID:', roundId);
    console.log('Tournament ID:', tournamentId);

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

    if (teams.length < 4) {
      console.error('Not enough teams for BP format');
      toast.error('Need at least 4 teams for British Parliamentary format');
      return;
    }

    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      console.error('No rooms available:', rooms);
      toast.error('No rooms available for draw generation');
      return;
    }

    if (!roundId) {
      console.error('No round ID provided');
      toast.error('Round ID is required for draw generation');
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

      if (roundError) {
        console.error('Error fetching round:', roundError);
        throw roundError;
      }
      if (!roundData) throw new Error('Round not found');

      console.log('Round data:', roundData);

      // Delete existing draws for this round first
      const { error: deleteError } = await supabase
        .from('draws')
        .delete()
        .eq('round_id', roundId);

      if (deleteError) {
        console.error('Error deleting existing draws:', deleteError);
        throw deleteError;
      }

      // Create enhanced draw generator instance
      const generator = new EnhancedDrawGenerator(teams, judges, rooms, {
        method,
        avoidInstitutionClashes: true,
        balanceExperience: true
      });

      // Generate draw rooms
      const drawRooms = generator.generateDraws();
      console.log('Generated draw rooms:', drawRooms);

      // Convert to database format
      const drawsToInsert = generator.convertToDraws(drawRooms, roundId, tournamentId);

      console.log('Inserting draws:', drawsToInsert);

      // Convert to proper database format (only include fields that exist in database)
      const drawsForDatabase = drawsToInsert.map(draw => ({
        round_id: draw.round_id,
        tournament_id: draw.tournament_id,
        room: draw.room,
        gov_team_id: draw.gov_team_id,
        opp_team_id: draw.opp_team_id,
        judge_id: draw.judge_id,
        judge: draw.judge,
        status: draw.status
      }));

      const { data, error } = await supabase
        .from('draws')
        .insert(drawsForDatabase)
        .select();

      if (error) {
        console.error('Error inserting draws:', error);
        throw error;
      }

      console.log('Successfully inserted draws:', data);

      // Update generation history with proper typing
      const newDraws: Draw[] = (data || []).map(draw => ({
        id: draw.id,
        round_id: draw.round_id,
        tournament_id: draw.tournament_id || tournamentId,
        room: draw.room,
        gov_team_id: draw.gov_team_id,
        opp_team_id: draw.opp_team_id,
        judge_id: draw.judge_id,
        status: draw.status as 'pending' | 'in_progress' | 'completed',
        created_at: draw.created_at,
        updated_at: draw.updated_at
      }));
      setGenerationHistory(prev => [...prev, ...newDraws]);

      toast.success(`Successfully generated ${drawRooms.length} draws!`);
      return newDraws;
    } catch (error) {
      console.error('Error generating draws:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate draws');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [tournamentId, roundId, teams, judges, rooms]);

  const regenerateDraws = useCallback(async () => {
    // Generate new draws with different randomization
    return generateDraws();
  }, [generateDraws]);

  return {
    generateDraws,
    regenerateDraws,
    isGenerating,
    generationHistory
  };
}