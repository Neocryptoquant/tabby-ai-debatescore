import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Define the possible user roles in the application
export type UserRole = 'tab_master' | 'assistant' | 'attendee' | null;

/**
 * Custom hook to manage user roles and permissions
 * Fetches the current user's role from the database and provides permission checks
 */
export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      // If no user is logged in, reset role state
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching role for user:', user.id);
        
        // Query the user_roles table to get the current user's role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
          setRole(null);
        } else if (!roleData) {
          // No role found for user - user needs to be assigned a role
          console.log('No role found for user - user needs to be assigned a role');
          setRole(null);
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

  // Permission check that includes tournament ownership
  const canEditTournament = (tournamentCreatedBy?: string) => {
    // Tab masters and assistants can edit any tournament
    if (role === 'tab_master' || role === 'assistant') {
      return true;
    }
    // Tournament creators can edit their own tournaments
    if (user && tournamentCreatedBy && user.id === tournamentCreatedBy) {
      return true;
    }
    return false;
  };

  // Permission checks based on user role
  const canCreateTournaments = role === 'tab_master' || role === 'assistant';
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

  // Return role state and permission checks
  return {
    role,
    isLoading,
    canCreateTournaments,
    canEditTournament,
    canDeleteTournaments,
    isTabMaster,
    isAssistant,
    isAttendee,
  };
}