/**
 * Maps Google Places API data to restaurant form fields
 */

interface GooglePlaceResult {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    weekday_text?: string[];
    periods?: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
  };
  price_level?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  place_id: string;
  url: string;
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  types: string[];
}

interface MappedRestaurantData {
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  website_url: string;
  google_maps_url: string;
  price_level: number;
  opening_times: Record<string, any>;
  cuisine: string;
  /** User-uploaded images only; Google photos use google_place_id and are loaded from google */
  image_url: string;
  google_place_id: string;
}

/**
 * Extract city from address components
 */
function extractCity(addressComponents: GooglePlaceResult['address_components']): string {
  const cityComponent = addressComponents.find(
    (component) =>
      component.types.includes('locality') ||
      component.types.includes('postal_town') ||
      component.types.includes('administrative_area_level_2')
  );
  return cityComponent?.long_name || '';
}

/**
 * Extract postcode from address components
 */
function extractPostcode(addressComponents: GooglePlaceResult['address_components']): string {
  const postcodeComponent = addressComponents.find((component) =>
    component.types.includes('postal_code')
  );
  return postcodeComponent?.long_name || '';
}

/**
 * Extract country from address components
 */
function extractCountry(addressComponents: GooglePlaceResult['address_components']): string {
  const countryComponent = addressComponents.find((component) =>
    component.types.includes('country')
  );
  return countryComponent?.long_name || '';
}

/**
 * Extract street address (without city, postcode, country)
 */
function extractStreetAddress(
  formattedAddress: string,
  city: string,
  postcode: string,
  country: string
): string {
  let address = formattedAddress;

  // Remove city, postcode, and country from the formatted address
  [city, postcode, country].forEach((part) => {
    if (part) {
      address = address.replace(new RegExp(`,?\\s*${part}\\s*,?`, 'gi'), '');
    }
  });

  return address.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim();
}

/**
 * Convert Google Places opening hours to our format
 */
function mapOpeningHours(openingHours?: GooglePlaceResult['opening_hours']): Record<string, any> {
  if (!openingHours?.periods) return {};

  const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const result: Record<string, any> = {};

  openingHours.periods.forEach((period) => {
    const dayName = daysMap[period.open.day];

    if (period.close) {
      result[dayName] = {
        open: formatTime(period.open.time),
        close: formatTime(period.close.time),
        closed: false,
      };
    } else {
      // Open 24 hours
      result[dayName] = {
        open: '00:00',
        close: '23:59',
        closed: false,
      };
    }
  });

  // Mark days without entries as closed
  daysMap.forEach((day) => {
    if (!result[day]) {
      result[day] = {
        open: '',
        close: '',
        closed: true,
      };
    }
  });

  return result;
}

/**
 * Format time from HHMM to HH:MM
 */
function formatTime(time: string): string {
  if (time.length !== 4) return time;
  return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
}

/**
 * Infer cuisine type from Google Places types
 */
function inferCuisine(types: string[]): string {
  const cuisineMap: Record<string, string> = {
    'chinese_restaurant': 'Chinese',
    'italian_restaurant': 'Italian',
    'japanese_restaurant': 'Japanese',
    'indian_restaurant': 'Indian',
    'mexican_restaurant': 'Mexican',
    'thai_restaurant': 'Thai',
    'french_restaurant': 'French',
    'spanish_restaurant': 'Spanish',
    'greek_restaurant': 'Greek',
    'korean_restaurant': 'Korean',
    'vietnamese_restaurant': 'Vietnamese',
    'american_restaurant': 'American',
    'pizza_restaurant': 'Pizza',
    'seafood_restaurant': 'Seafood',
    'steakhouse': 'Steakhouse',
    'sushi_restaurant': 'Japanese',
    'fast_food_restaurant': 'Fast Food',
    'cafe': 'Cafe',
    'bakery': 'Bakery',
  };

  for (const type of types) {
    if (cuisineMap[type]) {
      return cuisineMap[type];
    }
  }

  return 'International';
}

/**
 * Main mapping function
 */
export function mapGooglePlaceToRestaurant(placeData: GooglePlaceResult): MappedRestaurantData {
  const city = extractCity(placeData.address_components);
  const postcode = extractPostcode(placeData.address_components);
  const country = extractCountry(placeData.address_components);
  const streetAddress = extractStreetAddress(
    placeData.formatted_address,
    city,
    postcode,
    country
  );

  return {
    name: placeData.name,
    address: streetAddress,
    city,
    country,
    latitude: placeData.geometry.location.lat,
    longitude: placeData.geometry.location.lng,
    phone: placeData.formatted_phone_number || '',
    website_url: placeData.website || '',
    google_maps_url: placeData.url || '',
    price_level: placeData.price_level || 2,
    opening_times: mapOpeningHours(placeData.opening_hours),
    cuisine: inferCuisine(placeData.types),
    image_url: '',
    google_place_id: placeData.place_id || '',
  };
}

/**
 * Simplified mapper for suggestion form (fewer fields)
 */
export function mapGooglePlaceToSuggestion(placeData: GooglePlaceResult) {
  const city = extractCity(placeData.address_components);
  const postcode = extractPostcode(placeData.address_components);
  const streetAddress = extractStreetAddress(
    placeData.formatted_address,
    city,
    postcode,
    extractCountry(placeData.address_components)
  );

  // Note: restaurant_suggestions table has postcode, but restaurants table doesn't
  return {
    name: placeData.name,
    address: streetAddress,
    city,
    postcode,
    phone: placeData.formatted_phone_number || '',
    website: placeData.website || '',
    cuisine: inferCuisine(placeData.types),
    description: `Restaurant suggested via Google Places. Google Maps: ${placeData.url}`,
  };
}
