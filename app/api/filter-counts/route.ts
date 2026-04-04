import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AMENITY_DB_COLUMNS, FILTER_KEY_TO_DB_COLUMN } from "@/lib/amenities";
import { parseNaturalLanguageQuery } from "@/lib/natural-language-search";

export const dynamic = "force-dynamic";

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

    let countQuery = supabase
      .from("restaurants")
      .select(amenityFilters.join(", "))
      .eq("visible", true);

    if (city) {
      countQuery = countQuery.or(
        `address.ilike.%${city}%,city.ilike.%${city}%`,
      );
    } else if (parsed?.location) {
      countQuery = countQuery.or(
        `address.ilike.%${parsed.location}%,city.ilike.%${parsed.location}%`,
      );
    }

    if (parsed?.cuisines && parsed.cuisines.length > 0) {
      countQuery = countQuery.or(
        parsed.cuisines.map((c) => `cuisine.ilike.%${c}%`).join(","),
      );
    }

    const { data: amenityData, error: amenityError } = await countQuery;

    if (amenityError) {
      console.error("Error fetching amenity counts:", amenityError);
      amenityFilters.forEach((filter) => {
        counts[filter] = 0;
      });
    } else {
      amenityFilters.forEach((filter) => {
        counts[filter] = (amenityData || []).filter(
          (r: any) => r[filter] === true,
        ).length;
      });
    }

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
