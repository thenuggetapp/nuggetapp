import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    // Query information schema to get boolean columns from restaurants table
    const { data, error } = await supabase.rpc('get_restaurant_filter_columns');

    if (error) {
      // Fallback: query using raw SQL via a different approach
      const query = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'restaurants'
        AND table_schema = 'public'
        AND data_type = 'boolean'
        AND column_name NOT IN ('visible', 'nugget_verified')
        ORDER BY column_name;
      `;

      // Since we can't directly execute this, let's use a known set based on the schema
      // This is a temporary solution until we create the proper RPC function
      const availableColumns = [
        'air_conditioning',
        'baby_change_mens',
        'baby_change_unisex',
        'baby_change_womens',
        'buzzy',
        'changing_table',
        'dog_friendly',
        'free_kids_meal',
        'friendly_staff',
        'fun_quirky',
        'games_available',
        'gluten_free_options',
        'good_for_groups',
        'halal',
        'healthy_options',
        'high_chairs',
        'kids_coloring',
        'kids_menu',
        'kids_play_space',
        'kids_potty_toilet',
        'kosher',
        'one_pound_kids_meal',
        'outdoor_seating',
        'playground_nearby',
        'posh',
        'pram_storage',
        'quick_service',
        'relaxed',
        'small_plates',
        'takeaway',
        'teen_favourite',
        'tourist_attraction_nearby',
        'vegan_options',
        'vegetarian_options',
        'wheelchair_access',
      ];

      return NextResponse.json({ data: availableColumns });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching filter columns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter columns' },
      { status: 500 }
    );
  }
}
