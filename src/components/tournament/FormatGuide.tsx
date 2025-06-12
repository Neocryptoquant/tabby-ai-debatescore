import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Trophy, Settings, BookOpen, Gavel } from 'lucide-react';
import { DebateFormat } from '@/types/tournament';

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
  // Format specifications
  const formatSpecs = {
    bp: {
      name: 'British Parliamentary',
      description: 'Four-team format with Opening and Closing Government/Opposition',
      teamRoles: [
        { name: 'Opening Government', time: '7min', description: 'Defines the motion and presents the government case' },
        { name: 'Opening Opposition', time: '8min', description: 'Refutes government case and presents opposition' },
        { name: 'Closing Government', time: '8min', description: 'Extends government case with new material' },
        { name: 'Closing Opposition', time: '7min', description: 'Extends opposition case and provides summary' }
      ],
      scoring: {
        teamScoring: { win: 3, loss: 0, draw: 1 },
        speakerScoring: { min: 60, max: 80, avg: 75 }
      },
      adjudication: {
        minJudges: 1,
        maxJudges: 5,
        panelComposition: 'Odd number preferred',
        conflictRules: ['institution', 'coaching', 'personal']
      },
      roomSetup: {
        seating: 'Parliamentary (opposing benches)',
        equipment: ['Timer', 'Bell', 'Water']
      }
    },
    wsdc: {
      name: 'World Schools',
      description: 'Three-speaker format with prepared and impromptu motions',
      teamRoles: [
        { name: 'First Proposition', time: '8min', description: 'Defines the motion and presents the proposition case' },
        { name: 'First Opposition', time: '8min', description: 'Refutes proposition case and presents opposition' },
        { name: 'Second Proposition', time: '8min', description: 'Rebuilds proposition case and extends arguments' },
        { name: 'Second Opposition', time: '8min', description: 'Rebuilds opposition case and extends arguments' },
        { name: 'Third Proposition', time: '8min', description: 'Crystallizes debate and summarizes proposition' },
        { name: 'Third Opposition', time: '8min', description: 'Crystallizes debate and summarizes opposition' },
        { name: 'Reply Speech (Opp)', time: '4min', description: 'Biased adjudication of the debate' },
        { name: 'Reply Speech (Prop)', time: '4min', description: 'Biased adjudication of the debate' }
      ],
      scoring: {
        teamScoring: { win: 1, loss: 0 },
        speakerScoring: { min: 60, max: 80, avg: 75 }
      },
      adjudication: {
        minJudges: 1,
        maxJudges: 3,
        panelComposition: 'Odd number required',
        conflictRules: ['nationality', 'institution', 'coaching']
      },
      roomSetup: {
        seating: 'Traditional (facing each other)',
        equipment: ['Timer', 'Bell', 'Water', 'POI cards']
      }
    },
    ap: {
      name: 'American Parliamentary',
      description: 'Two-team format with government and opposition',
      teamRoles: [
        { name: 'Prime Minister', time: '7min', description: 'Defines the resolution and presents the government case' },
        { name: 'Leader of Opposition', time: '8min', description: 'Refutes government case and presents opposition' },
        { name: 'Member of Government', time: '8min', description: 'Rebuilds and extends government case' },
        { name: 'Member of Opposition', time: '8min', description: 'Rebuilds and extends opposition case' },
        { name: 'Leader of Opposition Rebuttal', time: '4min', description: 'Summarizes opposition case' },
        { name: 'Prime Minister Rebuttal', time: '5min', description: 'Summarizes government case' }
      ],
      scoring: {
        teamScoring: { win: 1, loss: 0 },
        speakerScoring: { min: 20, max: 30, avg: 25 }
      },
      adjudication: {
        minJudges: 1,
        maxJudges: 3,
        panelComposition: 'Odd number preferred',
        conflictRules: ['institution', 'coaching']
      },
      roomSetup: {
        seating: 'Parliamentary style',
        equipment: ['Timer', 'Bell', 'Water']
      }
    }
  };
  
  const formatSpec = formatSpecs[format] || formatSpecs.bp;

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
              <div className="font-bold">{format === 'bp' ? 4 : 2}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-sm text-gray-600">Speakers per Team</div>
              <div className="font-bold">{format === 'wsdc' ? 3 : 2}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm text-gray-600">Total Time</div>
              <div className="font-bold">
                {format === 'bp' ? '30min' : format === 'wsdc' ? '52min' : '40min'}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-sm text-gray-600">Prep Time</div>
              <div className="font-bold">
                {format === 'bp' ? '15min' : format === 'wsdc' ? '60min' : '20min'}
              </div>
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
                  <div className="font-bold">{role.time}</div>
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
                  <span className="font-medium">{formatSpec.scoring.teamScoring.win} points</span>
                </div>
                <div className="flex justify-between">
                  <span>Loss:</span>
                  <span className="font-medium">{formatSpec.scoring.teamScoring.loss} points</span>
                </div>
                {formatSpec.scoring.teamScoring.draw && (
                  <div className="flex justify-between">
                    <span>Draw:</span>
                    <span className="font-medium">{formatSpec.scoring.teamScoring.draw} points</span>
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
                    {formatSpec.scoring.speakerScoring.min}-{formatSpec.scoring.speakerScoring.max}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average:</span>
                  <span className="font-medium">{formatSpec.scoring.speakerScoring.avg}</span>
                </div>
              </div>
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
                  <span className="font-medium">Seating:</span> {formatSpec.roomSetup.seating}
                </div>
                <div>
                  <span className="font-medium">Equipment:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formatSpec.roomSetup.equipment.map((item, index) => (
                      <Badge key={index} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Conflict Rules</h4>
            <div className="flex flex-wrap gap-2">
              {formatSpec.adjudication.conflictRules.map((rule, index) => (
                <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                  {rule.toUpperCase()}
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Format-Specific Recommendations</h4>
            
            {format === 'bp' && (
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Team count should be a multiple of 4 for optimal room allocation</li>
                <li>Typically 5-6 preliminary rounds before breaks</li>
                <li>Standard break sizes: 8 teams (quarterfinals), 16 teams (octofinals)</li>
                <li>Teams ranked by points first, then speaker scores</li>
                <li>Points: 1st = 3, 2nd = 2, 3rd = 1, 4th = 0</li>
              </ul>
            )}
            
            {format === 'wsdc' && (
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Team count should be even for optimal pairing</li>
                <li>Typically 8 preliminary rounds (4 prepared, 4 impromptu)</li>
                <li>Standard break size: 8 teams (quarterfinals)</li>
                <li>Teams ranked by wins first, then speaker scores</li>
                <li>Three speakers per team plus optional reply speakers</li>
                <li>POIs allowed during middle 6 minutes of speeches</li>
              </ul>
            )}
            
            {format === 'ap' && (
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Team count should be even for optimal pairing</li>
                <li>Typically 5-7 preliminary rounds</li>
                <li>Standard break size: 8 teams (quarterfinals)</li>
                <li>Teams ranked by wins first, then speaker scores</li>
                <li>Government team defines the resolution</li>
                <li>POIs allowed during speeches except first/last minute</li>
              </ul>
            )}
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