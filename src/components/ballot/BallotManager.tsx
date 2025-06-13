
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Judge, Round, Draw, Team } from '@/types/tournament';
import { JudgeBallotAccess } from './JudgeBallotAccess';
import { BallotStatusTable } from './BallotStatusTable';
import { BallotEntryForm } from './BallotEntryForm';
import { Gavel, CheckCircle, AlertTriangle, Clock, RefreshCw, Trophy, Plus } from 'lucide-react';

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
  const [teams, setTeams] = useState<Team[]>([]);
  const [ballotStats, setBallotStats] = useState({
    total: 0,
    submitted: 0,
    confirmed: 0,
    draft: 0,
    missing: 0
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showBallotEntry, setShowBallotEntry] = useState(false);
  
  // Fetch teams data
  const fetchTeams = async () => {
    if (!tournamentId) return;
    
    try {
      const { data: teamsData, error } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId);
      
      if (error) throw error;
      setTeams(teamsData || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };
  
  // Fetch ballots data
  const fetchBallots = async () => {
    if (!tournamentId) return;
    
    setIsLoading(true);
    try {
      // Fetch real ballots from the database
      const { data: ballotsData, error: ballotsError } = await supabase
        .from('ballots')
        .select(`
          *,
          draw:draws(*),
          judge:judges(*)
        `)
        .eq('tournament_id', tournamentId);
      
      if (ballotsError) throw ballotsError;
      
      setBallots(ballotsData || []);
      
      // Calculate stats
      const total = draws.length;
      const submitted = ballotsData?.filter(b => b.status === 'submitted').length || 0;
      const confirmed = ballotsData?.filter(b => b.status === 'confirmed').length || 0;
      const draft = ballotsData?.filter(b => b.status === 'draft').length || 0;
      const missing = total - submitted - confirmed - draft;
      
      setBallotStats({
        total,
        submitted,
        confirmed,
        draft,
        missing: Math.max(0, missing)
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching ballots:', error);
      toast.error('Failed to load ballots');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchTeams();
    fetchBallots();
  }, [tournamentId, judges.length, rounds.length, draws.length]);
  
  // Confirm a ballot
  const confirmBallot = async (ballotId: string) => {
    try {
      const { error } = await supabase
        .from('ballots')
        .update({ 
          status: 'confirmed',
          confirmed_time: new Date().toISOString()
        })
        .eq('id', ballotId);
      
      if (error) throw error;
      
      toast.success('Ballot confirmed successfully');
      fetchBallots(); // Refresh data
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
        .delete()
        .eq('id', ballotId);
      
      if (error) throw error;
      
      toast.success('Ballot discarded');
      fetchBallots(); // Refresh data
    } catch (error) {
      console.error('Error discarding ballot:', error);
      toast.error('Failed to discard ballot');
    }
  };
  
  // Complete a round
  const completeRound = async (roundId: string) => {
    try {
      // Use the Supabase function to complete the round
      const { data, error } = await supabase.rpc('complete_round', {
        p_round_id: roundId
      });
      
      if (error) throw error;
      
      if (data) {
        toast.success('Round completed successfully');
        fetchBallots(); // Refresh data
      } else {
        toast.error('Cannot complete round - not all ballots are submitted');
      }
    } catch (error) {
      console.error('Error completing round:', error);
      toast.error('Failed to complete round');
    }
  };
  
  const handleBallotEntrySuccess = () => {
    fetchBallots(); // Refresh ballots data
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
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-blue-900 mb-2">Manual Ballot Entry</h3>
                      <p className="text-sm text-blue-800">
                        As a tab master, you can manually enter ballots for any judge and round.
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowBallotEntry(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Enter Ballot
                    </Button>
                  </div>
                </div>
                
                {/* Ballots Table */}
                <BallotStatusTable
                  ballots={ballots}
                  onConfirm={confirmBallot}
                  onDiscard={discardBallot}
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
                      variant="outline"
                      className="bg-white"
                      onClick={() => {
                        // TODO: Implement break generation
                        toast.info('Break generation functionality coming soon!');
                      }}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Quarterfinals (8 teams)
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white"
                      onClick={() => {
                        // TODO: Implement break generation
                        toast.info('Break generation functionality coming soon!');
                      }}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Semifinals (4 teams)
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white"
                      onClick={() => {
                        // TODO: Implement break generation
                        toast.info('Break generation functionality coming soon!');
                      }}
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
      
      {/* Ballot Entry Dialog */}
      <Dialog open={showBallotEntry} onOpenChange={setShowBallotEntry}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <BallotEntryForm
            tournamentId={tournamentId}
            judges={judges}
            rounds={rounds}
            draws={draws}
            teams={teams}
            onClose={() => setShowBallotEntry(false)}
            onSuccess={handleBallotEntrySuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
