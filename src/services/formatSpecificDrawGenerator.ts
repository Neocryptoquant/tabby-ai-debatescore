import { Team, Judge, Draw } from "@/types/tournament";
import { DebateFormat, DEBATE_FORMATS, FormatDrawOptions } from "@/types/formats";

interface FormatDrawRoom {
  id: string;
  room: string;
  teams: Record<string, Team>;
  judge?: Judge;
  format: DebateFormat;
}

/**
 * Format-specific draw generator that handles different debate formats
 * Extends the base draw generator with format-specific logic
 */
export class FormatSpecificDrawGenerator {
  private teams: Team[];
  private judges: Judge[];
  private rooms: string[];
  private options: FormatDrawOptions;
  private formatSpec: any;

  constructor(
    teams: Team[],
    judges: Judge[],
    rooms: string[],
    options: FormatDrawOptions
  ) {
    this.teams = [...teams];
    this.judges = [...judges];
    this.rooms = options.customRooms || rooms;
    this.options = options;
    this.formatSpec = DEBATE_FORMATS[options.format];
  }

  /**
   * Generate draws based on the specified format
   */
  public generateDraws(): FormatDrawRoom[] {
    switch (this.options.format) {
      case 'bp':
        return this.generateBPDraws();
      case 'wsdc':
        return this.generateWSDCDraws();
      case 'ap':
        return this.generateAPDraws();
      case 'cp':
        return this.generateCPDraws();
      case 'pf':
        return this.generatePFDraws();
      case 'ld':
        return this.generateLDDraws();
      case 'policy':
        return this.generatePolicyDraws();
      default:
        throw new Error(`Unsupported format: ${this.options.format}`);
    }
  }

  /**
   * British Parliamentary draws (4 teams per room)
   */
  private generateBPDraws(): FormatDrawRoom[] {
    const draws: FormatDrawRoom[] = [];
    const shuffledTeams = this.shuffleArray(this.teams);
    const numRooms = Math.floor(shuffledTeams.length / 4);

    for (let roomIndex = 0; roomIndex < numRooms; roomIndex++) {
      const roomTeams: Team[] = [];
      
      // Get 4 teams for this room
      for (let i = 0; i < 4; i++) {
        const teamIndex = roomIndex * 4 + i;
        if (teamIndex < shuffledTeams.length) {
          roomTeams.push(shuffledTeams[teamIndex]);
        } else {
          // Create swing team if needed
          roomTeams.push(this.createSwingTeam(i));
        }
      }

      // Optimize team arrangement to minimize institution clashes
      const optimizedTeams = this.optimizeTeamArrangement(roomTeams);

      const drawRoom: FormatDrawRoom = {
        id: `room-${roomIndex + 1}`,
        room: this.rooms[roomIndex] || `Room ${roomIndex + 1}`,
        teams: {
          OG: optimizedTeams[0], // Opening Government
          OO: optimizedTeams[1], // Opening Opposition
          CG: optimizedTeams[2], // Closing Government
          CO: optimizedTeams[3]  // Closing Opposition
        },
        judge: this.allocateJudge(roomIndex),
        format: 'bp'
      };

      draws.push(drawRoom);
    }

    return draws;
  }

  /**
   * World Schools Debate Championship draws (2 teams per room)
   */
  private generateWSDCDraws(): FormatDrawRoom[] {
    const draws: FormatDrawRoom[] = [];
    const shuffledTeams = this.shuffleArray(this.teams);
    const numRooms = Math.floor(shuffledTeams.length / 2);

    for (let roomIndex = 0; roomIndex < numRooms; roomIndex++) {
      const propTeam = shuffledTeams[roomIndex * 2];
      const oppTeam = shuffledTeams[roomIndex * 2 + 1];

      if (!propTeam || !oppTeam) continue;

      const drawRoom: FormatDrawRoom = {
        id: `room-${roomIndex + 1}`,
        room: this.rooms[roomIndex] || `Room ${roomIndex + 1}`,
        teams: {
          Proposition: propTeam,
          Opposition: oppTeam
        },
        judge: this.allocateJudge(roomIndex),
        format: 'wsdc'
      };

      draws.push(drawRoom);
    }

    return draws;
  }

  /**
   * American Parliamentary draws (2 teams per room)
   */
  private generateAPDraws(): FormatDrawRoom[] {
    const draws: FormatDrawRoom[] = [];
    const shuffledTeams = this.shuffleArray(this.teams);
    const numRooms = Math.floor(shuffledTeams.length / 2);

    for (let roomIndex = 0; roomIndex < numRooms; roomIndex++) {
      const govTeam = shuffledTeams[roomIndex * 2];
      const oppTeam = shuffledTeams[roomIndex * 2 + 1];

      if (!govTeam || !oppTeam) continue;

      const drawRoom: FormatDrawRoom = {
        id: `room-${roomIndex + 1}`,
        room: this.rooms[roomIndex] || `Room ${roomIndex + 1}`,
        teams: {
          Government: govTeam,
          Opposition: oppTeam
        },
        judge: this.allocateJudge(roomIndex),
        format: 'ap'
      };

      draws.push(drawRoom);
    }

    return draws;
  }

  /**
   * Canadian Parliamentary draws (4 teams per room)
   */
  private generateCPDraws(): FormatDrawRoom[] {
    const draws: FormatDrawRoom[] = [];
    const shuffledTeams = this.shuffleArray(this.teams);
    const numRooms = Math.floor(shuffledTeams.length / 4);

    for (let roomIndex = 0; roomIndex < numRooms; roomIndex++) {
      const roomTeams: Team[] = [];
      
      for (let i = 0; i < 4; i++) {
        const teamIndex = roomIndex * 4 + i;
        if (teamIndex < shuffledTeams.length) {
          roomTeams.push(shuffledTeams[teamIndex]);
        } else {
          roomTeams.push(this.createSwingTeam(i));
        }
      }

      const drawRoom: FormatDrawRoom = {
        id: `room-${roomIndex + 1}`,
        room: this.rooms[roomIndex] || `Room ${roomIndex + 1}`,
        teams: {
          'Government Member': roomTeams[0],
          'Opposition Member': roomTeams[1],
          'Government Whip': roomTeams[2],
          'Opposition Whip': roomTeams[3]
        },
        judge: this.allocateJudge(roomIndex),
        format: 'cp'
      };

      draws.push(drawRoom);
    }

    return draws;
  }

  /**
   * Public Forum draws (2 teams per room)
   */
  private generatePFDraws(): FormatDrawRoom[] {
    const draws: FormatDrawRoom[] = [];
    const shuffledTeams = this.shuffleArray(this.teams);
    const numRooms = Math.floor(shuffledTeams.length / 2);

    for (let roomIndex = 0; roomIndex < numRooms; roomIndex++) {
      const proTeam = shuffledTeams[roomIndex * 2];
      const conTeam = shuffledTeams[roomIndex * 2 + 1];

      if (!proTeam || !conTeam) continue;

      const drawRoom: FormatDrawRoom = {
        id: `room-${roomIndex + 1}`,
        room: this.rooms[roomIndex] || `Room ${roomIndex + 1}`,
        teams: {
          Pro: proTeam,
          Con: conTeam
        },
        judge: this.allocateJudge(roomIndex),
        format: 'pf'
      };

      draws.push(drawRoom);
    }

    return draws;
  }

  /**
   * Lincoln-Douglas draws (2 individuals per room)
   */
  private generateLDDraws(): FormatDrawRoom[] {
    const draws: FormatDrawRoom[] = [];
    const shuffledTeams = this.shuffleArray(this.teams);
    const numRooms = Math.floor(shuffledTeams.length / 2);

    for (let roomIndex = 0; roomIndex < numRooms; roomIndex++) {
      const affTeam = shuffledTeams[roomIndex * 2];
      const negTeam = shuffledTeams[roomIndex * 2 + 1];

      if (!affTeam || !negTeam) continue;

      const drawRoom: FormatDrawRoom = {
        id: `room-${roomIndex + 1}`,
        room: this.rooms[roomIndex] || `Room ${roomIndex + 1}`,
        teams: {
          Affirmative: affTeam,
          Negative: negTeam
        },
        judge: this.allocateJudge(roomIndex),
        format: 'ld'
      };

      draws.push(drawRoom);
    }

    return draws;
  }

  /**
   * Policy Debate draws (2 teams per room)
   */
  private generatePolicyDraws(): FormatDrawRoom[] {
    const draws: FormatDrawRoom[] = [];
    const shuffledTeams = this.shuffleArray(this.teams);
    const numRooms = Math.floor(shuffledTeams.length / 2);

    for (let roomIndex = 0; roomIndex < numRooms; roomIndex++) {
      const affTeam = shuffledTeams[roomIndex * 2];
      const negTeam = shuffledTeams[roomIndex * 2 + 1];

      if (!affTeam || !negTeam) continue;

      const drawRoom: FormatDrawRoom = {
        id: `room-${roomIndex + 1}`,
        room: this.rooms[roomIndex] || `Room ${roomIndex + 1}`,
        teams: {
          Affirmative: affTeam,
          Negative: negTeam
        },
        judge: this.allocateJudge(roomIndex),
        format: 'policy'
      };

      draws.push(drawRoom);
    }

    return draws;
  }

  /**
   * Utility methods
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private createSwingTeam(index: number): Team {
    return {
      id: `swing-${index}`,
      tournament_id: this.teams[0]?.tournament_id || 'unknown',
      name: `Swing Team ${String.fromCharCode(65 + index)}`,
      institution: 'Swing',
      speaker_1: 'Swing Speaker 1',
      speaker_2: 'Swing Speaker 2'
    };
  }

  private allocateJudge(roomIndex: number): Judge | undefined {
    if (this.judges.length === 0) return undefined;
    const judgeIndex = roomIndex % this.judges.length;
    return this.judges[judgeIndex];
  }

  private optimizeTeamArrangement(teams: Team[]): Team[] {
    if (!this.options.avoidInstitutionClashes) return teams;

    let bestArrangement = teams;
    let bestScore = this.calculateInstitutionClashScore(teams);

    // Try different arrangements to minimize institution clashes
    const arrangements = this.generateArrangements(teams);
    
    for (const arrangement of arrangements) {
      const score = this.calculateInstitutionClashScore(arrangement);
      if (score < bestScore) {
        bestScore = score;
        bestArrangement = arrangement;
      }
    }

    return bestArrangement;
  }

  private calculateInstitutionClashScore(teams: Team[]): number {
    let score = 0;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        if (this.areFromSameInstitution(teams[i], teams[j])) {
          score += 100; // High penalty for institution clash
        }
      }
    }
    return score;
  }

  private areFromSameInstitution(team1: Team, team2: Team): boolean {
    return team1.institution && team2.institution && 
           team1.institution.toLowerCase() === team2.institution.toLowerCase();
  }

  private generateArrangements(teams: Team[]): Team[][] {
    const arrangements: Team[][] = [];
    arrangements.push([...teams]);
    
    // Generate some permutations to try different arrangements
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const swapped = [...teams];
        [swapped[i], swapped[j]] = [swapped[j], swapped[i]];
        arrangements.push(swapped);
      }
    }

    return arrangements;
  }

  /**
   * Convert format-specific draws to database format
   */
  public convertToDraws(drawRooms: FormatDrawRoom[], roundId: string, tournamentId: string): Omit<Draw, 'id' | 'created_at' | 'updated_at'>[] {
    return drawRooms.map(room => {
      const teamEntries = Object.entries(room.teams);
      
      // For BP format, map to existing database structure
      if (room.format === 'bp') {
        return {
          round_id: roundId,
          tournament_id: tournamentId,
          room: room.room,
          gov_team_id: room.teams.OG?.id || '',
          opp_team_id: room.teams.OO?.id || '',
          cg_team_id: room.teams.CG?.id,
          co_team_id: room.teams.CO?.id,
          judge_id: room.judge?.id,
          judge: room.judge?.name,
          status: 'pending' as const,
          gov_score: null,
          opp_score: null,
          generation_history_id: null
        };
      }
      
      // For other formats, use gov/opp mapping
      return {
        round_id: roundId,
        tournament_id: tournamentId,
        room: room.room,
        gov_team_id: teamEntries[0]?.[1]?.id || '',
        opp_team_id: teamEntries[1]?.[1]?.id || '',
        cg_team_id: teamEntries[2]?.[1]?.id,
        co_team_id: teamEntries[3]?.[1]?.id,
        judge_id: room.judge?.id,
        judge: room.judge?.name,
        status: 'pending' as const,
        gov_score: null,
        opp_score: null,
        generation_history_id: null
      };
    });
  }
}
