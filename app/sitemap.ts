import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yourdomain.com';

  const supabase = createAdminClient();
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id')
    .eq('visible', true);

  const restaurantUrls = (restaurants || []).map((restaurant) => ({
    url: `${baseUrl}/restaurant/${restaurant.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...restaurantUrls,
  ];
}
