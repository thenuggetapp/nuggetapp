import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AMENITY_DB_COLUMNS } from "@/lib/db-amenities";
import { parseNaturalLanguageQuery } from "@/lib/search/natural-language-parser";

export const dynamic = "force-dynamic";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";

    const supabase = createClient();

    const amenityFilters = AMENITY_DB_COLUMNS;

    const parsed = searchQuery.trim()
      ? parseNaturalLanguageQuery(searchQuery.trim())
      : null;

    const counts: Record<string, number> = {};

    // One exact count query per amenity column. Fetching all matching rows and
    // counting in memory hits PostgREST's default row cap (~1000), so totals
    // would be wrong for larger datasets.
    await Promise.all(
      amenityFilters.map(async (filter) => {
        let q = supabase
          .from("restaurants")
          .select("id", { count: "exact", head: true })
          .eq("visible", true)
          .eq(filter, true);

        q = applyLocationAndCuisineFilters(q, city, parsed);

        const { count, error } = await q;
        if (error) {
          console.error(`Error counting ${filter}:`, error);
          counts[filter] = 0;
        } else {
          counts[filter] = count ?? 0;
        }
      }),
    );

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

    return NextResponse.json({
      amenities: counts,
      cuisines: cuisineCounts,
    });
  } catch (error) {
    console.error("Error fetching filter counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter counts" },
      { status: 500 },
    );
  }
}
