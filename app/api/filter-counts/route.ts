import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';

    const supabase = createClient();

    const amenityFilters = [
      'high_chairs',
      'baby_change_unisex',
      'kids_potty_toilet',
      'kids_colouring',
      'kids_play_space',
      'playground_nearby',
      'kids_menu',
      'free_kids_meal',
      'pram_storage',
      'games_available',
      'outdoor_seating',
      'wheelchair_access',
      'dog_friendly',
      'quick_service',
      'baby_change_womens',
      'baby_change_mens',
      'air_conditioning',
      'vegetarian_options',
      'vegan_options',
      'gluten_free_options',
      'small_plates',
      'healthy_options',
      'halal',
      'kosher',
      'fun_quirky',
      'relaxed',
      'buzzy',
      'posh',
      'good_for_groups',
      'teen_favourite',
      'friendly_staff',
      'takeaway',
      'one_pound_kids_meal',
      'tourist_attraction_nearby',
    ];

    const counts: Record<string, number> = {};

    await Promise.all(
      amenityFilters.map(async (filter) => {
        let query = supabase
          .from('restaurants')
          .select('id', { count: 'exact', head: true })
          .eq('visible', true)
          .eq(filter, true);

        if (city) {
          query = query.ilike('address', `%${city}%`);
        }

        if (searchQuery && !city) {
          query = query.or(
            `name.ilike.%${searchQuery}%,cuisine.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`
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
