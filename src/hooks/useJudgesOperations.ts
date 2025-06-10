import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Judge, JudgeFormData, ExperienceLevel } from '@/types/tournament';

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
      
      const typedJudges: Judge[] = (data || []).map(judge => ({
        id: judge.id,
        tournament_id: judge.tournament_id,
        name: judge.name,
        institution: judge.institution || undefined,
        experience_level: judge.experience_level as ExperienceLevel,
        created_at: judge.created_at
      }));
      
      setJudges(typedJudges);
    } catch (error) {
      console.error('Error fetching judges:', error);
      toast.error('Failed to fetch judges');
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  const addJudge = async (judgeData: JudgeFormData) => {
    if (!tournamentId) return;

    try {
      const { data, error } = await supabase
        .from('judges')
        .insert([{ ...judgeData, tournament_id: tournamentId }])
        .select()
        .single();

      if (error) throw error;
      
      const typedJudge: Judge = {
        id: data.id,
        tournament_id: data.tournament_id,
        name: data.name,
        institution: data.institution || undefined,
        experience_level: data.experience_level as ExperienceLevel,
        created_at: data.created_at
      };
      
      setJudges(prev => [...prev, typedJudge].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Judge added successfully!');
      
      return typedJudge;
    } catch (error) {
      console.error('Error adding judge:', error);
      toast.error('Failed to add judge');
      throw error;
    }
  };

  const updateJudge = async (judgeId: string, judgeData: Partial<JudgeFormData>) => {
    if (!tournamentId) return;
    try {
      const { data, error } = await supabase
        .from('judges')
        .update({ ...judgeData })
        .eq('id', judgeId)
        .eq('tournament_id', tournamentId)
        .select()
        .single();
      if (error) throw error;
      
      const typedJudge: Judge = {
        id: data.id,
        tournament_id: data.tournament_id,
        name: data.name,
        institution: data.institution || undefined,
        experience_level: data.experience_level as ExperienceLevel,
        created_at: data.created_at
      };
      
      setJudges(prev => prev.map(judge => judge.id === judgeId ? typedJudge : judge));
      toast.success('Judge updated successfully!');
      return typedJudge;
    } catch (error) {
      console.error('Error updating judge:', error);
      toast.error('Failed to update judge');
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
    updateJudge,
    deleteJudge
  };
};
