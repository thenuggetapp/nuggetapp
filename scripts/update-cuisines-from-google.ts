/**
 * Script to update restaurant cuisine types from Google Places API
 *
 * This script:
 * 1. Fetches restaurants with "Various" cuisine
 * 2. Searches Google Places API using restaurant name and address
 * 3. Extracts cuisine type from place types
 * 4. Updates the restaurant in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const googleApiKey = process.env.GOOGLE_PLACES_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  cuisine: string;
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
    'bar': 'Bar & Grill',
    'barbecue_restaurant': 'BBQ',
    'hamburger_restaurant': 'Burgers',
    'sandwich_shop': 'Sandwiches',
    'meal_takeaway': 'Takeaway',
    'mediterranean_restaurant': 'Mediterranean',
    'middle_eastern_restaurant': 'Middle Eastern',
    'turkish_restaurant': 'Turkish',
    'lebanese_restaurant': 'Lebanese',
    'brazilian_restaurant': 'Brazilian',
  };

  for (const type of types) {
    if (cuisineMap[type]) {
      return cuisineMap[type];
    }
  }

  return 'International';
}

/**
 * Search for a restaurant in Google Places
 */
async function searchGooglePlace(restaurant: Restaurant): Promise<string | null> {
  try {
    // First try: Text search with name and city
    const searchQuery = `${restaurant.name} ${restaurant.city}`;
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.set('query', searchQuery);
    searchUrl.searchParams.set('type', 'restaurant');
    searchUrl.searchParams.set('key', googleApiKey);

    // Add location bias if coordinates are available
    if (restaurant.latitude && restaurant.longitude) {
      searchUrl.searchParams.set('location', `${restaurant.latitude},${restaurant.longitude}`);
      searchUrl.searchParams.set('radius', '100');
    }

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (searchData.status !== 'OK' || !searchData.results?.[0]) {
      console.log(`No results found for: ${restaurant.name}`);
      return null;
    }

    const place = searchData.results[0];

    if (!place.types || place.types.length === 0) {
      console.log(`No types found for: ${restaurant.name}`);
      return null;
    }

    const cuisine = inferCuisine(place.types);
    console.log(`${restaurant.name} -> ${cuisine} (from types: ${place.types.slice(0, 3).join(', ')})`);

    return cuisine;
  } catch (error) {
    console.error(`Error searching for ${restaurant.name}:`, error);
    return null;
  }
}

/**
 * Update restaurant cuisine in Supabase
 */
async function updateRestaurantCuisine(restaurantId: string, cuisine: string): Promise<void> {
  const { error } = await supabase
    .from('restaurants')
    .update({ cuisine })
    .eq('id', restaurantId);

  if (error) {
    console.error(`Error updating restaurant ${restaurantId}:`, error);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting cuisine update process...\n');

  // Fetch restaurants with "Various" cuisine
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, address, city, latitude, longitude, cuisine')
    .eq('cuisine', 'Various')
    .limit(50); // Process in batches to avoid rate limits

  if (error) {
    console.error('Error fetching restaurants:', error);
    return;
  }

  if (!restaurants || restaurants.length === 0) {
    console.log('No restaurants with "Various" cuisine found.');
    return;
  }

  console.log(`Found ${restaurants.length} restaurants to update.\n`);

  let updated = 0;
  let failed = 0;

  for (const restaurant of restaurants) {
    console.log(`Processing: ${restaurant.name}...`);

    const cuisine = await searchGooglePlace(restaurant);

    if (cuisine && cuisine !== 'International') {
      await updateRestaurantCuisine(restaurant.id, cuisine);
      updated++;
    } else {
      failed++;
    }

    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n===== Summary =====');
  console.log(`Total processed: ${restaurants.length}`);
  console.log(`Successfully updated: ${updated}`);
  console.log(`Failed or no change: ${failed}`);
}

main().catch(console.error);
