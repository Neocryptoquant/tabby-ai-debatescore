import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// Lazy-loaded components for better performance
import {
  LazyDashboard,
  LazyTournaments,
  LazyCreateTournament,
  LazyEditTournament,
  LazyTournamentDetail,
  LazyTeams,
  LazyRounds,
  LazyResults,
  LazySettings,
  LazyAIAnalysis,
  LazySignIn,
  LazySignUp,
  LazyCallback,
  LazyConfirmation,
  LazyPublicTournament,
} from "@/components/optimized/LazyRoutes";

// Static imports for critical pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: unknown) => {
        // Don't retry on authentication errors
        const errorWithStatus = error as { status?: number };
        if (errorWithStatus?.status === 401 || errorWithStatus?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Main App component with optimized routing and error handling
 * Implements lazy loading for better performance and proper error boundaries
 */
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public routes - no lazy loading for critical paths */}
                <Route path="/" element={<Index />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Auth routes - lazy loaded */}
                <Route path="/auth/signin" element={<LazySignIn />} />
                <Route path="/auth/sign-in" element={<LazySignIn />} />
                <Route path="/auth/signup" element={<LazySignUp />} />
                <Route path="/auth/sign-up" element={<LazySignUp />} />
                <Route path="/auth/callback" element={<LazyCallback />} />
                <Route path="/auth/confirmation" element={<LazyConfirmation />} />
                
                {/* Public tournament access */}
                <Route path="/public/tournament/:token" element={<LazyPublicTournament />} />
                
                {/* Protected routes - lazy loaded */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <LazyDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/tournaments" element={
                  <ProtectedRoute>
                    <LazyTournaments />
                  </ProtectedRoute>
                } />
                
                <Route path="/tournaments/create" element={
                  <ProtectedRoute>
                    <LazyCreateTournament />
                  </ProtectedRoute>
                } />
                
                <Route path="/tournaments/:id" element={
                  <ProtectedRoute>
                    <LazyTournamentDetail />
                  </ProtectedRoute>
                } />
                
                <Route path="/tournaments/:id/edit" element={
                  <ProtectedRoute>
                    <LazyEditTournament />
                  </ProtectedRoute>
                } />
                
                <Route path="/teams" element={
                  <ProtectedRoute>
                    <LazyTeams />
                  </ProtectedRoute>
                } />
                
                <Route path="/rounds" element={
                  <ProtectedRoute>
                    <LazyRounds />
                  </ProtectedRoute>
                } />
                
                <Route path="/results" element={
                  <ProtectedRoute>
                    <LazyResults />
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <LazySettings />
                  </ProtectedRoute>
                } />
                
                <Route path="/ai-analysis" element={
                  <ProtectedRoute>
                    <LazyAIAnalysis />
                  </ProtectedRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;