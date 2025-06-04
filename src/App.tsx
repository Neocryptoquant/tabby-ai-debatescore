
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EnhancedProtectedRoute } from "@/components/auth/EnhancedProtectedRoute";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Tournaments from "./pages/Tournaments";
import CreateTournament from "./pages/CreateTournament";
import EditTournament from "./pages/EditTournament";
import TournamentDetail from "./pages/TournamentDetail";
import TournamentTeams from "./pages/TournamentTeams";
import Teams from "./pages/Teams";
import Rounds from "./pages/Rounds";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import AIAnalysis from "./pages/AIAnalysis";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import PublicTournament from "./pages/PublicTournament";

// Auth pages
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Callback from "./pages/auth/Callback";
import Confirmation from "./pages/auth/Confirmation";

const queryClient = new QueryClient();

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
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth/signin" element={<SignIn />} />
                <Route path="/auth/signup" element={<SignUp />} />
                <Route path="/auth/callback" element={<Callback />} />
                <Route path="/auth/confirmation" element={<Confirmation />} />
                <Route path="/public/tournament/:token" element={<PublicTournament />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/tournaments" element={
                  <ProtectedRoute>
                    <Tournaments />
                  </ProtectedRoute>
                } />
                
                <Route path="/tournaments/create" element={
                  <EnhancedProtectedRoute requiredRole="assistant">
                    <CreateTournament />
                  </EnhancedProtectedRoute>
                } />
                
                <Route path="/tournaments/:id" element={
                  <ProtectedRoute>
                    <TournamentDetail />
                  </ProtectedRoute>
                } />
                
                <Route path="/tournaments/:id/edit" element={
                  <ProtectedRoute>
                    <EditTournament />
                  </ProtectedRoute>
                } />
                
                <Route path="/tournaments/:id/teams" element={
                  <ProtectedRoute>
                    <TournamentTeams />
                  </ProtectedRoute>
                } />
                
                <Route path="/teams" element={
                  <ProtectedRoute>
                    <Teams />
                  </ProtectedRoute>
                } />
                
                <Route path="/rounds" element={
                  <ProtectedRoute>
                    <Rounds />
                  </ProtectedRoute>
                } />
                
                <Route path="/results" element={
                  <ProtectedRoute>
                    <Results />
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                
                <Route path="/ai-analysis" element={
                  <ProtectedRoute>
                    <AIAnalysis />
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
