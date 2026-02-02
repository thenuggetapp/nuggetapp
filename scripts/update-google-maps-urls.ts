import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const googlePlacesUrl = `${supabaseUrl}/functions/v1/google-places`;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  google_maps_url: string | null;
}

async function searchPlace(name: string, address: string) {
  try {
    const searchQuery = `${name}, ${address}`;
    console.log(`  Searching: "${searchQuery}"`);

    const autocompleteResponse = await fetch(`${googlePlacesUrl}?action=autocomplete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        input: searchQuery,
      }),
    });

    const autocompleteData = await autocompleteResponse.json();

    if (autocompleteData.predictions && autocompleteData.predictions.length > 0) {
      const placeId = autocompleteData.predictions[0].place_id;
      console.log(`  Found place_id: ${placeId}`);

      const detailsResponse = await fetch(`${googlePlacesUrl}?action=details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          placeId,
        }),
      });

      const detailsData = await detailsResponse.json();

      if (detailsData.result && detailsData.result.url) {
        return detailsData.result.url;
      }
    }

    return null;
  } catch (error) {
    console.error(`  Error searching place:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function updateRestaurantUrl(restaurantId: string, googleMapsUrl: string) {
  try {
    const { error } = await supabase
      .from('restaurants')
      .update({ google_maps_url: googleMapsUrl })
      .eq('id', restaurantId);

    if (error) {
      console.error(`  Failed to update: ${error.message}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`  Error updating restaurant:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function main() {
  console.log('Starting Google Maps URL validation and update...\n');

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, address, city, latitude, longitude, google_maps_url')
    .is('google_maps_url', null)
    .order('name');

  if (error) {
    console.error('Error fetching restaurants:', error);
    return;
  }

  if (!restaurants || restaurants.length === 0) {
    console.log('No restaurants without Google Maps URLs found!');

    console.log('\nChecking all restaurants to verify URLs...');
    const { data: allRestaurants, error: allError } = await supabase
      .from('restaurants')
      .select('id, name, address, city, latitude, longitude, google_maps_url')
      .order('name')
      .limit(10);

    if (allError) {
      console.error('Error fetching all restaurants:', allError);
      return;
    }

    console.log(`\nProcessing first 10 restaurants to verify URLs:\n`);

    let verified = 0;
    let updated = 0;

    for (const restaurant of allRestaurants || []) {
      console.log(`\n[${verified + 1}/${allRestaurants?.length}] ${restaurant.name}`);
      console.log(`  Current URL: ${restaurant.google_maps_url || 'None'}`);

      const newUrl = await searchPlace(restaurant.name, restaurant.address);

      if (newUrl) {
        if (newUrl !== restaurant.google_maps_url) {
          console.log(`  New URL found: ${newUrl}`);
          const success = await updateRestaurantUrl(restaurant.id, newUrl);
          if (success) {
            console.log(`  ✓ Updated`);
            updated++;
          }
        } else {
          console.log(`  ✓ URL is correct`);
        }
      } else {
        console.log(`  ✗ Could not find Google Maps URL`);
      }

      verified++;

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n\nVerification Summary:`);
    console.log(`- Restaurants checked: ${verified}`);
    console.log(`- URLs updated: ${updated}`);
    return;
  }

  console.log(`Found ${restaurants.length} restaurants without Google Maps URLs\n`);

  let processed = 0;
  let updated = 0;
  let failed = 0;

  for (const restaurant of restaurants) {
    processed++;
    console.log(`\n[${processed}/${restaurants.length}] ${restaurant.name}`);
    console.log(`  Address: ${restaurant.address}`);

    const googleMapsUrl = await searchPlace(restaurant.name, restaurant.address);

    if (googleMapsUrl) {
      console.log(`  Found URL: ${googleMapsUrl}`);
      const success = await updateRestaurantUrl(restaurant.id, googleMapsUrl);
      if (success) {
        console.log(`  ✓ Updated successfully`);
        updated++;
      } else {
        failed++;
      }
    } else {
      console.log(`  ✗ Could not find Google Maps URL`);
      failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n\nUpdate Summary:`);
  console.log(`- Total restaurants processed: ${processed}`);
  console.log(`- Successfully updated: ${updated}`);
  console.log(`- Failed: ${failed}`);
}

main().catch(console.error);
