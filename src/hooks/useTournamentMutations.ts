
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Round, Team } from '@/types/tournament';

export const useTournamentMutations = (
  tournamentId?: string,
  setRounds?: (updater: (prev: Round[]) => Round[]) => void,
  setTeams?: (updater: (prev: Team[]) => Team[]) => void,
  fetchDraws?: () => Promise<void>
) => {
  const addRound = async (roundData: Omit<Round, 'id' | 'tournament_id' | 'created_at' | 'updated_at'>) => {
    if (!tournamentId) {
      console.error('No tournament ID provided for addRound');
      return;
    }

    try {
      console.log('Adding round with data:', roundData);
      
      const { data, error } = await supabase
        .from('rounds')
        .insert([{ ...roundData, tournament_id: tournamentId }])
        .select()
        .single();

      if (error) {
        console.error('Error adding round:', error);
        throw error;
      }
      
      console.log('Round added successfully:', data);
      
      const typedRound: Round = {
        id: data.id,
        tournament_id: data.tournament_id,
        round_number: data.round_number,
        motion: data.motion,
        info_slide: data.info_slide || undefined,
        start_time: data.start_time || undefined,
        status: (data.status as 'upcoming' | 'active' | 'completed') || 'upcoming',
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      if (setRounds) {
        setRounds(prev => [...prev, typedRound].sort((a, b) => a.round_number - b.round_number));
      }
      
      toast.success('🎯 Round added successfully!', {
        description: `Round ${roundData.round_number} has been created`,
        duration: 3000,
      });
      
      return typedRound;
    } catch (error) {
      console.error('Error adding round:', error);
      toast.error('❌ Failed to add round', {
        description: 'Please check your data and try again',
        duration: 4000,
      });
      throw error;
    }
  };

  const addTeam = async (teamData: Omit<Team, 'id' | 'tournament_id' | 'created_at' | 'updated_at'>) => {
    if (!tournamentId) {
      console.error('No tournament ID provided for addTeam');
      return;
    }

    try {
      console.log('Adding team with data:', teamData);
      
      const { data, error } = await supabase
        .from('teams')
        .insert([{ ...teamData, tournament_id: tournamentId }])
        .select()
        .single();

      if (error) {
        console.error('Error adding team:', error);
        throw error;
      }
      
      console.log('Team added successfully:', data);
      
      const typedTeam: Team = {
        id: data.id,
        tournament_id: data.tournament_id,
        name: data.name,
        institution: data.institution || undefined,
        speaker_1: data.speaker_1 || undefined,
        speaker_2: data.speaker_2 || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      if (setTeams) {
        setTeams(prev => [...prev, typedTeam].sort((a, b) => a.name.localeCompare(b.name)));
      }
      
      toast.success('👥 Team added successfully!', {
        description: `${teamData.name} ${teamData.institution ? `from ${teamData.institution}` : ''} has been registered`,
        duration: 3000,
      });
      
      return typedTeam;
    } catch (error) {
      console.error('Error adding team:', error);
      toast.error('❌ Failed to add team', {
        description: 'Please check team details and try again',
        duration: 4000,
      });
      throw error;
    }
  };

  const deleteRound = async (roundId: string) => {
    try {
      console.log('Deleting round:', roundId);
      
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId);

      if (error) {
        console.error('Error deleting round:', error);
        throw error;
      }
      
      console.log('Round deleted successfully');
      
      if (setRounds) {
        setRounds(prev => prev.filter(round => round.id !== roundId));
      }
      
      toast.success('🗑️ Round deleted successfully!', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Error deleting round:', error);
      toast.error('❌ Failed to delete round', {
        duration: 3000,
      });
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      console.log('Deleting team:', teamId);
      
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) {
        console.error('Error deleting team:', error);
        throw error;
      }
      
      console.log('Team deleted successfully');
      
      if (setTeams) {
        setTeams(prev => prev.filter(team => team.id !== teamId));
      }
      
      toast.success('🗑️ Team deleted successfully!', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('❌ Failed to delete team', {
        duration: 3000,
      });
    }
  };

  return {
    addRound,
    addTeam,
    deleteRound,
    deleteTeam
  };
};
