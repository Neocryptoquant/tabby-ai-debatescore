
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Round, Team } from '@/types/tournament';

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
      const availableRooms = ['Room A', 'Room B', 'Room C', 'Room D', 'Room E', 'Room F', 'Room G', 'Room H'];

      for (const round of rounds) {
        const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < shuffledTeams.length; i += 2) {
          if (i + 1 < shuffledTeams.length) {
            newDraws.push({
              round_id: round.id,
              room: availableRooms[Math.floor(i / 2)] || `Room ${Math.floor(i / 2) + 1}`,
              gov_team_id: shuffledTeams[i].id,
              opp_team_id: shuffledTeams[i + 1].id,
              status: 'pending' as const
            });
          }
        }
      }

      const { error: insertError } = await supabase
        .from('draws')
        .insert(newDraws);

      if (insertError) {
        console.error('Error inserting new draws:', insertError);
        throw insertError;
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
