import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const googleApiKey = process.env.GOOGLE_PLACES_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  booking_url: string | null;
}

const DELAY_BETWEEN_REQUESTS = 1000;

async function searchGooglePlaces(restaurantName: string, address: string): Promise<{ website?: string; placeId?: string } | null> {
  try {
    const query = encodeURIComponent(`${restaurantName} ${address}`);
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${googleApiKey}`;

    console.log(`Searching Google Places for: ${restaurantName}`);

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const place = data.results[0];
      const placeId = place.place_id;

      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=website,url,name&key=${googleApiKey}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (detailsData.status === 'OK' && detailsData.result) {
        const result = detailsData.result;

        if (result.website) {
          console.log(`✓ Found website: ${result.website}`);
          return { website: result.website, placeId };
        }

        console.log(`✗ No website found for ${restaurantName}`);
        return null;
      }
    }

    console.log(`✗ No results found for ${restaurantName}`);
    return null;
  } catch (error) {
    console.error(`Error searching for ${restaurantName}:`, error);
    return null;
  }
}

async function updateRestaurantBookingUrl(restaurantId: string, bookingUrl: string) {
  const { error } = await supabase
    .from('restaurants')
    .update({ booking_url: bookingUrl })
    .eq('id', restaurantId);

  if (error) {
    console.error(`Error updating restaurant ${restaurantId}:`, error);
    return false;
  }

  return true;
}

async function main() {
  console.log('Fetching all restaurants without booking URLs...');

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, address, city, booking_url')
    .is('booking_url', null)
    .order('city', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching restaurants:', error);
    return;
  }

  console.log(`\n=== Found ${restaurants.length} restaurants without booking URLs ===\n`);

  let totalUpdated = 0;
  let totalNotFound = 0;
  let totalProcessed = 0;

  for (const restaurant of restaurants) {
    totalProcessed++;
    console.log(`\n[${totalProcessed}/${restaurants.length}] Processing: ${restaurant.name} (${restaurant.city})`);

    const result = await searchGooglePlaces(restaurant.name, restaurant.address);

    if (result && result.website) {
      const success = await updateRestaurantBookingUrl(restaurant.id, result.website);
      if (success) {
        console.log(`✓ Updated ${restaurant.name} with: ${result.website}`);
        totalUpdated++;
      }
    } else {
      totalNotFound++;
    }

    if (totalProcessed % 10 === 0) {
      console.log(`\n--- Progress Update ---`);
      console.log(`Processed: ${totalProcessed}/${restaurants.length}`);
      console.log(`Updated: ${totalUpdated}`);
      console.log(`Not found: ${totalNotFound}`);
      console.log(`Success rate: ${((totalUpdated / totalProcessed) * 100).toFixed(1)}%`);
    }

    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
  }

  console.log('\n\n=== FINAL SUMMARY ===');
  console.log(`Total restaurants processed: ${restaurants.length}`);
  console.log(`Total updated: ${totalUpdated}`);
  console.log(`Total not found: ${totalNotFound}`);
  console.log(`Success rate: ${((totalUpdated / restaurants.length) * 100).toFixed(1)}%`);
}

main();
