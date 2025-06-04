
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePermissions, Permission } from "@/hooks/usePermissions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface EnhancedProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

export function EnhancedProtectedRoute({ 
  children, 
  requireAuth = true,
  permission,
  permissions = [],
  requireAll = false,
  redirectTo = "/auth/signin",
  fallback
}: EnhancedProtectedRouteProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading: permissionLoading } = usePermissions();
  const location = useLocation();

  const isLoading = authLoading || permissionLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking permissions..." />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // For create_tournament permission, allow if user is authenticated
  if (permission === 'create_tournament') {
    if (!isAuthenticated) {
      return <Navigate to="/unauthorized" replace />;
    }
    return <>{children}</>;
  }

  if (permission && !hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasRequiredPermissions) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
