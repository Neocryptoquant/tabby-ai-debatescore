import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BallotForm } from './BallotForm';
import { BrainCircuit, ArrowLeft, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export function JudgeBallotView() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Parse the token to get judge and round IDs
  useEffect(() => {
    const validateSession = async () => {
      if (!token) {
        setError('Invalid ballot access token');
        setIsLoading(false);
        return;
      }
      
      try {
        // For now, we'll parse the token directly
        // In a real implementation, this would validate against the database
        const [judgeId, roundId, timestamp] = token.split('-');
        
        if (!judgeId || !roundId || !timestamp) {
          setError('Invalid or expired ballot access token');
          setIsLoading(false);
          return;
        }
        
        // Check if token is expired (48 hours)
        const tokenTime = parseInt(timestamp);
        const now = Date.now();
        if (now - tokenTime > 48 * 60 * 60 * 1000) {
          setError('Ballot access token has expired');
          setIsLoading(false);
          return;
        }
        
        // Get judge and round data
        const [judgeResponse, roundResponse] = await Promise.all([
          supabase.from('judges').select('*').eq('id', judgeId).single(),
          supabase.from('rounds').select('*').eq('id', roundId).single()
        ]);
        
        if (judgeResponse.error || roundResponse.error) {
          console.error('Error fetching judge or round:', judgeResponse.error || roundResponse.error);
          setError('Failed to validate ballot session');
          setIsLoading(false);
          return;
        }
        
        // Get tournament data
        const { data: tournamentData, error: tournamentError } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', roundResponse.data.tournament_id)
          .single();
          
        if (tournamentError) {
          console.error('Error fetching tournament:', tournamentError);
          setError('Failed to validate ballot session');
          setIsLoading(false);
          return;
        }
        
        // Set session data
        setSessionData({
          judge_id: judgeId,
          round_id: roundId,
          tournament_id: tournamentData.id,
          judge_name: judgeResponse.data.name,
          round_number: roundResponse.data.round_number,
          tournament_name: tournamentData.name,
          expires_at: new Date(tokenTime + 48 * 60 * 60 * 1000).toISOString()
        });
        
        // Fetch teams for this round
        await fetchTeams(roundId);
      } catch (error) {
        console.error('Error validating ballot session:', error);
        setError('Failed to validate ballot session');
        setIsLoading(false);
      }
    };
    
    validateSession();
  }, [token]);
  
  // Fetch teams for the round
  const fetchTeams = async (roundId: string) => {
    try {
      // Get draws for this round
      const { data: drawsData, error: drawsError } = await supabase
        .from('draws')
        .select('*')
        .eq('round_id', roundId);
        
      if (drawsError) throw drawsError;
      
      if (!drawsData || drawsData.length === 0) {
        setError('No draws found for this round');
        setIsLoading(false);
        return;
      }
      
      // Get team IDs from the draws
      const teamIds = new Set<string>();
      drawsData.forEach(draw => {
        if (draw.gov_team_id) teamIds.add(draw.gov_team_id);
        if (draw.opp_team_id) teamIds.add(draw.opp_team_id);
        if (draw.cg_team_id) teamIds.add(draw.cg_team_id);
        if (draw.co_team_id) teamIds.add(draw.co_team_id);
      });
      
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', Array.from(teamIds));
        
      if (teamsError) throw teamsError;
      
      setTeams(teamsData || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError('Failed to load teams');
      setIsLoading(false);
    }
  };
  
  // Handle ballot submission
  const handleBallotSubmit = async (data: any) => {
    try {
      toast.success('Ballot submitted successfully!');
      
      // Redirect to success page
      navigate('/ballot/success');
    } catch (error) {
      console.error('Error submitting ballot:', error);
      toast.error('Failed to submit ballot');
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Validating ballot access..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-center">Access Error</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-yellow-500" />
            </div>
            <CardTitle className="text-center">Session Expired</CardTitle>
            <CardDescription className="text-center">
              This ballot access link has expired or is invalid.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Find the draw for this judge and round
  const drawId = "123"; // This would normally come from the database
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BrainCircuit className="h-8 w-8 text-tabby-secondary mr-2" />
            <span className="text-2xl font-bold font-outfit">TabbyAI</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              Session expires in {Math.floor((new Date(sessionData.expires_at).getTime() - Date.now()) / (1000 * 60 * 60))} hours
            </span>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Judge Ballot</CardTitle>
                <CardDescription>
                  {sessionData.tournament_name} - Round {sessionData.round_number}
                </CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                Judge: {sessionData.judge_name}
              </Badge>
            </div>
          </CardHeader>
        </Card>
        
        <BallotForm
          drawId={drawId}
          judgeId={sessionData.judge_id}
          roundId={sessionData.round_id}
          tournamentId={sessionData.tournament_id}
          format="bp" // This would normally come from the tournament settings
          teams={teams}
          onSubmit={handleBallotSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}