import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Trophy, Users, BarChart3 } from "lucide-react";
import { toast } from "sonner";

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

interface ResultsExportProps {
  tournamentId: string;
  tournamentName: string;
}

export const ResultsExport = ({ tournamentId, tournamentName }: ResultsExportProps) => {
  const [isExporting, setIsExporting] = useState(false);

  // Mock data - in real implementation, this would come from database
  const teamStandings: Team[] = [
    { id: '1', name: 'Oxford A', institution: 'Oxford University', points: 18, speaker_scores: 756, wins: 6, position: 1 },
    { id: '2', name: 'Cambridge A', institution: 'Cambridge University', points: 15, speaker_scores: 742, wins: 5, position: 2 },
    { id: '3', name: 'LSE Debaters', institution: 'London School of Economics', points: 12, speaker_scores: 728, wins: 4, position: 3 },
    { id: '4', name: 'Imperial Knights', institution: 'Imperial College London', points: 9, speaker_scores: 715, wins: 3, position: 4 },
    { id: '5', name: 'UCL Speakers', institution: 'University College London', points: 6, speaker_scores: 698, wins: 2, position: 5 },
    { id: '6', name: 'Kings Debate', institution: 'Kings College London', points: 3, speaker_scores: 681, wins: 1, position: 6 },
  ];

  const speakerStandings: Speaker[] = [
    { id: '1', name: 'John Smith', team: 'Oxford A', total_score: 252, average_score: 84.0, position: 1 },
    { id: '2', name: 'Jane Doe', team: 'Oxford A', total_score: 251, average_score: 83.7, position: 2 },
    { id: '3', name: 'Mike Johnson', team: 'Cambridge A', total_score: 248, average_score: 82.7, position: 3 },
    { id: '4', name: 'Sarah Wilson', team: 'Cambridge A', total_score: 247, average_score: 82.3, position: 4 },
    { id: '5', name: 'David Brown', team: 'LSE Debaters', total_score: 244, average_score: 81.3, position: 5 },
    { id: '6', name: 'Lisa Davis', team: 'LSE Debaters', total_score: 243, average_score: 81.0, position: 6 },
  ];

  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${tournamentName}_${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTeamStandings = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      exportToCSV(teamStandings as Record<string, unknown>[], 'team_standings');
      toast.success("Team standings exported successfully!");
    } catch (error) {
      toast.error("Failed to export team standings");
    } finally {
      setIsExporting(false);
    }
  };

  const exportSpeakerStandings = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      exportToCSV(speakerStandings as Record<string, unknown>[], 'speaker_standings');
      toast.success("Speaker standings exported successfully!");
    } catch (error) {
      toast.error("Failed to export speaker standings");
    } finally {
      setIsExporting(false);
    }
  };

  const exportFullResults = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Export multiple files
      exportToCSV(teamStandings as Record<string, unknown>[], 'team_standings');
      setTimeout(() => exportToCSV(speakerStandings as Record<string, unknown>[], 'speaker_standings'), 500);
      
      toast.success("Full tournament results exported successfully!");
    } catch (error) {
      toast.error("Failed to export full results");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={exportTeamStandings}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2 h-auto p-4 flex-col"
            >
              <Trophy className="h-6 w-6 text-yellow-600" />
              <span className="font-medium">Team Standings</span>
              <span className="text-sm text-gray-500">Export team rankings and points</span>
            </Button>

            <Button
              onClick={exportSpeakerStandings}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2 h-auto p-4 flex-col"
            >
              <Users className="h-6 w-6 text-blue-600" />
              <span className="font-medium">Speaker Standings</span>
              <span className="text-sm text-gray-500">Export individual speaker scores</span>
            </Button>

            <Button
              onClick={exportFullResults}
              disabled={isExporting}
              className="flex items-center gap-2 h-auto p-4 flex-col bg-tabby-secondary hover:bg-tabby-secondary/90"
            >
              <BarChart3 className="h-6 w-6" />
              <span className="font-medium">Full Results</span>
              <span className="text-sm text-white/80">Export complete tournament data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Standings Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teamStandings.slice(0, 3).map((team) => (
                <div key={team.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                      {team.position}
                    </Badge>
                    <div>
                      <div className="font-medium">{team.name}</div>
                      <div className="text-sm text-gray-500">{team.institution}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{team.points} pts</div>
                    <div className="text-sm text-gray-500">{team.wins} wins</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Speaker Standings Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {speakerStandings.slice(0, 3).map((speaker) => (
                <div key={speaker.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                      {speaker.position}
                    </Badge>
                    <div>
                      <div className="font-medium">{speaker.name}</div>
                      <div className="text-sm text-gray-500">{speaker.team}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{speaker.average_score}</div>
                    <div className="text-sm text-gray-500">avg score</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
