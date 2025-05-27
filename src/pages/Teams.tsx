import { useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { TeamForm } from "@/components/teams/TeamForm";
import { TeamsList } from "@/components/teams/TeamsList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Upload, BarChart3 } from "lucide-react";
import { useTournamentData } from "@/hooks/useTournamentData";
import { toast } from "sonner";

interface TeamFormData {
  name: string;
  institution: string;
  speaker1_name: string;
  speaker2_name: string;
  speaker3_name?: string;
  speaker4_name?: string;
}

/**
 * Teams management page for tournament administration
 * Handles team registration, viewing, and statistics
 */
const Teams = () => {
  const { id } = useParams<{ id: string }>();
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    teams,
    isLoading,
    addTeam,
    deleteTeam
  } = useTournamentData(id);

  /**
   * Handles adding a new team with proper error handling and user feedback
   */
  const handleAddTeam = async (data: TeamFormData) => {
    setIsSaving(true);
    try {
      await addTeam({
        name: data.name,
        institution: data.institution,
        speaker_1: data.speaker1_name,
        speaker_2: data.speaker2_name
      });
    } catch (error) {
      // Error already handled in the hook with enhanced feedback
      console.error('Failed to add team:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTeam = (team: any) => {
    toast.info("📝 Edit functionality coming soon!", {
      description: "Team editing will be available in the next update"
    });
    console.log('Edit team:', team);
  };

  const handleDeleteTeam = async (teamId: string) => {
    await deleteTeam(teamId);
  };

  const handleBulkImport = () => {
    toast.info("📁 Bulk import feature coming soon!", {
      description: "CSV import will be available in the next update"
    });
  };

  const generateTeamStats = () => {
    toast.info("📊 Team statistics feature coming soon!", {
      description: "Advanced analytics will be available soon"
    });
  };

  // Transform teams data to match the TeamsList component interface
  const transformedTeams = teams.map(team => ({
    id: team.id,
    name: team.name,
    institution: team.institution || '',
    speaker1_name: team.speaker_1 || '',
    speaker2_name: team.speaker_2 || '',
    speaker3_name: '',
    speaker4_name: ''
  }));

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

        <TabsContent value="manage" className="space-y-6">
          <TeamsList
            teams={transformedTeams}
            onEdit={handleEditTeam}
            onDelete={handleDeleteTeam}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <TeamForm
            onSave={handleAddTeam}
            isLoading={isSaving}
          />
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Import Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Import Teams from CSV</h3>
                <p className="text-gray-500 mt-2 mb-4">Upload a CSV file to register multiple teams at once</p>
                <Button onClick={handleBulkImport} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-tabby-secondary">{teams.length}</div>
                    <div className="text-sm text-gray-500">Total Teams</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-tabby-secondary">{teams.length * 2}</div>
                    <div className="text-sm text-gray-500">Total Speakers</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-tabby-secondary">
                      {new Set(teams.map(t => t.institution)).size}
                    </div>
                    <div className="text-sm text-gray-500">Institutions</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Detailed Analytics</h3>
                <p className="text-gray-500 mt-2">Advanced team analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AIAssistant />
    </MainLayout>
  );
};

export default Teams;
