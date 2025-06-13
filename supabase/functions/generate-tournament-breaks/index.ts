
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
    const { tournamentId, breakType, breakSize } = await req.json();

    // Validate required fields
    if (!tournamentId || !breakType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: tournamentId, breakType' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate break type
    const validBreakTypes = ['quarters', 'semis', 'finals'];
    if (!validBreakTypes.includes(breakType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid break type. Must be one of: quarters, semis, finals' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Set default break sizes
    let finalBreakSize = breakSize;
    if (!finalBreakSize) {
      switch (breakType) {
        case 'quarters':
          finalBreakSize = 8;
          break;
        case 'semis':
          finalBreakSize = 4;
          break;
        case 'finals':
          finalBreakSize = 2;
          break;
      }
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Use the database function to generate tournament breaks
    const { data: breakRoundId, error: breakError } = await supabase.rpc('generate_tournament_breaks', {
      p_tournament_id: tournamentId,
      p_break_size: finalBreakSize,
      p_break_type: breakType
    });

    if (breakError) {
      console.error('Error generating tournament breaks:', breakError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate tournament breaks' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate break debates
    const { data: debatesCount, error: debatesError } = await supabase.rpc('generate_break_debates', {
      p_break_round_id: breakRoundId
    });

    if (debatesError) {
      console.error('Error generating break debates:', debatesError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate break debates' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        breakRoundId,
        debatesGenerated: debatesCount,
        breakType,
        breakSize: finalBreakSize,
        message: `Successfully generated ${breakType} with ${debatesCount} debates`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in generate-tournament-breaks function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
