import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BallotEntryForm } from '@/components/ballot/BallotEntryForm';
import { BallotStatusTable } from '@/components/ballot/BallotStatusTable';
import { DrawsList } from '@/components/rounds/DrawsList';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const RoundDetail = () => {
  const { tournamentId, roundId } = useParams<{ tournamentId: string; roundId: string }>();
  const navigate = useNavigate();
  const { isTabMaster } = useUserRole();
  const { user } = useAuth();

  const [round, setRound] = useState<any>(null);
  const [draws, setDraws] = useState<any[]>([]);
  const [ballots, setBallots] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingDraw, setIsGeneratingDraw] = useState(false);

  // Fetch all data for this round
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: roundData } = await supabase.from('rounds').select('*').eq('id', roundId).single();
        setRound(roundData);
        const { data: drawsData } = await supabase.from('draws').select('*').eq('round_id', roundId);
        setDraws(drawsData || []);
        const { data: ballotsData } = await supabase.from('ballots').select('*').eq('round_id', roundId);
        setBallots(ballotsData || []);
        const { data: teamsData } = await supabase.from('teams').select('*').eq('tournament_id', tournamentId);
        setTeams(teamsData || []);
        const { data: judgesData } = await supabase.from('judges').select('*').eq('tournament_id', tournamentId);
        setJudges(judgesData || []);
      } catch (error) {
        toast.error('Failed to load round data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tournamentId, roundId]);

  // Generate draw for this round
  const handleGenerateDraw = async () => {
    setIsGeneratingDraw(true);
    try {
      // For now, just call a function or endpoint to generate draws for this round
      // TODO: Use format-aware logic
      const { error } = await supabase.functions.invoke('generate-draw', {
        body: { tournamentId, roundId }
      });
      if (error) throw error;
      toast.success('Draw generated!');
      // Refetch draws
      const { data: drawsData } = await supabase.from('draws').select('*').eq('round_id', roundId);
      setDraws(drawsData || []);
    } catch (error) {
      toast.error('Failed to generate draw');
    } finally {
      setIsGeneratingDraw(false);
    }
  };

  // Ballot confirmation (tabmaster only)
  const handleConfirmBallot = async (ballotId: string) => {
    try {
      if (!isTabMaster) {
        toast.error('Only the tabmaster can confirm ballots');
        return;
      }
      const { error } = await supabase
        .from('ballots')
        .update({ status: 'confirmed', confirmed_time: new Date().toISOString(), confirmed_by: user?.id })
        .eq('id', ballotId);
      if (error) throw error;
      toast.success('Ballot confirmed');
      // Refetch ballots
      const { data: ballotsData } = await supabase.from('ballots').select('*').eq('round_id', roundId);
      setBallots(ballotsData || []);
    } catch (error) {
      toast.error('Failed to confirm ballot');
    }
  };

  // Helper: Calculate standings for this round (BP and WSDC)
  const getTeamResults = () => {
    if (!draws || !teams) return [];
    // Map teamId to results
    const teamResults: Record<string, any> = {};
    draws.forEach(draw => {
      // BP: 4 teams per room, points 3-2-1-0, ranks 1-4
      if (draw.gov_team_id) teamResults[draw.gov_team_id] = { teamId: draw.gov_team_id, points: draw.gov_team_points, rank: draw.gov_team_rank };
      if (draw.opp_team_id) teamResults[draw.opp_team_id] = { teamId: draw.opp_team_id, points: draw.opp_team_points, rank: draw.opp_team_rank };
      if (draw.cg_team_id) teamResults[draw.cg_team_id] = { teamId: draw.cg_team_id, points: draw.cg_team_points, rank: draw.cg_team_rank };
      if (draw.co_team_id) teamResults[draw.co_team_id] = { teamId: draw.co_team_id, points: draw.co_team_points, rank: draw.co_team_rank };
    });
    // Attach team info
    return Object.values(teamResults).map(res => ({
      ...res,
      team: teams.find(t => t.id === res.teamId)
    })).sort((a, b) => (b.points || 0) - (a.points || 0));
  };

  // Helper: Calculate speaker scores for this round
  const getSpeakerResults = () => {
    if (!ballots) return [];
    const speakerScores: Record<string, { name: string; total: number; count: number }> = {};
    ballots.forEach(ballot => {
      (ballot.speaker_scores || []).forEach((score: any) => {
        if (!speakerScores[score.speaker_name]) {
          speakerScores[score.speaker_name] = { name: score.speaker_name, total: 0, count: 0 };
        }
        speakerScores[score.speaker_name].total += score.score;
        speakerScores[score.speaker_name].count += 1;
      });
    });
    return Object.values(speakerScores).map(s => ({ ...s, avg: s.count ? (s.total / s.count) : 0 }))
      .sort((a, b) => b.avg - a.avg);
  };

  // Helper: Is this the last preliminary round?
  const isLastPrelim = () => {
    // For now, just check if round.status !== 'completed' and round.round_number is the highest
    return round && round.status !== 'completed';
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <MainLayout>
      <PageHeader
        title={`Round ${round?.round_number || ''}`}
        description={round?.motion ? `Motion: ${round.motion}` : 'Round details'}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back to Rounds
          </Button>
        }
      />
      <div className="p-6 space-y-6">
        {/* Draw Section */}
        <Card>
          <CardHeader>
            <CardTitle>Draw</CardTitle>
          </CardHeader>
          <CardContent>
            {draws.length === 0 ? (
              <Button onClick={handleGenerateDraw} disabled={isGeneratingDraw}>
                {isGeneratingDraw ? 'Generating...' : 'Generate Draw'}
              </Button>
            ) : (
              <DrawsList
                tournamentId={tournamentId!}
                roundId={roundId!}
                teams={teams}
                judges={judges}
                rooms={round?.rooms || []}
                draws={draws}
                rounds={[round]}
                onStartRound={async () => {}}
                onCompleteRound={async () => {}}
                onGenerateDraws={handleGenerateDraw}
                tournamentName={''}
                roundName={`Round ${round?.round_number}`}
                publicMode={false}
              />
            )}
          </CardContent>
        </Card>
        {/* Ballots Section */}
        <Card>
          <CardHeader>
            <CardTitle>Ballots</CardTitle>
          </CardHeader>
          <CardContent>
            <BallotStatusTable
              ballots={ballots}
              judges={judges}
              rounds={[round]}
              draws={draws}
              onConfirm={isTabMaster ? handleConfirmBallot : undefined}
            />
            <BallotEntryForm
              tournamentId={tournamentId!}
              judges={judges}
              rounds={[round]}
              draws={draws}
              teams={teams}
              onClose={() => {}}
              onSuccess={async () => {
                // Refetch ballots
                const { data: ballotsData } = await supabase.from('ballots').select('*').eq('round_id', roundId);
                setBallots(ballotsData || []);
              }}
            />
          </CardContent>
        </Card>
        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Team Standings Table */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Team Standings</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getTeamResults().map((res, i) => (
                    <TableRow key={res.teamId} className={i === 0 ? 'bg-green-50' : ''}>
                      <TableCell>{res.team?.name || res.teamId}</TableCell>
                      <TableCell>{res.points ?? '-'}</TableCell>
                      <TableCell>{res.rank ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Speaker Scores Table */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Speaker Scores</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Speaker</TableHead>
                    <TableHead>Avg. Score</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSpeakerResults().map((s, i) => (
                    <TableRow key={s.name} className={i === 0 ? 'bg-blue-50' : ''}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.avg.toFixed(2)}</TableCell>
                      <TableCell>{s.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Breaks Placeholder */}
            {isLastPrelim() && (
              <div className="mt-8">
                <Button variant="secondary" disabled>
                  Generate Breaks (coming soon)
                </Button>
                <div className="text-gray-500 mt-2">Breaks will be available after all preliminary rounds are completed and confirmed.</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RoundDetail; 