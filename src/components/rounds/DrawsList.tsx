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
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useState } from "react";
import { Team, Draw, Round, Judge } from '@/types/tournament';
import { EnhancedDrawsList } from './EnhancedDrawsList';

interface DrawsListProps {
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
  format?: string;
}

export function DrawsList(props: DrawsListProps) {
  // Use the enhanced draws list component
  return <EnhancedDrawsList {...props} />;
}