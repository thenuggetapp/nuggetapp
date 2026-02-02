import { createClient as createBrowserClient } from '@supabase/supabase-js';

const AMENITY_FILTERS = [
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
  'outdoor',
  'wheelchair',
  'dog_friendly',
  'quick_service',
];

export async function getFilterCounts(city: string): Promise<Record<string, number>> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const counts: Record<string, number> = {};

  await Promise.all(
    AMENITY_FILTERS.map(async (filter) => {
      const { count, error } = await supabase
        .from('restaurants')
        .select('id', { count: 'exact', head: true })
        .eq('visible', true)
        .eq(filter, true)
        .ilike('address', `%${city}%`);

      if (!error) {
        counts[filter] = count || 0;
      } else {
        counts[filter] = 0;
      }
    })
  );

  return counts;
}
