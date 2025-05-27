
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { useTournamentData } from "@/hooks/useTournamentData";
import { TeamsTab } from "@/components/teams/TeamsTab";
import { useTeamsActions } from "@/components/teams/TeamsActions";

/**
 * Teams management page for tournament administration
 * Handles team registration, viewing, and statistics with proper loading states
 * Refactored into smaller components for better maintainability
 */
const Teams = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
    teams,
    isLoading,
    addTeam,
    deleteTeam
  } = useTournamentData(id);

  const {
    isSaving,
    handleAddTeam,
    handleEditTeam,
    handleDeleteTeam,
    handleBulkImport,
    generateTeamStats,
    transformedTeams
  } = useTeamsActions(teams, addTeam, deleteTeam);

  return (
    <MainLayout>
      <PageHeader 
        title="Tournament Teams"
        description="Manage team registrations and participant information"
        actions={
          <Button 
            onClick={generateTeamStats}
            variant="outline"
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Team Statistics
          </Button>
        }
      />
      
      <TeamsTab
        transformedTeams={transformedTeams}
        isLoading={isLoading}
        isSaving={isSaving}
        handleAddTeam={handleAddTeam}
        handleEditTeam={handleEditTeam}
        handleDeleteTeam={handleDeleteTeam}
        handleBulkImport={handleBulkImport}
        generateTeamStats={generateTeamStats}
        teams={teams}
      />
      
      <AIAssistant />
    </MainLayout>
  );
};

export default Teams;
