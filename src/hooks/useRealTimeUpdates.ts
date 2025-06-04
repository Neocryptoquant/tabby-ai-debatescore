
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeUpdates = (
  tournamentId: string,
  onUpdate: () => void
) => {
  useEffect(() => {
    if (!tournamentId) return;

    const channel = supabase
      .channel('tournament-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
          filter: `tournament_id=eq.${tournamentId}`
        },
        () => onUpdate()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rounds',
          filter: `tournament_id=eq.${tournamentId}`
        },
        () => onUpdate()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'draws'
        },
        () => onUpdate()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId, onUpdate]);
};
