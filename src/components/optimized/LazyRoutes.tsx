import React, { Suspense } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import RoundDetail from '@/pages/RoundDetail';

// Lazy load route components for better performance
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Tournaments = React.lazy(() => import('@/pages/Tournaments'));
const CreateTournament = React.lazy(() => import('@/pages/CreateTournament'));
const EditTournament = React.lazy(() => import('@/pages/EditTournament'));
const TournamentDetail = React.lazy(() => import('@/pages/TournamentDetail'));
const Teams = React.lazy(() => import('@/pages/Teams'));
const Rounds = React.lazy(() => import('@/pages/Rounds'));
const Results = React.lazy(() => import('@/pages/Results'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const AIAnalysis = React.lazy(() => import('@/pages/AIAnalysis'));

// Auth pages
const SignIn = React.lazy(() => import('@/pages/auth/SignIn'));
const SignUp = React.lazy(() => import('@/pages/auth/SignUp'));
const Callback = React.lazy(() => import('@/pages/auth/Callback'));
const Confirmation = React.lazy(() => import('@/pages/auth/Confirmation'));

// Public pages
const PublicTournament = React.lazy(() => import('@/pages/PublicTournament'));

/**
 * Higher-order component for lazy loading with consistent loading UI
 */
const withSuspense = <P extends object>(Component: React.ComponentType<P>) => {
  return React.memo((props: P) => (
    <Suspense fallback={<LoadingSpinner size="lg" text="Loading page..." centered />}>
      <Component {...props} />
    </Suspense>
  ));
};

// Export lazy-loaded components with suspense
export const LazyDashboard = withSuspense(Dashboard);
export const LazyTournaments = withSuspense(Tournaments);
export const LazyCreateTournament = withSuspense(CreateTournament);
export const LazyEditTournament = withSuspense(EditTournament);
export const LazyTournamentDetail = withSuspense(TournamentDetail);
export const LazyTeams = withSuspense(Teams);
export const LazyRounds = withSuspense(Rounds);
export const LazyResults = withSuspense(Results);
export const LazySettings = withSuspense(Settings);
export const LazyAIAnalysis = withSuspense(AIAnalysis);

// Auth components
export const LazySignIn = withSuspense(SignIn);
export const LazySignUp = withSuspense(SignUp);
export const LazyCallback = withSuspense(Callback);
export const LazyConfirmation = withSuspense(Confirmation);

// Public components
export const LazyPublicTournament = withSuspense(PublicTournament);

export const LazyRoundDetail = withSuspense(RoundDetail);