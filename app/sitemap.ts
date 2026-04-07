import { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE_URL = `${process.env.NEXT_PUBLIC_APP_URL}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id")
    .eq("visible", true);

  const restaurantUrls = (restaurants || []).map((restaurant) => ({
    url: `${BASE_URL}/restaurant/${restaurant.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...restaurantUrls,
  ];
}
