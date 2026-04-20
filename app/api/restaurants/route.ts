import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseNaturalLanguageQuery } from "@/lib/natural-language-search";
import { FILTER_KEY_TO_DB_COLUMN } from "@/lib/amenities";
import { scoreAndRank } from "@/lib/search/scorer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

async function applyFilters(initialQuery: any, searchParams: URLSearchParams) {
  // Map filter names to database column names (supports both camelCase and snake_case)
  //TODO standardize search keys to camelCase, then remove this mapping
  const columnMap: Record<string, string> = {
    kidsMenu: "kids_menu",
    kids_menu: "kids_menu",
    highChairs: "high_chairs",
    high_chairs: "high_chairs",
    changingTable: "changing_table",
    changing_table: "changing_table",
    wheelchairAccess: "wheelchair_access",
    wheelchair_access: "wheelchair_access",
    wheelchair: "wheelchair_access",
    babyChangeWomens: "baby_change_womens",
    baby_change_womens: "baby_change_womens",
    babyChangeUnisex: "baby_change_unisex",
    baby_change_unisex: "baby_change_unisex",
    babyChangeMens: "baby_change_mens",
    baby_change_mens: "baby_change_mens",
    kidsPottyToilet: "kids_potty_toilet",
    kids_potty_toilet: "kids_potty_toilet",
    pramStorage: "pram_storage",
    pram_storage: "pram_storage",
    outdoorSeating: "outdoor_seating",
    outdoor_seating: "outdoor_seating",
    outdoor: "outdoor_seating",
    playgroundNearby: "playground_nearby",
    playground_nearby: "playground_nearby",
    airConditioning: "air_conditioning",
    air_conditioning: "air_conditioning",
    dogFriendly: "dog_friendly",
    dog_friendly: "dog_friendly",
    vegetarianOptions: "vegetarian_options",
    vegetarian_options: "vegetarian_options",
    veganOptions: "vegan_options",
    vegan_options: "vegan_options",
    glutenFreeOptions: "gluten_free_options",
    gluten_free_options: "gluten_free_options",
    smallPlates: "small_plates",
    small_plates: "small_plates",
    healthyOptions: "healthy_options",
    healthy_options: "healthy_options",
    halal: "halal",
    kosher: "kosher",
    funQuirky: "fun_quirky",
    fun_quirky: "fun_quirky",
    relaxed: "relaxed",
    buzzy: "buzzy",
    posh: "posh",
    goodForGroups: "good_for_groups",
    good_for_groups: "good_for_groups",
    kidsColoring: "kids_coloring",
    kids_coloring: "kids_coloring",
    kids_colouring: "kids_coloring",
    gamesAvailable: "games_available",
    games_available: "games_available",
    kidsPlaySpace: "kids_play_space",
    kids_play_space: "kids_play_space",
    teenFavourite: "teen_favourite",
    teen_favourite: "teen_favourite",
    quickService: "quick_service",
    quick_service: "quick_service",
    friendlyStaff: "friendly_staff",
    friendly_staff: "friendly_staff",
    takeaway: "takeaway",
    freeKidsMeal: "free_kids_meal",
    free_kids_meal: "free_kids_meal",
    onePoundKidsMeal: "one_pound_kids_meal",
    one_pound_kids_meal: "one_pound_kids_meal",
    touristAttractionNearby: "tourist_attraction_nearby",
    tourist_attraction_nearby: "tourist_attraction_nearby",
  };

  // Apply boolean filters
  for (const [filterKey, dbColumn] of Object.entries(columnMap)) {
    if (searchParams.get(filterKey) === "true") {
      initialQuery = initialQuery.eq(dbColumn, true);
    }
  }

  // Handle cuisine filters separately
  const cuisines = searchParams.get("cuisines");
  if (cuisines) {
    const cuisineList = cuisines.split(",");

    // If we have cuisine filters, we need to fetch all results first and filter in memory
    // to avoid conflicts with OR conditions
    const { data, error } = await initialQuery;

    if (error) throw error;

    // Filter by cuisines in memory
    const filteredData = data.filter((restaurant: any) => {
      return cuisineList.some((cuisine) =>
        restaurant.cuisine
          ?.toLowerCase()
          .includes(cuisine.trim().toLowerCase()),
      );
    });

    return { data: filteredData, isFiltered: true };
  }

  return { query: initialQuery, isFiltered: false };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const query = searchParams.get("q");

  // Pagination parameters
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "24");
  const offset = (page - 1) * limit;

  try {
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

    if (type === "search") {
      const searchTerm = `%${query?.toLowerCase() || ""}%`;

      // Parse natural language query
      const parsed = query ? parseNaturalLanguageQuery(query) : null;

      console.log(
        "Natural language parse result:",
        JSON.stringify(parsed, null, 2),
      );

      // Check if there's a location in the parsed query or in the original query
      const locationToCheck = parsed?.location || query?.toLowerCase();

      const cityCheckResult = await supabase
        .from("restaurants")
        .select("city")
        .eq("visible", true)
        .not("city", "is", null)
        .neq("city", "")
        .ilike("city", `%${locationToCheck}%`)
        .limit(1);

      const isExactCityMatch =
        cityCheckResult.data && cityCheckResult.data.length > 0;
      let cityCoordinates = null;
      let matchedCity = null;

      if (isExactCityMatch && (parsed?.location || query)) {
        matchedCity = cityCheckResult.data[0].city;

        // Use parsed location for geocoding if available, otherwise use query
        const geocodeQuery = parsed?.location || query;

        try {
          const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
          if (mapboxToken) {
            const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(geocodeQuery!)}.json?access_token=${mapboxToken}&limit=1&types=place`;
            const geocodeResponse = await fetch(geocodeUrl);

            if (geocodeResponse.ok) {
              const geocodeData = await geocodeResponse.json();
              if (geocodeData.features && geocodeData.features.length > 0) {
                cityCoordinates = geocodeData.features[0].center;
              }
            }
          }
        } catch (geocodeError) {
          console.error("Geocoding error:", geocodeError);
        }
      }

      let supabaseQuery = supabase
        .from("restaurants")
        .select(
          `
    id, name, slug, cuisine, address, city,
    rating, likes_count, price_level,
    image_url, latitude, longitude, description,
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
  `,
        )
        .eq("visible", true);

      // // Apply feature filters from natural language parsing
      // if (parsed?.features) {
      //   Object.entries(parsed.features).forEach(([feature, value]) => {
      //     if (value === true) {
      //       // Map feature names to database column names using shared mapping.
      //       // Most feature keys match FilterPanel keys and can use FILTER_KEY_TO_DB_COLUMN.
      //       const dbColumn = FILTER_KEY_TO_DB_COLUMN[feature];
      //       supabaseQuery = supabaseQuery.eq(dbColumn, true);
      //     }
      //   });
      // }

      // // Apply price level filter
      // if (parsed?.priceLevel) {
      //   supabaseQuery = supabaseQuery.eq("price_level", parsed.priceLevel);
      // }

      // // Apply cuisine filters
      // if (parsed?.cuisines && parsed.cuisines.length > 0) {
      //   const cuisineConditions = parsed.cuisines
      //     .map((c) => `cuisine.ilike.%${c}%`)
      //     .join(",");
      //   supabaseQuery = supabaseQuery.or(cuisineConditions);
      // }

      // // Apply food keyword filters (search across name, description, and cuisine)
      // if (parsed?.foodKeywords && parsed.foodKeywords.length > 0) {
      //   const foodConditions = parsed.foodKeywords
      //     .flatMap((food) => [
      //       `name.ilike.%${food}%`,
      //       `description.ilike.%${food}%`,
      //       `cuisine.ilike.%${food}%`,
      //     ])
      //     .join(",");
      //   supabaseQuery = supabaseQuery.or(foodConditions);
      // }

      if (isExactCityMatch && cityCoordinates) {
        const [lng, lat] = cityCoordinates;
        const radiusMiles = 20;
        const radiusMeters = radiusMiles * 1609.34;

        // IMPORTANT: Filter by city name first to avoid showing global results
        const cityName = cityCheckResult.data[0].city;
        supabaseQuery = supabaseQuery.ilike("city", `%${cityName}%`);

        // Apply user-selected filters before executing
        const filterResult = await applyFilters(supabaseQuery, searchParams);

        let allData;
        if (filterResult.isFiltered) {
          allData = filterResult.data;
        } else {
          const { data, error: allError } = await filterResult.query.order(
            "rating",
            { ascending: false },
          );
          if (allError) throw allError;
          allData = data;
        }

        const filteredData = (allData || []).filter((restaurant: any) => {
          if (!restaurant.latitude || !restaurant.longitude) return false;

          const distance = calculateDistance(
            lat,
            lng,
            restaurant.latitude,
            restaurant.longitude,
          );

          return distance <= radiusMeters;
        });

        // Apply pagination to filtered data
        const ranked = scoreAndRank(filteredData, parsed);
        const total = ranked.length;
        const paginatedData = ranked.slice(offset, offset + limit);

        // filteredData.sort(
        //   (a: any, b: any) => (b.rating || 0) - (a.rating || 0),
        // );
        // const total = filteredData.length;
        // const paginatedData = filteredData.slice(offset, offset + limit);

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
      } else if (isExactCityMatch) {
        const cityName = cityCheckResult.data[0].city;
        supabaseQuery = supabaseQuery.ilike("city", `%${cityName}%`);
      } else if (parsed?.location) {
        // Apply location filter from natural language parsing
        supabaseQuery = supabaseQuery.or(
          `city.ilike.%${parsed.location}%,address.ilike.%${parsed.location}%`,
        );
      } else if (
        !parsed?.cuisines?.length &&
        !parsed?.foodKeywords?.length &&
        !Object.keys(parsed?.features || {}).length
      ) {
        // Only do generic search if no specific features, cuisines, or food keywords were found
        // Search across name, description, cuisine, address, and city
        // supabaseQuery = supabaseQuery.or(
        //   `name.ilike.${searchTerm},description.ilike.${searchTerm},cuisine.ilike.${searchTerm},address.ilike.${searchTerm},city.ilike.${searchTerm}`,
        // );
      }

      // Apply user-selected filters at the end
      const filterResult = await applyFilters(supabaseQuery, searchParams);

      if (filterResult.isFiltered) {
        // Apply pagination
        const ranked = scoreAndRank(filterResult.data, parsed);
        const total = ranked.length;
        const paginatedData = ranked.slice(offset, offset + limit);

        // const sortedData = filterResult.data.sort(
        //   (a: any, b: any) => (b.rating || 0) - (a.rating || 0),
        // );
        // const total = sortedData.length;
        // const paginatedData = sortedData.slice(offset, offset + limit);

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
      } else {
        const { data, error } = await filterResult.query;

        if (error) throw error;

        const ranked = scoreAndRank(data, parsed);
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
    }

    if (type === "all") {
      let supabaseQuery = supabase
        .from("restaurants")
        .select(
          `
    id, name, slug, cuisine, address, city,
    rating, likes_count, price_level,
    image_url, latitude, longitude,
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
  `,
        )
        .eq("visible", true);

      // Apply filters
      const filterResult = await applyFilters(supabaseQuery, searchParams);

      if (filterResult.isFiltered) {
        // Data was filtered in memory (cuisines were involved), need to sort
        const sortedData = filterResult.data.sort(
          (a: any, b: any) => (b.rating || 0) - (a.rating || 0),
        );

        // Apply pagination
        const total = sortedData.length;
        const paginatedData = sortedData.slice(offset, offset + limit);

        return NextResponse.json({
          data: paginatedData,
          error: null,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        });
      } else {
        // Get total count with filters applied
        const { count: totalCount } = await filterResult.query.select("*", {
          count: "exact",
          head: true,
        });

        // Use the query object and add ordering + pagination
        const { data, error } = await filterResult.query
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
    }

    if (type === "suggestions") {
      const searchTerm = `%${query?.toLowerCase() || ""}%`;

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

      // Get unique cities with counts
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

      // Sort cities by restaurant count (descending)
      const sortedCities = Array.from(cityCountMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const citySuggestions = sortedCities.map(([city, count]) => ({
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

      // Prioritize cities first, then restaurants
      const allSuggestions = [
        ...citySuggestions,
        ...restaurantSuggestions,
      ].slice(0, 8);

      return NextResponse.json({ data: allSuggestions, error: null });
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
