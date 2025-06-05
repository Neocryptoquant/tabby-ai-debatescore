
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Round } from '@/types/tournament';

export interface EnhancedRound extends Round {
  is_motion_public?: boolean;
  is_info_slide_public?: boolean;
  default_rooms?: string[];
}

export const useEnhancedRoundsOperations = (tournamentId?: string) => {
  const [rounds, setRounds] = useState<EnhancedRound[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRounds = useCallback(async () => {
    if (!tournamentId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number');

      if (error) throw error;
      
      const typedRounds: EnhancedRound[] = (data || []).map(round => ({
        id: round.id,
        tournament_id: round.tournament_id,
        round_number: round.round_number,
        motion: round.motion,
        info_slide: round.info_slide || undefined,
        start_time: round.start_time || undefined,
        status: (round.status as 'upcoming' | 'active' | 'completed') || 'upcoming',
        is_motion_public: round.is_motion_public || false,
        is_info_slide_public: round.is_info_slide_public || false,
        default_rooms: round.default_rooms || [],
        created_at: round.created_at,
        updated_at: round.updated_at
      }));
      
      setRounds(typedRounds);
    } catch (error) {
      console.error('Error fetching rounds:', error);
      toast.error('Failed to fetch rounds');
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  const addRound = async (roundData: Omit<EnhancedRound, 'id' | 'tournament_id' | 'created_at' | 'updated_at'>) => {
    if (!tournamentId) return;

    try {
      const { data, error } = await supabase
        .from('rounds')
        .insert([{ ...roundData, tournament_id: tournamentId }])
        .select()
        .single();

      if (error) throw error;
      
      const typedRound: EnhancedRound = {
        id: data.id,
        tournament_id: data.tournament_id,
        round_number: data.round_number,
        motion: data.motion,
        info_slide: data.info_slide || undefined,
        start_time: data.start_time || undefined,
        status: (data.status as 'upcoming' | 'active' | 'completed') || 'upcoming',
        is_motion_public: data.is_motion_public || false,
        is_info_slide_public: data.is_info_slide_public || false,
        default_rooms: data.default_rooms || [],
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setRounds(prev => [...prev, typedRound].sort((a, b) => a.round_number - b.round_number));
      toast.success('🎯 Round added successfully!');
      
      return typedRound;
    } catch (error) {
      console.error('Error adding round:', error);
      toast.error('Failed to add round');
      throw error;
    }
  };

  const updateRoundPrivacy = async (roundId: string, isMotionPublic: boolean, isInfoSlidePublic: boolean) => {
    try {
      const { error } = await supabase
        .from('rounds')
        .update({
          is_motion_public: isMotionPublic,
          is_info_slide_public: isInfoSlidePublic
        })
        .eq('id', roundId);

      if (error) throw error;
      
      setRounds(prev => prev.map(round => 
        round.id === roundId 
          ? { ...round, is_motion_public: isMotionPublic, is_info_slide_public: isInfoSlidePublic }
          : round
      ));
      
      toast.success('Privacy settings updated');
    } catch (error) {
      console.error('Error updating round privacy:', error);
      toast.error('Failed to update privacy settings');
    }
  };

  const deleteRound = async (roundId: string) => {
    try {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId);

      if (error) throw error;
      
      setRounds(prev => prev.filter(round => round.id !== roundId));
      toast.success('🗑️ Round deleted successfully!');
    } catch (error) {
      console.error('Error deleting round:', error);
      toast.error('Failed to delete round');
    }
  };

  return {
    rounds,
    isLoading,
    fetchRounds,
    addRound,
    updateRoundPrivacy,
    deleteRound
  };
};
