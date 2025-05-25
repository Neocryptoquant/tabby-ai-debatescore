
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { TeamForm } from "@/components/teams/TeamForm";
import { TeamsList } from "@/components/teams/TeamsList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, Download, Upload } from "lucide-react";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  institution: string;
  speaker1_name: string;
  speaker2_name: string;
  speaker3_name?: string;
  speaker4_name?: string;
}

interface TeamFormData {
  name: string;
  institution: string;
  speaker1_name: string;
  speaker2_name: string;
  speaker3_name?: string;
  speaker4_name?: string;
}

const TournamentTeams = () => {
  const { id } = useParams<{ id: string }>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch teams for tournament
  useEffect(() => {
    if (id) {
      fetchTeams();
    }
  }, [id]);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching teams for tournament:', id);
      
      // Mock data for demonstration - in real app, this would come from Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTeams([
        {
          id: '1',
          name: 'FUTA A',
          institution: 'FUTA',
          speaker1_name: 'George',
          speaker2_name: 'Emmanuel',
          speaker3_name: '',
          speaker4_name: ''
        }
      ]);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error("Failed to load teams");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTeam = async (data: TeamFormData) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTeam: Team = {
        id: String(Date.now()),
        ...data
      };
      
      setTeams(prev => [...prev, newTeam]);
      toast.success("Team added successfully!");
    } catch (error) {
      console.error('Error adding team:', error);
      toast.error("Failed to add team");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTeam = (team: Team) => {
    toast.info("Edit functionality coming soon!");
    console.log('Edit team:', team);
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTeams(prev => prev.filter(team => team.id !== teamId));
      toast.success("Team deleted successfully!");
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error("Failed to delete team");
    }
  };

  const handleImportTeams = () => {
    toast.info("Import functionality coming soon!");
  };

  const handleExportTeams = () => {
    toast.info("Export functionality coming soon!");
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Team Management"
        description="Register and manage teams for this tournament"
        actions={
          <div className="flex gap-2">
            <Button 
              onClick={handleImportTeams}
              variant="outline"
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button 
              onClick={handleExportTeams}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />
      
      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="manage" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Teams</span>
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Team</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-1.5">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <TeamsList
            teams={teams}
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
              <CardTitle>Import Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Bulk Import</h3>
                <p className="text-gray-500 mt-2">Import teams from CSV or Excel file</p>
                <Button className="mt-4" onClick={handleImportTeams}>
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AIAssistant />
    </MainLayout>
  );
};

export default TournamentTeams;
