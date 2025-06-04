
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Trophy, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTournamentAnalytics } from '@/hooks/useTournamentAnalytics';

interface TournamentDashboardProps {
  tournamentId: string;
}

export const TournamentDashboard = ({ tournamentId }: TournamentDashboardProps) => {
  const { teamPerformance, speakerRankings, isLoading, exportAnalytics } = useTournamentAnalytics(tournamentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tabby-secondary"></div>
      </div>
    );
  }

  const totalTeams = teamPerformance.length;
  const totalRounds = teamPerformance[0]?.rounds_participated || 0;
  const averageScore = teamPerformance.reduce((sum, team) => sum + team.average_speaker_score, 0) / totalTeams || 0;
  const topSpeaker = speakerRankings[0];

  // Prepare data for charts
  const teamChartData = teamPerformance.slice(0, 10).map(team => ({
    name: team.team_name.length > 15 ? team.team_name.substring(0, 15) + '...' : team.team_name,
    wins: team.wins,
    losses: team.losses,
    avgScore: team.average_speaker_score
  }));

  const scoreDistribution = teamPerformance.reduce((acc, team) => {
    const scoreRange = Math.floor(team.average_speaker_score / 10) * 10;
    const range = `${scoreRange}-${scoreRange + 9}`;
    acc[range] = (acc[range] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const distributionData = Object.entries(scoreDistribution).map(([range, count]) => ({
    range,
    count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold">{totalTeams}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rounds Completed</p>
                <p className="text-2xl font-bold">{totalRounds}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">{averageScore.toFixed(1)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top Speaker</p>
                <p className="text-lg font-bold">{topSpeaker?.speaker_name || 'N/A'}</p>
                <p className="text-sm text-gray-500">{topSpeaker?.total_score.toFixed(1) || 0}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Performance (Top 10)</CardTitle>
            <Button onClick={exportAnalytics} variant="outline" size="sm">
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={teamChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="wins" fill="#22c55e" name="Wins" />
              <Bar dataKey="losses" fill="#ef4444" name="Losses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Scores Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Team Average Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={teamChartData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgScore" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Standings */}
        <Card>
          <CardHeader>
            <CardTitle>Team Standings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teamPerformance.slice(0, 10).map((team, index) => (
                <div key={team.team_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-600">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{team.team_name}</p>
                      <p className="text-sm text-gray-500">{team.institution}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{team.wins}W - {team.losses}L</p>
                    <p className="text-sm text-gray-500">{team.average_speaker_score.toFixed(1)} avg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Speaker Rankings */}
        <Card>
          <CardHeader>
            <CardTitle>Top Speakers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {speakerRankings.slice(0, 10).map((speaker, index) => (
                <div key={`${speaker.team_id}-${speaker.speaker_position}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-600">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{speaker.speaker_name}</p>
                      <p className="text-sm text-gray-500">{speaker.team_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{speaker.total_score.toFixed(1)}</p>
                    <p className="text-sm text-gray-500">{speaker.average_score.toFixed(1)} avg</p>
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
