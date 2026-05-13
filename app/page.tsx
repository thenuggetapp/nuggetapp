import { Header } from '@/components/Header';
import { SkipNav } from '@/components/SkipNav';
import { generateWebsiteStructuredData } from '@/lib/website-structured-data';
import { SmartSearchSection } from '@/components/home/SmartSearchSection';
import { RestaurantGrid } from '@/components/home/RestaurantGrid';
import { CityBrowse } from '@/components/home/CityBrowse';
import { createClient as createBrowserClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  likes_count: number;
  address: string;
  image_url: string | null;
  google_place_id?: string | null;
}

async function getFeaturedRestaurants(): Promise<Restaurant[]> {
  // Use browser client for public data to avoid server cookie issues in dev
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name, cuisine, likes_count, address, image_url, google_place_id')
    .eq('visible', true)
    .eq('high_chairs', true)
    .order('likes_count', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching featured restaurants:', error);
    return [];
  }

  return data || [];
}

async function getLondonRestaurants(excludeIds: string[]): Promise<Restaurant[]> {
  // Use browser client for public data to avoid server cookie issues in dev
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let query = supabase
    .from('restaurants')
    .select('id, name, cuisine, likes_count, address, image_url, google_place_id')
    .eq('visible', true)
    .ilike('address', '%London%');

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data, error } = await query
    .order('likes_count', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching London restaurants:', error);
    return [];
  }

  return data || [];
}

export default async function Home() {
  const websiteStructuredData = generateWebsiteStructuredData();
  
  // Fetch data on the server
  const featuredRestaurants = await getFeaturedRestaurants();
  const featuredIds = featuredRestaurants.map(r => r.id);
  const londonRestaurants = await getLondonRestaurants(featuredIds);

  return (
    <>
      <SkipNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      <div className="min-h-screen">
        <div className="relative min-h-[500px] md:min-h-[600px] md:m-10 md:rounded-t-xl">
          <div className="absolute inset-0 z-0 md:rounded-t-xl md:overflow-hidden">
            <img
              src="/Nugget_home_hero_08.jpg"
              alt="Happy family with young children enjoying a meal together at a family-friendly restaurant"
              className="w-full h-full object-cover md:object-center object-[center_-100px]"
            />
          </div>

          <div className="relative z-10">
            <Header />
          </div>

          <div className="relative z-20 container mx-auto px-4 pt-8 md:pt-16 pb-16 md:pb-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="space-y-4 mt-[120px] md:mt-24">
                <h1 className="text-[2.8125rem] sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-white tracking-tight font-serif drop-shadow-lg leading-[1] sm:leading-tight">
                  We called ahead so you don&apos;t have to
                </h1>
                <p className="text-base sm:text-lg text-white/80 font-light drop-shadow">
                  30+ filters per restaurant — high chairs, kids menus, dietary needs, and yes, exactly where the baby change is.
                </p>
              </div>

              <SmartSearchSection />
            </div>
          </div>
        </div>

        <main id="main-content">
          <CityBrowse />

          <RestaurantGrid
            restaurants={featuredRestaurants}
            title="Featured restaurants with high chairs"
          />

          <RestaurantGrid
            restaurants={londonRestaurants}
            title="Featured restaurants in London"
          />
        </main>
    </div>
    </>
  );
}
