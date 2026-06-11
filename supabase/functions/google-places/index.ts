import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PLACES_AUTOCOMPLETE_URL =
  "https://places.googleapis.com/v1/places:autocomplete";

/** Field mask limits payload to fields needed for legacy-compatible predictions. */
const AUTOCOMPLETE_FIELD_MASK =
  "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat";

interface AutocompleteRequest {
  input: string;
  location?: string;
  radius?: number;
  sessionToken?: string;
  languageCode?: string;
  regionCode?: string;
}

interface PlaceDetailsRequest {
  placeId: string;
}

interface LegacyAutocompletePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface NewPlacePrediction {
  placeId?: string;
  text?: { text?: string };
  structuredFormat?: {
    mainText?: { text?: string };
    secondaryText?: { text?: string };
  };
}

interface NewAutocompleteResponse {
  suggestions?: Array<{
    placePrediction?: NewPlacePrediction;
  }>;
}

function parseLocationBias(location?: string, radius = 50000) {
  if (!location) return undefined;

  const [latStr, lngStr] = location.split(",").map((part) => part.trim());
  const latitude = Number.parseFloat(latStr);
  const longitude = Number.parseFloat(lngStr);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return undefined;
  }

  return {
    circle: {
      center: { latitude, longitude },
      radius,
    },
  };
}

function mapToLegacyAutocompleteResponse(
  data: NewAutocompleteResponse
): { status: string; predictions: LegacyAutocompletePrediction[] } {
  const predictions = (data.suggestions ?? [])
    .filter((suggestion) => suggestion.placePrediction?.placeId)
    .map((suggestion) => {
      const prediction = suggestion.placePrediction!;
      const mainText = prediction.structuredFormat?.mainText?.text ?? "";
      const secondaryText = prediction.structuredFormat?.secondaryText?.text ?? "";
      const description =
        prediction.text?.text ??
        [mainText, secondaryText].filter(Boolean).join(", ");

      return {
        description,
        place_id: prediction.placeId!,
        structured_formatting: {
          main_text: mainText,
          secondary_text: secondaryText,
        },
      };
    });

  return {
    status: predictions.length > 0 ? "OK" : "ZERO_RESULTS",
    predictions,
  };
}

async function fetchAutocompleteNew(
  apiKey: string,
  request: AutocompleteRequest
) {
  const { input, location, radius = 50000, sessionToken, languageCode, regionCode } =
    request;

  const body: Record<string, unknown> = {
    input,
    includedPrimaryTypes: ["restaurant"],
  };

  const locationBias = parseLocationBias(location, radius);
  if (locationBias) {
    body.locationBias = locationBias;
  }

  if (sessionToken) {
    body.sessionToken = sessionToken;
  }

  if (languageCode) {
    body.languageCode = languageCode;
  }

  if (regionCode) {
    body.regionCode = regionCode;
  }

  const response = await fetch(PLACES_AUTOCOMPLETE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": AUTOCOMPLETE_FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      (errorBody as { error?: { message?: string } })?.error?.message ??
      `Autocomplete request failed (${response.status})`;

    return {
      status: "REQUEST_DENIED",
      error_message: message,
      predictions: [] as LegacyAutocompletePrediction[],
    };
  }

  const data = (await response.json()) as NewAutocompleteResponse;
  return mapToLegacyAutocompleteResponse(data);
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

    // Autocomplete endpoint (Places API New)
    if (action === "autocomplete") {
      const requestBody: AutocompleteRequest = await req.json();

      if (!requestBody.input?.trim()) {
        return new Response(
          JSON.stringify({ error: "Input is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const data = await fetchAutocompleteNew(GOOGLE_API_KEY, {
        ...requestBody,
        input: requestBody.input.trim(),
      });

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Place Details endpoint (legacy — migrate to GET /v1/places/{placeId} separately)
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

    // Photo endpoint (legacy)
    if (action === "photo") {
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
      }

      return new Response(
        JSON.stringify({ error: "Failed to fetch photo" }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Invalid action. Use 'autocomplete', 'details', or 'photo'",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in google-places function:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error in google-places";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
