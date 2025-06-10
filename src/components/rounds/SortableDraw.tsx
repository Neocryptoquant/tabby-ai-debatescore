import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Clock, Play, CheckCircle } from "lucide-react";
import { Team, Draw } from '@/types/tournament';

interface SortableDrawProps {
  draw: Draw;
  teams: Team[];
}

export function SortableDraw({ draw, teams }: SortableDrawProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: draw.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab'
  };

  // Find the teams by their IDs
  const govTeam = teams.find(team => team.id === draw.gov_team_id);
  const oppTeam = teams.find(team => team.id === draw.opp_team_id);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative"
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-semibold">Room {draw.room}</h4>
          </div>
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
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-muted-foreground mb-1">Government</h5>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <p className="font-medium">{govTeam?.name || 'TBD'}</p>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-muted-foreground mb-1">Opposition</h5>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <p className="font-medium">{oppTeam?.name || 'TBD'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 