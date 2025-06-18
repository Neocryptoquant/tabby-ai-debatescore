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
    rooms: string[],
    format: string // 'bp', 'wsdc', etc.
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

      // Shuffle teams
      const shuffledTeams = [...teamsToUse].sort(() => Math.random() - 0.5);
      const isBP = format === 'bp';
      const teamsPerRoom = isBP ? 4 : 2;
      const numRooms = rooms.length;
      const drawsToInsert = [];
      
      console.log('Creating', numRooms, 'debates');
      console.log('Teams per room:', teamsPerRoom);
      console.log('Total teams available:', shuffledTeams.length);
      
      for (let i = 0; i < numRooms; i++) {
        const roomTeams = [];
        for (let j = 0; j < teamsPerRoom; j++) {
          const teamIndex = i * teamsPerRoom + j;
          if (teamIndex < shuffledTeams.length) {
            roomTeams.push(shuffledTeams[teamIndex]);
          } else {
            // Add swing team if not enough real teams
            roomTeams.push({
              id: `swing-${i}-${j}`,
              tournament_id: tournamentId,
              name: `Swing Team ${String.fromCharCode(65 + j)}`,
              institution: 'Swing'
            });
          }
        }
        
        console.log(`Room ${i + 1} (${rooms[i]}):`, roomTeams.map(t => t.name));
        
        if (isBP) {
          drawsToInsert.push({
            round_id: roundId,
            tournament_id: tournamentId,
            room: rooms[i],
            gov_team_id: roomTeams[0]?.id,
            opp_team_id: roomTeams[1]?.id,
            cg_team_id: roomTeams[2]?.id,
            co_team_id: roomTeams[3]?.id,
            judge_id: judges[i % judges.length]?.id || null,
            judge: judges[i % judges.length]?.name || null,
            status: 'pending'
          });
        } else {
          drawsToInsert.push({
            round_id: roundId,
            tournament_id: tournamentId,
            room: rooms[i],
            gov_team_id: roomTeams[0]?.id,
            opp_team_id: roomTeams[1]?.id,
            judge_id: judges[i % judges.length]?.id || null,
            judge: judges[i % judges.length]?.name || null,
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
            judges_count: judges.length,
            format
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
