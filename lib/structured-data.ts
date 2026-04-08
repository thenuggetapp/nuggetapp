import { Restaurant } from "./dummy-restaurants";

export function generateRestaurantStructuredData(restaurant: Restaurant) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    image: restaurant.imageUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city || "London",
      addressCountry: restaurant.country || "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: restaurant.coordinates[1],
      longitude: restaurant.coordinates[0],
    },
    url: `/restaurant/${restaurant.id}`,
    servesCuisine: restaurant.cuisine,
    priceRange: "$".repeat(restaurant.priceLevel),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: restaurant.rating,
      reviewCount: restaurant.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    amenityFeature: [
      restaurant.kidsMenu && {
        "@type": "LocationFeatureSpecification",
        name: "Kids Menu",
        value: true,
      },
      restaurant.highChairs && {
        "@type": "LocationFeatureSpecification",
        name: "High Chairs Available",
        value: true,
      },
      restaurant.changingTable && {
        "@type": "LocationFeatureSpecification",
        name: "Baby Changing Facilities",
        value: true,
      },
    ].filter(Boolean),
  };
}

export function generateBreadcrumbStructuredData(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
