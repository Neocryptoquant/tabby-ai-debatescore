import { DebateFormat, DEBATE_FORMATS, FormatUtils } from '@/types/formats';

/**
 * Validation utilities for tournament format constraints
 */

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface TournamentValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationError[];
}

/**
 * Validates tournament configuration against format-specific constraints
 */
export function validateTournamentConfiguration(
  format: DebateFormat,
  config: {
    teamCount: number;
    judgeCount: number;
    roundCount: number;
    roomCount?: number;
  }
): TournamentValidationResult {
  const formatSpec = DEBATE_FORMATS[format];
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const suggestions: ValidationError[] = [];

  // Team count validation
  if (config.teamCount < formatSpec.drawRules.minTeamsForTournament) {
    errors.push({
      field: 'team_count',
      message: `Minimum ${formatSpec.drawRules.minTeamsForTournament} teams required for ${formatSpec.name}`,
      severity: 'error'
    });
  } else if (config.teamCount > formatSpec.drawRules.maxTeamsForTournament) {
    errors.push({
      field: 'team_count',
      message: `Maximum ${formatSpec.drawRules.maxTeamsForTournament} teams allowed for ${formatSpec.name}`,
      severity: 'error'
    });
  }

  // Format-specific team count validation
  if (formatSpec.teamsPerDebate === 4 && config.teamCount % 4 !== 0) {
    warnings.push({
      field: 'team_count',
      message: `Team count (${config.teamCount}) is not divisible by 4, which is required for ${formatSpec.name}`,
      severity: 'warning'
    });
    
    // Suggest the closest valid team count
    const closestValidCount = Math.round(config.teamCount / 4) * 4;
    suggestions.push({
      field: 'team_count',
      message: `Consider adjusting to ${closestValidCount} teams for optimal room allocation`,
      severity: 'info'
    });
  } else if (formatSpec.teamsPerDebate === 2 && config.teamCount % 2 !== 0) {
    warnings.push({
      field: 'team_count',
      message: `Team count (${config.teamCount}) is odd, which means one team will sit out each round`,
      severity: 'warning'
    });
  }

  // Judge count validation
  const requiredRooms = formatSpec.drawRules.roomsRequired(config.teamCount);
  const minJudgesRequired = requiredRooms * formatSpec.adjudication.minJudges;
  
  if (config.judgeCount < minJudgesRequired) {
    errors.push({
      field: 'judge_count',
      message: `Minimum ${minJudgesRequired} judges required (${formatSpec.adjudication.minJudges} per room)`,
      severity: 'error'
    });
  }

  // Round count validation
  const maxRoundsPerDay = formatSpec.scheduling.roundsPerDay;
  if (config.roundCount > maxRoundsPerDay) {
    warnings.push({
      field: 'round_count',
      message: `${config.roundCount} rounds exceeds recommended ${maxRoundsPerDay} rounds per day`,
      severity: 'warning'
    });
  }

  // Room count validation (if provided)
  if (config.roomCount !== undefined && config.roomCount < requiredRooms) {
    errors.push({
      field: 'room_count',
      message: `Minimum ${requiredRooms} rooms required for ${config.teamCount} teams`,
      severity: 'error'
    });
  }

  // Calculate tournament duration
  const duration = FormatUtils.calculateTournamentDuration(format, config.roundCount);
  if (duration.hours > 8) {
    warnings.push({
      field: 'tournament_duration',
      message: `Tournament duration (${duration.hours}h ${duration.minutes}m) exceeds 8 hours`,
      severity: 'warning'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Calculates the optimal number of teams for a given format
 */
export function calculateOptimalTeamCount(format: DebateFormat, approximateCount: number): number {
  const formatSpec = DEBATE_FORMATS[format];
  const teamsPerDebate = formatSpec.teamsPerDebate;
  
  // Round to the nearest multiple of teamsPerDebate
  return Math.round(approximateCount / teamsPerDebate) * teamsPerDebate;
}

/**
 * Calculates the minimum number of judges needed
 */
export function calculateRequiredJudges(format: DebateFormat, teamCount: number): number {
  const formatSpec = DEBATE_FORMATS[format];
  const requiredRooms = formatSpec.drawRules.roomsRequired(teamCount);
  return requiredRooms * formatSpec.adjudication.minJudges;
}

/**
 * Calculates the recommended number of preliminary rounds
 */
export function calculateRecommendedRounds(format: DebateFormat, teamCount: number): number {
  // General rule: log2(teamCount) + 1 for power of 2 tournaments
  // But adjust based on format-specific considerations
  const baseRounds = Math.ceil(Math.log2(teamCount)) + 1;
  
  switch (format) {
    case 'bp':
      // BP typically has 5-6 preliminary rounds
      return Math.min(Math.max(5, baseRounds), 6);
    case 'wsdc':
      // WSDC typically has 8 preliminary rounds
      return 8;
    case 'ap':
    case 'cp':
      // AP/CP typically has 5-7 preliminary rounds
      return Math.min(Math.max(5, baseRounds), 7);
    case 'pf':
    case 'ld':
    case 'policy':
      // High school formats typically have 4-6 preliminary rounds
      return Math.min(Math.max(4, baseRounds), 6);
    default:
      return baseRounds;
  }
}

/**
 * Calculates the recommended break size
 */
export function calculateRecommendedBreakSize(format: DebateFormat, teamCount: number): number {
  const formatSpec = DEBATE_FORMATS[format];
  
  // Default to format's default break size
  let breakSize = formatSpec.breakStructure.defaultBreakSize;
  
  // Adjust based on team count
  if (teamCount < breakSize * 2) {
    // If fewer than 2x the break size, reduce the break
    breakSize = Math.max(4, Math.pow(2, Math.floor(Math.log2(teamCount / 2))));
  }
  
  return breakSize;
}