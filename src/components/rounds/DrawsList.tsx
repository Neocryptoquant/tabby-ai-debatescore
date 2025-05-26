
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Shuffle, Play, CheckCircle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  institution: string;
}

interface Draw {
  id: string;
  round_number: number;
  room: string;
  gov_team: Team;
  opp_team: Team;
  judge?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface DrawsListProps {
  draws: Draw[];
  onGenerateDraws: () => void;
  onRegenerateDraws: (roundNumber: number) => void;
  isLoading?: boolean;
}

export const DrawsList = ({ draws, onGenerateDraws, onRegenerateDraws, isLoading = false }: DrawsListProps) => {
  const getStatusColor = (status: Draw['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Draw['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'in_progress': return <Play className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const groupedDraws = draws.reduce((acc, draw) => {
    const round = `Round ${draw.round_number}`;
    if (!acc[round]) acc[round] = [];
    acc[round].push(draw);
    return acc;
  }, {} as Record<string, Draw[]>);

  const handleStartRound = (roundNumber: number) => {
    // Update all draws in this round to in_progress status
    toast.success(`Round ${roundNumber} started!`);
  };

  const handleCompleteRound = (roundNumber: number) => {
    // Update all draws in this round to completed status
    toast.success(`Round ${roundNumber} completed!`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (Object.keys(groupedDraws).length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No draws created yet</h3>
          <p className="text-gray-500 mb-4">Generate draws to pair teams for each round</p>
          <Button onClick={onGenerateDraws} className="gap-2 bg-tabby-secondary hover:bg-tabby-secondary/90">
            <Shuffle className="h-4 w-4" />
            Generate Draws
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tournament Draws</h3>
        <Button onClick={onGenerateDraws} variant="outline" className="gap-2">
          <Shuffle className="h-4 w-4" />
          Regenerate All Draws
        </Button>
      </div>

      {Object.entries(groupedDraws).map(([roundName, roundDraws]) => {
        const roundNumber = roundDraws[0].round_number;
        const roundStatus = roundDraws[0].status;
        
        return (
          <Card key={roundName}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {roundName}
                  <Badge className={getStatusColor(roundStatus)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(roundStatus)}
                      {roundStatus.replace('_', ' ')}
                    </span>
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  {roundStatus === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartRound(roundNumber)}
                      className="gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Start Round
                    </Button>
                  )}
                  {roundStatus === 'in_progress' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompleteRound(roundNumber)}
                      className="gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Complete Round
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRegenerateDraws(roundNumber)}
                    className="gap-1"
                  >
                    <Shuffle className="h-3 w-3" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Government</TableHead>
                    <TableHead>Opposition</TableHead>
                    <TableHead>Judge</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roundDraws.map((draw) => (
                    <TableRow key={draw.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{draw.room}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-green-700">{draw.gov_team.name}</div>
                          <div className="text-sm text-gray-500">{draw.gov_team.institution}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-red-700">{draw.opp_team.name}</div>
                          <div className="text-sm text-gray-500">{draw.opp_team.institution}</div>
                        </div>
                      </TableCell>
                      <TableCell>{draw.judge || "TBA"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(draw.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(draw.status)}
                            {draw.status.replace('_', ' ')}
                          </span>
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
