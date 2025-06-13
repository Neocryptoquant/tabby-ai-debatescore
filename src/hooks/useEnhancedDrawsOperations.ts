
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
  const [generationHistory, setGenerationHistory] = useState<unknown[]>([]);
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

    if (teamsToUse.length < 2) {
      throw new Error('At least 2 teams are required to generate draws');
    }

    setIsGenerating(true);
    
    try {
      console.log('Generating draws for round:', roundId);
      console.log('Teams to use:', teamsToUse);
      console.log('Rooms:', rooms);

      // Clear existing draws for this round
      const { error: deleteError } = await supabase
        .from('draws')
        .delete()
        .eq('round_id', roundId);

      if (deleteError) {
        console.error('Error deleting existing draws:', deleteError);
        throw deleteError;
      }

      // Validate we have enough teams
      if (teamsToUse.length % 2 !== 0) {
        console.warn('Odd number of teams, one team will have a bye');
      }

      // Generate new draws
      const drawsToInsert = [];
      const shuffledTeams = [...teamsToUse].sort(() => Math.random() - 0.5);
      const numRooms = Math.floor(shuffledTeams.length / 2);
      
      console.log('Creating', numRooms, 'debates');
      
      for (let i = 0; i < numRooms; i++) {
        const govTeam = shuffledTeams[i * 2];
        const oppTeam = shuffledTeams[i * 2 + 1];
        
        if (govTeam && oppTeam) {
          const roomName = rooms[i] || `Room ${i + 1}`;
          const assignedJudge = judges[i % judges.length];
          
          drawsToInsert.push({
            round_id: roundId,
            tournament_id: tournamentId,
            room: roomName,
            gov_team_id: govTeam.id,
            opp_team_id: oppTeam.id,
            judge_id: assignedJudge?.id || null,
            judge: assignedJudge?.name || null,
            status: 'pending'
          });
        }
      }

      console.log('Draws to insert:', drawsToInsert);

      if (drawsToInsert.length === 0) {
        throw new Error('No valid draws could be generated');
      }

      // Insert new draws
      const { data, error } = await supabase
        .from('draws')
        .insert(drawsToInsert)
        .select();

      if (error) {
        console.error('Error inserting draws:', error);
        throw error;
      }

      console.log('Draws inserted successfully:', data);

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
        setTimeout(() => {
          refetchDraws();
        }, 500);
      }

      toast.success(`Generated ${drawsToInsert.length} draws successfully!`);
      return data;
    } catch (error) {
      console.error('Error generating draws:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate draws';
      toast.error(errorMessage);
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
