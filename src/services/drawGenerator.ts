import { Team, Draw, Round } from "@/types/tournament";

interface PositionHistory {
  OG: number;
  OO: number;
  CG: number;
  CO: number;
}

interface TeamWithHistory extends Team {
  positionHistory: PositionHistory;
  points: number;
}

interface DrawAssignment {
  room: string;
  teams: {
    OG: TeamWithHistory;
    OO: TeamWithHistory;
    CG: TeamWithHistory;
    CO: TeamWithHistory;
  };
}

export class DrawGenerator {
  private teams: TeamWithHistory[];
  private roundNumber: number;
  private rooms: string[];
  private positionCostExponent: number = 4; // Default value from Tabbycat
  private renyiOrder: number = 1; // Default to Shannon entropy

  constructor(teams: Team[], roundNumber: number, rooms: string[]) {
    if (!teams || !Array.isArray(teams) || teams.length === 0) {
      throw new Error('Teams array is required and must not be empty');
    }
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      throw new Error('Rooms array is required and must not be empty');
    }
    if (typeof roundNumber !== 'number' || roundNumber < 1) {
      throw new Error('Round number must be a positive number');
    }

    this.teams = teams.map(team => ({
      ...team,
      positionHistory: { OG: 0, OO: 0, CG: 0, CO: 0 },
      points: 0 // This should be calculated based on previous rounds
    }));
    this.roundNumber = roundNumber;
    this.rooms = rooms;
  }

  // Calculate position cost using Rényi entropy
  private calculatePositionCost(history: PositionHistory, position: keyof PositionHistory): number {
    const hypotheticalHistory = { ...history };
    hypotheticalHistory[position]++;

    const totalRounds = Object.values(hypotheticalHistory).reduce((a, b) => a + b, 0);
    const probabilities = Object.values(hypotheticalHistory).map(h => h / totalRounds);

    if (this.renyiOrder === 1) {
      // Shannon entropy
      return -probabilities.reduce((sum, p) => sum + p * Math.log2(p), 0);
    } else {
      // Rényi entropy
      const sum = probabilities.reduce((sum, p) => sum + Math.pow(p, this.renyiOrder), 0);
      return (1 / (1 - this.renyiOrder)) * Math.log2(sum);
    }
  }

  // Create cost matrix for Hungarian algorithm
  private createCostMatrix(): number[][] {
    const matrix: number[][] = [];
    const positions: (keyof PositionHistory)[] = ['OG', 'OO', 'CG', 'CO'];

    this.teams.forEach(team => {
      const row: number[] = [];
      this.rooms.forEach(room => {
        positions.forEach(position => {
          const cost = Math.pow(this.calculatePositionCost(team.positionHistory, position), this.positionCostExponent);
          row.push(cost);
        });
      });
      matrix.push(row);
    });

    return matrix;
  }

  // Generate draws with preshuffling
  public generateDraws(): DrawAssignment[] {
    // 1. Check for valid team count (BP format expects at least 4 teams)
    if (this.teams.length < 4) {
      throw new Error(`Not enough teams (${this.teams.length}) for BP format. Need at least 4.`);
    }

    // 2. Shuffle teams (random for first round, or sort by points for later rounds)
    const shuffledTeams = [...this.teams].sort(() => Math.random() - 0.5);

    // 3. Calculate number of full rooms
    const numRooms = Math.floor(shuffledTeams.length / 4);
    const draws: DrawAssignment[] = [];
    const positions: (keyof PositionHistory)[] = ['OG', 'OO', 'CG', 'CO'];

    for (let i = 0; i < numRooms; i++) {
      const roomTeams: Partial<Record<keyof PositionHistory, TeamWithHistory>> = {};
      for (let j = 0; j < 4; j++) {
        const team = shuffledTeams[i * 4 + j];
        if (!team) continue;
        roomTeams[positions[j]] = team;
      }
      draws.push({
        room: this.rooms[i] || `Room ${i + 1}`,
        teams: roomTeams as DrawAssignment['teams'],
      });
    }

    // 4. Handle leftover teams (assign a bye or log a warning)
    const leftoverTeams = shuffledTeams.slice(numRooms * 4);
    if (leftoverTeams.length > 0) {
      console.warn(`Leftover teams (not enough for a full room):`, leftoverTeams);
      // Optionally, handle byes here
    }

    return draws;
  }

  // Update team histories after a round
  public updateTeamHistories(draws: DrawAssignment[]) {
    draws.forEach(draw => {
      Object.entries(draw.teams).forEach(([position, team]) => {
        const teamIndex = this.teams.findIndex(t => t.id === team.id);
        if (teamIndex !== -1) {
          this.teams[teamIndex].positionHistory[position as keyof PositionHistory]++;
        }
      });
    });
  }
} 