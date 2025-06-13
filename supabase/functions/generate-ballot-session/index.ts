
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { judgeId, roundId, tournamentId, hoursValid = 24 } = await req.json();

    // Validate required fields
    if (!judgeId || !roundId || !tournamentId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: judgeId, roundId, tournamentId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Use the database function to create ballot session
    const { data, error } = await supabase.rpc('create_ballot_session', {
      p_judge_id: judgeId,
      p_round_id: roundId,
      p_tournament_id: tournamentId,
      p_hours_valid: hoursValid
    });

    if (error) {
      console.error('Error creating ballot session:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create ballot session' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return the short URL code
    const shortCode = data;
    const ballotUrl = `${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/ballot/${shortCode}`;

    return new Response(
      JSON.stringify({ 
        shortCode,
        ballotUrl,
        expiresIn: hoursValid
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in generate-ballot-session function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
