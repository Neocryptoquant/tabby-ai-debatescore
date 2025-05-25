
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Clock, MessageSquare } from "lucide-react";

interface Round {
  id: string;
  round_number: number;
  motion: string;
  info_slide?: string;
  start_time?: string;
  status: 'upcoming' | 'active' | 'completed';
}

interface RoundsListProps {
  rounds: Round[];
  onEdit: (round: Round) => void;
  onDelete: (roundId: string) => void;
  isLoading?: boolean;
}

export const RoundsList = ({ rounds, onEdit, onDelete, isLoading = false }: RoundsListProps) => {
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "TBD";
    const date = new Date(timeStr);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: Round['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No rounds created yet</h3>
          <p className="text-gray-500">Start by adding the first round to your tournament</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rounds.map((round) => (
        <Card key={round.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Round {round.round_number}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(round.status)}>
                  {round.status}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(round)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(round.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {formatTime(round.start_time)}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Motion:</h4>
                <p className="text-gray-700">{round.motion}</p>
              </div>
              
              {round.info_slide && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Info Slide:</h4>
                  <p className="text-gray-600 text-sm">{round.info_slide}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
