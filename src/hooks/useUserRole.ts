
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
        
        // First check if user has any role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
          
          // If no role exists, create one
          if (roleError.code === 'PGRST116') {
            console.log('No role found, creating attendee role for user');
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ user_id: user.id, role: 'attendee' });
            
            if (insertError) {
              console.error('Error creating role:', insertError);
              setRole('attendee'); // Default fallback
            } else {
              setRole('attendee');
            }
          } else {
            setRole('attendee'); // Default fallback
          }
        } else {
          console.log('User role found:', roleData.role);
          setRole(roleData.role);
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

  console.log('Current user role state:', { role, canCreateTournaments, isLoading });

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
