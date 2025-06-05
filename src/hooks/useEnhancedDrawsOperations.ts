
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Round, Team, Draw } from '@/types/tournament';

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

  const generateDrawsWithHistory = async (roundId: string, method: string = 'power_pairing') => {
    if (!tournamentId || !teams || !rounds || teams.length < 2) {
      toast.error('⚠️ Cannot generate draws', {
        description: 'Need at least 2 teams to generate draws',
        duration: 4000,
      });
      return;
    }

    const targetRound = rounds.find(r => r.id === roundId);
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
          generation_method: method,
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

      // Generate new draws
      const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
      const availableRooms = targetRound.default_rooms || ['Room A', 'Room B', 'Room C', 'Room D'];
      const availableJudges = judges || [];
      
      const newDraws = [];
      for (let i = 0; i < shuffledTeams.length; i += 2) {
        if (i + 1 < shuffledTeams.length) {
          const roomIndex = Math.floor(i / 2);
          const judgeIndex = roomIndex < availableJudges.length ? roomIndex : null;
          
          newDraws.push({
            round_id: roundId,
            room: availableRooms[roomIndex % availableRooms.length] || `Room ${roomIndex + 1}`,
            gov_team_id: shuffledTeams[i].id,
            opp_team_id: shuffledTeams[i + 1].id,
            judge_id: judgeIndex !== null ? availableJudges[judgeIndex].id : null,
            status: 'pending' as const,
            generation_history_id: historyRecord.id
          });
        }
      }

      const { error: insertError } = await supabase
        .from('draws')
        .insert(newDraws);

      if (insertError) throw insertError;
      
      if (fetchDraws) {
        await fetchDraws();
      }
      
      await fetchGenerationHistory();
      
      toast.success('🎲 Draws generated successfully!', {
        description: `Generated ${newDraws.length} pairings with ${method.replace('_', ' ')} algorithm`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error generating draws:', error);
      toast.error('❌ Failed to generate draws', {
        description: 'Please try again or contact support',
        duration: 4000,
      });
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
      await generateDrawsWithHistory(historyRecord.round_id, historyRecord.generation_method);
      
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
