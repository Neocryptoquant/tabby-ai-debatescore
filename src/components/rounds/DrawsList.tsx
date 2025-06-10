import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Shuffle, Play, CheckCircle, Clock } from "lucide-react";
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
import { Team, Draw } from '@/types/tournament';
import { useDrawGenerator } from '@/hooks/useDrawGenerator';
import { DraggableDrawsList } from './DraggableDrawsList';
import { supabase } from '@/integrations/supabase/client';

interface DrawsListProps {
  tournamentId: string;
  roundId: string;
  teams: Team[];
  rooms: string[];
  draws: Draw[];
  onStartRound: (roundId: string) => Promise<void>;
  onCompleteRound: (roundId: string) => Promise<void>;
  tournamentName: string;
  roundName: string;
  publicMode?: boolean;
}

export function DrawsList(props: DrawsListProps) {
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

  return (
    <DraggableDrawsList
      {...props}
      onUpdateDraws={handleUpdateDraws}
      tournamentName={props.tournamentName}
      roundName={props.roundName}
      publicMode={props.publicMode}
    />
  );
}
