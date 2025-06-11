
import { useState } from 'react';
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
import { Users, Trophy, Shuffle, Play, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Team, Draw, Judge } from '@/types/tournament';
import { useDrawGenerator } from '@/hooks/useDrawGenerator';
import { SortableDraw } from './SortableDraw';
import html2canvas from 'html2canvas';

interface DraggableDrawsListProps {
  tournamentId: string;
  roundId: string;
  teams: Team[];
  judges: Judge[];
  rooms: string[];
  draws: Draw[];
  onStartRound: (roundId: string) => Promise<void>;
  onCompleteRound: (roundId: string) => Promise<void>;
  onUpdateDraws: (draws: Draw[]) => Promise<void>;
  tournamentName: string;
  roundName: string;
  publicMode?: boolean;
}

export function DraggableDrawsList({
  tournamentId,
  roundId,
  teams,
  judges,
  rooms,
  draws: initialDraws,
  onStartRound,
  onCompleteRound,
  onUpdateDraws,
  tournamentName,
  roundName,
  publicMode = false
}: DraggableDrawsListProps) {
  const [draws, setDraws] = useState(initialDraws);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const {
    generateDraws,
    regenerateDraws,
    isGenerating,
    generationHistory
  } = useDrawGenerator({
    tournamentId,
    roundId,
    teams,
    judges,
    rooms
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setDraws((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleStartRound = async () => {
    setIsStarting(true);
    try {
      await onStartRound(roundId);
      toast.success('Round started successfully');
    } catch (error) {
      console.error('Error starting round:', error);
      toast.error('Failed to start round');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteRound = async () => {
    setIsCompleting(true);
    try {
      await onCompleteRound(roundId);
      toast.success('Round completed successfully');
    } catch (error) {
      console.error('Error completing round:', error);
      toast.error('Failed to complete round');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      await onUpdateDraws(draws);
      toast.success('Draws updated successfully');
    } catch (error) {
      console.error('Error updating draws:', error);
      toast.error('Failed to update draws');
    } finally {
      setIsUpdating(false);
    }
  };

  const exportAsImage = () => {
    const node = document.getElementById('draws-preview');
    if (!node) return;
    html2canvas(node).then(canvas => {
      const link = document.createElement('a');
      link.download = `${tournamentName}_Round_${roundName}_Draws.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const isTabMaster = !publicMode;

  if (!draws.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-4">No draws generated yet</p>
          <Button
            onClick={() => generateDraws()}
            disabled={isGenerating}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner className="mr-2" />
                Generating Draws...
              </>
            ) : (
              <>
                <Shuffle className="mr-2 h-4 w-4" />
                Generate Draws
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <CardTitle>British Parliamentary Draws</CardTitle>
        <div className="flex flex-wrap gap-2">
          {isTabMaster && (
            <Button
              onClick={() => regenerateDraws()}
              disabled={isGenerating}
              variant="outline"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Shuffle className="mr-2 h-4 w-4" />
                  Regenerate Draws
                </>
              )}
            </Button>
          )}
          <Button onClick={exportAsImage} variant="outline">
            Export as Image
          </Button>
        </div>
      </div>
      <div id="draws-preview" className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">{tournamentName}</h2>
            <div className="text-lg text-gray-500">{roundName}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {draws.map((draw, idx) => {
            // Find team data
            const govTeam = teams.find(t => t.id === draw.gov_team_id);
            const oppTeam = teams.find(t => t.id === draw.opp_team_id);
            const cgTeam = draw.cg_team_id ? teams.find(t => t.id === draw.cg_team_id) : undefined;
            const coTeam = draw.co_team_id ? teams.find(t => t.id === draw.co_team_id) : undefined;
            const judge = draw.judge_id ? judges.find(j => j.id === draw.judge_id) : undefined;

            return (
              <Card key={draw.id} className="border-2 border-blue-200 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="font-semibold text-blue-700">{draw.room}</div>
                  <Badge variant="outline">Room {idx + 1}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-bold text-green-600">OG</div>
                    <div>{govTeam?.name || '-'}</div>
                    <div className="font-bold text-red-600">OO</div>
                    <div>{oppTeam?.name || '-'}</div>
                    <div className="font-bold text-blue-600">CG</div>
                    <div>{cgTeam?.name || '-'}</div>
                    <div className="font-bold text-purple-600">CO</div>
                    <div>{coTeam?.name || '-'}</div>
                    {judge && (
                      <>
                        <div className="font-bold text-gray-600">Judge</div>
                        <div>{judge.name}</div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      {isTabMaster && !isAccepted && (
        <div className="flex gap-4 mt-6">
          <Button onClick={() => { setIsAccepted(true); toast.success('Draws accepted!'); }} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="mr-2 h-4 w-4" /> Accept Draws
          </Button>
          <Button onClick={() => regenerateDraws()} variant="outline">
            <Shuffle className="mr-2 h-4 w-4" /> Regenerate
          </Button>
        </div>
      )}
      {isAccepted && (
        <div className="mt-4 text-green-700 font-semibold">Draws have been accepted and are now public.</div>
      )}
    </div>
  );
}
