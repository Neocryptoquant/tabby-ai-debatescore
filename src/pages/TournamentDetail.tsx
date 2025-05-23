
import { useState } from "react";
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

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock data - would come from API in real app
  const tournament = {
    id: id || "1",
    name: "Global Debate Championship",
    format: "BP",
    formatName: "British Parliamentary",
    status: "active",
    startDate: "May 25, 2025",
    endDate: "May 27, 2025",
    location: "London, UK",
    description: "The annual Global Debate Championship brings together the best university debate teams from around the world.",
    teamCount: 32,
    judgeCount: 16,
    roundCount: 6,
    currentRound: 3,
    rounds: [
      { roundNumber: 1, status: "completed", motion: "This House Would ban private education" },
      { roundNumber: 2, status: "completed", motion: "This House Believes that developing nations should prioritize climate adaptation over mitigation" },
      { roundNumber: 3, status: "active", motion: "This House Would allow the sale of human organs" },
      { roundNumber: 4, status: "upcoming", motion: "TBA" },
      { roundNumber: 5, status: "upcoming", motion: "TBA" },
      { roundNumber: 6, status: "upcoming", motion: "TBA" },
    ],
    topTeams: [
      { rank: 1, name: "Oxford A", wins: 6, points: 18 },
      { rank: 2, name: "Harvard B", wins: 5, points: 16 },
      { rank: 3, name: "Sydney A", wins: 5, points: 15 },
    ]
  };
  
  const statusColors = {
    active: "bg-tabby-success",
    upcoming: "bg-tabby-accent",
    completed: "bg-tabby-warning",
  };
  
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  
  const loadAiInsights = () => {
    setAiInsightsLoading(true);
    // Simulate AI loading
    setTimeout(() => {
      setAiInsights("Based on the current standings and previous round performances, the most competitive debates are likely to be between Oxford A and Harvard B teams. The motion analysis shows a balanced set of topics with no clear bias towards government or opposition positions. Judge allocations show good distribution with minimal conflicts of interest.");
      setAiInsightsLoading(false);
    }, 2000);
  };
  
  return (
    <MainLayout>
      <PageHeader 
        title={tournament.name}
        description={`${tournament.formatName} format • ${tournament.location}`}
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button className="bg-tabby-secondary hover:bg-tabby-secondary/90">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        }
      />
      
      {/* Status Bar */}
      <div className="flex items-center mb-6 p-3 bg-gray-50 rounded-md border border-gray-100">
        <div className="flex items-center">
          <div className={`tabby-status-circle ${statusColors[tournament.status as keyof typeof statusColors]}`} />
          <span className="text-sm font-medium ml-2 capitalize">{tournament.status}</span>
        </div>
        <div className="ml-6 text-sm text-gray-500 flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-400" />
          Current Round: {tournament.currentRound} of {tournament.roundCount}
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
                <div className="text-gray-500">{tournament.startDate}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">End Date</div>
                <div className="text-gray-500">{tournament.endDate}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Location</div>
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {tournament.location}
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
                <div className="font-medium">{tournament.teamCount}</div>
              </div>
              <div className="text-sm flex justify-between items-center">
                <div>Judges</div>
                <div className="font-medium">{tournament.judgeCount}</div>
              </div>
              <div className="mt-4">
                <Link to={`/tournaments/${id}/teams`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View All Teams
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
              <CardTitle className="text-base">Current Standings</CardTitle>
            </div>
            <div className="mt-4 space-y-2">
              {tournament.topTeams.map((team) => (
                <div key={team.rank} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${team.rank === 1 ? 'bg-yellow-100 text-yellow-700' : team.rank === 2 ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-700'} mr-2`}>
                      {team.rank}
                    </span>
                    <span>{team.name}</span>
                  </div>
                  <div className="text-gray-500">
                    {team.wins} wins | {team.points} pts
                  </div>
                </div>
              ))}
              <div className="mt-4">
                <Link to={`/tournaments/${id}/results`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Full Standings
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournament.rounds.map((round) => (
              <Card 
                key={round.roundNumber}
                className={round.status === "active" ? "border-2 border-tabby-secondary" : ""}
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Round {round.roundNumber}</CardTitle>
                    <div className={`tabby-badge-${round.status === "completed" ? "success" : round.status === "active" ? "primary" : "secondary"} capitalize`}>
                      {round.status}
                    </div>
                  </div>
                  <CardDescription>
                    {round.status === "completed" ? "Completed" : round.status === "active" ? "In progress" : "Not started"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium">Motion</div>
                      <div className="text-gray-600 italic mt-1">{round.motion}</div>
                    </div>
                    {round.status !== "upcoming" && (
                      <div className="pt-2">
                        <Link to={`/tournaments/${id}/rounds`}>
                          <Button variant="outline" size="sm" className="w-full">
                            {round.status === "completed" ? (
                              <>
                                <ClipboardCheck className="h-4 w-4 mr-2" />
                                View Results
                              </>
                            ) : round.status === "active" ? (
                              <>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Manage Round
                              </>
                            ) : null}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center mt-4">
            <Link to={`/tournaments/${id}/rounds`}>
              <Button variant="outline">View All Rounds</Button>
            </Link>
          </div>
        </TabsContent>
        
        {/* Teams Tab */}
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>View and manage teams participating in this tournament</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Team details</h3>
                <p className="text-gray-500 mt-2 mb-6">View detailed team information and manage registrations</p>
                <Link to={`/tournaments/${id}/teams`}>
                  <Button>Go to Teams Page</Button>
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
                <h3 className="text-lg font-medium text-gray-700">Judge details</h3>
                <p className="text-gray-500 mt-2 mb-6">View detailed judge information and manage allocations</p>
                <Button>Manage Judges</Button>
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
                <h3 className="text-lg font-medium text-gray-700">Motion details</h3>
                <p className="text-gray-500 mt-2 mb-6">View and manage debate motions for all rounds</p>
                <Button>Manage Motions</Button>
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
