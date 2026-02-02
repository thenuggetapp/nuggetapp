/**
 * Script to update restaurants with "Various" cuisine using Google Places API
 *
 * This script:
 * 1. Fetches all restaurants with cuisine = "Various"
 * 2. Calls the google-places edge function to get details
 * 3. Extracts cuisine types from Google Places types
 * 4. Updates the database with proper cuisine
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Map Google Places types to our cuisine categories
const cuisineMapping: Record<string, string> = {
  'american_restaurant': 'American',
  'bakery': 'Bakery',
  'bar': 'Bar',
  'barbecue_restaurant': 'BBQ',
  'brazilian_restaurant': 'Brazilian',
  'breakfast_restaurant': 'Breakfast',
  'brunch_restaurant': 'Brunch',
  'cafe': 'Cafe',
  'chinese_restaurant': 'Chinese',
  'coffee_shop': 'Coffee Shop',
  'fast_food_restaurant': 'Fast Food',
  'french_restaurant': 'French',
  'greek_restaurant': 'Greek',
  'hamburger_restaurant': 'Burgers',
  'ice_cream_shop': 'Dessert',
  'indian_restaurant': 'Indian',
  'indonesian_restaurant': 'Indonesian',
  'italian_restaurant': 'Italian',
  'japanese_restaurant': 'Japanese',
  'korean_restaurant': 'Korean',
  'lebanese_restaurant': 'Lebanese',
  'meal_delivery': 'Delivery',
  'meal_takeaway': 'Takeout',
  'mediterranean_restaurant': 'Mediterranean',
  'mexican_restaurant': 'Mexican',
  'middle_eastern_restaurant': 'Middle Eastern',
  'pizza_restaurant': 'Pizza',
  'ramen_restaurant': 'Ramen',
  'restaurant': 'Restaurant',
  'sandwich_shop': 'Sandwiches',
  'seafood_restaurant': 'Seafood',
  'spanish_restaurant': 'Spanish',
  'steak_house': 'Steakhouse',
  'sushi_restaurant': 'Sushi',
  'thai_restaurant': 'Thai',
  'turkish_restaurant': 'Turkish',
  'vegan_restaurant': 'Vegan',
  'vegetarian_restaurant': 'Vegetarian',
  'vietnamese_restaurant': 'Vietnamese',
};

interface Restaurant {
  id: string;
  name: string;
  google_place_id: string | null;
  cuisine: string;
}

async function callGooglePlacesEdgeFunction(placeId: string): Promise<any> {
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/google-places?action=details`;

  try {
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ placeId }),
    });

    if (!response.ok) {
      throw new Error(`Edge function returned ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error calling edge function for place ${placeId}:`, error);
    return null;
  }
}

function extractCuisineFromTypes(types: string[]): string {
  if (!types || types.length === 0) {
    return 'Various';
  }

  // Find the most specific cuisine type
  for (const type of types) {
    if (cuisineMapping[type] && cuisineMapping[type] !== 'Restaurant') {
      return cuisineMapping[type];
    }
  }

  // If only generic "restaurant" found, return Various
  return 'Various';
}

async function updateRestaurantCuisine(restaurantId: string, cuisine: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('restaurants')
      .update({ cuisine })
      .eq('id', restaurantId);

    if (error) {
      console.error(`Error updating restaurant ${restaurantId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Exception updating restaurant ${restaurantId}:`, error);
    return false;
  }
}

async function main() {
  console.log('🔍 Fetching restaurants with "Various" cuisine...\n');

  // Fetch all restaurants with cuisine = "Various"
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, google_place_id, cuisine')
    .eq('cuisine', 'Various')
    .not('google_place_id', 'is', null);

  if (error) {
    console.error('Error fetching restaurants:', error);
    process.exit(1);
  }

  if (!restaurants || restaurants.length === 0) {
    console.log('✅ No restaurants with "Various" cuisine found!');
    return;
  }

  console.log(`📊 Found ${restaurants.length} restaurants to update\n`);

  let updated = 0;
  let failed = 0;
  let unchanged = 0;

  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i];
    console.log(`[${i + 1}/${restaurants.length}] Processing: ${restaurant.name}`);

    if (!restaurant.google_place_id) {
      console.log('  ⚠️  No Google Place ID, skipping...');
      failed++;
      continue;
    }

    // Call the edge function
    const placeDetails = await callGooglePlacesEdgeFunction(restaurant.google_place_id);

    if (!placeDetails || placeDetails.status !== 'OK') {
      console.log(`  ❌ Failed to fetch place details`);
      failed++;
      continue;
    }

    // Extract cuisine from types
    const types = placeDetails.result?.types || [];
    const newCuisine = extractCuisineFromTypes(types);

    if (newCuisine === 'Various') {
      console.log(`  ➡️  Still "Various" (types: ${types.join(', ')})`);
      unchanged++;
      continue;
    }

    // Update the database
    const success = await updateRestaurantCuisine(restaurant.id, newCuisine);

    if (success) {
      console.log(`  ✅ Updated to: ${newCuisine}`);
      updated++;
    } else {
      console.log(`  ❌ Failed to update database`);
      failed++;
    }

    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📈 Summary:');
  console.log(`  ✅ Updated: ${updated}`);
  console.log(`  ➡️  Unchanged: ${unchanged}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Total: ${restaurants.length}`);
  console.log('='.repeat(50));
}

main().catch(console.error);
