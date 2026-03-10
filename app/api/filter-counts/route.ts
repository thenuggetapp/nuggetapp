import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AMENITY_DB_COLUMNS, AMENITY_PHRASES_TO_DB_COLUMN } from '@/lib/amenities';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';

    const supabase = createClient();

    const amenityFilters = AMENITY_DB_COLUMNS;

    const rawQuery = searchQuery.trim().toLowerCase();
    const tokens = rawQuery
      ? rawQuery.split(/\s+/).filter((t) => t.length > 0)
      : [];

    // Derive amenity constraints from phrases in the search query
    const derivedAmenityColumns = new Set<string>();
    if (rawQuery) {
      for (const [phrase, column] of Object.entries(AMENITY_PHRASES_TO_DB_COLUMN)) {
        if (rawQuery.includes(phrase)) {
          derivedAmenityColumns.add(column);
        }
      }
    }

    const counts: Record<string, number> = {};

    await Promise.all(
      amenityFilters.map(async (filter) => {
        let query = supabase
          .from('restaurants')
          .select('id', { count: 'exact', head: true })
          .eq('visible', true)
          .eq(filter, true);

        // If the search text implies an amenity (e.g. "kids coloring"),
        // require that amenity as well for all counts.
        derivedAmenityColumns.forEach((col) => {
          query = query.eq(col, true);
        });

        // If a city is specified, match either address OR city case-insensitively.
        if (city) {
          const cityPat = `%${city}%`;
          query = query.or(
            `address.ilike.${cityPat},city.ilike.${cityPat}`
          );
        }

        // If we have a search query but no explicit city, treat each token
        // as an additional constraint: every token must match at least one
        // of name/cuisine/address/city.
        if (tokens.length > 0 && !city) {
          for (const token of tokens) {
            const pat = `%${token}%`;
            const conditions = [
              `name.ilike.${pat}`,
              `cuisine.ilike.${pat}`,
              `address.ilike.${pat}`,
              `city.ilike.${pat}`,
            ].join(',');
            query = query.or(conditions);
          }
        }

        const { count, error } = await query;

        if (error) {
          console.error(`Error counting ${filter}:`, error);
          counts[filter] = 0;
        } else {
          counts[filter] = count || 0;
        }
      })
    );

    const { data: cuisineData, error: cuisineError } = await supabase
      .from('restaurants')
      .select('cuisine')
      .eq('visible', true)
      .not('cuisine', 'is', null);

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
      cuisines: cuisineCounts
    });
  } catch (error) {
    console.error('Error fetching filter counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter counts' },
      { status: 500 }
    );
  }
}
