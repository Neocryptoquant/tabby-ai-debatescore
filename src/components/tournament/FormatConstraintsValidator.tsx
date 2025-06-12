import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { DebateFormat, DEBATE_FORMATS, FormatUtils } from '@/types/formats';

interface ValidationResult {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: string[];
}

interface FormatConstraintsValidatorProps {
  format: DebateFormat;
  teamCount: number;
  judgeCount: number;
  roundCount: number;
  className?: string;
}

/**
 * Validates tournament setup against format-specific constraints
 */
function validateTournamentSetup(
  formatSpec: any,
  teamCount: number,
  judgeCount: number,
  roundCount: number
): ValidationResult[] {
  const validations: ValidationResult[] = [];

  // Team count validation
  if (teamCount < formatSpec.drawRules.minTeamsForTournament) {
    validations.push({
      type: 'error',
      message: `Insufficient teams for ${formatSpec.name}`,
      details: [`Minimum ${formatSpec.drawRules.minTeamsForTournament} teams required, you have ${teamCount}`]
    });
  } else if (teamCount > formatSpec.drawRules.maxTeamsForTournament) {
    validations.push({
      type: 'error',
      message: `Too many teams for ${formatSpec.name}`,
      details: [`Maximum ${formatSpec.drawRules.maxTeamsForTournament} teams allowed, you have ${teamCount}`]
    });
  } else {
    validations.push({
      type: 'success',
      message: 'Team count is valid',
      details: [`${teamCount} teams within acceptable range`]
    });
  }

  // Judge count validation
  const requiredRooms = formatSpec.drawRules.roomsRequired(teamCount);
  const minJudgesRequired = requiredRooms * formatSpec.adjudication.minJudges;
  const maxJudgesRecommended = requiredRooms * formatSpec.adjudication.maxJudges;

  if (judgeCount < minJudgesRequired) {
    validations.push({
      type: 'error',
      message: 'Insufficient judges',
      details: [
        `Need ${minJudgesRequired} judges minimum (${formatSpec.adjudication.minJudges} per room)`,
        `You have ${judgeCount} judges`,
        `${requiredRooms} rooms required`
      ]
    });
  } else if (judgeCount > maxJudgesRecommended) {
    validations.push({
      type: 'warning',
      message: 'More judges than recommended',
      details: [
        `Recommended maximum: ${maxJudgesRecommended} judges`,
        `You have ${judgeCount} judges`,
        'Consider using panels or backup judges'
      ]
    });
  } else {
    validations.push({
      type: 'success',
      message: 'Judge count is appropriate',
      details: [`${judgeCount} judges for ${requiredRooms} rooms`]
    });
  }

  // Round count validation
  const maxRoundsPerDay = formatSpec.scheduling.roundsPerDay;
  if (roundCount > maxRoundsPerDay) {
    validations.push({
      type: 'warning',
      message: 'High number of rounds',
      details: [
        `${roundCount} rounds exceeds recommended ${maxRoundsPerDay} per day`,
        'Consider spreading across multiple days',
        'Participants may experience fatigue'
      ]
    });
  } else {
    validations.push({
      type: 'success',
      message: 'Round count is reasonable',
      details: [`${roundCount} rounds within daily limit`]
    });
  }

  // Format-specific validations
  if (formatSpec.teamsPerDebate === 4 && teamCount % 4 !== 0) {
    const remainder = teamCount % 4;
    validations.push({
      type: 'warning',
      message: 'Team count not optimal for format',
      details: [
        `${remainder} teams will need to sit out or swing teams will be used`,
        'Consider adjusting team count to multiple of 4'
      ]
    });
  }

  if (formatSpec.teamsPerDebate === 2 && teamCount % 2 !== 0) {
    validations.push({
      type: 'warning',
      message: 'Odd number of teams',
      details: [
        '1 team will sit out each round',
        'Consider adding or removing one team'
      ]
    });
  }

  // Tournament duration validation
  const duration = FormatUtils.calculateTournamentDuration(formatSpec.name.toLowerCase(), roundCount);
  if (duration.hours > 12) {
    validations.push({
      type: 'warning',
      message: 'Very long tournament',
      details: [
        `Estimated duration: ${duration.hours}h ${duration.minutes}m`,
        'Consider reducing rounds or extending to multiple days'
      ]
    });
  } else {
    validations.push({
      type: 'info',
      message: 'Tournament duration',
      details: [`Estimated duration: ${duration.hours}h ${duration.minutes}m`]
    });
  }

  return validations;
}

/**
 * Component that validates tournament setup against format-specific constraints
 * Provides real-time feedback on tournament configuration
 */
export const FormatConstraintsValidator = React.memo<FormatConstraintsValidatorProps>(({
  format,
  teamCount,
  judgeCount,
  roundCount,
  className
}) => {
  const formatConfig = DEBATE_FORMATS[format];
  const validations = validateTournamentSetup(formatConfig, teamCount, judgeCount, roundCount);

  const getIcon = (type: ValidationResult['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'info': return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertVariant = (type: ValidationResult['type']) => {
    return type === 'error' ? 'destructive' : 'default';
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Format Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {validations.map((validation, index) => (
            <Alert key={index} variant={getAlertVariant(validation.type)}>
              <div className="flex items-start gap-2">
                {getIcon(validation.type)}
                <div className="flex-1">
                  <AlertDescription>
                    <div className="font-medium mb-1">{validation.message}</div>
                    {validation.details && validation.details.length > 0 && (
                      <ul className="text-sm space-y-1 mt-2">
                        {validation.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-current rounded-full" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}

          {/* Tournament Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700 mb-3">Tournament Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Format:</span>
                <div className="font-medium">{formatConfig.name}</div>
              </div>
              <div>
                <span className="text-gray-600">Teams:</span>
                <div className="font-medium">{teamCount}</div>
              </div>
              <div>
                <span className="text-gray-600">Judges:</span>
                <div className="font-medium">{judgeCount}</div>
              </div>
              <div>
                <span className="text-gray-600">Rounds:</span>
                <div className="font-medium">{roundCount}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

FormatConstraintsValidator.displayName = 'FormatConstraintsValidator';