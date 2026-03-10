import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AMENITY_DB_COLUMNS, FILTER_KEY_TO_DB_COLUMN } from '@/lib/amenities';
import { parseNaturalLanguageQuery } from '@/lib/natural-language-search';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';

    const supabase = createClient();

    const amenityFilters = AMENITY_DB_COLUMNS;

    const parsed = parseNaturalLanguageQuery(searchQuery.trim());

    const counts: Record<string, number> = {};

    await Promise.all(
      amenityFilters.map(async (filter) => {
        let query = supabase
          .from('restaurants')
          .select('id', { count: 'exact', head: true })
          .eq('visible', true)
          .eq(filter, true);

        // If a city is specified, match either address OR city case-insensitively.
        if (city) {
          const cityPat = `%${city}%`;
          query = query.or(
            `address.ilike.${cityPat},city.ilike.${cityPat}`
          );
        } else if (parsed?.location) {
          query = query.or(
            `address.ilike.${parsed.location},city.ilike.${parsed.location}`
          );
        }

        if(parsed?.cuisines?.length > 0) {
          query = query.or(
            parsed.cuisines.map(c => `cuisine.ilike.${c}`).join(',')
          );
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
