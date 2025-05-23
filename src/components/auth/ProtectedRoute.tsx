
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    // Show a loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tabby-secondary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to sign-in if not authenticated
    return <Navigate to="/auth/sign-in" replace />;
  }
  
  // Render children if authenticated
  return <>{children}</>;
}
