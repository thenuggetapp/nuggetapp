/**
 * Script to fetch and update a single restaurant's image from Google Places API
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

async function searchGooglePlaces(restaurantName: string, city: string): Promise<string | null> {
  try {
    console.log(`\nSearching Google Places for: ${restaurantName} in ${city}`);

    // Step 1: Autocomplete search
    const autocompleteResponse = await fetch(
      `${supabaseUrl}/functions/v1/google-places?action=autocomplete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          input: `${restaurantName} ${city}`,
        }),
      }
    );

    if (!autocompleteResponse.ok) {
      console.error('Autocomplete request failed:', await autocompleteResponse.text());
      return null;
    }

    const autocompleteData = await autocompleteResponse.json();
    console.log(`Found ${autocompleteData.predictions?.length || 0} predictions`);

    if (!autocompleteData.predictions || autocompleteData.predictions.length === 0) {
      console.log('No results found in autocomplete');
      return null;
    }

    // Get the first result's place_id
    const placeId = autocompleteData.predictions[0].place_id;
    console.log(`Using place_id: ${placeId}`);

    // Step 2: Get place details
    const detailsResponse = await fetch(
      `${supabaseUrl}/functions/v1/google-places?action=details`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ placeId }),
      }
    );

    if (!detailsResponse.ok) {
      console.error('Details request failed:', await detailsResponse.text());
      return null;
    }

    const detailsData = await detailsResponse.json();

    if (detailsData.result?.photos && detailsData.result.photos.length > 0) {
      const photoReference = detailsData.result.photos[0].photo_reference;
      console.log(`Found photo reference: ${photoReference.substring(0, 30)}...`);

      // Step 3: Generate photo URL
      const photoUrl = `${supabaseUrl}/functions/v1/google-places?action=photo&photo_reference=${photoReference}&maxwidth=800`;
      console.log(`Generated photo URL: ${photoUrl}`);

      return photoUrl;
    } else {
      console.log('No photos found for this place');
      return null;
    }
  } catch (error) {
    console.error('Error fetching from Google Places:', error);
    return null;
  }
}

async function updateRestaurantImage(restaurantName: string) {
  try {
    // Find the restaurant
    console.log(`Looking up restaurant: ${restaurantName}`);
    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('id, name, city, address, image_url')
      .ilike('name', restaurantName)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching restaurant:', fetchError);
      return;
    }

    if (!restaurant) {
      console.error(`Restaurant "${restaurantName}" not found in database`);
      return;
    }

    console.log(`\nFound restaurant:`);
    console.log(`  ID: ${restaurant.id}`);
    console.log(`  Name: ${restaurant.name}`);
    console.log(`  City: ${restaurant.city}`);
    console.log(`  Address: ${restaurant.address}`);
    console.log(`  Current image_url: ${restaurant.image_url || '(none)'}`);

    // Fetch image from Google Places
    const imageUrl = await searchGooglePlaces(restaurant.name, restaurant.city);

    if (!imageUrl) {
      console.log('\n❌ Could not find image for this restaurant');
      return;
    }

    // Update the database
    console.log(`\nUpdating database with new image URL...`);
    const { error: updateError } = await supabase
      .from('restaurants')
      .update({ image_url: imageUrl })
      .eq('id', restaurant.id);

    if (updateError) {
      console.error('Error updating restaurant:', updateError);
      return;
    }

    console.log('\n✅ Successfully updated restaurant image!');
    console.log(`   New image URL: ${imageUrl}`);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
const restaurantName = 'Tuco And Blondie';
updateRestaurantImage(restaurantName).then(() => {
  console.log('\n--- Script completed ---');
  process.exit(0);
});
