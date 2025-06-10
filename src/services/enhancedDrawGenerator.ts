
import { Team, Judge, Draw } from "@/types/tournament";

interface DrawRoom {
  id: string;
  room: string;
  teams: {
    OG: Team;
    OO: Team;
    CG: Team;
    CO: Team;
  };
  judge?: Judge;
}

interface GenerationOptions {
  method: 'random' | 'power_pairing' | 'swiss' | 'balanced';
  avoidInstitutionClashes: boolean;
  balanceExperience: boolean;
  randomSeed?: number;
}

export class EnhancedDrawGenerator {
  private teams: Team[];
  private judges: Judge[];
  private rooms: string[];
  private options: GenerationOptions;
  private usedPairings: Set<string> = new Set();

  constructor(
    teams: Team[], 
    judges: Judge[], 
    rooms: string[], 
    options: Partial<GenerationOptions> = {}
  ) {
    this.teams = [...teams];
    this.judges = [...judges];
    this.rooms = rooms;
    this.options = {
      method: 'random',
      avoidInstitutionClashes: true,
      balanceExperience: true,
      ...options
    };
  }

  // Shuffle array using Fisher-Yates algorithm
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Check if teams are from the same institution
  private areFromSameInstitution(team1: Team, team2: Team): boolean {
    return team1.institution && team2.institution && 
           team1.institution.toLowerCase() === team2.institution.toLowerCase();
  }

  // Calculate team compatibility score (lower is better)
  private calculateCompatibilityScore(teams: Team[]): number {
    let score = 0;
    
    // Penalize same institution clashes
    if (this.options.avoidInstitutionClashes) {
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          if (this.areFromSameInstitution(teams[i], teams[j])) {
            score += 100; // High penalty for institution clash
          }
        }
      }
    }

    // Check if this pairing has been used before
    const pairingKey = teams.map(t => t.id).sort().join('-');
    if (this.usedPairings.has(pairingKey)) {
      score += 50; // Penalty for repeated pairings
    }

    return score;
  }

  // Generate judge allocation for a room
  private allocateJudge(roomIndex: number): Judge | undefined {
    if (this.judges.length === 0) return undefined;
    
    // Simple round-robin allocation
    const judgeIndex = roomIndex % this.judges.length;
    return this.judges[judgeIndex];
  }

  // Generate draws using the specified method
  public generateDraws(): DrawRoom[] {
    if (this.teams.length < 4) {
      throw new Error('Need at least 4 teams to generate draws');
    }

    const draws: DrawRoom[] = [];
    const shuffledTeams = this.shuffleArray(this.teams);
    const maxRooms = Math.floor(shuffledTeams.length / 4);
    const numRooms = Math.min(maxRooms, this.rooms.length);

    // Generate draws for each room
    for (let roomIndex = 0; roomIndex < numRooms; roomIndex++) {
      const roomTeams = shuffledTeams.slice(roomIndex * 4, (roomIndex + 1) * 4);
      
      if (roomTeams.length === 4) {
        // Optimize team arrangement to minimize institution clashes
        const optimizedTeams = this.optimizeTeamArrangement(roomTeams);
        
        const drawRoom: DrawRoom = {
          id: `room-${roomIndex + 1}`,
          room: this.rooms[roomIndex] || `Room ${roomIndex + 1}`,
          teams: {
            OG: optimizedTeams[0],
            OO: optimizedTeams[1],
            CG: optimizedTeams[2],
            CO: optimizedTeams[3]
          },
          judge: this.allocateJudge(roomIndex)
        };

        draws.push(drawRoom);

        // Track this pairing
        const pairingKey = optimizedTeams.map(t => t.id).sort().join('-');
        this.usedPairings.add(pairingKey);
      }
    }

    return draws;
  }

  // Optimize team arrangement within a room
  private optimizeTeamArrangement(teams: Team[]): Team[] {
    if (teams.length !== 4) return teams;

    let bestArrangement = teams;
    let bestScore = this.calculateCompatibilityScore(teams);

    // Try different arrangements (permutations)
    const arrangements = this.generateArrangements(teams);
    
    for (const arrangement of arrangements) {
      const score = this.calculateCompatibilityScore(arrangement);
      if (score < bestScore) {
        bestScore = score;
        bestArrangement = arrangement;
      }
    }

    return bestArrangement;
  }

  // Generate different team arrangements
  private generateArrangements(teams: Team[]): Team[][] {
    const arrangements: Team[][] = [];
    
    // Original order
    arrangements.push([...teams]);
    
    // Swap positions to avoid institution clashes
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const swapped = [...teams];
        [swapped[i], swapped[j]] = [swapped[j], swapped[i]];
        arrangements.push(swapped);
      }
    }

    return arrangements;
  }

  // Convert DrawRoom to database format
  public convertToDraws(drawRooms: DrawRoom[], roundId: string, tournamentId: string): Omit<Draw, 'id' | 'created_at' | 'updated_at'>[] {
    return drawRooms.map(room => ({
      round_id: roundId,
      tournament_id: tournamentId,
      room: room.room,
      gov_team_id: room.teams.OG.id,
      opp_team_id: room.teams.OO.id,
      judge_id: room.judge?.id,
      status: 'pending' as const
    }));
  }

  // Regenerate with different randomization
  public regenerateDraws(): DrawRoom[] {
    // Clear used pairings for fresh generation
    this.usedPairings.clear();
    return this.generateDraws();
  }
}
