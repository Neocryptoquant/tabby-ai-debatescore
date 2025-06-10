
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { RoundForm } from "@/components/rounds/RoundForm";
import { RoundsList } from "@/components/rounds/RoundsList";
import { DrawsList } from "@/components/rounds/DrawsList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, BarChart3, Users } from "lucide-react";
import { useTournamentData } from "@/hooks/useTournamentData";
import { toast } from "sonner";

interface RoundFormData {
  round_number: number;
  motion: string;
  info_slide: string;
  start_time: string;
}

const Rounds = () => {
  const { id } = useParams<{ id: string }>();
  const {
    tournament,
    rounds,
    teams,
    draws,
    judges,
    isLoading,
    addRound,
    generateDrawsWithHistory,
    deleteRound
  } = useTournamentData(id);

  const handleAddRound = async (data: RoundFormData) => {
    try {
      await addRound({
        round_number: data.round_number,
        motion: data.motion,
        info_slide: data.info_slide || undefined,
        start_time: data.start_time || undefined,
        status: 'upcoming'
      });
    } catch (error) {
      // Error already handled in the hook
    }
  };

  const handleEditRound = (round: any) => {
    toast.info("Edit functionality coming soon!");
    console.log('Edit round:', round);
  };

  const handleDeleteRound = async (roundId: string) => {
    await deleteRound(roundId);
  };

  const handleGenerateDraws = async (roundId: string) => {
    try {
      const rooms = Array.from({ length: Math.ceil(teams.length / 4) }, (_, i) => `Room ${i + 1}`);
      await generateDrawsWithHistory(roundId, teams, rooms);
    } catch (error) {
      console.error('Error generating draws:', error);
    }
  };

  const handleStartRound = async (roundId: string) => {
    console.log('Starting round:', roundId);
    toast.info("Start round functionality coming soon!");
  };

  const handleCompleteRound = async (roundId: string) => {
    console.log('Completing round:', roundId);
    toast.info("Complete round functionality coming soon!");
  };

  const generateRounds = () => {
    toast.info("Auto-generate rounds feature coming soon!");
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Tournament Rounds"
        description="Manage rounds, motions, draws and schedule for this tournament"
        actions={
          <Button 
            onClick={generateRounds}
            variant="outline"
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Auto-Generate Rounds
          </Button>
        }
      />
      
      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid grid-cols-4 max-w-lg">
          <TabsTrigger value="manage" className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Manage</span>
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Round</span>
          </TabsTrigger>
          <TabsTrigger value="draws" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Draws</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Rounds</CardTitle>
            </CardHeader>
            <CardContent>
              <RoundsList
                rounds={rounds}
                onEdit={handleEditRound}
                onDelete={handleDeleteRound}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <RoundForm
            tournamentId={id!}
            onSave={handleAddRound}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="draws" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tournament Draws
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DrawsList
                tournamentId={id!}
                roundId={rounds[0]?.id}
                teams={teams}
                judges={judges}
                rooms={['Room 1', 'Room 2', 'Room 3', 'Room 4']}
                draws={draws}
                rounds={rounds}
                onStartRound={handleStartRound}
                onCompleteRound={handleCompleteRound}
                onGenerateDraws={handleGenerateDraws}
                tournamentName={tournament?.name || 'Tournament'}
                roundName={rounds[0] ? `Round ${rounds[0].round_number}` : undefined}
                publicMode={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Round Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Schedule Management</h3>
                <p className="text-gray-500 mt-2">Advanced scheduling features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AIAssistant />
    </MainLayout>
  );
};

export default Rounds;
