import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useTournamentAnalytics } from "@/hooks/useTournamentAnalytics";
import { useTournamentData } from "@/hooks/useTournamentData";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { 
  Trophy, 
  Users, 
  Medal, 
  Crown, 
  Download, 
  RefreshCw, 
  Target,
  Award,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FormatUtils, DEBATE_FORMATS, DebateFormat } from '@/types/formats';
import { Round } from '@/types/tournament';

interface BreakingTeam {
  team_id: string;
  team_name: string;
  institution?: string;
  position: number;
  total_points: number;
  wins: number;
}

const Standings = () => {
  const { id } = useParams<{ id: string }>();
  const { role, isTabMaster } = useUserRole();
  const { tournament, rounds } = useTournamentData(id);
  const { 
    teamPerformance, 
    speakerRankings, 
    isLoading, 
    refetch,
    exportAnalytics 
  } = useTournamentAnalytics(id);

  // Format-based logic
  const format = (tournament?.format as DebateFormat) || 'bp';
  const formatSpec = DEBATE_FORMATS[format];
  const breakStructure = formatSpec.breakStructure;
  const supportedBreaks = breakStructure.supportedBreaks;
  const defaultBreakSize = breakStructure.defaultBreakSize;
  const qualificationCriteria = breakStructure.qualificationCriteria;
  const tieBreakers = breakStructure.tieBreakers;

  // State
  const [breakType, setBreakType] = useState(supportedBreaks[0] || 'quarters');
  const [breakSize, setBreakSize] = useState(defaultBreakSize);
  const [isGeneratingBreaks, setIsGeneratingBreaks] = useState(false);
  const [breakingTeams, setBreakingTeams] = useState<BreakingTeam[]>([]);
  const [showBreakResults, setShowBreakResults] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [overrideTeams, setOverrideTeams] = useState<BreakingTeam[] | null>(null);

  // Robust: Use round_number to determine prelims
  // Assume last N rounds are breaks, where N = supportedBreaks.length
  const breakRoundsCount = supportedBreaks.length;
  const sortedRounds = rounds ? [...rounds].sort((a, b) => a.round_number - b.round_number) : [];
  const prelimRounds = sortedRounds.slice(0, sortedRounds.length - breakRoundsCount);
  const allPrelimsCompleted = prelimRounds.length > 0 && prelimRounds.every(r => r.status === 'completed');

  // Format-based break size options
  const getBreakSizeOptions = () => {
    // E.g., for BP: [4, 8, 16, 32] but not more than team count
    const max = Math.min((teamPerformance?.length || 0), 32);
    const options = [4, 8, 16, 32].filter(size => size <= max);
    return options.length ? options : [max];
  };

  // Format-based team sorting and tie-breakers
  const computeBreakTeams = () => {
    let sorted = [...teamPerformance];
    // Apply qualification criteria and tie-breakers
    if (qualificationCriteria === 'points' || qualificationCriteria === 'wins') {
      sorted.sort((a, b) => b.wins - a.wins);
    } else if (qualificationCriteria === 'speaker_scores') {
      sorted.sort((a, b) => b.total_speaker_score - a.total_speaker_score);
    } else if (qualificationCriteria === 'combined') {
      // Example: sort by wins, then speaker score
      sorted.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.total_speaker_score - a.total_speaker_score;
      });
    }
    // TODO: Apply further tie-breakers as needed
    return sorted.slice(0, breakSize).map((team, index) => ({
      team_id: team.team_id,
      team_name: team.team_name,
      institution: team.institution,
      position: index + 1,
      total_points: team.total_speaker_score,
      wins: team.wins
    }));
  };

  // Tabmaster can override break list
  const handleOverrideTeam = (teamId: string, action: 'add' | 'remove') => {
    if (!overrideTeams) return;
    if (action === 'remove') {
      setOverrideTeams(overrideTeams.filter(t => t.team_id !== teamId));
    } else if (action === 'add') {
      const team = teamPerformance.find(t => t.team_id === teamId);
      if (team && !overrideTeams.some(t => t.team_id === teamId)) {
        setOverrideTeams([...overrideTeams, {
          team_id: team.team_id,
          team_name: team.team_name,
          institution: team.institution,
          position: overrideTeams.length + 1,
          total_points: team.total_speaker_score,
          wins: team.wins
        }]);
      }
    }
  };

  // Confirm and persist break
  const confirmBreak = async () => {
    setIsGeneratingBreaks(true);
    try {
      // Persist break round and debates (minimal backend call)
      // For now, just set breakingTeams and show results
      setBreakingTeams(overrideTeams || computeBreakTeams());
      setShowBreakResults(true);
      setShowBreakModal(false);
      toast.success(`Break confirmed for ${breakType} (${breakSize} teams)`);
    } catch (error) {
      toast.error('Failed to confirm break');
    } finally {
      setIsGeneratingBreaks(false);
    }
  };

  const getPodiumColor = (position: number) => {
    switch (position) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2: return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3: return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Tournament Standings"
        description="Live team and speaker rankings, plus break generation"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={refetch} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportAnalytics} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            {isTabMaster && allPrelimsCompleted && (
              <Button className="bg-tabby-secondary hover:bg-tabby-secondary/90 gap-2" onClick={() => {
                setOverrideTeams(computeBreakTeams());
                setShowBreakModal(true);
              }}>
                <Crown className="h-4 w-4" />
                Generate Breaks
              </Button>
            )}
          </div>
        }
      />
      {/* Break Preview/Override Modal for Tabmaster */}
      {showBreakModal && (
        <Dialog open={showBreakModal} onOpenChange={setShowBreakModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Preview & Confirm Break ({breakType}, {breakSize} teams)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Break Type</Label>
                <Select value={breakType} onValueChange={v => setBreakType(v as typeof breakType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {supportedBreaks.map(type => (
                      <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Break Size</Label>
                <Select value={breakSize.toString()} onValueChange={v => setBreakSize(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {getBreakSizeOptions().map(size => (
                      <SelectItem key={size} value={size.toString()}>{size} Teams</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">#</th>
                      <th className="text-left">Team</th>
                      <th className="text-left">Institution</th>
                      <th className="text-left">Wins</th>
                      <th className="text-left">Speaker Score</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {overrideTeams?.map((team, idx) => (
                      <tr key={team.team_id} className="border-b">
                        <td>{idx + 1}</td>
                        <td>{team.team_name}</td>
                        <td>{team.institution}</td>
                        <td>{team.wins}</td>
                        <td>{team.total_points}</td>
                        <td>
                          <Button size="sm" variant="destructive" onClick={() => handleOverrideTeam(team.team_id, 'remove')}>Remove</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Optionally allow adding teams not in the break */}
                <div className="mt-2">
                  <Label>Add Team</Label>
                  <Select onValueChange={teamId => handleOverrideTeam(teamId, 'add')}>
                    <SelectTrigger><SelectValue placeholder="Select team to add" /></SelectTrigger>
                    <SelectContent>
                      {teamPerformance.filter(t => !overrideTeams?.some(bt => bt.team_id === t.team_id)).map(t => (
                        <SelectItem key={t.team_id} value={t.team_id}>{t.team_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={confirmBreak} disabled={isGeneratingBreaks} className="w-full">
                {isGeneratingBreaks ? 'Confirming...' : 'Confirm Break'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Break Results (visible to all) */}
      <Tabs defaultValue="teams" className="mt-6">
        <TabsList>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="speakers">Speakers</TabsTrigger>
          <TabsTrigger value="breaks">Breaks</TabsTrigger>
        </TabsList>
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Team Standings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamPerformance.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No Team Data</h3>
                  <p className="text-gray-500 mt-2">Team standings will appear here once rounds are completed</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamPerformance.map((team, index) => (
                    <Card key={team.team_id} className={`border-2 ${getPodiumColor(index + 1)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={`w-10 h-10 rounded-full p-0 flex items-center justify-center ${getPodiumColor(index + 1)}`}>
                              {index + 1}
                            </Badge>
                            <div>
                              <h3 className="font-semibold text-lg">{team.team_name}</h3>
                              <p className="text-gray-600">{team.institution}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-tabby-secondary">{team.wins}</div>
                              <div className="text-sm text-gray-500">Wins</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold">{team.losses}</div>
                              <div className="text-sm text-gray-500">Losses</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold">{team.total_speaker_score.toFixed(1)}</div>
                              <div className="text-sm text-gray-500">Total</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold">{team.average_speaker_score.toFixed(1)}</div>
                              <div className="text-sm text-gray-500">Avg</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="speakers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Speaker Standings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {speakerRankings.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No Speaker Data</h3>
                  <p className="text-gray-500 mt-2">Speaker rankings will appear here once rounds are completed</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {speakerRankings.map((speaker, index) => (
                    <Card key={`${speaker.team_id}-${speaker.speaker_position}`} className={`border ${index < 3 ? getPodiumColor(index + 1) : 'border-gray-200'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={`w-10 h-10 rounded-full p-0 flex items-center justify-center ${
                              index < 3 ? getPodiumColor(index + 1) : 'bg-gray-100 text-gray-800'
                            }`}>
                              {index + 1}
                            </Badge>
                            <div>
                              <h3 className="font-semibold">{speaker.speaker_name}</h3>
                              <p className="text-gray-600">{speaker.team_name} • Speaker {speaker.speaker_position}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-xl font-bold text-tabby-secondary">{speaker.total_score.toFixed(1)}</div>
                              <div className="text-sm text-gray-500">Total</div>
                            </div>
                            <div>
                              <div className="text-xl font-bold">{speaker.average_score.toFixed(1)}</div>
                              <div className="text-sm text-gray-500">Avg</div>
                            </div>
                            <div>
                              <div className="text-xl font-bold">{speaker.rounds_spoken}</div>
                              <div className="text-sm text-gray-500">Rounds</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="breaks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Break Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {breakingTeams.length === 0 ? (
                <div className="text-center py-8">
                  <Crown className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No Break Results</h3>
                  <p className="text-gray-500 mt-2">
                    {isTabMaster 
                      ? "Generate breaks to see which teams advance to elimination rounds"
                      : "Break results will appear here once generated by the tabmaster"
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left">#</th>
                        <th className="text-left">Team</th>
                        <th className="text-left">Institution</th>
                        <th className="text-left">Wins</th>
                        <th className="text-left">Speaker Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakingTeams.map((team, idx) => (
                        <tr key={team.team_id} className="border-b">
                          <td>{idx + 1}</td>
                          <td>{team.team_name}</td>
                          <td>{team.institution}</td>
                          <td>{team.wins}</td>
                          <td>{team.total_points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Standings; 