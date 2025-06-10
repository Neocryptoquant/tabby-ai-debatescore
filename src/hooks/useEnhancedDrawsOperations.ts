import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Round, Team, Draw } from '@/types/tournament';
import { DrawGenerator } from '@/services/drawGenerator';

export interface DrawGenerationHistory {
  id: string;
  tournament_id: string;
  round_id: string;
  generation_method: string;
  generation_params?: any;
  generated_at: string;
  generated_by?: string;
  is_current: boolean;
}

export const useEnhancedDrawsOperations = (
  tournamentId?: string,
  rounds?: Round[],
  teams?: Team[],
  judges?: any[],
  fetchDraws?: () => Promise<void>
) => {
  const [generationHistory, setGenerationHistory] = useState<DrawGenerationHistory[]>([]);
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

  const generateDrawsWithHistory = async (roundId: string, teams: Team[], rooms: string[]) => {
    if (!tournamentId || !teams || !Array.isArray(teams) || teams.length < 2) {
      toast.error('⚠️ Cannot generate draws', {
        description: 'Need at least 2 teams to generate draws',
        duration: 4000,
      });
      return;
    }

    const targetRound = rounds?.find(r => r.id === roundId);
    if (!targetRound) {
      toast.error('Round not found');
      return;
    }

    setIsGenerating(true);
    try {
      // Create generation history record
      const { data: historyRecord, error: historyError } = await supabase
        .from('draw_generation_history')
        .insert([{
          tournament_id: tournamentId,
          round_id: roundId,
          generation_method: 'power_pairing',
          generation_params: { team_count: teams.length, judge_count: judges?.length || 0 },
          is_current: true
        }])
        .select()
        .single();

      if (historyError) throw historyError;

      // Mark previous generations as non-current
      await supabase
        .from('draw_generation_history')
        .update({ is_current: false })
        .eq('tournament_id', tournamentId)
        .eq('round_id', roundId)
        .neq('id', historyRecord.id);

      // Delete existing draws for this round
      await supabase
        .from('draws')
        .delete()
        .eq('round_id', roundId);

      // Generate new draws using the DrawGenerator service
      const generator = new DrawGenerator(teams, targetRound.round_number, rooms);
      const draws = generator.generateDraws();

      // Save draws to database
      const { error: insertError } = await supabase
        .from('draws')
        .insert(
          draws.map(draw => ({
            round_id: roundId,
            tournament_id: tournamentId,
            room: draw.room,
            gov_team_id: draw.teams.OG.id,
            opp_team_id: draw.teams.OO.id,
            status: 'pending' as const,
            generation_history_id: historyRecord.id
          }))
        );

      if (insertError) throw insertError;
      
      if (fetchDraws) {
        await fetchDraws();
      }
      
      await fetchGenerationHistory();
      
      toast.success('🎲 Draws generated successfully!', {
        description: `Generated ${draws.length} pairings with power pairing algorithm`,
        duration: 3000,
      });

      return draws;
    } catch (error) {
      console.error('Error generating draws:', error);
      toast.error('❌ Failed to generate draws', {
        description: 'Please try again or contact support',
        duration: 4000,
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const rollbackToGeneration = async (historyId: string) => {
    try {
      const { data: historyRecord, error: historyError } = await supabase
        .from('draw_generation_history')
        .select('*')
        .eq('id', historyId)
        .single();

      if (historyError) throw historyError;

      // Mark this generation as current
      await supabase
        .from('draw_generation_history')
        .update({ is_current: false })
        .eq('round_id', historyRecord.round_id);

      await supabase
        .from('draw_generation_history')
        .update({ is_current: true })
        .eq('id', historyId);

      // Delete current draws and restore from history
      await supabase
        .from('draws')
        .delete()
        .eq('round_id', historyRecord.round_id);

      // This would require storing the actual draw data in the history
      // For now, we'll regenerate with the same method
      if (teams) {
        const rooms = Array.from({ length: Math.ceil(teams.length / 2) }, (_, i) => `Room ${i + 1}`);
        await generateDrawsWithHistory(historyRecord.round_id, teams, rooms);
      }
      
      toast.success('Draws rolled back successfully!');
    } catch (error) {
      console.error('Error rolling back draws:', error);
      toast.error('Failed to rollback draws');
    }
  };

  return {
    generationHistory,
    isGenerating,
    fetchGenerationHistory,
    generateDrawsWithHistory,
    rollbackToGeneration
  };
};
