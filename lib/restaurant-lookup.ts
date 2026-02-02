const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export interface RestaurantSuggestion {
  name: string;
  address: string;
  city: string;
  postcode: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
}

export async function searchRestaurants(query: string): Promise<RestaurantSuggestion[]> {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${MAPBOX_TOKEN}&types=poi&country=GB&limit=5`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Mapbox API error:', response.statusText);
      return [];
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return [];
    }

    return data.features
      .filter((feature: any) => {
        const categories = feature.properties?.category?.split(',') || [];
        return categories.some((cat: string) =>
          cat.includes('restaurant') ||
          cat.includes('cafe') ||
          cat.includes('food') ||
          cat.includes('bar')
        );
      })
      .map((feature: any) => {
        const [longitude, latitude] = feature.center;
        const context = feature.context || [];

        let city = '';
        let postcode = '';

        for (const item of context) {
          if (item.id.startsWith('place')) {
            city = item.text;
          }
          if (item.id.startsWith('postcode')) {
            postcode = item.text;
          }
        }

        const addressParts = feature.place_name.split(',');
        const streetAddress = addressParts[0] || '';

        return {
          name: feature.text || '',
          address: streetAddress,
          city: city || addressParts[addressParts.length - 2]?.trim() || '',
          postcode: postcode,
          latitude,
          longitude,
          fullAddress: feature.place_name,
        };
      });
  } catch (error) {
    console.error('Error searching restaurants:', error);
    return [];
  }
}
