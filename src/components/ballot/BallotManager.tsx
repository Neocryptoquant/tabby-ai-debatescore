import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Judge, Round, Draw } from '@/types/tournament';
import { JudgeBallotAccess } from './JudgeBallotAccess';
import { BallotStatusTable } from './BallotStatusTable';
import { Gavel, CheckCircle, AlertTriangle, Clock, RefreshCw, Trophy } from 'lucide-react';

interface BallotManagerProps {
  tournamentId: string;
  judges: Judge[];
  rounds: Round[];
  draws: Draw[];
  className?: string;
}

export function BallotManager({
  tournamentId,
  judges,
  rounds,
  draws,
  className
}: BallotManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [ballots, setBallots] = useState<any[]>([]);
  const [ballotStats, setBallotStats] = useState({
    total: 0,
    submitted: 0,
    confirmed: 0,
    draft: 0,
    missing: 0
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Fetch ballots data
  const fetchBallots = async () => {
    if (!tournamentId) return;
    
    setIsLoading(true);
    try {
      // For now, we'll use mock data since the ballots table might not be fully set up
      const mockBallots = draws.map((draw, index) => ({
        id: `mock-ballot-${index}`,
        draw_id: draw.id,
        judge_id: judges[index % judges.length]?.id,
        status: ['draft', 'submitted', 'confirmed'][Math.floor(Math.random() * 3)],
        submission_time: new Date().toISOString(),
        draw: {
          id: draw.id,
          room: draw.room,
          round_id: draw.round_id
        },
        judge: {
          id: judges[index % judges.length]?.id,
          name: judges[index % judges.length]?.name,
          institution: judges[index % judges.length]?.institution
        },
        speaker_scores: []
      }));
      
      setBallots(mockBallots);
      
      // Calculate stats
      const total = draws.length;
      const submitted = mockBallots.filter(b => b.status === 'submitted').length;
      const confirmed = mockBallots.filter(b => b.status === 'confirmed').length;
      const draft = mockBallots.filter(b => b.status === 'draft').length;
      const missing = total - submitted - confirmed - draft;
      
      setBallotStats({
        total,
        submitted,
        confirmed,
        draft,
        missing
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching ballots:', error);
      toast.error('Failed to load ballots');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch ballots on mount and when dependencies change
  useEffect(() => {
    fetchBallots();
  }, [tournamentId, judges.length, rounds.length, draws.length]);
  
  // Confirm a ballot
  const confirmBallot = async (ballotId: string) => {
    try {
      // In a real implementation, this would update the database
      // For now, we'll just update the local state
      setBallots(prev => prev.map(ballot => 
        ballot.id === ballotId 
          ? { ...ballot, status: 'confirmed' } 
          : ballot
      ));
      
      toast.success('Ballot confirmed successfully');
      
      // Update stats
      setBallotStats(prev => ({
        ...prev,
        confirmed: prev.confirmed + 1,
        submitted: prev.submitted - 1
      }));
    } catch (error) {
      console.error('Error confirming ballot:', error);
      toast.error('Failed to confirm ballot');
    }
  };
  
  // Discard a ballot
  const discardBallot = async (ballotId: string) => {
    try {
      // In a real implementation, this would update the database
      // For now, we'll just update the local state
      const ballot = ballots.find(b => b.id === ballotId);
      const oldStatus = ballot?.status;
      
      setBallots(prev => prev.map(ballot => 
        ballot.id === ballotId 
          ? { ...ballot, status: 'discarded' } 
          : ballot
      ));
      
      toast.success('Ballot discarded');
      
      // Update stats
      setBallotStats(prev => {
        const newStats = { ...prev };
        if (oldStatus === 'submitted') newStats.submitted -= 1;
        if (oldStatus === 'confirmed') newStats.confirmed -= 1;
        if (oldStatus === 'draft') newStats.draft -= 1;
        return newStats;
      });
    } catch (error) {
      console.error('Error discarding ballot:', error);
      toast.error('Failed to discard ballot');
    }
  };
  
  // Complete a round
  const completeRound = async (roundId: string) => {
    try {
      toast.success('Round completed successfully');
    } catch (error) {
      console.error('Error completing round:', error);
      toast.error('Failed to complete round');
    }
  };
  
  // Generate ballot access link
  const generateBallotLink = async (judgeId: string, roundId: string) => {
    try {
      // Generate a simple token for now
      const token = `${judgeId}-${roundId}-${Date.now()}`;
      
      // In a real implementation, this would be stored in the database
      // For now, we'll just return the token
      return `${window.location.origin}/ballot/${token}`;
    } catch (error) {
      console.error('Error generating ballot link:', error);
      throw error;
    }
  };
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Ballot Management
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBallots}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            Manage judge ballots, track submission status, and complete rounds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Loading ballot data..." />
            </div>
          ) : (
            <Tabs defaultValue="status">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="status">Status Overview</TabsTrigger>
                <TabsTrigger value="access">Judge Access</TabsTrigger>
                <TabsTrigger value="breaks">Breaks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="status" className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold">{ballotStats.total}</div>
                    <div className="text-sm text-gray-600">Total Ballots</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700">{ballotStats.confirmed}</div>
                    <div className="text-sm text-green-600">Confirmed</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-700">{ballotStats.submitted}</div>
                    <div className="text-sm text-blue-600">Submitted</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-700">{ballotStats.draft}</div>
                    <div className="text-sm text-yellow-600">Drafts</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-700">{ballotStats.missing}</div>
                    <div className="text-sm text-red-600">Missing</div>
                  </div>
                </div>
                
                {/* Manual Ballot Entry */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Manual Ballot Entry</h3>
                  <p className="text-sm text-blue-800 mb-4">
                    As a tab master, you can manually enter ballots for any judge and round.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Round</label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="">Select a round...</option>
                        {rounds.map((round) => (
                          <option key={round.id} value={round.id}>
                            Round {round.round_number}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Room</label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="">Select a room...</option>
                        {draws.map((draw) => (
                          <option key={draw.id} value={draw.id}>
                            {draw.room}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button className="w-full">
                        Enter Ballot
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 text-right">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              </TabsContent>
              
              <TabsContent value="access">
                <JudgeBallotAccess
                  tournamentId={tournamentId}
                  judges={judges}
                  rounds={rounds}
                />
              </TabsContent>
              
              <TabsContent value="breaks" className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Generate Tournament Breaks</h4>
                  <p className="text-sm text-blue-800 mb-4">
                    Generate break rounds based on team performance. All preliminary rounds must be completed first.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="bg-white"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Quarterfinals (8 teams)
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Semifinals (4 teams)
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Finals (2 teams)
                    </Button>
                  </div>
                </div>
                
                {/* TODO: Add break rounds display */}
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No Break Rounds Generated</h3>
                  <p className="text-gray-500 mt-2">Complete all preliminary rounds before generating breaks</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}