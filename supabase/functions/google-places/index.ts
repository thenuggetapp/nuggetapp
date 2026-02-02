import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AutocompleteRequest {
  input: string;
  location?: string;
  radius?: number;
}

interface PlaceDetailsRequest {
  placeId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");

    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_PLACES_API_KEY not configured");
    }

    // Autocomplete endpoint
    if (action === "autocomplete") {
      const { input, location, radius = 50000 }: AutocompleteRequest = await req.json();

      if (!input) {
        return new Response(
          JSON.stringify({ error: "Input is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const autocompleteUrl = new URL(
        "https://maps.googleapis.com/maps/api/place/autocomplete/json"
      );
      autocompleteUrl.searchParams.set("input", input);
      autocompleteUrl.searchParams.set("types", "restaurant");
      autocompleteUrl.searchParams.set("key", GOOGLE_API_KEY);

      if (location) {
        autocompleteUrl.searchParams.set("location", location);
        autocompleteUrl.searchParams.set("radius", radius.toString());
      }

      const response = await fetch(autocompleteUrl.toString());
      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Place Details endpoint
    if (action === "details") {
      const { placeId }: PlaceDetailsRequest = await req.json();

      if (!placeId) {
        return new Response(
          JSON.stringify({ error: "Place ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const detailsUrl = new URL(
        "https://maps.googleapis.com/maps/api/place/details/json"
      );
      detailsUrl.searchParams.set("place_id", placeId);
      detailsUrl.searchParams.set(
        "fields",
        "name,formatted_address,formatted_phone_number,website,geometry,opening_hours,price_level,photos,place_id,url,address_components,types"
      );
      detailsUrl.searchParams.set("key", GOOGLE_API_KEY);

      const response = await fetch(detailsUrl.toString());
      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Photo endpoint
    if (action === "photo") {
      const url = new URL(req.url);
      const photoReference = url.searchParams.get("photo_reference");
      const maxwidth = url.searchParams.get("maxwidth") || "800";

      if (!photoReference) {
        return new Response(
          JSON.stringify({ error: "Photo reference is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const photoUrl = new URL(
        "https://maps.googleapis.com/maps/api/place/photo"
      );
      photoUrl.searchParams.set("photo_reference", photoReference);
      photoUrl.searchParams.set("maxwidth", maxwidth);
      photoUrl.searchParams.set("key", GOOGLE_API_KEY);

      const response = await fetch(photoUrl.toString());

      if (response.ok) {
        return new Response(response.body, {
          headers: {
            ...corsHeaders,
            "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
          },
        });
      } else {
        return new Response(
          JSON.stringify({ error: "Failed to fetch photo" }),
          {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'autocomplete', 'details', or 'photo'" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in google-places function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});