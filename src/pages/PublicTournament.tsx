
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TournamentDashboard } from '@/components/analytics/TournamentDashboard';

interface PublicTournamentData {
  tournament: {
    id: string;
    name: string;
    description?: string;
    format?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  };
  showSpeakerScores: boolean;
}

const PublicTournament = () => {
  const { token } = useParams<{ token: string }>();
  const [tournamentData, setTournamentData] = useState<PublicTournamentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (token) {
      fetchTournamentData();
      
      // Set up auto-refresh every 30 seconds for live updates
      const interval = setInterval(() => {
        fetchTournamentData();
        setLastUpdated(new Date());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchTournamentData = async () => {
    if (!token) return;

    try {
      // First get the public access record
      const { data: accessData, error: accessError } = await supabase
        .from('public_tournament_access')
        .select('*')
        .eq('access_token', token)
        .eq('is_active', true)
        .single();

      if (accessError || !accessData) {
        console.error('Invalid or inactive tournament link');
        toast.error('Invalid or inactive tournament link');
        return;
      }

      // Get tournament data
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', accessData.tournament_id)
        .single();

      if (tournamentError || !tournamentData) {
        console.error('Tournament not found');
        toast.error('Tournament not found');
        return;
      }

      setTournamentData({
        tournament: tournamentData,
        showSpeakerScores: accessData.show_speaker_scores
      });
    } catch (error) {
      console.error('Error fetching tournament data:', error);
      toast.error('Failed to load tournament data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'upcoming': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tabby-secondary"></div>
      </div>
    );
  }

  if (!tournamentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tournament Not Found</h1>
          <p className="text-gray-600">This tournament link is invalid or has been deactivated.</p>
        </div>
      </div>
    );
  }

  const { tournament, showSpeakerScores } = tournamentData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                  {tournament.status?.toUpperCase() || 'UNKNOWN'}
                </Badge>
                <span className="text-sm text-gray-500">
                  Format: {tournament.format?.toUpperCase() || 'TBD'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw className="h-4 w-4" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tournament Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Dates</p>
                  <p className="font-medium">
                    {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{tournament.location || 'TBD'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Live Results</p>
                  <p className="font-medium">
                    {showSpeakerScores ? 'Full Results Available' : 'Team Standings Only'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {tournament.description && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About This Tournament</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{tournament.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Tournament Analytics Dashboard */}
        <TournamentDashboard tournamentId={tournament.id} />

        {/* Disclaimer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This is a live view of tournament results. Data updates automatically every 30 seconds.
            {!showSpeakerScores && ' Individual speaker scores will be available after tournament completion.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicTournament;
