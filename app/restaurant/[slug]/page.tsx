import { Metadata } from "next";
import RestaurantDetail from "@/components/RestaurantDetail";
import { createAdminClient } from "@/lib/supabase/admin";

// Enable ISR: Revalidate every 60 seconds
export const revalidate = 60;

// Allow dynamic params for restaurants not in generateStaticParams
export const dynamicParams = true;

export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("restaurants")
    .select("id")
    .eq("visible", true);

  return (data || []).map((restaurant) => ({
    slug: restaurant.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", params.slug)
    .eq("visible", true)
    .maybeSingle();

  if (!restaurant) {
    return {
      title: "Restaurant Not Found",
      description: "The restaurant you are looking for could not be found.",
    };
  }

  const priceSymbol = "$".repeat(restaurant.price_level || 2);
  const imageUrl =
    restaurant.image_url ||
    "/nugget_colour_logo.png";

  return {
    title: `${restaurant.name} - ${restaurant.cuisine}`,
    description: `${restaurant.name} in ${restaurant.address}. ${
      restaurant.likes_count || 0
    } likes. ${
      restaurant.nugget_verified ? "Nugget Verified restaurant" : "Restaurant"
    } serving ${restaurant.cuisine}. ${priceSymbol} price level.`,
    keywords: [
      restaurant.name,
      restaurant.cuisine,
      "restaurant",
      restaurant.nugget_verified ? "nugget-verified" : "",
      restaurant.kids_menu ? "kids menu" : "",
      restaurant.address,
    ].filter(Boolean),
    alternates: {
      canonical: `/restaurant/${restaurant.id}`,
    },
    openGraph: {
      title: `${restaurant.name} | Nugget`,
      description: `${restaurant.name} - ${restaurant.cuisine}. ${
        restaurant.likes_count || 0
      } likes.`,
      url: `https://yourdomain.com/restaurant/${restaurant.id}`,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: restaurant.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${restaurant.name} | MapSearch`,
      description: `${restaurant.name} - ${restaurant.cuisine}. ${
        restaurant.likes_count || 0
      } likes`,
      images: [imageUrl],
    },
  };
}

export default function RestaurantDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return <RestaurantDetail slug={params.slug} />;
}
