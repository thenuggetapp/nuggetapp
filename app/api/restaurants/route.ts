import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseNaturalLanguageQuery } from "@/lib/search/natural-language-parser";
import { FILTER_KEY_TO_DB_COLUMN } from "@/lib/db-amenities";
import { scoreAndRank } from "@/lib/search/scorer";
import { calculateDistance } from "@/lib/search/distance";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const columnMap = FILTER_KEY_TO_DB_COLUMN;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

const RESTAURANT_SELECT = `
  id, name, slug, cuisine, address, city,
  rating, likes_count, price_level,
  image_url, google_place_id, latitude, longitude, description,
  kids_menu, high_chairs, wheelchair_access,
  outdoor_seating, dog_friendly, vegetarian_options,
  vegan_options, gluten_free_options, halal, kosher,
  baby_change_womens, baby_change_unisex, baby_change_mens,
  kids_potty_toilet, pram_storage, playground_nearby,
  air_conditioning, small_plates, healthy_options,
  fun_quirky, relaxed, buzzy, posh, good_for_groups,
  kids_coloring, games_available, kids_play_space,
  teen_favourite, quick_service, friendly_staff,
  takeaway, free_kids_meal, one_pound_kids_meal,
  tourist_attraction_nearby, changing_table
`;

function sanitizeQuery(input: string): string {
  return input
    .trim()
    .replace(/[(),.%*\\\x00]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function applyUiFilters(query: any, searchParams: URLSearchParams) {
  for (const [filterKey, dbColumn] of Object.entries(columnMap)) {
    if (searchParams.get(filterKey) === "true") {
      query = query.eq(dbColumn, true);
    }
  }

  // Cuisine filter from UI panel — OR within the group
  const cuisines = searchParams.get("cuisines");
  if (cuisines) {
    const conditions = cuisines
      .split(",")
      .map((c) => `cuisine.ilike.%${c.trim()}%`)
      .join(",");
    query = query.or(conditions);
  }

  return query;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const query = searchParams.get("q");
  const externalLat = searchParams.get("lat")
    ? parseFloat(searchParams.get("lat")!)
    : null;
  const externalLng = searchParams.get("lng")
    ? parseFloat(searchParams.get("lng")!)
    : null;
  const bboxParam = searchParams.get("bbox");
  const externalBbox = bboxParam
    ? (bboxParam.split(",").map(Number) as [number, number, number, number])
    : null;

  // Pagination parameters
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const offset = (page - 1) * limit;

  try {
    // FEATURED
    if (type === "featured") {
      const { data, error } = await supabase
        .from("restaurants")
        .select(
          "id, name, cuisine, likes_count, address, image_url, google_place_id",
        )
        .eq("visible", true)
        .eq("high_chairs", true)
        .order("likes_count", { ascending: false })
        .limit(5);

      if (error) throw error;
      return NextResponse.json({ data, error: null });
    }

    // SEARCH
    if (type === "search") {
      const rawQuery = query ?? "";
      const safeQuery = sanitizeQuery(rawQuery);
      const parsed = safeQuery ? parseNaturalLanguageQuery(safeQuery) : null;

      // Base query
      let supabaseQuery = supabase
        .from("restaurants")
        .select(RESTAURANT_SELECT)
        .eq("visible", true);

      // 1. City - hard exclude from NL query, but skip if location box coordinates
      // are provided (radius filter handles it instead)
      const location = (externalLat === null || externalLng === null) ? parsed?.location : null;
      if (location) {
        supabaseQuery = supabaseQuery.ilike("city", `%${location}%`);
      }

      // 2. Feature flags - hard AND from natural language
      if (parsed?.features) {
        Object.entries(parsed.features).forEach(([feature, value]) => {
          if (value === true) {
            const dbColumn =
              FILTER_KEY_TO_DB_COLUMN[
                feature as keyof typeof FILTER_KEY_TO_DB_COLUMN
              ];
            if (dbColumn) supabaseQuery = supabaseQuery.eq(dbColumn, true);
          }
        });
      }

      // 3. Price level - hard AND
      if (parsed?.priceLevel) {
        supabaseQuery = supabaseQuery.eq("price_level", parsed.priceLevel);
      }

      // 4. Food/cuisine terms - OR within group
      if (parsed?.foodKeywords?.length || parsed?.cuisines?.length) {
        const foodConditions = [
          ...(parsed?.foodKeywords ?? []).flatMap((food) => [
            `name.ilike.%${food}%`,
            `description.ilike.%${food}%`,
            `cuisine.ilike.%${food}%`,
          ]),
          ...(parsed?.cuisines ?? []).map((c) => `cuisine.ilike.%${c}%`),
        ].join(",");

        if (foodConditions) supabaseQuery = supabaseQuery.or(foodConditions);
      }

      // 5. Search terms - catch-all OR across name and description
      if (parsed?.searchTerms?.length) {
        const termConditions = parsed.searchTerms
          .flatMap((term) => [
            `name.ilike.%${term}%`,
            `description.ilike.%${term}%`,
          ])
          .join(",");

        if (termConditions) supabaseQuery = supabaseQuery.or(termConditions);
      }

      // 6. UI panel filters (filter chips) - hard AND on top of NL filters
      supabaseQuery = applyUiFilters(supabaseQuery, searchParams);

      // Execute
      const { data: candidates, error: fetchError } = await supabaseQuery.order(
        "rating",
        { ascending: false },
      );

      if (fetchError) throw fetchError;

      // 7. Distance filter
      let cityCoordinates: [number, number] | null = null;
      let matchedCity: string | null = null;

      // Use pre-resolved coordinates from the location input if provided
      if (externalLat !== null && externalLng !== null) {
        cityCoordinates = [externalLng, externalLat];
      }

      let nlBbox: [number, number, number, number] | null = null;

      if (location && candidates && candidates.length > 0) {
        matchedCity = candidates[0].city ?? null;

        if (!cityCoordinates) {
          try {
            const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
            if (mapboxToken) {
              const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxToken}&limit=1&types=place,locality`;
              const geocodeResponse = await fetch(geocodeUrl);
              if (geocodeResponse.ok) {
                const geocodeData = await geocodeResponse.json();
                if (geocodeData.features?.length > 0) {
                  const feature = geocodeData.features[0];
                  cityCoordinates = feature.center;
                  if (feature.bbox) nlBbox = feature.bbox;
                }
              }
            }
          } catch (geocodeError) {
            console.error("Geocoding error:", geocodeError);
          }
        }
      }

      // Derive radius from bbox (center → NE corner distance).
      // Prefer the explicit location-box bbox; fall back to bbox from NL geocoding.
      // Cities (bbox radius ≥ 10 km) get a 1.5× multiplier to cover suburbs.
      // Localities (bbox radius < 10 km) stay tight — trust the bbox as-is.
      // Falls back to 20 miles when there is no bbox.
      const effectiveBbox = externalBbox ?? nlBbox;
      let radiusMeters = 20 * 1609.34;
      if (effectiveBbox && cityCoordinates) {
        const [centerLng, centerLat] = cityCoordinates;
        const [, , east, north] = effectiveBbox;
        const bboxRadius = calculateDistance(centerLat, centerLng, north, east);
        const isCityScale = bboxRadius >= 10_000; // 10 km threshold
        radiusMeters = isCityScale ? bboxRadius * 1.5 : bboxRadius;
      }

      const filterByRadius = (radius: number) =>
        (candidates || []).filter((restaurant: any) => {
          if (!cityCoordinates) return true;
          if (!restaurant.latitude || !restaurant.longitude) return false;
          const [lng, lat] = cityCoordinates;
          return (
            calculateDistance(lat, lng, restaurant.latitude, restaurant.longitude) <= radius
          );
        });

      let filtered = filterByRadius(radiusMeters);

      // If the bbox gave a tight radius and returned nothing, expand once to 20 miles.
      if (filtered.length === 0 && cityCoordinates && radiusMeters < 20 * 1609.34) {
        radiusMeters = 20 * 1609.34;
        filtered = filterByRadius(radiusMeters);
      }

      // 8. Score, rank, paginate
      const ranked = scoreAndRank(filtered, parsed, cityCoordinates, radiusMeters);
      const total = ranked.length;
      const paginatedData = ranked.slice(offset, offset + limit);

      return NextResponse.json({
        data: paginatedData,
        error: null,
        city: matchedCity,
        cityCoordinates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // ALL
    if (type === "all") {
      let supabaseQuery = supabase
        .from("restaurants")
        .select(RESTAURANT_SELECT)
        .eq("visible", true);

      supabaseQuery = applyUiFilters(supabaseQuery, searchParams);

      // Get total count with the same filters as the data query
      let countQuery = supabase
        .from("restaurants")
        .select("id", { count: "exact", head: true })
        .eq("visible", true);

      countQuery = applyUiFilters(countQuery, searchParams);
      const { count: totalCount, error: countError } = await countQuery;
      if (countError) throw countError;

      const { data, error } = await supabaseQuery
        .order("rating", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return NextResponse.json({
        data,
        error: null,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit),
        },
      });
    }

    // SUGGESTIONS
    if (type === "suggestions") {
      const safeQuery = sanitizeQuery(query ?? "");
      if (!safeQuery) {
        return NextResponse.json({ data: [], error: null });
      }

      const searchTerm = `%${safeQuery.toLowerCase()}%`;

      const [restaurantsResult, citiesResult] = await Promise.all([
        supabase
          .from("restaurants")
          .select("id, name, cuisine, address, city")
          .eq("visible", true)
          .or(
            `name.ilike.${searchTerm},description.ilike.${searchTerm},cuisine.ilike.${searchTerm},address.ilike.${searchTerm}`,
          )
          .order("rating", { ascending: false })
          .limit(5),
        supabase
          .from("restaurants")
          .select("city")
          .eq("visible", true)
          .not("city", "is", null)
          .neq("city", "")
          .ilike("city", searchTerm),
      ]);

      if (restaurantsResult.error) throw restaurantsResult.error;
      if (citiesResult.error) throw citiesResult.error;

      const cityCountMap = new Map<string, number>();
      (citiesResult.data || []).forEach((r) => {
        if (r.city) {
          const normalizedCity =
            r.city.charAt(0).toUpperCase() + r.city.slice(1).toLowerCase();
          cityCountMap.set(
            normalizedCity,
            (cityCountMap.get(normalizedCity) || 0) + 1,
          );
        }
      });

      const citySuggestions = Array.from(cityCountMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([city]) => ({
          id: city,
          name: city,
          cuisine: "",
          address: "",
          type: "city" as const,
        }));

      const restaurantSuggestions = (restaurantsResult.data || []).map((r) => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        address: r.address,
        type: "restaurant" as const,
      }));

      return NextResponse.json({
        data: [...citySuggestions, ...restaurantSuggestions].slice(0, 8),
        error: null,
      });
    }

    return NextResponse.json({ data: [], error: null });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 },
    );
  }
}
