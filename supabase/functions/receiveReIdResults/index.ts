import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge Function to receive Person Re-ID results from external Python pipeline
 * 
 * Expected payload from Python script:
 * {
 *   case_id: string,
 *   footage_id?: string,
 *   reference_photo_url: string,
 *   video_url: string,
 *   total_frames_processed: number,
 *   total_persons_detected: number,
 *   processing_time_seconds: number,
 *   threshold: number,
 *   matches: [
 *     {
 *       frame_number: number,
 *       timestamp_seconds: number,
 *       similarity: number,
 *       bbox: [x1, y1, x2, y2],
 *       cropped_image_url?: string
 *     }
 *   ]
 * }
 */

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    console.log('Received Re-ID results:', JSON.stringify(payload, null, 2));

    // Validate required fields
    if (!payload.case_id || !payload.reference_photo_url || !payload.video_url) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: case_id, reference_photo_url, video_url' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert reid_result record
    const { data: resultData, error: resultError } = await supabase
      .from('reid_results')
      .insert({
        case_id: payload.case_id,
        footage_id: payload.footage_id || null,
        reference_photo_url: payload.reference_photo_url,
        video_url: payload.video_url,
        total_frames_processed: payload.total_frames_processed || 0,
        total_persons_detected: payload.total_persons_detected || 0,
        processing_time_seconds: payload.processing_time_seconds || 0,
        threshold: payload.threshold || 0.70,
        status: 'completed',
      })
      .select()
      .single();

    if (resultError) {
      console.error('Error inserting reid_result:', resultError);
      return new Response(
        JSON.stringify({ error: 'Failed to store results', details: resultError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Created reid_result:', resultData.id);

    // Insert matches (top 10, ranked by similarity)
    const matches = payload.matches || [];
    const sortedMatches = matches
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, 10);

    if (sortedMatches.length > 0) {
      const matchRecords = sortedMatches.map((match: any, index: number) => ({
        result_id: resultData.id,
        frame_number: match.frame_number,
        timestamp_seconds: match.timestamp_seconds,
        similarity: match.similarity,
        bbox: match.bbox || null,
        cropped_image_url: match.cropped_image_url || null,
        rank: index + 1,
      }));

      const { error: matchError } = await supabase
        .from('reid_matches')
        .insert(matchRecords);

      if (matchError) {
        console.error('Error inserting matches:', matchError);
        // Don't fail the whole request, result is already saved
      } else {
        console.log(`Inserted ${matchRecords.length} matches`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        result_id: resultData.id,
        matches_stored: sortedMatches.length,
        message: 'Re-ID results stored successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
