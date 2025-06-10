import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Users, Building2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Judge {
  id: string;
  name: string;
  institution?: string;
  experience_level?: string;
}

interface JudgesListProps {
  judges: Judge[];
  onDelete: (judgeId: string) => Promise<void>;
  onEdit?: (judge: Judge) => void;
  isLoading?: boolean;
}

export const JudgesList = ({ judges, onDelete, onEdit, isLoading = false }: JudgesListProps) => {
  const getExperienceColor = (level?: string) => {
    switch (level) {
      case 'novice': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-green-100 text-green-800';
      case 'experienced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <LoadingSpinner size="lg" text="Loading judges..." />
        </CardContent>
      </Card>
    );
  }

  if (judges.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No judges registered yet</h3>
          <p className="text-gray-500">Start by adding judges to help adjudicate your tournament</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {judges.map((judge) => (
        <Card key={judge.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-600" />
                <div>
                  <CardTitle className="text-lg">{judge.name}</CardTitle>
                  {judge.institution && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Building2 className="h-4 w-4" />
                      {judge.institution}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {judge.experience_level && (
                  <Badge className={getExperienceColor(judge.experience_level)}>
                    {judge.experience_level}
                  </Badge>
                )}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(judge)}
                  >
                    Edit
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(judge.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};
