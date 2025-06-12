import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Info, Users, Clock, Trophy } from 'lucide-react';
import { DebateFormat } from '@/types/tournament';

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
  // Format details
  const formatDetails = {
    bp: {
      name: 'British Parliamentary',
      description: 'Four-team format with Opening and Closing Government/Opposition',
      teamsPerDebate: 4,
      speakersPerTeam: 2,
      totalSpeakingTime: '30min',
      roomsRequired: Math.floor(teamCount / 4)
    },
    wsdc: {
      name: 'World Schools',
      description: 'Three-speaker format with prepared and impromptu motions',
      teamsPerDebate: 2,
      speakersPerTeam: 3,
      totalSpeakingTime: '52min',
      roomsRequired: Math.floor(teamCount / 2)
    },
    ap: {
      name: 'American Parliamentary',
      description: 'Two-team format with government and opposition',
      teamsPerDebate: 2,
      speakersPerTeam: 2,
      totalSpeakingTime: '30min',
      roomsRequired: Math.floor(teamCount / 2)
    }
  };
  
  const formatSpec = formatDetails[selectedFormat] || formatDetails.bp;

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
            <Select value={selectedFormat} onValueChange={(value: DebateFormat) => onFormatChange(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose debate format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bp">
                  <div className="flex flex-col">
                    <span className="font-medium">British Parliamentary (BP)</span>
                    <span className="text-sm text-gray-500">4 teams per debate, 2 speakers per team</span>
                  </div>
                </SelectItem>
                <SelectItem value="wsdc">
                  <div className="flex flex-col">
                    <span className="font-medium">World Schools (WSDC)</span>
                    <span className="text-sm text-gray-500">2 teams per debate, 3 speakers per team</span>
                  </div>
                </SelectItem>
                <SelectItem value="ap">
                  <div className="flex flex-col">
                    <span className="font-medium">American Parliamentary (AP)</span>
                    <span className="text-sm text-gray-500">2 teams per debate, 2 speakers per team</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 mx-auto mb-2 text-blue-600" />
              <div className="text-sm font-medium text-gray-700">Teams per Debate</div>
              <div className="text-lg font-bold">{formatSpec.teamsPerDebate}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium text-gray-700">Speakers per Team</div>
              <div className="text-lg font-bold">{formatSpec.speakersPerTeam}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-2 text-purple-600" />
              <div className="text-sm font-medium text-gray-700">Total Speaking Time</div>
              <div className="text-lg font-bold">{formatSpec.totalSpeakingTime}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Trophy className="h-5 w-5 mx-auto mb-2 text-orange-600" />
              <div className="text-sm font-medium text-gray-700">Rooms Required</div>
              <div className="text-lg font-bold">{teamCount > 0 ? formatSpec.roomsRequired : 'TBD'}</div>
            </div>
          </div>

          {/* Format Description */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">{formatSpec.name}</h4>
            <p className="text-sm text-blue-800">{formatSpec.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

FormatSelector.displayName = 'FormatSelector';