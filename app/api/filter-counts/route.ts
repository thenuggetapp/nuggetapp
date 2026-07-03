import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AMENITY_DB_COLUMNS } from "@/lib/db-amenities";
import { parseNaturalLanguageQuery } from "@/lib/search/natural-language-parser";

export const dynamic = "force-dynamic";

const FILTER_COUNT_MODES = ["amenities", "cuisines", "location"] as const;
type FilterCountMode = (typeof FILTER_COUNT_MODES)[number];

function applyLocationAndCuisineFilters(
  query: any,
  city: string,
  parsed: ReturnType<typeof parseNaturalLanguageQuery> | null,
) {
  let q = query;
  if (city) {
    q = q.or(`address.ilike.%${city}%,city.ilike.%${city}%`);
  } else if (parsed?.location) {
    q = q.or(
      `address.ilike.%${parsed.location}%,city.ilike.%${parsed.location}%`,
    );
  }
  if (parsed?.cuisines && parsed.cuisines.length > 0) {
    q = q.or(
      parsed.cuisines.map((c) => `cuisine.ilike.%${c}%`).join(","),
    );
  }
  return q;
}

function parseMode(searchParams: URLSearchParams): FilterCountMode | null {
  const mode = searchParams.get("mode");
  if (!mode) {
    return null;
  }
  if (!FILTER_COUNT_MODES.includes(mode as FilterCountMode)) {
    return null;
  }
  return mode as FilterCountMode;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const mode = parseMode(searchParams);

    if (searchParams.get("mode") && !mode) {
      return NextResponse.json(
        { error: "Invalid mode. Allowed values: amenities, cuisines, location" },
        { status: 400 },
      );
    }

    const includeAmenities = mode === "amenities" || mode === null;
    const includeCuisines = mode === "cuisines" || mode === null;
    const includeLocation = mode === "location";

    const supabase = createClient();

    const parsed = searchQuery.trim()
      ? parseNaturalLanguageQuery(searchQuery.trim())
      : null;

    const response: {
      amenities?: Record<string, number>;
      cuisines?: Record<string, number>;
      total?: number;
    } = {};

    if (includeAmenities) {
      const counts: Record<string, number> = {};

      // One exact count query per amenity column. Fetching all matching rows and
      // counting in memory hits PostgREST's default row cap (~1000), so totals
      // would be wrong for larger datasets.
      await Promise.all(
        AMENITY_DB_COLUMNS.map(async (filter) => {
          let q = supabase
            .from("restaurants")
            .select("id", { count: "exact", head: true })
            .eq("visible", true)
            .eq(filter, true);

          q = applyLocationAndCuisineFilters(q, city, parsed);

          const { count, error } = await q;
          counts[filter] = error ? 0 : (count ?? 0);
        }),
      );

      response.amenities = counts;
    }

    if (includeCuisines) {
      const { data: cuisineData, error: cuisineError } = await supabase
        .from("restaurants")
        .select("cuisine")
        .eq("visible", true)
        .not("cuisine", "is", null);

      const cuisineCounts: Record<string, number> = {};
      if (!cuisineError && cuisineData) {
        cuisineData.forEach((row) => {
          const cuisine = row.cuisine;
          if (cuisine) {
            cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
          }
        });
      }

      response.cuisines = cuisineCounts;
    }

    if (includeLocation) {
      let totalQuery = supabase
        .from("restaurants")
        .select("id", { count: "exact", head: true })
        .eq("visible", true);
      totalQuery = applyLocationAndCuisineFilters(totalQuery, city, parsed);
      const { count: totalCount, error: totalError } = await totalQuery;
      if (totalError) {
        response.total = 0;
      } else {
        response.total = totalCount ?? 0;
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching filter counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter counts" },
      { status: 500 },
    );
  }
}
