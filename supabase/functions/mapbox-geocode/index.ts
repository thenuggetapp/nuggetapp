import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('query');
    const longitude = url.searchParams.get('longitude');
    const latitude = url.searchParams.get('latitude');

    if (!query && (!longitude || !latitude)) {
      return new Response(
        JSON.stringify({ error: 'Either query or longitude/latitude parameters are required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');

    if (!mapboxToken) {
      console.error('MAPBOX_ACCESS_TOKEN environment variable not set');
      return new Response(
        JSON.stringify({ error: 'Mapbox token not configured' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    let mapboxUrl: string;

    if (longitude && latitude) {
      mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&types=place,locality,neighborhood&limit=1`;
      console.log('[Mapbox Geocode] Reverse geocoding for coordinates:', longitude, latitude);
    } else {
      const encodedQuery = encodeURIComponent(query!);
      mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${mapboxToken}&limit=10`;
      console.log('[Mapbox Geocode] Fetching results for:', query);
    }

    const response = await fetch(mapboxUrl);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Mapbox Geocode] API error:', response.status, errorData);
      return new Response(
        JSON.stringify({ 
          error: `Mapbox API error (${response.status})`,
          details: errorData 
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();
    console.log('[Mapbox Geocode] Results found:', data.features?.length || 0);

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[Mapbox Geocode] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});