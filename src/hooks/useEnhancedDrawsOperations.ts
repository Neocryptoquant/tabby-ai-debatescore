import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Round, Team, Judge, Draw } from '@/types/tournament';
import { toast } from 'sonner';

export const useEnhancedDrawsOperations = (
  tournamentId?: string,
  rounds: Round[] = [],
  teams: Team[] = [],
  judges: Judge[] = [],
  refetchDraws?: () => void
) => {
  const [generationHistory, setGenerationHistory] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchGenerationHistory = useCallback(async () => {
    if (!tournamentId) return;
    
    try {
      const { data, error } = await supabase
        .from('draw_generation_history')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setGenerationHistory(data || []);
    } catch (error) {
      console.error('Error fetching generation history:', error);
    }
  }, [tournamentId]);

  const generateDrawsWithHistory = async (
    roundId: string,
    teamsToUse: Team[],
    rooms: string[]
  ) => {
    if (!tournamentId) {
      throw new Error('Tournament ID is required');
    }

    setIsGenerating(true);
    
    try {
      // Clear existing draws for this round
      const { error: deleteError } = await supabase
        .from('draws')
        .delete()
        .eq('round_id', roundId);

      if (deleteError) throw deleteError;

      // Generate new draws
      const drawsToInsert = [];
      const shuffledTeams = [...teamsToUse].sort(() => Math.random() - 0.5);
      const numRooms = Math.floor(shuffledTeams.length / 2);
      
      for (let i = 0; i < numRooms; i++) {
        if (i*2+1 < shuffledTeams.length) {
          const govTeam = shuffledTeams[i*2];
          const oppTeam = shuffledTeams[i*2+1];
          
          drawsToInsert.push({
            round_id: roundId,
            tournament_id: tournamentId,
            room: rooms[i] || `Room ${i+1}`,
            gov_team_id: govTeam.id,
            opp_team_id: oppTeam.id,
            judge_id: judges[i % judges.length]?.id || null,
            judge: judges[i % judges.length]?.name || null,
            status: 'pending'
          });
        }
      }

      // Insert new draws
      const { data, error } = await supabase
        .from('draws')
        .insert(drawsToInsert)
        .select();

      if (error) throw error;

      // Create generation history record
      const { error: historyError } = await supabase
        .from('draw_generation_history')
        .insert({
          tournament_id: tournamentId,
          round_id: roundId,
          generation_method: 'standard',
          generation_params: {
            teams_count: teamsToUse.length,
            rooms_count: rooms.length,
            judges_count: judges.length
          },
          is_current: true
        });

      if (historyError) {
        console.warn('Failed to create generation history:', historyError);
      }

      // Refresh draws
      if (refetchDraws) {
        refetchDraws();
      }

      toast.success(`Generated ${drawsToInsert.length} draws successfully!`);
      return data;
    } catch (error) {
      console.error('Error generating draws:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate draws');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const rollbackToGeneration = async (historyId: string) => {
    // Implementation for rollback functionality
    console.log('Rollback to generation:', historyId);
    toast.info('Rollback functionality coming soon!');
  };

  return {
    generationHistory,
    isGenerating,
    fetchGenerationHistory,
    generateDrawsWithHistory,
    rollbackToGeneration
  };
};