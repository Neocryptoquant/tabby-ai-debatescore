
import { useState, useEffect } from "react";
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
import { Calendar, Plus, BarChart3, Users, Shuffle } from "lucide-react";
import { toast } from "sonner";

interface Round {
  id: string;
  round_number: number;
  motion: string;
  info_slide?: string;
  start_time?: string;
  status: 'upcoming' | 'active' | 'completed';
}

interface Team {
  id: string;
  name: string;
  institution: string;
}

interface Draw {
  id: string;
  round_number: number;
  room: string;
  gov_team: Team;
  opp_team: Team;
  judge?: string;
  status: 'pending' | 'in_progress' | 'completed';
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
  const [draws, setDraws] = useState<Draw[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock teams data
  const mockTeams: Team[] = [
    { id: '1', name: 'Oxford A', institution: 'Oxford University' },
    { id: '2', name: 'Cambridge A', institution: 'Cambridge University' },
    { id: '3', name: 'LSE Debaters', institution: 'London School of Economics' },
    { id: '4', name: 'Imperial Knights', institution: 'Imperial College London' },
    { id: '5', name: 'UCL Speakers', institution: 'University College London' },
    { id: '6', name: 'Kings Debate', institution: 'Kings College London' },
  ];

  // Mock data for demonstration
  useEffect(() => {
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
        },
        {
          id: '2',
          round_number: 2,
          motion: 'This house would ban all forms of targeted political advertising',
          start_time: '2025-05-26T11:00:00',
          status: 'upcoming'
        }
      ]);

      // Mock draws data
      setDraws([
        {
          id: '1',
          round_number: 1,
          room: 'Room A',
          gov_team: mockTeams[0],
          opp_team: mockTeams[1],
          judge: 'Prof. Smith',
          status: 'pending'
        },
        {
          id: '2',
          round_number: 1,
          room: 'Room B',
          gov_team: mockTeams[2],
          opp_team: mockTeams[3],
          judge: 'Dr. Johnson',
          status: 'pending'
        },
        {
          id: '3',
          round_number: 1,
          room: 'Room C',
          gov_team: mockTeams[4],
          opp_team: mockTeams[5],
          status: 'pending'
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const handleAddRound = async (data: RoundFormData) => {
    setIsSaving(true);
    try {
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRounds(prev => prev.filter(round => round.id !== roundId));
      setDraws(prev => prev.filter(draw => draw.round_number !== parseInt(roundId)));
      toast.success("Round deleted successfully!");
    } catch (error) {
      console.error('Error deleting round:', error);
      toast.error("Failed to delete round");
    }
  };

  const handleGenerateDraws = () => {
    const availableRooms = ['Room A', 'Room B', 'Room C', 'Room D', 'Room E'];
    const judges = ['Prof. Smith', 'Dr. Johnson', 'Ms. Williams', 'Prof. Brown', 'Dr. Davis'];
    
    const newDraws: Draw[] = [];
    
    rounds.forEach(round => {
      // Shuffle teams for random pairing
      const shuffledTeams = [...mockTeams].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < shuffledTeams.length; i += 2) {
        if (i + 1 < shuffledTeams.length) {
          newDraws.push({
            id: `${round.round_number}-${i/2 + 1}`,
            round_number: round.round_number,
            room: availableRooms[i/2] || `Room ${i/2 + 1}`,
            gov_team: shuffledTeams[i],
            opp_team: shuffledTeams[i + 1],
            judge: judges[i/2] || undefined,
            status: 'pending'
          });
        }
      }
    });
    
    setDraws(newDraws);
    toast.success("Draws generated successfully!");
  };

  const handleRegenerateDraws = (roundNumber: number) => {
    const availableRooms = ['Room A', 'Room B', 'Room C', 'Room D', 'Room E'];
    const judges = ['Prof. Smith', 'Dr. Johnson', 'Ms. Williams', 'Prof. Brown', 'Dr. Davis'];
    
    // Remove existing draws for this round
    const filteredDraws = draws.filter(draw => draw.round_number !== roundNumber);
    
    // Generate new draws for this round
    const shuffledTeams = [...mockTeams].sort(() => Math.random() - 0.5);
    const newRoundDraws: Draw[] = [];
    
    for (let i = 0; i < shuffledTeams.length; i += 2) {
      if (i + 1 < shuffledTeams.length) {
        newRoundDraws.push({
          id: `${roundNumber}-${i/2 + 1}-${Date.now()}`,
          round_number: roundNumber,
          room: availableRooms[i/2] || `Room ${i/2 + 1}`,
          gov_team: shuffledTeams[i],
          opp_team: shuffledTeams[i + 1],
          judge: judges[i/2] || undefined,
          status: 'pending'
        });
      }
    }
    
    setDraws([...filteredDraws, ...newRoundDraws]);
    toast.success(`Round ${roundNumber} draws regenerated!`);
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
            isLoading={isSaving}
          />
        </TabsContent>

        <TabsContent value="draws" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                Tournament Draws
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DrawsList
                draws={draws}
                onGenerateDraws={handleGenerateDraws}
                onRegenerateDraws={handleRegenerateDraws}
                isLoading={isLoading}
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
