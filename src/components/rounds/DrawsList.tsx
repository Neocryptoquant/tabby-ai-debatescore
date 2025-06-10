
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Shuffle, Play, CheckCircle, Clock, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState } from "react";
import { Team, Draw, Round } from '@/types/tournament';
import { useDrawGenerator } from '@/hooks/useDrawGenerator';
import { DraggableDrawsList } from './DraggableDrawsList';
import { supabase } from '@/integrations/supabase/client';

interface DrawsListProps {
  tournamentId: string;
  roundId?: string;
  teams: Team[];
  rooms: string[];
  draws: Draw[];
  rounds: Round[];
  onStartRound: (roundId: string) => Promise<void>;
  onCompleteRound: (roundId: string) => Promise<void>;
  tournamentName: string;
  roundName?: string;
  publicMode?: boolean;
  onGenerateDraws?: (roundId: string) => Promise<void>;
}

export function DrawsList(props: DrawsListProps) {
  const [selectedRoundId, setSelectedRoundId] = useState(props.roundId || props.rounds[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleUpdateDraws = async (updatedDraws: Draw[]) => {
    try {
      // Update draws in the database
      const { error } = await supabase
        .from('draws')
        .upsert(
          updatedDraws.map((draw, index) => ({
            id: draw.id,
            round_id: draw.round_id,
            tournament_id: draw.tournament_id,
            room: draw.room,
            gov_team_id: draw.gov_team_id,
            opp_team_id: draw.opp_team_id,
            status: draw.status,
            position: index // Add position for ordering
          }))
        );

      if (error) throw error;
      toast.success('Draws updated successfully');
    } catch (error) {
      console.error('Error updating draws:', error);
      toast.error('Failed to update draws');
      throw error;
    }
  };

  const handleGenerateDraws = async () => {
    if (!selectedRoundId) {
      toast.error('Please select a round first');
      return;
    }

    if (props.teams.length < 2) {
      toast.error('Need at least 2 teams to generate draws');
      return;
    }

    setIsGenerating(true);
    try {
      if (props.onGenerateDraws) {
        await props.onGenerateDraws(selectedRoundId);
      }
      toast.success('Draws generated successfully!');
    } catch (error) {
      console.error('Error generating draws:', error);
      toast.error('Failed to generate draws');
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter draws for the selected round
  const roundDraws = props.draws.filter(draw => draw.round_id === selectedRoundId);
  const selectedRound = props.rounds.find(r => r.id === selectedRoundId);

  // If no rounds exist, show a message to create rounds first
  if (props.rounds.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Rounds Available</h3>
          <p className="text-gray-500 mb-4 text-center">You need to create rounds before generating draws</p>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create Round
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Round Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Generate Draws
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Round:</label>
              <select 
                value={selectedRoundId} 
                onChange={(e) => setSelectedRoundId(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {props.rounds.map((round) => (
                  <option key={round.id} value={round.id}>
                    Round {round.round_number} - {round.motion}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Teams: {props.teams.length} | 
                Potential Rooms: {Math.floor(props.teams.length / 2)}
              </div>
              <Button 
                onClick={handleGenerateDraws}
                disabled={isGenerating || !selectedRoundId}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner className="w-4 h-4" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Shuffle className="w-4 h-4" />
                    Generate Draws
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Draws Display */}
      {roundDraws.length > 0 ? (
        <DraggableDrawsList
          tournamentId={props.tournamentId}
          roundId={selectedRoundId}
          teams={props.teams}
          rooms={props.rooms}
          draws={roundDraws}
          onStartRound={props.onStartRound}
          onCompleteRound={props.onCompleteRound}
          onUpdateDraws={handleUpdateDraws}
          tournamentName={props.tournamentName}
          roundName={selectedRound ? `Round ${selectedRound.round_number}` : props.roundName || 'Current Round'}
          publicMode={props.publicMode}
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Draws Generated</h3>
            <p className="text-gray-500 mb-4 text-center">
              {selectedRound ? `Generate draws for Round ${selectedRound.round_number}` : 'Select a round and generate draws'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
