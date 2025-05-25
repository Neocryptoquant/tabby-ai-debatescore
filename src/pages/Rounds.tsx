
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { RoundForm } from "@/components/rounds/RoundForm";
import { RoundsList } from "@/components/rounds/RoundsList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface Round {
  id: string;
  round_number: number;
  motion: string;
  info_slide?: string;
  start_time?: string;
  status: 'upcoming' | 'active' | 'completed';
}

interface RoundFormData {
  round_number: number;
  motion: string;
  info_slide: string;
  start_time: string;
}

const Rounds = () => {
  const { id } = useParams<{ id: string }>();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock data for demonstration - in real app, this would come from Supabase
  useEffect(() => {
    // Simulate loading rounds
    setIsLoading(true);
    setTimeout(() => {
      setRounds([
        {
          id: '1',
          round_number: 1,
          motion: 'This house believes that social media platforms should be held legally responsible for the mental health impacts of their algorithms',
          info_slide: 'Consider the role of algorithmic content curation in user engagement and psychological well-being.',
          start_time: '2025-05-26T09:00:00',
          status: 'upcoming'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const handleAddRound = async (data: RoundFormData) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRound: Round = {
        id: String(Date.now()),
        round_number: data.round_number,
        motion: data.motion,
        info_slide: data.info_slide || undefined,
        start_time: data.start_time || undefined,
        status: 'upcoming'
      };
      
      setRounds(prev => [...prev, newRound].sort((a, b) => a.round_number - b.round_number));
      toast.success("Round added successfully!");
    } catch (error) {
      console.error('Error adding round:', error);
      toast.error("Failed to add round");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditRound = (round: Round) => {
    toast.info("Edit functionality coming soon!");
    console.log('Edit round:', round);
  };

  const handleDeleteRound = async (roundId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRounds(prev => prev.filter(round => round.id !== roundId));
      toast.success("Round deleted successfully!");
    } catch (error) {
      console.error('Error deleting round:', error);
      toast.error("Failed to delete round");
    }
  };

  const generateRounds = () => {
    toast.info("Auto-generate rounds feature coming soon!");
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Tournament Rounds"
        description="Manage rounds, motions, and schedule for this tournament"
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
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="manage" className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Manage</span>
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Round</span>
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
            isLoading={isSaving}
          />
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
