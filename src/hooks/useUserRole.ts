
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'tab_master' | 'assistant' | 'attendee' | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('get_user_role', { _user_id: user.id });

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('attendee'); // Default fallback
        } else {
          setRole(data || 'attendee');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('attendee');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  const canCreateTournaments = role === 'tab_master' || role === 'assistant';
  const canEditTournaments = role === 'tab_master' || role === 'assistant';
  const canDeleteTournaments = role === 'tab_master';
  const isTabMaster = role === 'tab_master';
  const isAssistant = role === 'assistant';
  const isAttendee = role === 'attendee';

  return {
    role,
    isLoading,
    canCreateTournaments,
    canEditTournaments,
    canDeleteTournaments,
    isTabMaster,
    isAssistant,
    isAttendee,
  };
}
