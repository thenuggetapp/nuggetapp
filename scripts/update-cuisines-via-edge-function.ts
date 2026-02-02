/**
 * Script to update restaurant cuisine types using the Supabase Edge Function
 *
 * This script:
 * 1. Fetches restaurants with "Various" cuisine
 * 2. Calls the google-places edge function to search for each restaurant
 * 3. Extracts cuisine type from place types
 * 4. Updates the restaurant in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role key for updates (bypasses RLS), anon key for Google Places API calls
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
 * Prioritizes specific cuisine types over generic ones
 */
function inferCuisine(types: string[]): string {
  // Priority 1: Specific cuisine restaurant types (highest priority)
  const specificCuisineMap: Record<string, string> = {
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
    'mediterranean_restaurant': 'Mediterranean',
    'middle_eastern_restaurant': 'Middle Eastern',
    'turkish_restaurant': 'Turkish',
    'lebanese_restaurant': 'Lebanese',
    'brazilian_restaurant': 'Brazilian',
    'persian_restaurant': 'Persian',
    'ethiopian_restaurant': 'Ethiopian',
    'asian_restaurant': 'Asian',
  };

  // Priority 2: Specific food types
  const specificFoodMap: Record<string, string> = {
    'pizza_restaurant': 'Pizza',
    'seafood_restaurant': 'Seafood',
    'steakhouse': 'Steakhouse',
    'sushi_restaurant': 'Japanese',
    'ramen_restaurant': 'Japanese',
    'barbecue_restaurant': 'BBQ',
    'hamburger_restaurant': 'Burgers',
    'sandwich_shop': 'Sandwiches',
    'soul_food_restaurant': 'Soul Food',
  };

  // Priority 3: Generic food service types (lower priority)
  const genericMap: Record<string, string> = {
    'fast_food_restaurant': 'Fast Food',
    'cafe': 'Cafe',
    'bakery': 'Bakery',
    'bar': 'Bar & Grill',
    'meal_takeaway': 'Various', // Keep as Various for now
  };

  // Check in priority order
  for (const type of types) {
    if (specificCuisineMap[type]) {
      return specificCuisineMap[type];
    }
  }

  for (const type of types) {
    if (specificFoodMap[type]) {
      return specificFoodMap[type];
    }
  }

  for (const type of types) {
    if (genericMap[type]) {
      return genericMap[type];
    }
  }

  return 'International';
}

/**
 * Search for a restaurant using the edge function
 */
async function searchRestaurant(restaurant: Restaurant): Promise<string | null> {
  try {
    // Use the autocomplete endpoint to find the place
    const searchQuery = `${restaurant.name} ${restaurant.city}`;
    const location = restaurant.latitude && restaurant.longitude
      ? `${restaurant.latitude},${restaurant.longitude}`
      : undefined;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/google-places?action=autocomplete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          input: searchQuery,
          location,
          radius: 1000,
        }),
      }
    );

    const data = await response.json();

    if (data.status !== 'OK' || !data.predictions?.[0]) {
      console.log(`  ❌ No results found`);
      return null;
    }

    const placeId = data.predictions[0].place_id;

    // Get place details to get the types
    const detailsResponse = await fetch(
      `${supabaseUrl}/functions/v1/google-places?action=details`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          placeId,
        }),
      }
    );

    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK' || !detailsData.result?.types) {
      console.log(`  ❌ No types found`);
      return null;
    }

    const cuisine = inferCuisine(detailsData.result.types);
    const typesPreview = detailsData.result.types.slice(0, 3).join(', ');
    console.log(`  ✓ ${cuisine} (${typesPreview})`);

    return cuisine;
  } catch (error) {
    console.error(`  ❌ Error:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Update restaurant cuisine in Supabase
 */
async function updateRestaurantCuisine(restaurantId: string, cuisine: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('restaurants')
    .update({ cuisine })
    .eq('id', restaurantId);

  if (error) {
    console.error(`  ❌ Error updating database:`, error.message);
    return false;
  }

  return true;
}

/**
 * Main function
 */
async function main() {
  console.log('🍽️  Starting cuisine update process...\n');

  // Check if service role key is available
  if (!supabaseServiceKey) {
    console.warn('⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not found in .env file.');
    console.warn('⚠️  Updates may fail due to RLS policies. Add the key to .env file.\n');
  }

  // Check connection
  const { data: testData, error: testError } = await supabaseAdmin
    .from('restaurants')
    .select('count')
    .limit(1);

  if (testError) {
    console.error('❌ Error connecting to Supabase:', testError);
    return;
  }

  // Fetch restaurants with "Various" cuisine
  const batchSize = 30; // Process 30 at a time
  const { data: restaurants, error } = await supabaseAdmin
    .from('restaurants')
    .select('id, name, address, city, latitude, longitude, cuisine')
    .eq('cuisine', 'Various')
    .limit(batchSize);

  if (error) {
    console.error('❌ Error fetching restaurants:', error);
    return;
  }

  if (!restaurants || restaurants.length === 0) {
    console.log('✓ No restaurants with "Various" cuisine found.');
    return;
  }

  console.log(`📊 Found ${restaurants.length} restaurants to update.\n`);

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i];
    console.log(`[${i + 1}/${restaurants.length}] ${restaurant.name} (${restaurant.city})`);

    const cuisine = await searchRestaurant(restaurant);

    if (cuisine && cuisine !== 'International' && cuisine !== 'Various') {
      const success = await updateRestaurantCuisine(restaurant.id, cuisine);
      if (success) {
        updated++;
      } else {
        failed++;
      }
    } else if (cuisine === 'International') {
      skipped++;
      console.log(`  ⊘ Skipped (would remain generic)`);
    } else {
      failed++;
    }

    // Rate limiting: wait 200ms between requests to avoid quota issues
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📈 Summary');
  console.log('='.repeat(50));
  console.log(`Total processed:      ${restaurants.length}`);
  console.log(`✓ Successfully updated: ${updated}`);
  console.log(`⊘ Skipped (generic):    ${skipped}`);
  console.log(`❌ Failed:              ${failed}`);
  console.log('='.repeat(50));
  console.log('\n💡 To process more restaurants, run this script again.\n');
}

main().catch(console.error);
