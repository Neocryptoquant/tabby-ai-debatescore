
import { TeamsTabsContent } from "./TeamsTabsContent";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Upload, BarChart3 } from "lucide-react";

interface TeamsTabProps {
  transformedTeams: any[];
  isLoading: boolean;
  isSaving: boolean;
  handleAddTeam: (data: any) => Promise<void>;
  handleEditTeam: (team: any) => void;
  handleDeleteTeam: (teamId: string) => Promise<void>;
  handleBulkImport: () => void;
  generateTeamStats: () => void;
  teams: any[];
}

/**
 * Teams tab navigation and content management component
 * Handles the main tabbed interface for team operations
 */
export const TeamsTab = ({
  transformedTeams,
  isLoading,
  isSaving,
  handleAddTeam,
  handleEditTeam,
  handleDeleteTeam,
  handleBulkImport,
  generateTeamStats,
  teams
}: TeamsTabProps) => {
  return (
    <Tabs defaultValue="manage" className="space-y-6">
      <TabsList className="grid grid-cols-4 max-w-lg">
        <TabsTrigger value="manage" className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Teams</span>
        </TabsTrigger>
        <TabsTrigger value="add" className="flex items-center gap-1.5">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Team</span>
        </TabsTrigger>
        <TabsTrigger value="import" className="flex items-center gap-1.5">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Import</span>
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Statistics</span>
        </TabsTrigger>
      </TabsList>

      <TeamsTabsContent
        transformedTeams={transformedTeams}
        isLoading={isLoading}
        isSaving={isSaving}
        handleAddTeam={handleAddTeam}
        handleEditTeam={handleEditTeam}
        handleDeleteTeam={handleDeleteTeam}
        handleBulkImport={handleBulkImport}
        teams={teams}
      />
    </Tabs>
  );
};
