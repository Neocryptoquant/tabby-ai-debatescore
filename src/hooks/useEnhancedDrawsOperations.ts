
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateBPDraws } from '@/services/bpDrawGenerator';
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
      // Generate British Parliamentary draws
      const newDraws = generateBPDraws(roundId, teamsToUse, judges, rooms);
      
      if (newDraws.length === 0) {
        throw new Error('No draws could be generated');
      }

      // Clear existing draws for this round
      const { error: deleteError } = await supabase
        .from('draws')
        .delete()
        .eq('round_id', roundId);

      if (deleteError) throw deleteError;

      // Insert new draws
      const { error: insertError } = await supabase
        .from('draws')
        .insert(newDraws);

      if (insertError) throw insertError;

      // Create generation history record
      const { error: historyError } = await supabase
        .from('draw_generation_history')
        .insert({
          tournament_id: tournamentId,
          round_id: roundId,
          generation_method: 'british_parliamentary',
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

      toast.success(`Generated ${newDraws.length} British Parliamentary draws successfully!`);
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
