import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Users, Star, Save } from 'lucide-react';
import { DebateFormat, DEBATE_FORMATS } from '@/types/formats';

interface ScoringData {
  teamRankings: Record<string, number>;
  speakerScores: Record<string, number>;
  teamPoints: Record<string, number>;
}

interface FormatSpecificScoringProps {
  format: DebateFormat;
  teams: Array<{ id: string; name: string; }>;
  speakers: Array<{ id: string; name: string; teamId: string; }>;
  onScoringSubmit: (data: ScoringData) => void;
  className?: string;
}

/**
 * Format-specific scoring component that adapts to different debate formats
 * Provides appropriate scoring interfaces based on format requirements
 */
export const FormatSpecificScoring = React.memo<FormatSpecificScoringProps>(({
  format,
  teams,
  speakers,
  onScoringSubmit,
  className
}) => {
  const formatSpec = DEBATE_FORMATS[format];
  const [teamRankings, setTeamRankings] = React.useState<Record<string, number>>({});
  const [speakerScores, setSpeakerScores] = React.useState<Record<string, number>>({});
  const [teamPoints, setTeamPoints] = React.useState<Record<string, number>>({});

  const handleTeamRankingChange = (teamId: string, ranking: number) => {
    setTeamRankings(prev => ({ ...prev, [teamId]: ranking }));
    
    // Auto-calculate team points based on ranking for formats that use ranking
    if (formatSpec.scoring.judgeScoring.requireRanking) {
      const points = calculatePointsFromRanking(ranking, teams.length);
      setTeamPoints(prev => ({ ...prev, [teamId]: points }));
    }
  };

  const handleSpeakerScoreChange = (speakerId: string, score: number) => {
    const { minSpeakerScore, maxSpeakerScore } = formatSpec.scoring.speakerScoring;
    
    if (score >= minSpeakerScore && score <= maxSpeakerScore) {
      setSpeakerScores(prev => ({ ...prev, [speakerId]: score }));
    }
  };

  const calculatePointsFromRanking = (ranking: number, totalTeams: number): number => {
    // Different point systems based on format
    switch (format) {
      case 'bp':
      case 'cp':
        // BP/CP: 1st=3pts, 2nd=2pts, 3rd=1pt, 4th=0pts
        return Math.max(0, 4 - ranking);
      case 'wsdc':
      case 'ap':
      case 'pf':
      case 'ld':
      case 'policy':
        // Two-team formats: 1st=1pt, 2nd=0pts
        return ranking === 1 ? 1 : 0;
      default:
        return 0;
    }
  };

  const handleSubmit = () => {
    const scoringData: ScoringData = {
      teamRankings,
      speakerScores,
      teamPoints
    };
    onScoringSubmit(scoringData);
  };

  const isFormValid = () => {
    // Check if all required fields are filled
    const hasAllRankings = formatSpec.scoring.judgeScoring.requireRanking 
      ? teams.every(team => teamRankings[team.id] !== undefined)
      : true;
    
    const hasAllSpeakerScores = speakers.every(speaker => 
      speakerScores[speaker.id] !== undefined
    );

    return hasAllRankings && hasAllSpeakerScores;
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {formatSpec.name} Scoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scoring Guidelines */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Scoring Guidelines</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <strong>Speaker Scores:</strong>
                <div>Range: {formatSpec.scoring.speakerScoring.minSpeakerScore}-{formatSpec.scoring.speakerScoring.maxSpeakerScore}</div>
                <div>Average: {formatSpec.scoring.speakerScoring.averageExpected}</div>
                <div>Increment: {formatSpec.scoring.speakerScoring.increment}</div>
              </div>
              <div>
                <strong>Team Scoring:</strong>
                <div>Win: {formatSpec.scoring.teamScoring.winPoints} points</div>
                <div>Loss: {formatSpec.scoring.teamScoring.lossPoints} points</div>
                {formatSpec.scoring.teamScoring.drawPoints && (
                  <div>Draw: {formatSpec.scoring.teamScoring.drawPoints} points</div>
                )}
              </div>
            </div>
          </div>

          {/* Team Rankings (if required by format) */}
          {formatSpec.scoring.judgeScoring.requireRanking && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Rankings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team, index) => (
                  <div key={team.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{team.name}</div>
                      {teamPoints[team.id] !== undefined && (
                        <Badge variant="outline" className="mt-1">
                          {teamPoints[team.id]} points
                        </Badge>
                      )}
                    </div>
                    <div className="w-24">
                      <Select 
                        value={teamRankings[team.id]?.toString() || ''} 
                        onValueChange={(value) => handleTeamRankingChange(team.id, parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Rank" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: teams.length }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speaker Scores */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Speaker Scores
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {speakers.map((speaker) => {
                const team = teams.find(t => t.id === speaker.teamId);
                return (
                  <div key={speaker.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{speaker.name}</div>
                      <div className="text-sm text-gray-500">{team?.name}</div>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min={formatSpec.scoring.speakerScoring.minSpeakerScore}
                        max={formatSpec.scoring.speakerScoring.maxSpeakerScore}
                        step={formatSpec.scoring.speakerScoring.increment}
                        value={speakerScores[speaker.id] || ''}
                        onChange={(e) => handleSpeakerScoreChange(speaker.id, parseFloat(e.target.value))}
                        placeholder="Score"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scoring Criteria */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Judging Criteria</h4>
            <div className="flex flex-wrap gap-2">
              {formatSpec.scoring.judgeScoring.scoringCriteria.map((criterion, index) => (
                <Badge key={index} variant="outline">
                  {criterion.replace('_', ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            Submit Scores
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});

FormatSpecificScoring.displayName = 'FormatSpecificScoring';