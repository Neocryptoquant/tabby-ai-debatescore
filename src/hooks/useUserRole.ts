
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
        console.log('Fetching role for user:', user.id);
        
        // Check if user has any role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
          
          // If no role exists (PGRST116 = no rows returned), don't create one automatically
          if (roleError.code === 'PGRST116') {
            console.log('No role found for user - user needs to be assigned a role');
            setRole(null);
          } else {
            console.error('Database error:', roleError);
            setRole(null);
          }
        } else {
          console.log('User role found:', roleData.role);
          setRole(roleData.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
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

  console.log('Current user role state:', { 
    userId: user?.id, 
    role, 
    canCreateTournaments, 
    isLoading 
  });

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
