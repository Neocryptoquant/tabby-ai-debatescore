
import { useMemo } from "react";
import { useUserRole } from "./useUserRole";
import { useAuth } from "@/context/AuthContext";

// Define granular permissions
export type Permission = 
  | 'create_tournament'
  | 'edit_tournament'
  | 'delete_tournament'
  | 'view_tournament'
  | 'manage_teams'
  | 'edit_scores'
  | 'view_results'
  | 'manage_judges'
  | 'manage_draws'
  | 'manage_rounds'
  | 'view_analytics'
  | 'system_admin';

// Permission mappings for each role
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  tab_master: [
    'create_tournament',
    'edit_tournament', 
    'delete_tournament',
    'view_tournament',
    'manage_teams',
    'edit_scores',
    'view_results',
    'manage_judges',
    'manage_draws',
    'manage_rounds',
    'view_analytics',
    'system_admin'
  ],
  assistant: [
    'create_tournament',
    'edit_tournament',
    'view_tournament', 
    'manage_teams',
    'edit_scores',
    'view_results',
    'manage_judges',
    'manage_draws',
    'manage_rounds',
    'view_analytics'
  ],
  attendee: [
    'view_tournament',
    'view_results'
  ]
};

/**
 * Enhanced permissions hook with granular permission checking
 * Provides fine-grained access control beyond basic role checking
 */
export function usePermissions() {
  const { role, isLoading } = useUserRole();
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!role) return [];
    return ROLE_PERMISSIONS[role] || [];
  }, [role]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: Permission) => {
    return permissions.includes(permission);
  };

  /**
   * Check if user has any of the provided permissions
   */
  const hasAnyPermission = (permissionList: Permission[]) => {
    return permissionList.some(permission => hasPermission(permission));
  };

  /**
   * Check if user has all of the provided permissions
   */
  const hasAllPermissions = (permissionList: Permission[]) => {
    return permissionList.every(permission => hasPermission(permission));
  };

  /**
   * Check if user can edit a specific tournament (ownership + role-based)
   */
  const canEditTournament = (tournamentCreatedBy?: string) => {
    // Tab masters and assistants can edit any tournament
    if (hasPermission('edit_tournament')) {
      return true;
    }
    // Tournament creators can edit their own tournaments
    if (user && tournamentCreatedBy && user.id === tournamentCreatedBy) {
      return true;
    }
    return false;
  };

  /**
   * Get user's permission level for UI display
   */
  const getPermissionLevel = () => {
    if (hasPermission('system_admin')) return 'Administrator';
    if (hasPermission('create_tournament')) return 'Tournament Manager';
    if (hasPermission('view_results')) return 'Participant';
    return 'Guest';
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canEditTournament,
    getPermissionLevel,
    isLoading,
    role,
    user
  };
}
