
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { TournamentCard } from "@/components/cards/TournamentCard";
import { TeamsTabContainer } from "@/components/teams/TeamsTabContainer";
import { RoundsList } from "@/components/rounds/RoundsList";
import { DrawsList } from "@/components/rounds/DrawsList";
import { TournamentDashboard } from "@/components/analytics/TournamentDashboard";
import { PublicAccessPanel } from "@/components/tournament/PublicAccessPanel";
import { CSVUpload } from "@/components/teams/CSVUpload";
import { useTournamentData } from "@/hooks/useTournamentData";
import { useUserRole } from "@/hooks/useUserRole";
import { useTournamentMutations } from "@/hooks/useTournamentMutations";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  Edit, 
  Settings, 
  BarChart3, 
  Share2, 
  Upload,
  Users,
  Target,
  Trophy,
  FileBarChart
} from "lucide-react";

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { canEditTournament } = useUserRole();
  const { tournament, teams, rounds, draws, isLoading, addTeam, refetch } = useTournamentData(id);
  const { addTeam: addTeamMutation } = useTournamentMutations(id, undefined, undefined, undefined);

  const [activeTab, setActiveTab] = useState("overview");

  const handleCSVUpload = async (uploadedTeams: any[]) => {
    try {
      for (const team of uploadedTeams) {
        await addTeamMutation(team);
      }
      refetch();
      toast.success('Teams uploaded successfully!');
    } catch (error) {
      console.error('Error uploading teams:', error);
      toast.error('Failed to upload teams');
    }
  };

  const handleEditRound = (round: any) => {
    // TODO: Implement edit round functionality
    console.log('Edit round:', round);
    toast.info('Edit round functionality coming soon');
  };

  const handleDeleteRound = (roundId: string) => {
    // TODO: Implement delete round functionality
    console.log('Delete round:', roundId);
    toast.info('Delete round functionality coming soon');
  };

  const handleGenerateDraws = () => {
    // TODO: Implement generate draws functionality
    console.log('Generate draws');
    toast.info('Generate draws functionality coming soon');
  };

  const handleRegenerateDraws = (roundNumber: number) => {
    // TODO: Implement regenerate draws functionality
    console.log('Regenerate draws for round:', roundNumber);
    toast.info('Regenerate draws functionality coming soon');
  };

  if (isLoading || !tournament) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tabby-secondary"></div>
        </div>
      </MainLayout>
    );
  }

  const canEdit = canEditTournament(tournament.created_by);

  const tournamentCardData = {
    id: tournament.id,
    name: tournament.name,
    format: tournament.format?.toUpperCase() || "TBD",
    date: tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : "TBD",
    teamCount: teams.length,
    location: tournament.location || "TBD",
    status: (tournament.status as "active" | "upcoming" | "completed") || "upcoming",
  };

  return (
    <MainLayout>
      <PageHeader
        title={tournament.name}
        description={tournament.description || "Tournament management"}
        actions={
          canEdit ? (
            <div className="flex gap-2">
              <Link to={`/tournaments/${id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Tournament
                </Button>
              </Link>
            </div>
          ) : null
        }
      />

      <div className="space-y-6">
        {/* Tournament Overview Card */}
        <TournamentCard {...tournamentCardData} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 max-w-2xl">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="rounds" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Rounds
            </TabsTrigger>
            <TabsTrigger value="draws" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Draws
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="sharing" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Public Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {canEdit && (
                <CSVUpload onTeamsUploaded={handleCSVUpload} />
              )}
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Teams Registered</p>
                    <p className="text-2xl font-bold text-blue-900">{teams.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Rounds Created</p>
                    <p className="text-2xl font-bold text-green-900">{rounds.length}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600">Draws Generated</p>
                    <p className="text-2xl font-bold text-purple-900">{draws.length}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-600">Status</p>
                    <p className="text-lg font-bold text-orange-900 capitalize">{tournament.status || 'Upcoming'}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="teams">
            <TeamsTabContainer tournamentId={id!} />
          </TabsContent>

          <TabsContent value="rounds">
            <RoundsList 
              rounds={rounds}
              onEdit={handleEditRound}
              onDelete={handleDeleteRound}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="draws">
            <DrawsList 
              draws={draws}
              onGenerateDraws={handleGenerateDraws}
              onRegenerateDraws={handleRegenerateDraws}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <TournamentDashboard tournamentId={id!} />
          </TabsContent>

          <TabsContent value="sharing">
            {canEdit ? (
              <PublicAccessPanel tournamentId={id!} />
            ) : (
              <div className="text-center py-12">
                <Share2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Access Restricted</h3>
                <p className="text-gray-500 mt-2">Only tournament organizers can manage public access settings</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default TournamentDetail;
