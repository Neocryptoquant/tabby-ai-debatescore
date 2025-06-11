
import { Team, Judge, Draw } from '@/types/tournament';

interface BPDraw {
  room: string;
  gov_team_id: string;
  opp_team_id: string;
  cg_team_id: string;
  co_team_id: string;
  judge_id?: string;
}

export const generateBPDraws = (
  roundId: string,
  teams: Team[],
  judges: Judge[],
  rooms: string[]
): Omit<Draw, 'id' | 'created_at' | 'updated_at'>[] => {
  if (teams.length < 4) {
    throw new Error('Need at least 4 teams for British Parliamentary draws');
  }

  const numRooms = Math.floor(teams.length / 4);
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
  const shuffledJudges = [...judges].sort(() => Math.random() - 0.5);

  const draws: Omit<Draw, 'id' | 'created_at' | 'updated_at'>[] = [];

  for (let i = 0; i < numRooms; i++) {
    const roomTeams = shuffledTeams.slice(i * 4, (i + 1) * 4);
    
    if (roomTeams.length < 4) continue;

    // Assign positions: Gov, Opp, CG, CO
    const [govTeam, oppTeam, cgTeam, coTeam] = roomTeams;
    
    // Try to avoid institution clashes
    const hasClash = (
      govTeam.institution === oppTeam.institution ||
      cgTeam.institution === coTeam.institution ||
      govTeam.institution === cgTeam.institution ||
      oppTeam.institution === coTeam.institution
    );

    // If there's a clash, try to swap teams
    if (hasClash && i < numRooms - 1) {
      const nextRoomTeams = shuffledTeams.slice((i + 1) * 4, (i + 2) * 4);
      if (nextRoomTeams.length === 4) {
        // Try swapping with next room
        const potentialSwap = nextRoomTeams.find(team => 
          team.institution !== govTeam.institution &&
          team.institution !== oppTeam.institution
        );
        
        if (potentialSwap) {
          const swapIndex = shuffledTeams.findIndex(t => t.id === potentialSwap.id);
          const clashTeamIndex = shuffledTeams.findIndex(t => 
            t.id === cgTeam.id && cgTeam.institution === govTeam.institution
          );
          
          if (swapIndex > -1 && clashTeamIndex > -1) {
            [shuffledTeams[swapIndex], shuffledTeams[clashTeamIndex]] = 
            [shuffledTeams[clashTeamIndex], shuffledTeams[swapIndex]];
          }
        }
      }
    }

    const assignedJudge = shuffledJudges[i % shuffledJudges.length];

    draws.push({
      round_id: roundId,
      tournament_id: govTeam.tournament_id,
      room: rooms[i] || `Room ${i + 1}`,
      gov_team_id: govTeam.id,
      opp_team_id: oppTeam.id,
      cg_team_id: cgTeam.id,
      co_team_id: coTeam.id,
      judge_id: assignedJudge?.id || null,
      judge: assignedJudge?.name || null,
      status: 'pending',
      gov_score: null,
      opp_score: null,
      generation_history_id: null
    });
  }

  return draws;
};
