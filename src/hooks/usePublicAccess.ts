
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PublicAccess {
  id: string;
  tournament_id: string;
  access_token: string;
  is_active: boolean;
  show_speaker_scores: boolean;
  created_at: string;
}

export const usePublicAccess = (tournamentId?: string) => {
  const [publicAccess, setPublicAccess] = useState<PublicAccess | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      fetchPublicAccess();
    }
  }, [tournamentId]);

  const fetchPublicAccess = async () => {
    if (!tournamentId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('public_tournament_access')
        .select('*')
        .eq('tournament_id', tournamentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching public access:', error);
        return;
      }

      setPublicAccess(data);
    } catch (error) {
      console.error('Error fetching public access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePublicLink = async (showSpeakerScores = false) => {
    if (!tournamentId) return;

    try {
      const accessToken = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('public_tournament_access')
        .upsert({
          tournament_id: tournamentId,
          access_token: accessToken,
          is_active: true,
          show_speaker_scores: showSpeakerScores
        })
        .select()
        .single();

      if (error) {
        console.error('Error generating public link:', error);
        toast.error('Failed to generate public link');
        return;
      }

      setPublicAccess(data);
      toast.success('Public link generated successfully!');
      return `${window.location.origin}/public/tournament/${accessToken}`;
    } catch (error) {
      console.error('Error generating public link:', error);
      toast.error('Failed to generate public link');
    }
  };

  const updatePublicAccess = async (updates: Partial<Pick<PublicAccess, 'is_active' | 'show_speaker_scores'>>) => {
    if (!publicAccess) return;

    try {
      const { data, error } = await supabase
        .from('public_tournament_access')
        .update(updates)
        .eq('id', publicAccess.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating public access:', error);
        toast.error('Failed to update public access settings');
        return;
      }

      setPublicAccess(data);
      toast.success('Public access settings updated!');
    } catch (error) {
      console.error('Error updating public access:', error);
      toast.error('Failed to update public access settings');
    }
  };

  const getPublicUrl = () => {
    if (!publicAccess) return null;
    return `${window.location.origin}/public/tournament/${publicAccess.access_token}`;
  };

  return {
    publicAccess,
    isLoading,
    generatePublicLink,
    updatePublicAccess,
    getPublicUrl,
    refetch: fetchPublicAccess
  };
};
