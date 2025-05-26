
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { ResultsExport } from "@/components/results/ResultsExport";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Download, BarChart3, Podium } from "lucide-react";

interface Team {
  id: string;
  name: string;
  institution: string;
  points: number;
  speaker_scores: number;
  wins: number;
  position: number;
}

interface Speaker {
  id: string;
  name: string;
  team: string;
  total_score: number;
  average_score: number;
  position: number;
}

const Results = () => {
  const { id } = useParams<{ id: string }>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tournamentName, setTournamentName] = useState("Sample Tournament");

  // Mock data for demonstration
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setTeams([
        { id: '1', name: 'Oxford A', institution: 'Oxford University', points: 18, speaker_scores: 756, wins: 6, position: 1 },
        { id: '2', name: 'Cambridge A', institution: 'Cambridge University', points: 15, speaker_scores: 742, wins: 5, position: 2 },
        { id: '3', name: 'LSE Debaters', institution: 'London School of Economics', points: 12, speaker_scores: 728, wins: 4, position: 3 },
        { id: '4', name: 'Imperial Knights', institution: 'Imperial College London', points: 9, speaker_scores: 715, wins: 3, position: 4 },
        { id: '5', name: 'UCL Speakers', institution: 'University College London', points: 6, speaker_scores: 698, wins: 2, position: 5 },
        { id: '6', name: 'Kings Debate', institution: 'Kings College London', points: 3, speaker_scores: 681, wins: 1, position: 6 },
      ]);

      setSpeakers([
        { id: '1', name: 'John Smith', team: 'Oxford A', total_score: 252, average_score: 84.0, position: 1 },
        { id: '2', name: 'Jane Doe', team: 'Oxford A', total_score: 251, average_score: 83.7, position: 2 },
        { id: '3', name: 'Mike Johnson', team: 'Cambridge A', total_score: 248, average_score: 82.7, position: 3 },
        { id: '4', name: 'Sarah Wilson', team: 'Cambridge A', total_score: 247, average_score: 82.3, position: 4 },
        { id: '5', name: 'David Brown', team: 'LSE Debaters', total_score: 244, average_score: 81.3, position: 5 },
        { id: '6', name: 'Lisa Davis', team: 'LSE Debaters', total_score: 243, average_score: 81.0, position: 6 },
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, [id]);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tabby-secondary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Tournament Results"
        description="View final standings, speaker scores, and export tournament data"
        actions={
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </Button>
        }
      />
      
      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList className="grid grid-cols-4 max-w-lg">
          <TabsTrigger value="teams" className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Teams</span>
          </TabsTrigger>
          <TabsTrigger value="speakers" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Speakers</span>
          </TabsTrigger>
          <TabsTrigger value="rounds" className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Rounds</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
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
              <div className="space-y-3">
                {teams.map((team) => (
                  <Card key={team.id} className={`border-2 ${getPodiumColor(team.position)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`w-10 h-10 rounded-full p-0 flex items-center justify-center ${getPodiumColor(team.position)}`}>
                            {team.position}
                          </Badge>
                          <div>
                            <h3 className="font-semibold text-lg">{team.name}</h3>
                            <p className="text-gray-600">{team.institution}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-tabby-secondary">{team.points}</div>
                            <div className="text-sm text-gray-500">Points</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{team.wins}</div>
                            <div className="text-sm text-gray-500">Wins</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{team.speaker_scores}</div>
                            <div className="text-sm text-gray-500">Speaker Pts</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
              <div className="space-y-3">
                {speakers.map((speaker) => (
                  <Card key={speaker.id} className={`border ${speaker.position <= 3 ? getPodiumColor(speaker.position) : 'border-gray-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`w-10 h-10 rounded-full p-0 flex items-center justify-center ${
                            speaker.position <= 3 ? getPodiumColor(speaker.position) : 'bg-gray-100 text-gray-800'
                          }`}>
                            {speaker.position}
                          </Badge>
                          <div>
                            <h3 className="font-semibold">{speaker.name}</h3>
                            <p className="text-gray-600">{speaker.team}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-xl font-bold text-tabby-secondary">{speaker.average_score}</div>
                            <div className="text-sm text-gray-500">Avg Score</div>
                          </div>
                          <div>
                            <div className="text-xl font-bold">{speaker.total_score}</div>
                            <div className="text-sm text-gray-500">Total</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rounds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Round-by-Round Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Round Results</h3>
                <p className="text-gray-500 mt-2">Detailed round-by-round analysis coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ResultsExport tournamentId={id!} tournamentName={tournamentName} />
        </TabsContent>
      </Tabs>
      
      <AIAssistant />
    </MainLayout>
  );
};

export default Results;
