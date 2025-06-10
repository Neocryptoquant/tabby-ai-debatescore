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
  Gavel,
  Plus,
  RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tournament, Team, Round, Draw, Judge, ExperienceLevel } from "@/types/tournament";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useDrawGenerator } from "@/hooks/useDrawGenerator";
import { TeamsList } from "@/components/teams/TeamsList";

interface TournamentCardData {
  id: string;
  name: string;
  format: string;
  date: string;
  teamCount: number;
  location: string;
  status: 'active' | 'upcoming' | 'completed';
}

interface JudgeFormData {
  name: string;
  institution?: string;
  experience_level: ExperienceLevel;
}

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
    updateJudge,
    deleteJudge,
    deleteTeam,
    deleteRound,
    generateDrawsWithHistory,
    generationHistory,
    isGenerating,
    updateRoundPrivacy,
    refetch 
  } = useTournamentData(id);

  const [activeTab, setActiveTab] = useState("overview");
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [editJudge, setEditJudge] = useState<Judge | null>(null);
  const [isEditJudgeModalOpen, setIsEditJudgeModalOpen] = useState(false);
  const [isGeneratingDraws, setIsGeneratingDraws] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [isAddJudgeOpen, setIsAddJudgeOpen] = useState(false);
  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);

  const handleCSVUpload = async (uploadedTeams: Omit<Team, 'id' | 'tournament_id' | 'created_at' | 'updated_at'>[]) => {
    if (!uploadedTeams || uploadedTeams.length === 0) {
      toast.error('No teams to upload');
      return;
    }

    try {
      toast.loading('Uploading teams...');
      for (const team of uploadedTeams) {
        await addTeam({
          name: team.name,
          institution: team.institution || '',
          speaker_1: team.speaker_1 || '',
          speaker_2: team.speaker_2 || '',
          experience_level: team.experience_level || 'novice'
        });
      }
      toast.dismiss();
      toast.success(`Successfully uploaded ${uploadedTeams.length} teams!`);
      setShowCSVUpload(false);
      refetch();
    } catch (error) {
      toast.dismiss();
      console.error('Error uploading teams:', error);
      toast.error('Failed to upload teams');
    }
  };

  const handleAddRound = async (roundData: Omit<Round, 'id' | 'tournament_id' | 'created_at' | 'updated_at'>) => {
    try {
      toast.loading('Creating round...');
      await addRound({
        round_number: roundData.round_number,
        motion: roundData.motion,
        info_slide: roundData.info_slide || '',
        start_time: roundData.start_time || null,
        status: 'upcoming'
      });
      toast.dismiss();
      toast.success('Round created successfully!');
    } catch (error) {
      toast.dismiss();
      console.error('Error adding round:', error);
      toast.error('Failed to create round');
    }
  };

  const handleAddJudge = async (judgeData: JudgeFormData) => {
    try {
      toast.loading('Adding judge...');
      await addJudge({
        name: judgeData.name,
        institution: judgeData.institution || '',
        experience_level: judgeData.experience_level || 'novice'
      });
      toast.dismiss();
      toast.success('Judge added successfully!');
    } catch (error) {
      toast.dismiss();
      console.error('Error adding judge:', error);
      toast.error('Failed to add judge');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId);
      toast.success('Team deleted successfully');
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    }
  };

  const handleDeleteJudge = async (judgeId: string) => {
    try {
      await deleteJudge(judgeId);
      toast.success('Judge deleted successfully');
    } catch (error) {
      console.error('Error deleting judge:', error);
      toast.error('Failed to delete judge');
    }
  };

  const handleDeleteRound = async (roundId: string) => {
    try {
      await deleteRound(roundId);
      toast.success('Round deleted successfully');
    } catch (error) {
      console.error('Error deleting round:', error);
      toast.error('Failed to delete round');
    }
  };

  const handleGenerateDraws = async (roundId: string) => {
    console.log('Current teams:', teams);
    console.log('Number of teams:', teams?.length);

    if (!teams || !Array.isArray(teams)) {
      console.error('Teams is not an array:', teams);
      toast.error('Invalid teams data');
      return;
    }

    if (teams.length < 2) {
      console.error('Not enough teams:', teams.length);
      toast.error('Need at least 2 teams to generate draws');
      return;
    }

    try {
      setIsGeneratingDraws(true);
      toast.loading('Generating draws...');

      // Get the round data
      const round = rounds.find(r => r.id === roundId);
      if (!round) {
        throw new Error('Round not found');
      }

      // Generate rooms based on number of teams
      const numRooms = Math.ceil(teams.length / 2);
      const rooms = Array.from({ length: numRooms }, (_, i) => `Room ${i + 1}`);

      // Use the draw generator hook with the correct arguments
      const { generateDraws } = useDrawGenerator({
        tournamentId: id!,
        roundId,
        teams,
        rooms,
      });
      await generateDraws();
      toast.dismiss();
      toast.success('Draws generated successfully!');
      refetch();
    } catch (error) {
      toast.dismiss();
      console.error('Error generating draws:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate draws');
    } finally {
      setIsGeneratingDraws(false);
    }
  };

  const handleGenerateAllDraws = async () => {
    if (rounds.length === 0) {
      toast.error('No rounds available to generate draws');
      return;
    }
    
    if (teams.length < 2) {
      toast.error('Need at least 2 teams to generate draws');
      return;
    }

    if (judges.length === 0) {
      toast.error('Need at least 1 judge to generate draws');
      return;
    }
    
    setIsGeneratingDraws(true);
    try {
      // Generate draws for the first available round
      const firstRound = rounds[0];
      await handleGenerateDraws(firstRound.id);
    } catch (error) {
      console.error('Error generating all draws:', error);
      toast.error('Failed to generate draws');
    } finally {
      setIsGeneratingDraws(false);
    }
  };

  const handleEditTournament = () => {
    if (id) {
      navigate(`/tournaments/${id}/edit`);
    }
  };

  const handleQuickActionTeams = () => {
    setActiveTab("teams");
  };

  const handleQuickActionJudges = () => {
    setActiveTab("judges");
  };

  const handleQuickActionRounds = () => {
    setActiveTab("rounds");
  };

  const handleQuickActionUpload = () => {
    setShowCSVUpload(!showCSVUpload);
  };

  const handleEditJudge = (judge: Judge) => {
    setEditJudge(judge);
    setIsEditJudgeModalOpen(true);
  };

  const handleUpdateJudge = async (data: JudgeFormData) => {
    if (!editJudge) return;

    try {
      await updateJudge(editJudge.id, {
        name: data.name,
        institution: data.institution,
        experience_level: data.experience_level
      });
      setIsEditJudgeModalOpen(false);
      setEditJudge(null);
      toast.success('Judge updated successfully!');
    } catch (error) {
      console.error('Error updating judge:', error);
      toast.error('Failed to update judge');
    }
  };

  const handleStartRound = async (roundId: string) => {
    // TODO: Implement start round functionality
    console.log('Starting round:', roundId);
  };

  const handleCompleteRound = async (roundId: string) => {
    // TODO: Implement complete round functionality
    console.log('Completing round:', roundId);
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

  const tournamentCardData: TournamentCardData = {
    id: tournament.id,
    name: tournament.name,
    format: tournament.format?.toUpperCase() || "TBD",
    date: tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : "TBD",
    teamCount: teams.length,
    location: tournament.location || "TBD",
    status: (tournament.status as 'active' | 'upcoming' | 'completed') || "upcoming",
  };

  const quickStats: TournamentCardData[] = [
    {
      title: "Teams",
      value: teams?.length || 0,
      description: "Total registered teams"
    },
    {
      title: "Judges",
      value: judges?.length || 0,
      description: "Total registered judges"
    },
    {
      title: "Rounds",
      value: rounds?.length || 0,
      description: "Total rounds"
    }
  ];

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
                  {quickStats.map((stat, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-blue-900">{stat.value}</p>
                      {stat.description && (
                        <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {canEdit && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={handleQuickActionTeams}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Teams
                    </Button>
                    
                    <Button
                      onClick={handleQuickActionJudges}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Gavel className="h-4 w-4 mr-2" />
                      Add Judges
                    </Button>
                    
                    <Button
                      onClick={handleQuickActionRounds}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Rounds
                    </Button>
                    
                    <Button
                      onClick={handleQuickActionUpload}
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
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsAddTeamOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Team
              </Button>
            </div>
            <TeamsList
              teams={teams}
              onDelete={deleteTeam}
            />
          </TabsContent>

          <TabsContent value="judges" className="space-y-6">
            {canEdit && (
              <JudgeForm onSave={handleAddJudge} isLoading={isLoading} />
            )}
            <JudgesList
              judges={judges}
              onDelete={handleDeleteJudge}
              onEdit={handleEditJudge}
              isLoading={isLoading}
            />
            <Dialog open={isEditJudgeModalOpen} onOpenChange={setIsEditJudgeModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Judge</DialogTitle>
                </DialogHeader>
                {editJudge && (
                  <JudgeForm
                    onSave={handleUpdateJudge}
                    isLoading={isLoading}
                    defaultValues={{
                      name: editJudge.name,
                      institution: editJudge.institution,
                      experience_level: editJudge.experience_level
                    }}
                    isEditMode
                  />
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="rounds" className="space-y-6">
            {canEdit && (
              <EnhancedRoundForm 
                onSave={handleAddRound} 
                isLoading={isLoading}
                existingRounds={rounds.map(r => r.round_number)}
              />
            )}
            <RoundsList 
              rounds={rounds}
              onEdit={(round) => console.log('Edit round:', round)}
              onDelete={handleDeleteRound}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="draws">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <DrawsList
                tournamentId={id!}
                roundId={rounds[0]?.id || ''}
                teams={teams}
                rooms={['Room 1', 'Room 2', 'Room 3', 'Room 4']} // TODO: Make this dynamic
                draws={draws}
                onStartRound={handleStartRound}
                onCompleteRound={handleCompleteRound}
              />
            )}
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
