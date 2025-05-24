
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean; // Make authentication optional
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    // Show a loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tabby-secondary"></div>
      </div>
    );
  }
  
  if (requireAuth && !isAuthenticated) {
    // Redirect to sign-in if authentication is required but user is not authenticated
    return <Navigate to="/auth/sign-in" replace />;
  }
  
  // Render children if authenticated or if auth is not required
  return <>{children}</>;
}
