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
import { Gavel, CheckCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

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
      const { data, error } = await supabase
        .from('ballots')
        .select(`
          *,
          judge:judges(id, name, institution),
          draw:draws(id, room, round_id),
          speaker_scores(*)
        `)
        .eq('draw.tournament_id', tournamentId);
        
      if (error) throw error;
      
      setBallots(data || []);
      
      // Calculate stats
      const total = draws.length * judges.length;
      const submitted = data?.filter(b => b.status === 'submitted').length || 0;
      const confirmed = data?.filter(b => b.status === 'confirmed').length || 0;
      const draft = data?.filter(b => b.status === 'draft').length || 0;
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
      const { error } = await supabase
        .from('ballots')
        .update({ 
          status: 'confirmed',
          confirmed_time: new Date().toISOString(),
          confirmed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', ballotId);
        
      if (error) throw error;
      
      toast.success('Ballot confirmed successfully');
      fetchBallots();
    } catch (error) {
      console.error('Error confirming ballot:', error);
      toast.error('Failed to confirm ballot');
    }
  };
  
  // Discard a ballot
  const discardBallot = async (ballotId: string) => {
    try {
      const { error } = await supabase
        .from('ballots')
        .update({ status: 'discarded' })
        .eq('id', ballotId);
        
      if (error) throw error;
      
      toast.success('Ballot discarded');
      fetchBallots();
    } catch (error) {
      console.error('Error discarding ballot:', error);
      toast.error('Failed to discard ballot');
    }
  };
  
  // Complete a round
  const completeRound = async (roundId: string) => {
    try {
      // Check if all ballots are submitted or confirmed
      const roundDraws = draws.filter(d => d.round_id === roundId);
      const roundBallots = ballots.filter(b => b.draw.round_id === roundId);
      
      const allBallotsSubmitted = roundDraws.every(draw => 
        roundBallots.some(ballot => 
          ballot.draw_id === draw.id && 
          (ballot.status === 'submitted' || ballot.status === 'confirmed')
        )
      );
      
      if (!allBallotsSubmitted) {
        toast.error('Cannot complete round: not all ballots have been submitted');
        return;
      }
      
      // Call the complete_round function
      const { data, error } = await supabase.rpc('complete_round', {
        p_round_id: roundId
      });
      
      if (error) throw error;
      
      if (data) {
        // Update round status
        await supabase
          .from('rounds')
          .update({ 
            status: 'completed',
            is_completed: true,
            completion_time: new Date().toISOString()
          })
          .eq('id', roundId);
          
        toast.success('Round completed successfully');
      } else {
        toast.error('Failed to complete round: not all ballots are submitted');
      }
    } catch (error) {
      console.error('Error completing round:', error);
      toast.error('Failed to complete round');
    }
  };
  
  // Generate break rounds
  const generateBreak = async (breakType: 'quarters' | 'semis' | 'finals') => {
    try {
      // Determine break size based on type
      let breakSize = 8;
      if (breakType === 'semis') breakSize = 4;
      if (breakType === 'finals') breakSize = 2;
      
      // Call the generate_tournament_breaks function
      const { data, error } = await supabase.rpc('generate_tournament_breaks', {
        p_tournament_id: tournamentId,
        p_break_size: breakSize,
        p_break_type: breakType
      });
      
      if (error) throw error;
      
      if (data) {
        toast.success(`${breakType.charAt(0).toUpperCase() + breakType.slice(1)} break generated successfully`);
      } else {
        toast.error('Failed to generate break');
      }
    } catch (error) {
      console.error('Error generating break:', error);
      toast.error('Failed to generate break');
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
                
                {/* Ballot Status Table */}
                <BallotStatusTable
                  ballots={ballots}
                  judges={judges}
                  rounds={rounds}
                  draws={draws}
                  onConfirmBallot={confirmBallot}
                  onDiscardBallot={discardBallot}
                  onCompleteRound={completeRound}
                />
                
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
                      onClick={() => generateBreak('quarters')}
                      variant="outline"
                      className="bg-white"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Quarterfinals (8 teams)
                    </Button>
                    <Button
                      onClick={() => generateBreak('semis')}
                      variant="outline"
                      className="bg-white"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Semifinals (4 teams)
                    </Button>
                    <Button
                      onClick={() => generateBreak('finals')}
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