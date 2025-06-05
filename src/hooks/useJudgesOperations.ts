
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Judge {
  id: string;
  tournament_id: string;
  name: string;
  institution?: string;
  experience_level?: string;
  created_at: string;
}

export const useJudgesOperations = (tournamentId?: string) => {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchJudges = useCallback(async () => {
    if (!tournamentId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('judges')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('name');

      if (error) throw error;
      
      setJudges(data || []);
    } catch (error) {
      console.error('Error fetching judges:', error);
      toast.error('Failed to fetch judges');
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  const addJudge = async (judgeData: Omit<Judge, 'id' | 'tournament_id' | 'created_at'>) => {
    if (!tournamentId) return;

    try {
      const { data, error } = await supabase
        .from('judges')
        .insert([{ ...judgeData, tournament_id: tournamentId }])
        .select()
        .single();

      if (error) throw error;
      
      setJudges(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Judge added successfully!');
      
      return data;
    } catch (error) {
      console.error('Error adding judge:', error);
      toast.error('Failed to add judge');
      throw error;
    }
  };

  const deleteJudge = async (judgeId: string) => {
    try {
      const { error } = await supabase
        .from('judges')
        .delete()
        .eq('id', judgeId);

      if (error) throw error;
      
      setJudges(prev => prev.filter(judge => judge.id !== judgeId));
      toast.success('Judge deleted successfully!');
    } catch (error) {
      console.error('Error deleting judge:', error);
      toast.error('Failed to delete judge');
      throw error;
    }
  };

  return {
    judges,
    isLoading,
    fetchJudges,
    addJudge,
    deleteJudge
  };
};
