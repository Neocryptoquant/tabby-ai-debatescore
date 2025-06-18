import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { ballotId } = await req.json()
    
    if (!ballotId) {
      throw new Error('Ballot ID is required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the ballot with related data
    const { data: ballot, error: ballotError } = await supabase
      .from('ballots')
      .select(`
        *,
        draw:draws(*),
        round:rounds(*),
        tournament:tournaments(*)
      `)
      .eq('id', ballotId)
      .single()

    if (ballotError || !ballot) {
      throw new Error('Ballot not found')
    }

    // Only process confirmed ballots
    if (ballot.status !== 'confirmed') {
      return new Response(
        JSON.stringify({ message: 'Ballot is not confirmed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update team standings
    await updateTeamStandings(supabase, ballot)
    
    // Update speaker scores
    await updateSpeakerScores(supabase, ballot)

    return new Response(
      JSON.stringify({ 
        message: 'Standings updated successfully',
        ballotId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error updating standings:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function updateTeamStandings(supabase: any, ballot: any) {
  const tournamentId = ballot.tournament_id
  const roundId = ballot.round_id

  // Get all confirmed ballots for this tournament
  const { data: allBallots, error: ballotsError } = await supabase
    .from('ballots')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('status', 'confirmed')

  if (ballotsError) throw ballotsError

  // Calculate team standings
  const teamStats: Record<string, any> = {}

  for (const ballot of allBallots) {
    // Process team results based on format
    const teams = [
      { id: ballot.gov_team_id, points: ballot.gov_team_points, rank: ballot.gov_team_rank },
      { id: ballot.opp_team_id, points: ballot.opp_team_points, rank: ballot.opp_team_rank }
    ]

    // Add CG/CO teams for BP format
    if (ballot.cg_team_id) {
      teams.push({ id: ballot.cg_team_id, points: ballot.cg_team_points, rank: ballot.cg_team_rank })
    }
    if (ballot.co_team_id) {
      teams.push({ id: ballot.co_team_id, points: ballot.co_team_points, rank: ballot.co_team_rank })
    }

    for (const team of teams) {
      if (!team.id) continue

      if (!teamStats[team.id]) {
        teamStats[team.id] = {
          team_id: team.id,
          tournament_id: tournamentId,
          total_points: 0,
          total_wins: 0,
          total_debates: 0,
          average_points: 0,
          average_rank: 0,
          total_ranks: 0
        }
      }

      teamStats[team.id].total_points += team.points || 0
      teamStats[team.id].total_wins += (team.points || 0) > 1.5 ? 1 : 0
      teamStats[team.id].total_debates += 1
      teamStats[team.id].total_ranks += team.rank || 0
    }
  }

  // Calculate averages
  for (const teamId in teamStats) {
    const stats = teamStats[teamId]
    stats.average_points = stats.total_debates > 0 ? stats.total_points / stats.total_debates : 0
    stats.average_rank = stats.total_debates > 0 ? stats.total_ranks / stats.total_debates : 0
  }

  // Upsert team standings
  for (const teamId in teamStats) {
    const { error: upsertError } = await supabase
      .from('team_standings')
      .upsert(teamStats[teamId], { onConflict: 'team_id,tournament_id' })

    if (upsertError) {
      console.error('Error upserting team standings:', upsertError)
    }
  }
}

async function updateSpeakerScores(supabase: any, ballot: any) {
  // This would update speaker scores if you have a speaker_scores table
  // For now, we'll just log that this would happen
  console.log('Speaker scores update would happen here for ballot:', ballot.id)
  
  // TODO: Implement speaker score updates when you have the speaker_scores table structure
  // This would involve:
  // 1. Extracting speaker scores from the ballot
  // 2. Updating the speaker_scores table
  // 3. Recalculating speaker averages and totals
} 