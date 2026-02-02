import { Header } from '@/components/Header';
import { generateWebsiteStructuredData } from '@/lib/structured-data';
import { SearchSection } from '@/components/home/SearchSection';
import { RestaurantCarousel } from '@/components/home/RestaurantCarousel';
import { PopularFilters } from '@/components/home/PopularFilters';
import { createClient as createBrowserClient } from '@supabase/supabase-js';
import { getFilterCounts } from '@/lib/filter-counts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  likes_count: number;
  address: string;
  image_url: string | null;
}

async function getFeaturedRestaurants(): Promise<Restaurant[]> {
  // Use browser client for public data to avoid server cookie issues in dev
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name, cuisine, likes_count, address, image_url')
    .eq('visible', true)
    .eq('high_chairs', true)
    .ilike('address', '%Chicago%')
    .order('likes_count', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching featured restaurants:', error);
    return [];
  }

  return data || [];
}

async function getDogFriendlyRestaurants(): Promise<Restaurant[]> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name, cuisine, likes_count, address, image_url')
    .eq('visible', true)
    .eq('dog_friendly', true)
    .ilike('address', '%Chicago%')
    .order('likes_count', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching dog friendly restaurants:', error);
    return [];
  }

  return data || [];
}

async function getBabyChangeRestaurants(): Promise<Restaurant[]> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name, cuisine, likes_count, address, image_url')
    .eq('visible', true)
    .ilike('address', '%Chicago%')
    .or('baby_change_mens.eq.true,baby_change_womens.eq.true,baby_change_unisex.eq.true')
    .order('likes_count', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching baby change restaurants:', error);
    return [];
  }

  return data || [];
}

async function getKidsColouringRestaurants(): Promise<Restaurant[]> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name, cuisine, likes_count, address, image_url')
    .eq('visible', true)
    .eq('kids_colouring', true)
    .ilike('address', '%Chicago%')
    .order('likes_count', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching kids colouring restaurants:', error);
    return [];
  }

  return data || [];
}

export default async function Chicago() {
  const websiteStructuredData = generateWebsiteStructuredData();

  // Fetch data on the server
  const [
    featuredRestaurants,
    dogFriendlyRestaurants,
    babyChangeRestaurants,
    kidsColouringRestaurants,
    filterCounts
  ] = await Promise.all([
    getFeaturedRestaurants(),
    getDogFriendlyRestaurants(),
    getBabyChangeRestaurants(),
    getKidsColouringRestaurants(),
    getFilterCounts('Chicago')
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      <div className="min-h-screen">
        <div className="relative min-h-[500px] md:min-h-[600px] md:m-10 md:rounded-t-xl">
          <div className="absolute inset-0 z-0 md:rounded-t-xl md:overflow-hidden">
            <img
              src="/chicago-hero-01.jpg"
              alt="Chicago theater with light trails"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </div>

          <div className="relative z-10">
            <Header />
          </div>

          <div className="relative z-20 container mx-auto px-4 pt-8 md:pt-16 pb-16 md:pb-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="space-y-4 mt-[120px] md:mt-24">
                <h1 className="text-[2.8125rem] sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-white tracking-tight font-serif drop-shadow-lg leading-[1] sm:leading-tight">
                  Search for family friendly restaurants in Chicago
                </h1>
              </div>

              <SearchSection defaultCity="Chicago" />
            </div>
          </div>
        </div>

        <main>
          <PopularFilters location="Chicago" filterCounts={filterCounts} />

          <RestaurantCarousel
            restaurants={featuredRestaurants}
            title="Chicago restaurants with high chairs"
            titleLink="/search?q=Chicago&high_chairs=true"
          />

          <RestaurantCarousel
            restaurants={dogFriendlyRestaurants}
            title="Chicago restaurants that are dog friendly"
            titleLink="/search?q=Chicago&dog_friendly=true"
          />

          <RestaurantCarousel
            restaurants={babyChangeRestaurants}
            title="Chicago restaurants with baby change"
            titleLink="/search?q=Chicago&baby_change=true"
          />

          <RestaurantCarousel
            restaurants={kidsColouringRestaurants}
            title="Chicago restaurants with kids colouring"
            titleLink="/search?q=Chicago&kids_colouring=true"
          />
        </main>
    </div>
    </>
  );
}
