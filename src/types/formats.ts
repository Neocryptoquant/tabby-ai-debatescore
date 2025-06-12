/**
 * Comprehensive debate format definitions and specifications
 * Based on Tabbycat's implementation and international standards
 */

export type DebateFormat = 'bp' | 'wsdc' | 'ap' | 'cp' | 'pf' | 'ld' | 'policy';

export interface SpeakingTime {
  minutes: number;
  seconds: number;
  protected?: number; // Protected time in seconds
}

export interface TeamRole {
  name: string;
  position: number;
  description: string;
  speakingOrder: number;
  speakingTime: SpeakingTime;
}

export interface FormatSpecification {
  name: string;
  shortName: string;
  description: string;
  teamsPerDebate: number;
  speakersPerTeam: number;
  teamRoles: TeamRole[];
  totalSpeakingTime: SpeakingTime;
  
  // Draw generation rules
  drawRules: {
    method: 'random' | 'power_pairing' | 'swiss' | 'balanced';
    avoidInstitutionClashes: boolean;
    balanceExperience: boolean;
    minTeamsForTournament: number;
    maxTeamsForTournament: number;
    roomsRequired: (teamCount: number) => number;
  };
  
  // Break round structures
  breakStructure: {
    supportedBreaks: ('finals' | 'semis' | 'quarters' | 'octofinals')[];
    defaultBreakSize: number;
    qualificationCriteria: 'points' | 'wins' | 'speaker_scores' | 'combined';
    tieBreakers: string[];
  };
  
  // Scoring system
  scoring: {
    teamScoring: {
      winPoints: number;
      lossPoints: number;
      drawPoints?: number;
      maxTeamScore?: number;
      minTeamScore?: number;
    };
    speakerScoring: {
      maxSpeakerScore: number;
      minSpeakerScore: number;
      increment: number;
      averageExpected: number;
    };
    judgeScoring: {
      requireRanking: boolean;
      allowTies: boolean;
      scoringCriteria: string[];
    };
  };
  
  // Room setup requirements
  roomSetup: {
    seatingArrangement: string;
    requiredEquipment: string[];
    timekeeper: boolean;
    chairRequired: boolean;
  };
  
  // Adjudication criteria
  adjudication: {
    minJudges: number;
    maxJudges: number;
    panelComposition: string;
    conflictRules: string[];
    experienceRequirements: string[];
  };
  
  // Motion/topic specifications
  motions: {
    types: string[];
    preparationTime: number; // minutes
    informationSlide: boolean;
    motionRelease: 'before_round' | 'at_round' | 'prepared';
  };
  
  // Tournament scheduling
  scheduling: {
    roundsPerDay: number;
    timeBetweenRounds: number; // minutes
    preparationTime: number; // minutes
    debateLength: number; // minutes including prep
  };
}

/**
 * Complete format specifications for all major debate formats
 */
export const DEBATE_FORMATS: Record<DebateFormat, FormatSpecification> = {
  // British Parliamentary (BP)
  bp: {
    name: 'British Parliamentary',
    shortName: 'BP',
    description: 'Four-team format with Opening and Closing Government/Opposition',
    teamsPerDebate: 4,
    speakersPerTeam: 2,
    teamRoles: [
      {
        name: 'Opening Government',
        position: 1,
        description: 'Defines the motion and presents the government case',
        speakingOrder: 1,
        speakingTime: { minutes: 7, seconds: 0, protected: 60 }
      },
      {
        name: 'Opening Opposition',
        position: 2,
        description: 'Refutes government case and presents opposition',
        speakingOrder: 2,
        speakingTime: { minutes: 8, seconds: 0, protected: 60 }
      },
      {
        name: 'Closing Government',
        position: 3,
        description: 'Extends government case with new material',
        speakingOrder: 3,
        speakingTime: { minutes: 8, seconds: 0, protected: 60 }
      },
      {
        name: 'Closing Opposition',
        position: 4,
        description: 'Extends opposition case and provides summary',
        speakingOrder: 4,
        speakingTime: { minutes: 7, seconds: 0, protected: 60 }
      }
    ],
    totalSpeakingTime: { minutes: 30, seconds: 0 },
    
    drawRules: {
      method: 'power_pairing',
      avoidInstitutionClashes: true,
      balanceExperience: true,
      minTeamsForTournament: 4,
      maxTeamsForTournament: 400,
      roomsRequired: (teamCount) => Math.floor(teamCount / 4)
    },
    
    breakStructure: {
      supportedBreaks: ['finals', 'semis', 'quarters', 'octofinals'],
      defaultBreakSize: 16,
      qualificationCriteria: 'combined',
      tieBreakers: ['team_points', 'speaker_scores', 'opposition_strength', 'head_to_head']
    },
    
    scoring: {
      teamScoring: {
        winPoints: 3,
        lossPoints: 0,
        drawPoints: 1,
        maxTeamScore: 3,
        minTeamScore: 0
      },
      speakerScoring: {
        maxSpeakerScore: 100,
        minSpeakerScore: 50,
        increment: 1,
        averageExpected: 75
      },
      judgeScoring: {
        requireRanking: true,
        allowTies: false,
        scoringCriteria: ['content', 'style', 'strategy']
      }
    },
    
    roomSetup: {
      seatingArrangement: 'Parliamentary (opposing benches)',
      requiredEquipment: ['Timer', 'Bell', 'Water'],
      timekeeper: true,
      chairRequired: true
    },
    
    adjudication: {
      minJudges: 1,
      maxJudges: 5,
      panelComposition: 'Odd number preferred',
      conflictRules: ['institution', 'coaching', 'personal'],
      experienceRequirements: ['Familiar with BP format', 'Parliamentary procedure knowledge']
    },
    
    motions: {
      types: ['Policy', 'Value', 'Fact'],
      preparationTime: 15,
      informationSlide: true,
      motionRelease: 'before_round'
    },
    
    scheduling: {
      roundsPerDay: 5,
      timeBetweenRounds: 90,
      preparationTime: 15,
      debateLength: 60
    }
  },

  // World Schools Debate Championship (WSDC)
  wsdc: {
    name: 'World Schools Debate Championship',
    shortName: 'WSDC',
    description: 'Three-speaker format with prepared and impromptu motions',
    teamsPerDebate: 2,
    speakersPerTeam: 3,
    teamRoles: [
      {
        name: 'Proposition',
        position: 1,
        description: 'Supports the motion',
        speakingOrder: 1,
        speakingTime: { minutes: 8, seconds: 0, protected: 60 }
      },
      {
        name: 'Opposition',
        position: 2,
        description: 'Opposes the motion',
        speakingOrder: 2,
        speakingTime: { minutes: 8, seconds: 0, protected: 60 }
      }
    ],
    totalSpeakingTime: { minutes: 52, seconds: 0 }, // 6x8min + 2x2min replies
    
    drawRules: {
      method: 'power_pairing',
      avoidInstitutionClashes: true,
      balanceExperience: false,
      minTeamsForTournament: 4,
      maxTeamsForTournament: 64,
      roomsRequired: (teamCount) => Math.floor(teamCount / 2)
    },
    
    breakStructure: {
      supportedBreaks: ['finals', 'semis', 'quarters', 'octofinals'],
      defaultBreakSize: 8,
      qualificationCriteria: 'wins',
      tieBreakers: ['head_to_head', 'speaker_scores', 'margin']
    },
    
    scoring: {
      teamScoring: {
        winPoints: 1,
        lossPoints: 0,
        maxTeamScore: 1,
        minTeamScore: 0
      },
      speakerScoring: {
        maxSpeakerScore: 100,
        minSpeakerScore: 60,
        increment: 1,
        averageExpected: 75
      },
      judgeScoring: {
        requireRanking: false,
        allowTies: false,
        scoringCriteria: ['content', 'style', 'strategy', 'POI_handling']
      }
    },
    
    roomSetup: {
      seatingArrangement: 'Traditional (facing each other)',
      requiredEquipment: ['Timer', 'Bell', 'Water', 'POI cards'],
      timekeeper: true,
      chairRequired: true
    },
    
    adjudication: {
      minJudges: 1,
      maxJudges: 3,
      panelComposition: 'Odd number required',
      conflictRules: ['nationality', 'institution', 'coaching'],
      experienceRequirements: ['WSDC training', 'International experience preferred']
    },
    
    motions: {
      types: ['Prepared', 'Impromptu'],
      preparationTime: 60, // 1 hour for prepared, 1 hour for impromptu
      informationSlide: false,
      motionRelease: 'prepared'
    },
    
    scheduling: {
      roundsPerDay: 3,
      timeBetweenRounds: 120,
      preparationTime: 60,
      debateLength: 90
    }
  },

  // American Parliamentary (AP)
  ap: {
    name: 'American Parliamentary',
    shortName: 'AP',
    description: 'Two-team format with government and opposition',
    teamsPerDebate: 2,
    speakersPerTeam: 2,
    teamRoles: [
      {
        name: 'Government',
        position: 1,
        description: 'Supports the motion',
        speakingOrder: 1,
        speakingTime: { minutes: 7, seconds: 0, protected: 60 }
      },
      {
        name: 'Opposition',
        position: 2,
        description: 'Opposes the motion',
        speakingOrder: 2,
        speakingTime: { minutes: 8, seconds: 0, protected: 60 }
      }
    ],
    totalSpeakingTime: { minutes: 30, seconds: 0 },
    
    drawRules: {
      method: 'power_pairing',
      avoidInstitutionClashes: true,
      balanceExperience: true,
      minTeamsForTournament: 4,
      maxTeamsForTournament: 200,
      roomsRequired: (teamCount) => Math.floor(teamCount / 2)
    },
    
    breakStructure: {
      supportedBreaks: ['finals', 'semis', 'quarters'],
      defaultBreakSize: 8,
      qualificationCriteria: 'wins',
      tieBreakers: ['speaker_scores', 'head_to_head', 'opposition_strength']
    },
    
    scoring: {
      teamScoring: {
        winPoints: 1,
        lossPoints: 0,
        maxTeamScore: 1,
        minTeamScore: 0
      },
      speakerScoring: {
        maxSpeakerScore: 30,
        minSpeakerScore: 20,
        increment: 0.5,
        averageExpected: 25
      },
      judgeScoring: {
        requireRanking: false,
        allowTies: false,
        scoringCriteria: ['content', 'style', 'strategy']
      }
    },
    
    roomSetup: {
      seatingArrangement: 'Parliamentary style',
      requiredEquipment: ['Timer', 'Bell', 'Water'],
      timekeeper: true,
      chairRequired: false
    },
    
    adjudication: {
      minJudges: 1,
      maxJudges: 3,
      panelComposition: 'Odd number preferred',
      conflictRules: ['institution', 'coaching'],
      experienceRequirements: ['Parliamentary debate experience']
    },
    
    motions: {
      types: ['Policy', 'Value', 'Fact'],
      preparationTime: 20,
      informationSlide: false,
      motionRelease: 'before_round'
    },
    
    scheduling: {
      roundsPerDay: 6,
      timeBetweenRounds: 75,
      preparationTime: 20,
      debateLength: 50
    }
  },

  // Canadian Parliamentary (CP)
  cp: {
    name: 'Canadian Parliamentary',
    shortName: 'CP',
    description: 'Similar to BP but with Canadian modifications',
    teamsPerDebate: 4,
    speakersPerTeam: 2,
    teamRoles: [
      {
        name: 'Government Member',
        position: 1,
        description: 'Defines and supports the motion',
        speakingOrder: 1,
        speakingTime: { minutes: 7, seconds: 0, protected: 60 }
      },
      {
        name: 'Opposition Member',
        position: 2,
        description: 'Refutes government case',
        speakingOrder: 2,
        speakingTime: { minutes: 8, seconds: 0, protected: 60 }
      },
      {
        name: 'Government Whip',
        position: 3,
        description: 'Extends government case',
        speakingOrder: 3,
        speakingTime: { minutes: 8, seconds: 0, protected: 60 }
      },
      {
        name: 'Opposition Whip',
        position: 4,
        description: 'Extends opposition and summarizes',
        speakingOrder: 4,
        speakingTime: { minutes: 7, seconds: 0, protected: 60 }
      }
    ],
    totalSpeakingTime: { minutes: 30, seconds: 0 },
    
    drawRules: {
      method: 'power_pairing',
      avoidInstitutionClashes: true,
      balanceExperience: true,
      minTeamsForTournament: 4,
      maxTeamsForTournament: 300,
      roomsRequired: (teamCount) => Math.floor(teamCount / 4)
    },
    
    breakStructure: {
      supportedBreaks: ['finals', 'semis', 'quarters'],
      defaultBreakSize: 16,
      qualificationCriteria: 'combined',
      tieBreakers: ['team_points', 'speaker_scores', 'head_to_head']
    },
    
    scoring: {
      teamScoring: {
        winPoints: 3,
        lossPoints: 0,
        drawPoints: 1,
        maxTeamScore: 3,
        minTeamScore: 0
      },
      speakerScoring: {
        maxSpeakerScore: 100,
        minSpeakerScore: 50,
        increment: 1,
        averageExpected: 75
      },
      judgeScoring: {
        requireRanking: true,
        allowTies: false,
        scoringCriteria: ['content', 'style', 'strategy']
      }
    },
    
    roomSetup: {
      seatingArrangement: 'Parliamentary (House of Commons style)',
      requiredEquipment: ['Timer', 'Bell', 'Water'],
      timekeeper: true,
      chairRequired: true
    },
    
    adjudication: {
      minJudges: 1,
      maxJudges: 5,
      panelComposition: 'Odd number preferred',
      conflictRules: ['institution', 'coaching', 'personal'],
      experienceRequirements: ['Parliamentary debate experience', 'CP format knowledge']
    },
    
    motions: {
      types: ['Policy', 'Value'],
      preparationTime: 15,
      informationSlide: true,
      motionRelease: 'before_round'
    },
    
    scheduling: {
      roundsPerDay: 5,
      timeBetweenRounds: 90,
      preparationTime: 15,
      debateLength: 60
    }
  },

  // Public Forum (PF)
  pf: {
    name: 'Public Forum',
    shortName: 'PF',
    description: 'Accessible format designed for public understanding',
    teamsPerDebate: 2,
    speakersPerTeam: 2,
    teamRoles: [
      {
        name: 'Pro',
        position: 1,
        description: 'Supports the resolution',
        speakingOrder: 1,
        speakingTime: { minutes: 4, seconds: 0 }
      },
      {
        name: 'Con',
        position: 2,
        description: 'Opposes the resolution',
        speakingOrder: 2,
        speakingTime: { minutes: 4, seconds: 0 }
      }
    ],
    totalSpeakingTime: { minutes: 24, seconds: 0 },
    
    drawRules: {
      method: 'random',
      avoidInstitutionClashes: true,
      balanceExperience: false,
      minTeamsForTournament: 4,
      maxTeamsForTournament: 100,
      roomsRequired: (teamCount) => Math.floor(teamCount / 2)
    },
    
    breakStructure: {
      supportedBreaks: ['finals', 'semis', 'quarters'],
      defaultBreakSize: 8,
      qualificationCriteria: 'wins',
      tieBreakers: ['head_to_head', 'speaker_points', 'record_vs_common_opponents']
    },
    
    scoring: {
      teamScoring: {
        winPoints: 1,
        lossPoints: 0,
        maxTeamScore: 1,
        minTeamScore: 0
      },
      speakerScoring: {
        maxSpeakerScore: 30,
        minSpeakerScore: 20,
        increment: 0.1,
        averageExpected: 27
      },
      judgeScoring: {
        requireRanking: false,
        allowTies: false,
        scoringCriteria: ['argumentation', 'evidence', 'refutation', 'delivery']
      }
    },
    
    roomSetup: {
      seatingArrangement: 'Traditional classroom',
      requiredEquipment: ['Timer', 'Flip chart'],
      timekeeper: true,
      chairRequired: false
    },
    
    adjudication: {
      minJudges: 1,
      maxJudges: 3,
      panelComposition: 'Any number',
      conflictRules: ['school', 'coaching'],
      experienceRequirements: ['Basic debate knowledge', 'PF format familiarity']
    },
    
    motions: {
      types: ['Policy', 'Current events'],
      preparationTime: 0,
      informationSlide: false,
      motionRelease: 'prepared'
    },
    
    scheduling: {
      roundsPerDay: 6,
      timeBetweenRounds: 45,
      preparationTime: 0,
      debateLength: 45
    }
  },

  // Lincoln-Douglas (LD)
  ld: {
    name: 'Lincoln-Douglas',
    shortName: 'LD',
    description: 'One-on-one value debate format',
    teamsPerDebate: 2,
    speakersPerTeam: 1,
    teamRoles: [
      {
        name: 'Affirmative',
        position: 1,
        description: 'Supports the resolution',
        speakingOrder: 1,
        speakingTime: { minutes: 6, seconds: 0 }
      },
      {
        name: 'Negative',
        position: 2,
        description: 'Opposes the resolution',
        speakingOrder: 2,
        speakingTime: { minutes: 7, seconds: 0 }
      }
    ],
    totalSpeakingTime: { minutes: 26, seconds: 0 },
    
    drawRules: {
      method: 'random',
      avoidInstitutionClashes: false,
      balanceExperience: false,
      minTeamsForTournament: 4,
      maxTeamsForTournament: 64,
      roomsRequired: (teamCount) => Math.floor(teamCount / 2)
    },
    
    breakStructure: {
      supportedBreaks: ['finals', 'semis', 'quarters'],
      defaultBreakSize: 8,
      qualificationCriteria: 'wins',
      tieBreakers: ['head_to_head', 'speaker_points', 'total_wins']
    },
    
    scoring: {
      teamScoring: {
        winPoints: 1,
        lossPoints: 0,
        maxTeamScore: 1,
        minTeamScore: 0
      },
      speakerScoring: {
        maxSpeakerScore: 30,
        minSpeakerScore: 20,
        increment: 0.1,
        averageExpected: 27
      },
      judgeScoring: {
        requireRanking: false,
        allowTies: false,
        scoringCriteria: ['value_criterion', 'argumentation', 'refutation', 'delivery']
      }
    },
    
    roomSetup: {
      seatingArrangement: 'Traditional classroom',
      requiredEquipment: ['Timer'],
      timekeeper: true,
      chairRequired: false
    },
    
    adjudication: {
      minJudges: 1,
      maxJudges: 3,
      panelComposition: 'Any number',
      conflictRules: ['school', 'coaching'],
      experienceRequirements: ['Philosophy background helpful', 'LD format knowledge']
    },
    
    motions: {
      types: ['Value', 'Philosophical'],
      preparationTime: 0,
      informationSlide: false,
      motionRelease: 'prepared'
    },
    
    scheduling: {
      roundsPerDay: 6,
      timeBetweenRounds: 30,
      preparationTime: 0,
      debateLength: 45
    }
  },

  // Policy Debate
  policy: {
    name: 'Policy Debate',
    shortName: 'Policy',
    description: 'Evidence-based policy analysis format',
    teamsPerDebate: 2,
    speakersPerTeam: 2,
    teamRoles: [
      {
        name: 'Affirmative',
        position: 1,
        description: 'Supports the resolution with a plan',
        speakingOrder: 1,
        speakingTime: { minutes: 8, seconds: 0 }
      },
      {
        name: 'Negative',
        position: 2,
        description: 'Opposes the affirmative plan',
        speakingOrder: 2,
        speakingTime: { minutes: 8, seconds: 0 }
      }
    ],
    totalSpeakingTime: { minutes: 48, seconds: 0 }, // 8 constructive + 5 rebuttal speeches
    
    drawRules: {
      method: 'random',
      avoidInstitutionClashes: true,
      balanceExperience: false,
      minTeamsForTournament: 4,
      maxTeamsForTournament: 100,
      roomsRequired: (teamCount) => Math.floor(teamCount / 2)
    },
    
    breakStructure: {
      supportedBreaks: ['finals', 'semis', 'quarters'],
      defaultBreakSize: 8,
      qualificationCriteria: 'wins',
      tieBreakers: ['head_to_head', 'speaker_points', 'total_wins']
    },
    
    scoring: {
      teamScoring: {
        winPoints: 1,
        lossPoints: 0,
        maxTeamScore: 1,
        minTeamScore: 0
      },
      speakerScoring: {
        maxSpeakerScore: 30,
        minSpeakerScore: 20,
        increment: 0.1,
        averageExpected: 27.5
      },
      judgeScoring: {
        requireRanking: false,
        allowTies: false,
        scoringCriteria: ['stock_issues', 'evidence_quality', 'argumentation', 'refutation']
      }
    },
    
    roomSetup: {
      seatingArrangement: 'Traditional classroom with evidence tables',
      requiredEquipment: ['Timer', 'Evidence tables', 'Power outlets'],
      timekeeper: true,
      chairRequired: false
    },
    
    adjudication: {
      minJudges: 1,
      maxJudges: 3,
      panelComposition: 'Any number',
      conflictRules: ['school', 'coaching'],
      experienceRequirements: ['Policy debate experience', 'Evidence evaluation skills']
    },
    
    motions: {
      types: ['Policy'],
      preparationTime: 0,
      informationSlide: false,
      motionRelease: 'prepared'
    },
    
    scheduling: {
      roundsPerDay: 4,
      timeBetweenRounds: 60,
      preparationTime: 0,
      debateLength: 90
    }
  }
};

/**
 * Utility functions for working with debate formats
 */
export class FormatUtils {
  /**
   * Get format specification by format code
   */
  static getFormat(format: DebateFormat): FormatSpecification {
    return DEBATE_FORMATS[format];
  }

  /**
   * Calculate required rooms for a tournament
   */
  static calculateRooms(format: DebateFormat, teamCount: number): number {
    const formatSpec = DEBATE_FORMATS[format];
    return formatSpec.drawRules.roomsRequired(teamCount);
  }

  /**
   * Validate tournament setup against format constraints
   */
  static validateTournamentSetup(
    format: DebateFormat,
    teamCount: number,
    judgeCount: number,
    roundCount: number
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const formatSpec = DEBATE_FORMATS[format];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Team count validation
    if (teamCount < formatSpec.drawRules.minTeamsForTournament) {
      errors.push(`Minimum ${formatSpec.drawRules.minTeamsForTournament} teams required for ${formatSpec.name}`);
    }
    if (teamCount > formatSpec.drawRules.maxTeamsForTournament) {
      errors.push(`Maximum ${formatSpec.drawRules.maxTeamsForTournament} teams allowed for ${formatSpec.name}`);
    }

    // Judge count validation
    const requiredRooms = formatSpec.drawRules.roomsRequired(teamCount);
    const minJudgesRequired = requiredRooms * formatSpec.adjudication.minJudges;
    if (judgeCount < minJudgesRequired) {
      errors.push(`Minimum ${minJudgesRequired} judges required (${formatSpec.adjudication.minJudges} per room)`);
    }

    // Round count validation
    const maxRoundsPerDay = formatSpec.scheduling.roundsPerDay;
    if (roundCount > maxRoundsPerDay) {
      warnings.push(`${roundCount} rounds exceeds recommended ${maxRoundsPerDay} rounds per day for ${formatSpec.name}`);
    }

    // Format-specific validations
    if (format === 'bp' && teamCount % 4 !== 0) {
      warnings.push('Team count not divisible by 4 - some teams may need to sit out or swing teams will be used');
    }
    if ((format === 'wsdc' || format === 'ap') && teamCount % 2 !== 0) {
      warnings.push('Odd number of teams - one team will sit out each round');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get recommended break size for format and team count
   */
  static getRecommendedBreakSize(format: DebateFormat, teamCount: number): number {
    const formatSpec = DEBATE_FORMATS[format];
    const defaultBreak = formatSpec.breakStructure.defaultBreakSize;
    
    // Adjust break size based on team count
    if (teamCount < defaultBreak) {
      return Math.max(4, Math.floor(teamCount / 2));
    }
    
    return defaultBreak;
  }

  /**
   * Calculate tournament duration
   */
  static calculateTournamentDuration(
    format: DebateFormat,
    roundCount: number
  ): { hours: number; minutes: number } {
    const formatSpec = DEBATE_FORMATS[format];
    const totalMinutes = roundCount * (
      formatSpec.scheduling.debateLength + 
      formatSpec.scheduling.timeBetweenRounds
    );
    
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60
    };
  }

  /**
   * Get all available formats
   */
  static getAllFormats(): { code: DebateFormat; name: string; description: string }[] {
    return Object.entries(DEBATE_FORMATS).map(([code, spec]) => ({
      code: code as DebateFormat,
      name: spec.name,
      description: spec.description
    }));
  }

  /**
   * Check if format supports specific features
   */
  static supportsFeature(format: DebateFormat, feature: string): boolean {
    const formatSpec = DEBATE_FORMATS[format];
    
    switch (feature) {
      case 'information_slide':
        return formatSpec.motions.informationSlide;
      case 'preparation_time':
        return formatSpec.motions.preparationTime > 0;
      case 'team_ranking':
        return formatSpec.scoring.judgeScoring.requireRanking;
      case 'draw_points':
        return formatSpec.scoring.teamScoring.drawPoints !== undefined;
      default:
        return false;
    }
  }
}

/**
 * Format-specific draw generation options
 */
export interface FormatDrawOptions {
  format: DebateFormat;
  avoidInstitutionClashes: boolean;
  balanceExperience: boolean;
  method: 'random' | 'power_pairing' | 'swiss' | 'balanced';
  customRooms?: string[];
}

/**
 * Format-specific scoring templates
 */
export interface FormatScoringTemplate {
  format: DebateFormat;
  teamScoring: {
    positions: string[];
    pointsPerPosition: number[];
    allowTies: boolean;
  };
  speakerScoring: {
    minScore: number;
    maxScore: number;
    increment: number;
    criteria: string[];
  };
}