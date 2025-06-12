import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Trophy, Settings, BookOpen, Gavel } from 'lucide-react';
import { DebateFormat, DEBATE_FORMATS } from '@/types/formats';

interface FormatGuideProps {
  format: DebateFormat;
  className?: string;
}

/**
 * Comprehensive format guide component that displays detailed information
 * about the selected debate format including rules, timing, and procedures
 */
export const FormatGuide = React.memo<FormatGuideProps>(({
  format,
  className
}) => {
  const formatSpec = DEBATE_FORMATS[format];

  const formatTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">{formatSpec.name}</h3>
            <p className="text-blue-800">{formatSpec.description}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-sm text-gray-600">Teams per Debate</div>
              <div className="font-bold">{formatSpec.teamsPerDebate}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-sm text-gray-600">Speakers per Team</div>
              <div className="font-bold">{formatSpec.speakersPerTeam}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm text-gray-600">Total Time</div>
              <div className="font-bold">{formatSpec.totalSpeakingTime.minutes}min</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-sm text-gray-600">Prep Time</div>
              <div className="font-bold">{formatSpec.motions.preparationTime}min</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'speaking',
      label: 'Speaking Order',
      icon: Clock,
      content: (
        <div className="space-y-4">
          <h3 className="font-semibold">Speaking Order and Times</h3>
          <div className="space-y-3">
            {formatSpec.teamRoles.map((role, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{role.name}</div>
                  <div className="text-sm text-gray-600">{role.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{role.speakingTime.minutes}:{role.speakingTime.seconds.toString().padStart(2, '0')}</div>
                  {role.speakingTime.protected && (
                    <div className="text-xs text-gray-500">
                      Protected: {role.speakingTime.protected}s
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'scoring',
      label: 'Scoring',
      icon: Trophy,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Team Scoring</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Win:</span>
                  <span className="font-medium">{formatSpec.scoring.teamScoring.winPoints} points</span>
                </div>
                <div className="flex justify-between">
                  <span>Loss:</span>
                  <span className="font-medium">{formatSpec.scoring.teamScoring.lossPoints} points</span>
                </div>
                {formatSpec.scoring.teamScoring.drawPoints && (
                  <div className="flex justify-between">
                    <span>Draw:</span>
                    <span className="font-medium">{formatSpec.scoring.teamScoring.drawPoints} points</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Speaker Scoring</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Range:</span>
                  <span className="font-medium">
                    {formatSpec.scoring.speakerScoring.minSpeakerScore}-{formatSpec.scoring.speakerScoring.maxSpeakerScore}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average:</span>
                  <span className="font-medium">{formatSpec.scoring.speakerScoring.averageExpected}</span>
                </div>
                <div className="flex justify-between">
                  <span>Increment:</span>
                  <span className="font-medium">{formatSpec.scoring.speakerScoring.increment}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Judging Criteria</h4>
            <div className="flex flex-wrap gap-2">
              {formatSpec.scoring.judgeScoring.scoringCriteria.map((criterion, index) => (
                <Badge key={index} variant="outline">
                  {criterion.replace('_', ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'adjudication',
      label: 'Adjudication',
      icon: Gavel,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Panel Composition</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Min Judges:</span>
                  <span className="font-medium">{formatSpec.adjudication.minJudges}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Judges:</span>
                  <span className="font-medium">{formatSpec.adjudication.maxJudges}</span>
                </div>
                <div className="flex justify-between">
                  <span>Composition:</span>
                  <span className="font-medium">{formatSpec.adjudication.panelComposition}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Room Setup</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Seating:</span> {formatSpec.roomSetup.seatingArrangement}
                </div>
                <div>
                  <span className="font-medium">Timekeeper:</span> {formatSpec.roomSetup.timekeeper ? 'Required' : 'Optional'}
                </div>
                <div>
                  <span className="font-medium">Chair:</span> {formatSpec.roomSetup.chairRequired ? 'Required' : 'Optional'}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Conflict Rules</h4>
            <div className="flex flex-wrap gap-2">
              {formatSpec.adjudication.conflictRules.map((rule, index) => (
                <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                  {rule.replace('_', ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Experience Requirements</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {formatSpec.adjudication.experienceRequirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Required Equipment</h4>
            <div className="flex flex-wrap gap-2">
              {formatSpec.roomSetup.requiredEquipment.map((equipment, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                  {equipment}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tournament',
      label: 'Tournament',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Scheduling</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Rounds per Day:</span>
                  <span className="font-medium">{formatSpec.scheduling.roundsPerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Between Rounds:</span>
                  <span className="font-medium">{formatSpec.scheduling.timeBetweenRounds} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Debate Length:</span>
                  <span className="font-medium">{formatSpec.scheduling.debateLength} min</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Tournament Limits</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Min Teams:</span>
                  <span className="font-medium">{formatSpec.drawRules.minTeamsForTournament}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Teams:</span>
                  <span className="font-medium">{formatSpec.drawRules.maxTeamsForTournament}</span>
                </div>
                <div className="flex justify-between">
                  <span>Default Break:</span>
                  <span className="font-medium">{formatSpec.breakStructure.defaultBreakSize} teams</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Motion Types</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {formatSpec.motions.types.map((type, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                  {type}
                </Badge>
              ))}
            </div>
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Preparation Time:</span> {formatSpec.motions.preparationTime} minutes</div>
              <div><span className="font-medium">Information Slide:</span> {formatSpec.motions.informationSlide ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Motion Release:</span> {formatSpec.motions.motionRelease.replace('_', ' ')}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Break Structure</h4>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Supported Breaks:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formatSpec.breakStructure.supportedBreaks.map((breakType, index) => (
                    <Badge key={index} variant="outline">
                      {breakType.replace('_', ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium">Qualification:</span> {formatSpec.breakStructure.qualificationCriteria.replace('_', ' ')}
              </div>
              <div>
                <span className="font-medium">Tie Breakers:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formatSpec.breakStructure.tieBreakers.map((tieBreaker, index) => (
                    <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-700">
                      {tieBreaker.replace('_', ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {formatSpec.name} Format Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {formatTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {formatTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-6">
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
});

FormatGuide.displayName = 'FormatGuide';