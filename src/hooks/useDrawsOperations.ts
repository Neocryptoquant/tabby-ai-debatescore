import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Round, Team } from '@/types/tournament';
import { EnhancedDrawGenerator } from '@/services/enhancedDrawGenerator';

/**
 * Custom hook for draw generation and management operations
 */
export const useDrawsOperations = (
  tournamentId?: string,
  rounds?: Round[],
  teams?: Team[],
  fetchDraws?: () => Promise<void>
) => {
  const generateDraws = async () => {
    if (!tournamentId || !teams || !rounds || teams.length < 2 || rounds.length === 0) {
      toast.error('⚠️ Cannot generate draws', {
        description: 'Need at least 2 teams and 1 round to generate draws',
        duration: 4000,
      });
      return;
    }

    try {
      // Delete existing draws for this tournament
      const roundIds = rounds.map(r => r.id);
      const { error: deleteError } = await supabase
        .from('draws')
        .delete()
        .in('round_id', roundIds);

      if (deleteError) {
        console.error('Error deleting existing draws:', deleteError);
        throw deleteError;
      }

      const newDraws = [];

      for (const round of rounds) {
        // Use round-specific rooms if available, otherwise fallback to default
        const roundRooms = round.rooms || ['Room A', 'Room B', 'Room C', 'Room D'];
        
        try {
          // Create draw generator for this round
          const drawGenerator = new EnhancedDrawGenerator(
            teams,
            [], // No judges for now - can be enhanced later
            roundRooms,
            {
              method: 'random',
              avoidInstitutionClashes: true,
              balanceExperience: true
            }
          );

          // Generate draws for this round
          const drawRooms = drawGenerator.generateDraws();
          
          // Convert to database format
          const roundDraws = drawGenerator.convertToDraws(
            drawRooms, 
            round.id, 
            tournamentId
          );
          
          newDraws.push(...roundDraws);
          
        } catch (error) {
          console.error(`Error generating draws for round ${round.round_number}:`, error);
          toast.error(`Failed to generate draws for Round ${round.round_number}`, {
            description: error instanceof Error ? error.message : 'Unknown error',
            duration: 4000,
          });
          // Continue with other rounds
        }
      }

      if (newDraws.length > 0) {
        const { error: insertError } = await supabase
          .from('draws')
          .insert(newDraws);

        if (insertError) {
          console.error('Error inserting new draws:', insertError);
          throw insertError;
        }
      }
      
      if (fetchDraws) {
        await fetchDraws();
      }
      
      toast.success('🎲 Draws generated successfully!', {
        description: `Generated ${newDraws.length} pairings across ${rounds.length} rounds`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error generating draws:', error);
      toast.error('❌ Failed to generate draws', {
        description: 'Please try again or contact support',
        duration: 4000,
      });
    }
  };

  return { generateDraws };
};
