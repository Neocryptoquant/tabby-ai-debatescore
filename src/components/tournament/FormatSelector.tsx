import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Info, Users, Clock, Trophy } from 'lucide-react';
import { DebateFormat, DEBATE_FORMATS, FormatUtils } from '@/types/formats';

interface FormatSelectorProps {
  selectedFormat: DebateFormat;
  onFormatChange: (format: DebateFormat) => void;
  teamCount?: number;
  className?: string;
}

/**
 * Component for selecting and displaying debate format information
 * Shows format-specific details and constraints
 */
export const FormatSelector = React.memo<FormatSelectorProps>(({
  selectedFormat,
  onFormatChange,
  teamCount = 0,
  className
}) => {
  const formatSpec = DEBATE_FORMATS[selectedFormat];
  const allFormats = FormatUtils.getAllFormats();

  const formatDetails = [
    {
      icon: Users,
      label: 'Teams per Debate',
      value: formatSpec.teamsPerDebate,
      color: 'text-blue-600'
    },
    {
      icon: Users,
      label: 'Speakers per Team',
      value: formatSpec.speakersPerTeam,
      color: 'text-green-600'
    },
    {
      icon: Clock,
      label: 'Total Speaking Time',
      value: `${formatSpec.totalSpeakingTime.minutes}min`,
      color: 'text-purple-600'
    },
    {
      icon: Trophy,
      label: 'Rooms Required',
      value: teamCount > 0 ? FormatUtils.calculateRooms(selectedFormat, teamCount) : 'TBD',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Debate Format
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div>
            <Label htmlFor="format">Select Format</Label>
            <Select value={selectedFormat} onValueChange={onFormatChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose debate format" />
              </SelectTrigger>
              <SelectContent>
                {allFormats.map((format) => (
                  <SelectItem key={format.code} value={format.code}>
                    <div className="flex flex-col">
                      <span className="font-medium">{format.name}</span>
                      <span className="text-sm text-gray-500">{format.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formatDetails.map((detail, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <detail.icon className={`h-5 w-5 mx-auto mb-2 ${detail.color}`} />
                <div className="text-sm font-medium text-gray-700">{detail.label}</div>
                <div className="text-lg font-bold">{detail.value}</div>
              </div>
            ))}
          </div>

          {/* Format Description */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">{formatSpec.name}</h4>
            <p className="text-sm text-blue-800 mb-3">{formatSpec.description}</p>
            
            {/* Team Roles */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-blue-900">Team Positions:</h5>
              <div className="flex flex-wrap gap-2">
                {formatSpec.teamRoles.map((role, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {role.name} ({role.speakingTime.minutes}min)
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Scoring Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <h5 className="font-medium text-green-900 mb-2">Team Scoring</h5>
              <div className="text-sm text-green-800 space-y-1">
                <div>Win: {formatSpec.scoring.teamScoring.winPoints} points</div>
                <div>Loss: {formatSpec.scoring.teamScoring.lossPoints} points</div>
                {formatSpec.scoring.teamScoring.drawPoints && (
                  <div>Draw: {formatSpec.scoring.teamScoring.drawPoints} points</div>
                )}
              </div>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <h5 className="font-medium text-purple-900 mb-2">Speaker Scoring</h5>
              <div className="text-sm text-purple-800 space-y-1">
                <div>Range: {formatSpec.scoring.speakerScoring.minSpeakerScore}-{formatSpec.scoring.speakerScoring.maxSpeakerScore}</div>
                <div>Average: {formatSpec.scoring.speakerScoring.averageExpected}</div>
                <div>Increment: {formatSpec.scoring.speakerScoring.increment}</div>
              </div>
            </div>
          </div>

          {/* Tournament Constraints */}
          {teamCount > 0 && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <h5 className="font-medium text-yellow-900 mb-2">Tournament Setup</h5>
              <div className="text-sm text-yellow-800 space-y-1">
                <div>Teams: {teamCount}</div>
                <div>Rooms needed: {FormatUtils.calculateRooms(selectedFormat, teamCount)}</div>
                <div>Recommended break: {FormatUtils.getRecommendedBreakSize(selectedFormat, teamCount)} teams</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

FormatSelector.displayName = 'FormatSelector';