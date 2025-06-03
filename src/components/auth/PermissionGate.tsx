
import { ReactNode } from "react";
import { usePermissions, Permission } from "@/hooks/usePermissions";

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  tournamentCreatedBy?: string; // For tournament-specific permissions
}

/**
 * Component that conditionally renders children based on user permissions
 * Provides fine-grained access control at the component level
 */
export function PermissionGate({ 
  children, 
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  tournamentCreatedBy
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, canEditTournament, isLoading } = usePermissions();

  // Show loading state while checking permissions
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  // Check tournament-specific edit permission
  if (tournamentCreatedBy !== undefined && !canEditTournament(tournamentCreatedBy)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
