import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { JudgeForm } from "@/components/judges/JudgeForm";
import { JudgesList } from "@/components/judges/JudgesList";
import { EnhancedRoundForm } from "@/components/rounds/EnhancedRoundForm";
import { useTournamentData } from "@/hooks/useTournamentData";
import { useUserRole } from "@/hooks/useUserRole";
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
  UserPlus,
  PlusCircle,
  Gavel
} from "lucide-react";

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEditTournament } = useUserRole();
  const { 
    tournament, 
    teams, 
    rounds, 
    draws, 
    judges,
    isLoading, 
    addTeam, 
    addRound,
    addJudge,
    deleteJudge,
    generateDrawsWithHistory,
    generationHistory,
    isGenerating,
    updateRoundPrivacy,
    refetch 
  } = useTournamentData(id);

  const [activeTab, setActiveTab] = useState("overview");
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  const handleCSVUpload = async (uploadedTeams: any[]) => {
    try {
      for (const team of uploadedTeams) {
        await addTeam(team);
      }
      refetch();
      toast.success('Teams uploaded successfully!');
      setShowCSVUpload(false);
    } catch (error) {
      console.error('Error uploading teams:', error);
      toast.error('Failed to upload teams');
    }
  };

  const handleAddRound = async (roundData: any) => {
    try {
      await addRound(roundData);
      toast.success('Round created successfully!');
    } catch (error) {
      console.error('Error adding round:', error);
      toast.error('Failed to create round');
    }
  };

  const handleAddJudge = async (judgeData: any) => {
    try {
      await addJudge(judgeData);
      toast.success('Judge added successfully!');
    } catch (error) {
      console.error('Error adding judge:', error);
      toast.error('Failed to add judge');
    }
  };

  const handleGenerateDraws = async (roundId: string) => {
    if (teams.length < 2) {
      toast.error('Need at least 2 teams to generate draws');
      return;
    }
    await generateDrawsWithHistory(roundId, 'power_pairing');
  };

  const handleEditTournament = () => {
    if (id) {
      navigate(`/tournaments/${id}/edit`);
    }
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
              <Button onClick={handleEditTournament} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Tournament
              </Button>
            </div>
          ) : null
        }
      />

      <div className="space-y-6">
        <TournamentCard {...tournamentCardData} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-7 max-w-4xl">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="judges" className="flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Judges
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
                    <p className="text-sm text-orange-600">Judges Added</p>
                    <p className="text-2xl font-bold text-orange-900">{judges.length}</p>
                  </div>
                </div>
              </div>

              {canEdit && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setActiveTab("teams")}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Teams
                    </Button>
                    
                    <Button
                      onClick={() => setActiveTab("judges")}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Gavel className="h-4 w-4 mr-2" />
                      Add Judges
                    </Button>
                    
                    <Button
                      onClick={() => setActiveTab("rounds")}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Rounds
                    </Button>
                    
                    <Button
                      onClick={() => setShowCSVUpload(!showCSVUpload)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Upload Teams (Optional)
                    </Button>
                  </div>
                  
                  {showCSVUpload && (
                    <div className="mt-4">
                      <CSVUpload onTeamsUploaded={handleCSVUpload} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="teams">
            <TeamsTabContainer tournamentId={id!} />
          </TabsContent>

          <TabsContent value="judges" className="space-y-6">
            {canEdit && (
              <JudgeForm onSave={handleAddJudge} isLoading={isLoading} />
            )}
            <JudgesList
              judges={judges}
              onDelete={deleteJudge}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="rounds" className="space-y-6">
            {canEdit && (
              <EnhancedRoundForm onSave={handleAddRound} isLoading={isLoading} />
            )}
            <RoundsList 
              rounds={rounds}
              onEdit={(round) => toast.info('Edit round functionality coming soon')}
              onDelete={(roundId) => toast.info('Delete round functionality coming soon')}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="draws">
            <DrawsList 
              draws={draws}
              onGenerateDraws={() => toast.info('Select a round to generate draws')}
              onRegenerateDraws={(roundNumber) => toast.info(`Regenerate draws for round ${roundNumber} coming soon`)}
              isLoading={isLoading || isGenerating}
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
