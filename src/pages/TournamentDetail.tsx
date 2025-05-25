import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Calendar,
  Users,
  Award,
  Clock,
  MapPin,
  BarChart3,
  UserCircle,
  MessageCircle,
  MessageSquare,
  BrainCircuit,
  ClipboardCheck,
  Edit,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { AIAssistant } from "@/components/ai/AIAssistant";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Tournament = {
  id: string;
  name: string;
  format: string | null;
  start_date: string | null;
  end_date: string | null;
  team_count: number | null;
  round_count: number | null;
  location: string | null;
  description: string | null;
  status: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  
  useEffect(() => {
    if (id) {
      fetchTournament();
    }
  }, [id]);

  const fetchTournament = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching tournament:', error);
        toast.error("Failed to load tournament");
        return;
      }

      setTournament(data);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      toast.error("Failed to load tournament");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBD";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const getFormatName = (format: string | null) => {
    switch (format?.toLowerCase()) {
      case 'bp': return 'British Parliamentary';
      case 'wsdc': return 'World Schools';
      case 'apda': return 'American Parliamentary';
      case 'policy': return 'Policy Debate';
      default: return format || 'TBD';
    }
  };

  const statusColors = {
    active: "bg-tabby-success",
    upcoming: "bg-tabby-accent", 
    completed: "bg-tabby-warning",
  };
  
  const loadAiInsights = () => {
    setAiInsightsLoading(true);
    // Simulate AI loading
    setTimeout(() => {
      setAiInsights("Tournament analysis will be available once teams and rounds are added. Current tournament setup shows good planning with proper format selection and participant capacity.");
      setAiInsightsLoading(false);
    }, 2000);
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

  if (!tournament) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Tournament not found</h2>
          <p className="mt-2 text-gray-600">The tournament you're looking for doesn't exist.</p>
          <Link to="/tournaments">
            <Button className="mt-4">Back to Tournaments</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <PageHeader 
        title={tournament.name}
        description={`${getFormatName(tournament.format)} format • ${tournament.location || "Location TBD"}`}
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to="/tournaments">
              <Button variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link to={`/tournaments/${id}/edit`}>
              <Button className="bg-tabby-secondary hover:bg-tabby-secondary/90">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />
      
      {/* Status Bar */}
      <div className="flex items-center mb-6 p-3 bg-gray-50 rounded-md border border-gray-100">
        <div className="flex items-center">
          <div className={`tabby-status-circle ${statusColors[tournament.status as keyof typeof statusColors] || 'bg-gray-400'}`} />
          <span className="text-sm font-medium ml-2 capitalize">{tournament.status || 'upcoming'}</span>
        </div>
        <div className="ml-6 text-sm text-gray-500 flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-400" />
          Rounds: {tournament.round_count || 'TBD'}
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-tabby-secondary mr-2" />
              <CardTitle className="text-base">Tournament Schedule</CardTitle>
            </div>
            <div className="mt-4 space-y-3">
              <div className="text-sm">
                <div className="font-medium">Start Date</div>
                <div className="text-gray-500">{formatDate(tournament.start_date)}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">End Date</div>
                <div className="text-gray-500">{formatDate(tournament.end_date)}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Location</div>
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {tournament.location || "TBD"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-tabby-secondary mr-2" />
              <CardTitle className="text-base">Participants</CardTitle>
            </div>
            <div className="mt-4 space-y-3">
              <div className="text-sm flex justify-between items-center">
                <div>Teams</div>
                <div className="font-medium">{tournament.team_count || 'TBD'}</div>
              </div>
              <div className="text-sm flex justify-between items-center">
                <div>Judges</div>
                <div className="font-medium">TBD</div>
              </div>
              <div className="mt-4">
                <Link to={`/tournaments/${id}/teams`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Teams
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Award className="h-5 w-5 text-tabby-secondary mr-2" />
              <CardTitle className="text-base">Tournament Progress</CardTitle>
            </div>
            <div className="mt-4 space-y-3">
              <div className="text-sm">
                <div className="font-medium">Format</div>
                <div className="text-gray-500">{getFormatName(tournament.format)}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Total Rounds</div>
                <div className="text-gray-500">{tournament.round_count || 'TBD'}</div>
              </div>
              <div className="mt-4">
                <Link to={`/tournaments/${id}/results`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Results
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Insights Card */}
      <Card className="mb-8 overflow-hidden border-2 border-tabby-secondary/30">
        <CardHeader className="bg-gradient-to-r from-tabby-primary to-tabby-primary border-b border-gray-100">
          <div className="flex items-center">
            <BrainCircuit className="h-5 w-5 text-tabby-secondary mr-2" />
            <CardTitle className="text-white text-lg">AI Tournament Insights</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Get intelligent analysis of your tournament
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {aiInsights ? (
            <div className="text-sm">
              {aiInsights}
              <div className="mt-4">
                <Link to={`/tournaments/${id}/analysis`}>
                  <Button className="w-full bg-tabby-secondary hover:bg-tabby-secondary/90">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Detailed Analysis
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <BrainCircuit className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">Generate AI Insights</h3>
              <p className="text-gray-500 mt-2 mb-4">Get intelligent analysis of your tournament data</p>
              <Button 
                onClick={loadAiInsights} 
                className="bg-tabby-secondary hover:bg-tabby-secondary/90"
                disabled={aiInsightsLoading}
              >
                {aiInsightsLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Tournament
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-4 w-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Tabs Section */}
      <Tabs defaultValue="rounds" className="space-y-6">
        <TabsList className="grid grid-cols-4 max-w-md">
          <TabsTrigger value="rounds" className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Rounds</span>
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Teams</span>
          </TabsTrigger>
          <TabsTrigger value="judges" className="flex items-center gap-1.5">
            <UserCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Judges</span>
          </TabsTrigger>
          <TabsTrigger value="motions" className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Motions</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Rounds Tab */}
        <TabsContent value="rounds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Rounds</CardTitle>
              <CardDescription>Setup and manage rounds for this tournament</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No rounds created yet</h3>
                <p className="text-gray-500 mt-2 mb-6">Start by creating rounds for this tournament</p>
                <Link to={`/tournaments/${id}/rounds`}>
                  <Button className="bg-tabby-secondary hover:bg-tabby-secondary/90">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Setup Rounds
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Teams Tab - Now redirects to dedicated teams page */}
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>View and manage teams participating in this tournament</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Manage Tournament Teams</h3>
                <p className="text-gray-500 mt-2 mb-6">Add and organize teams for this tournament</p>
                <Link to={`/tournaments/${id}/teams`}>
                  <Button className="bg-tabby-secondary hover:bg-tabby-secondary/90">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Teams
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Judges Tab */}
        <TabsContent value="judges">
          <Card>
            <CardHeader>
              <CardTitle>Judge Management</CardTitle>
              <CardDescription>View and manage judges for this tournament</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <UserCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No judges assigned yet</h3>
                <p className="text-gray-500 mt-2 mb-6">Add judges to evaluate debates</p>
                <Button className="bg-tabby-secondary hover:bg-tabby-secondary/90">
                  <UserCircle className="h-4 w-4 mr-2" />
                  Add Judges
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Motions Tab */}
        <TabsContent value="motions">
          <Card>
            <CardHeader>
              <CardTitle>Motion Management</CardTitle>
              <CardDescription>View and manage debate motions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No motions prepared yet</h3>
                <p className="text-gray-500 mt-2 mb-6">Create debate motions for tournament rounds</p>
                <Button className="bg-tabby-secondary hover:bg-tabby-secondary/90">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Add Motions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* AI Assistant */}
      <AIAssistant />
    </MainLayout>
  );
};

export default TournamentDetail;
