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
  const { canEditTournament } = useUserRole();
  const { tournament } = useTournamentData(id);
  const { 
    teamPerformance, 
    speakerRankings, 
    isLoading, 
    refetch,
    exportAnalytics 
  } = useTournamentAnalytics(id);

  const [breakType, setBreakType] = useState<'quarters' | 'semis' | 'finals'>('quarters');
  const [breakSize, setBreakSize] = useState<number>(8);
  const [isGeneratingBreaks, setIsGeneratingBreaks] = useState(false);
  const [breakingTeams, setBreakingTeams] = useState<BreakingTeam[]>([]);
  const [showBreakResults, setShowBreakResults] = useState(false);

  const getPodiumColor = (position: number) => {
    switch (position) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2: return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3: return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getBreakSizeOptions = () => {
    switch (breakType) {
      case 'quarters': return [4, 8, 16, 32];
      case 'semis': return [4, 8, 16];
      case 'finals': return [2, 4, 8];
      default: return [8];
    }
  };

  const generateBreaks = async () => {
    if (!id || !canEditTournament) {
      toast.error('You do not have permission to generate breaks');
      return;
    }

    setIsGeneratingBreaks(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-tournament-breaks', {
        body: {
          tournamentId: id,
          breakType,
          breakSize
        }
      });

      if (error) {
        console.error('Error generating breaks:', error);
        toast.error('Failed to generate breaks');
        return;
      }

      // Get the top N teams for the break
      const topTeams = teamPerformance.slice(0, breakSize).map((team, index) => ({
        team_id: team.team_id,
        team_name: team.team_name,
        institution: team.institution,
        position: index + 1,
        total_points: team.total_speaker_score,
        wins: team.wins
      }));

      setBreakingTeams(topTeams);
      setShowBreakResults(true);
      toast.success(`Successfully generated ${breakType} with ${data.debatesGenerated} debates`);
    } catch (error) {
      console.error('Error generating breaks:', error);
      toast.error('Failed to generate breaks');
    } finally {
      setIsGeneratingBreaks(false);
    }
  };

  const canGenerateBreaks = () => {
    // Check if all preliminary rounds are completed
    // This is a simplified check - in a real system, you'd check round status
    return canEditTournament && teamPerformance.length > 0;
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
            {canGenerateBreaks() && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-tabby-secondary hover:bg-tabby-secondary/90 gap-2">
                    <Crown className="h-4 w-4" />
                    Generate Breaks
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Generate Tournament Breaks</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="break-type">Break Type</Label>
                      <Select value={breakType} onValueChange={(value: 'quarters' | 'semis' | 'finals') => setBreakType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quarters">Quarter Finals</SelectItem>
                          <SelectItem value="semis">Semi Finals</SelectItem>
                          <SelectItem value="finals">Finals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="break-size">Break Size</Label>
                      <Select value={breakSize.toString()} onValueChange={(value) => setBreakSize(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getBreakSizeOptions().map(size => (
                            <SelectItem key={size} value={size.toString()}>{size} Teams</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={generateBreaks} 
                      disabled={isGeneratingBreaks}
                      className="w-full"
                    >
                      {isGeneratingBreaks ? (
                        <>
                          <LoadingSpinner className="h-4 w-4 mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          Generate Breaks
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        }
      />

      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-lg">
          <TabsTrigger value="teams" className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Teams</span>
          </TabsTrigger>
          <TabsTrigger value="speakers" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Speakers</span>
          </TabsTrigger>
          <TabsTrigger value="breaks" className="flex items-center gap-1.5">
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline">Breaks</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-6">
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

        <TabsContent value="speakers" className="space-y-6">
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
                    {canEditTournament 
                      ? "Generate breaks to see which teams advance to elimination rounds"
                      : "Break results will appear here once generated by the tabmaster"
                    }
                  </p>
                  {canEditTournament && (
                    <Button 
                      onClick={() => (document.querySelector('[data-radix-dialog-trigger]') as HTMLElement)?.click()}
                      className="mt-4"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Generate Breaks
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Breaking Teams - {breakType.charAt(0).toUpperCase() + breakType.slice(1)}
                    </h3>
                    <Badge variant="secondary">{breakingTeams.length} Teams</Badge>
                  </div>
                  <div className="space-y-3">
                    {breakingTeams.map((team) => (
                      <Card key={team.team_id} className={`border-2 ${getPodiumColor(team.position)}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge className={`w-10 h-10 rounded-full p-0 flex items-center justify-center ${getPodiumColor(team.position)}`}>
                                {team.position}
                              </Badge>
                              <div>
                                <h3 className="font-semibold text-lg">{team.team_name}</h3>
                                <p className="text-gray-600">{team.institution}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <div className="text-2xl font-bold text-tabby-secondary">{team.wins}</div>
                                <div className="text-sm text-gray-500">Wins</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold">{team.total_points.toFixed(1)}</div>
                                <div className="text-sm text-gray-500">Points</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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