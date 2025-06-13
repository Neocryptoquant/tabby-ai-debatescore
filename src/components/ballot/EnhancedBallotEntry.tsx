
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calculator, Trophy, Users } from 'lucide-react';

interface EnhancedBallotEntryProps {
  ballotId: string;
  teams: Array<{
    id: string;
    name: string;
    position: 'gov' | 'opp' | 'cg' | 'co';
  }>;
  onSave: () => void;
}

interface SpeakerScore {
  speakerName: string;
  score: number;
}

interface TeamScores {
  teamId: string;
  teamName: string;
  speakers: SpeakerScore[];
  totalScore: number;
  calculatedPosition: number;
}

export function EnhancedBallotEntry({ ballotId, teams, onSave }: EnhancedBallotEntryProps) {
  const [teamScores, setTeamScores] = useState<TeamScores[]>([]);
  const [autoCalculatePositions, setAutoCalculatePositions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize team scores
    const initialScores = teams.map(team => ({
      teamId: team.id,
      teamName: team.name,
      speakers: [
        { speakerName: '', score: 0 },
        { speakerName: '', score: 0 }
      ],
      totalScore: 0,
      calculatedPosition: 0
    }));
    setTeamScores(initialScores);
  }, [teams]);

  const updateSpeakerScore = (teamIndex: number, speakerIndex: number, field: 'speakerName' | 'score', value: string | number) => {
    const newTeamScores = [...teamScores];
    if (field === 'speakerName') {
      newTeamScores[teamIndex].speakers[speakerIndex].speakerName = value as string;
    } else {
      newTeamScores[teamIndex].speakers[speakerIndex].score = Number(value);
    }
    
    // Recalculate total score for the team
    newTeamScores[teamIndex].totalScore = newTeamScores[teamIndex].speakers.reduce(
      (sum, speaker) => sum + speaker.score, 0
    );
    
    setTeamScores(newTeamScores);
    
    // Auto-calculate positions if enabled
    if (autoCalculatePositions) {
      calculatePositions(newTeamScores);
    }
  };

  const calculatePositions = (scores: TeamScores[]) => {
    // Sort teams by total score (descending)
    const sortedTeams = [...scores].sort((a, b) => b.totalScore - a.totalScore);
    
    // Assign positions (handle ties by giving same position)
    const updatedScores = scores.map(team => {
      const position = sortedTeams.findIndex(t => t.teamId === team.teamId) + 1;
      return { ...team, calculatedPosition: position };
    });
    
    setTeamScores(updatedScores);
  };

  const saveScores = async () => {
    setIsSaving(true);
    try {
      // Delete existing speaker scores for this ballot
      await supabase
        .from('speaker_scores')
        .delete()
        .eq('ballot_id', ballotId);

      // Insert new speaker scores
      const speakerScoresToInsert = [];
      for (const team of teamScores) {
        for (let i = 0; i < team.speakers.length; i++) {
          const speaker = team.speakers[i];
          if (speaker.speakerName && speaker.score > 0) {
            speakerScoresToInsert.push({
              ballot_id: ballotId,
              team_id: team.teamId,
              speaker_name: speaker.speakerName,
              speaker_position: i + 1,
              score: speaker.score
            });
          }
        }
      }

      if (speakerScoresToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('speaker_scores')
          .insert(speakerScoresToInsert);

        if (insertError) throw insertError;
      }

      // Update ballot with auto-calculate setting and positions if not auto-calculating
      const ballotUpdate: any = {
        auto_calculate_positions: autoCalculatePositions,
        updated_at: new Date().toISOString()
      };

      if (!autoCalculatePositions) {
        // Manually set positions based on calculated positions
        teamScores.forEach(team => {
          const teamData = teams.find(t => t.id === team.teamId);
          if (teamData) {
            const positionField = `${teamData.position}_team_rank`;
            ballotUpdate[positionField] = team.calculatedPosition;
          }
        });
      }

      const { error: ballotError } = await supabase
        .from('ballots')
        .update(ballotUpdate)
        .eq('id', ballotId);

      if (ballotError) throw ballotError;

      toast.success('Speaker scores saved successfully!');
      onSave();
    } catch (error) {
      console.error('Error saving scores:', error);
      toast.error('Failed to save speaker scores');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Speaker Scores & Team Positions
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-calculate"
              checked={autoCalculatePositions}
              onCheckedChange={setAutoCalculatePositions}
            />
            <Label htmlFor="auto-calculate">
              Automatically calculate team positions from speaker scores
            </Label>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {teamScores.map((team, teamIndex) => (
            <Card key={team.teamId} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    {team.teamName}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Total: {team.totalScore}
                    </Badge>
                    {autoCalculatePositions && (
                      <Badge 
                        className={`text-lg px-3 py-1 ${
                          team.calculatedPosition === 1 ? 'bg-yellow-500' :
                          team.calculatedPosition === 2 ? 'bg-gray-400' :
                          team.calculatedPosition === 3 ? 'bg-orange-600' :
                          'bg-blue-500'
                        }`}
                      >
                        Position: {team.calculatedPosition}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.speakers.map((speaker, speakerIndex) => (
                    <div key={speakerIndex} className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Speaker {speakerIndex + 1}
                      </Label>
                      <Input
                        placeholder="Speaker name"
                        value={speaker.speakerName}
                        onChange={(e) => updateSpeakerScore(teamIndex, speakerIndex, 'speakerName', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Score"
                        min="0"
                        max="100"
                        value={speaker.score || ''}
                        onChange={(e) => updateSpeakerScore(teamIndex, speakerIndex, 'score', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              onClick={saveScores}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? 'Saving...' : 'Save Speaker Scores'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
