
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Tournaments from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";
import CreateTournament from "./pages/CreateTournament";
import EditTournament from "./pages/EditTournament";
import TournamentTeams from "./pages/TournamentTeams";
import Teams from "./pages/Teams";
import Rounds from "./pages/Rounds";
import Results from "./pages/Results";
import AIAnalysis from "./pages/AIAnalysis";
import Settings from "./pages/Settings";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Confirmation from "./pages/auth/Confirmation";
import Callback from "./pages/auth/Callback";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth/sign-in" element={<SignIn />} />
            <Route path="/auth/sign-up" element={<SignUp />} />
            <Route path="/auth/confirmation" element={<Confirmation />} />
            <Route path="/auth/callback" element={<Callback />} />
            
            {/* Routes accessible to everyone (including attendees) */}
            <Route path="/tournaments" element={
              <ProtectedRoute requireAuth={false}>
                <Tournaments />
              </ProtectedRoute>
            } />
            <Route path="/tournaments/:id" element={
              <ProtectedRoute requireAuth={false}>
                <TournamentDetail />
              </ProtectedRoute>
            } />
            <Route path="/tournaments/:id/teams" element={
              <ProtectedRoute requireAuth={false}>
                <TournamentTeams />
              </ProtectedRoute>
            } />
            <Route path="/tournaments/:id/rounds" element={
              <ProtectedRoute requireAuth={false}>
                <Rounds />
              </ProtectedRoute>
            } />
            <Route path="/tournaments/:id/results" element={
              <ProtectedRoute requireAuth={false}>
                <Results />
              </ProtectedRoute>
            } />
            <Route path="/tournaments/:id/analysis" element={
              <ProtectedRoute requireAuth={false}>
                <AIAnalysis />
              </ProtectedRoute>
            } />
            
            {/* Routes that require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/tournaments/create" element={
              <ProtectedRoute>
                <CreateTournament />
              </ProtectedRoute>
            } />
            <Route path="/tournaments/:id/edit" element={
              <ProtectedRoute>
                <EditTournament />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
