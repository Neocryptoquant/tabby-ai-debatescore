import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Trophy, Shuffle, Play, CheckCircle, Clock, RefreshCw, Gavel } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Team, Draw, Round, Judge, EnhancedDraw } from '@/types/tournament';
import { EnhancedDrawGenerator } from '@/services/enhancedDrawGenerator';
import { supabase } from '@/integrations/supabase/client';
import html2canvas from 'html2canvas';

interface EnhancedDrawsListProps {
  tournamentId: string;
  roundId?: string;
  teams: Team[];
  judges: Judge[];
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

export function EnhancedDrawsList(props: EnhancedDrawsListProps) {
  const [selectedRoundId, setSelectedRoundId] = useState(props.roundId || props.rounds[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draws, setDraws] = useState<EnhancedDraw[]>([]);
  const [generationMethod, setGenerationMethod] = useState<'random' | 'power_pairing' | 'swiss' | 'balanced'>('random');
  const [isAccepted, setIsAccepted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update local draws when props change
  useEffect(() => {
    const roundDraws = props.draws.filter(draw => draw.round_id === selectedRoundId);
    const enhancedDraws: EnhancedDraw[] = roundDraws.map(draw => {
      // Map database columns to British Parliamentary positions correctly
      const ogTeam = props.teams.find(t => t.id === draw.gov_team_id);  // Opening Government
      const ooTeam = props.teams.find(t => t.id === draw.opp_team_id);  // Opening Opposition
      const cgTeam = draw.cg_team_id ? props.teams.find(t => t.id === draw.cg_team_id) : undefined;  // Closing Government
      const coTeam = draw.co_team_id ? props.teams.find(t => t.id === draw.co_team_id) : undefined;  // Closing Opposition
      const judgeObj = draw.judge_id ? props.judges.find(j => j.id === draw.judge_id) : undefined;
      
      return {
        ...draw,
        og_team: ogTeam,  // Opening Government
        oo_team: ooTeam,  // Opening Opposition
        cg_team: cgTeam,  // Closing Government
        co_team: coTeam,  // Closing Opposition
        judge_obj: judgeObj
      };
    });
    setDraws(enhancedDraws);
    
    // Check if any draws are already in progress or completed
    const nonPendingDraws = enhancedDraws.filter(draw => draw.status !== 'pending');
    if (nonPendingDraws.length > 0) {
      setIsAccepted(true);
    }
  }, [props.draws, props.teams, props.judges, selectedRoundId]);

  const handleGenerateDraws = async () => {
    if (!selectedRoundId) {
      toast.error('Please select a round first');
      return;
    }

    if (props.teams.length < 4) {
      toast.error('Need at least 4 teams to generate British Parliamentary draws');
      return;
    }

    setIsGenerating(true);
    try {
      // Delete existing draws for this round
      const { error: deleteError } = await supabase
        .from('draws')
        .delete()
        .eq('round_id', selectedRoundId);

      if (deleteError) throw deleteError;

      // Generate new draws using enhanced generator
      const generator = new EnhancedDrawGenerator(
        props.teams,
        props.judges,
        props.rooms.slice(0, 3), // Limit to 3 rooms as specified
        {
          method: generationMethod,
          avoidInstitutionClashes: true,
          balanceExperience: true
        }
      );

      const drawRooms = generator.generateDraws();
      
      // Convert to database format with correct BP mapping
      const drawsForDatabase = drawRooms.map(room => ({
        round_id: selectedRoundId,
        tournament_id: props.tournamentId,
        room: room.room,
        // Map British Parliamentary positions to database columns:
        gov_team_id: room.teams.OG.id,    // Opening Government -> gov_team_id
        opp_team_id: room.teams.OO.id,    // Opening Opposition -> opp_team_id
        cg_team_id: room.teams.CG.id,     // Closing Government -> cg_team_id
        co_team_id: room.teams.CO.id,     // Closing Opposition -> co_team_id
        judge_id: room.judge?.id,
        judge: room.judge?.name,
        status: 'pending'
      }));

      const { data, error } = await supabase
        .from('draws')
        .insert(drawsForDatabase)
        .select();

      if (error) throw error;

      toast.success(`Generated ${drawRooms.length} British Parliamentary draws successfully!`);
      
      // Refresh the draws
      if (props.onGenerateDraws) {
        await props.onGenerateDraws(selectedRoundId);
      }
      
      setIsAccepted(false);
    } catch (error) {
      console.error('Error generating draws:', error);
      toast.error('Failed to generate draws');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setDraws((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Update positions in database
        updateDrawOrder(newOrder);
        
        return newOrder;
      });
    }
  };

  const updateDrawOrder = async (orderedDraws: EnhancedDraw[]) => {
    try {
      // Update each draw with new position information
      const updates = orderedDraws.map((draw, index) => 
        supabase
          .from('draws')
          .update({ room: `Room ${index + 1}` })
          .eq('id', draw.id)
      );

      await Promise.all(updates);
      toast.success('Draw order updated');
    } catch (error) {
      console.error('Error updating draw order:', error);
      toast.error('Failed to update draw order');
    }
  };

  const exportAsImage = async () => {
    const element = document.getElementById('draws-preview');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = `${props.tournamentName}_${props.roundName || 'draws'}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('Draws exported successfully!');
    } catch (error) {
      console.error('Error exporting draws:', error);
      toast.error('Failed to export draws');
    }
  };

  const handleAcceptDraws = async () => {
    try {
      // Update all draws for this round to 'in_progress' status
      const { error } = await supabase
        .from('draws')
        .update({ status: 'in_progress' })
        .eq('round_id', selectedRoundId);
        
      if (error) throw error;
      
      setIsAccepted(true);
      toast.success('Draws accepted and published!');
      
      // Refresh the draws
      if (props.onGenerateDraws) {
        await props.onGenerateDraws(selectedRoundId);
      }
    } catch (error) {
      console.error('Error accepting draws:', error);
      toast.error('Failed to accept draws');
    }
  };

  const selectedRound = props.rounds.find(r => r.id === selectedRoundId);

  if (props.rounds.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Rounds Available</h3>
          <p className="text-gray-500 mb-4 text-center">Create rounds before generating draws</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            British Parliamentary Draw Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Round:</label>
              <Select value={selectedRoundId} onValueChange={setSelectedRoundId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select round" />
                </SelectTrigger>
                <SelectContent>
                  {props.rounds.map((round) => (
                    <SelectItem key={round.id} value={round.id}>
                      Round {round.round_number} - {round.motion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Method:</label>
              <Select value={generationMethod} onValueChange={(value: any) => setGenerationMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="power_pairing">Power Pairing</SelectItem>
                  <SelectItem value="swiss">Swiss System</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleGenerateDraws}
                disabled={isGenerating || !selectedRoundId}
                className="w-full gap-2"
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

          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Teams: {props.teams.length} | Judges: {props.judges.length} | 
              Rooms: 3 (BP Format)
            </span>
            <Button onClick={exportAsImage} variant="outline" size="sm">
              Export as Image
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Draws Display */}
      {draws.length > 0 ? (
        <div id="draws-preview" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              {props.tournamentName} - {selectedRound ? `Round ${selectedRound.round_number}` : props.roundName}
            </h3>
            {!props.publicMode && !isAccepted && (
              <Button onClick={handleGenerateDraws} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={draws.map(d => d.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {draws.map((draw) => (
                  <SortableDrawCard key={draw.id} draw={draw} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          {!props.publicMode && !isAccepted && (
            <div className="flex gap-4 mt-6">
              <Button onClick={handleAcceptDraws} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" /> Accept Draws
              </Button>
              <Button onClick={handleGenerateDraws} variant="outline">
                <Shuffle className="mr-2 h-4 w-4" /> Regenerate
              </Button>
            </div>
          )}
          
          {isAccepted && (
            <div className="mt-4 text-green-700 font-semibold">Draws have been accepted and are now public.</div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Draws Generated</h3>
            <p className="text-gray-500 mb-4 text-center">
              {selectedRound ? `Generate British Parliamentary draws for Round ${selectedRound.round_number}` : 'Select a round and generate draws'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Sortable Draw Card Component for British Parliamentary Format
function SortableDrawCard({ draw }: { draw: EnhancedDraw }) {
  return (
    <Card className="border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-blue-700">{draw.room}</CardTitle>
          <Badge variant={
            draw.status === 'pending' ? 'secondary' :
            draw.status === 'in_progress' ? 'default' :
            'default'
          } className={
            draw.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            draw.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }>
            {draw.status === 'pending' ? (
              <Clock className="mr-1 h-3 w-3" />
            ) : draw.status === 'in_progress' ? (
              <Play className="mr-1 h-3 w-3" />
            ) : (
              <CheckCircle className="mr-1 h-3 w-3" />
            )}
            {draw.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs font-medium text-green-600 uppercase">Opening Gov (OG)</div>
            <div className="font-medium">{draw.og_team?.name || 'TBD'}</div>
            <div className="text-xs text-gray-500">{draw.og_team?.institution}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-red-600 uppercase">Opening Opp (OO)</div>
            <div className="font-medium">{draw.oo_team?.name || 'TBD'}</div>
            <div className="text-xs text-gray-500">{draw.oo_team?.institution}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-blue-600 uppercase">Closing Gov (CG)</div>
            <div className="font-medium">{draw.cg_team?.name || 'Swing Team A'}</div>
            <div className="text-xs text-gray-500">{draw.cg_team?.institution || 'Swing'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-purple-600 uppercase">Closing Opp (CO)</div>
            <div className="font-medium">{draw.co_team?.name || 'Swing Team B'}</div>
            <div className="text-xs text-gray-500">{draw.co_team?.institution || 'Swing'}</div>
          </div>
        </div>
        
        {draw.judge_obj && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-gray-500" />
              <div>
                <div className="font-medium">{draw.judge_obj.name}</div>
                <div className="text-xs text-gray-500">{draw.judge_obj.institution}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}