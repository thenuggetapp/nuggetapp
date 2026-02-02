import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  booking_url: string | null;
}

async function searchOpenTableUK(restaurantName: string, city: string): Promise<string | null> {
  try {
    const searchQuery = encodeURIComponent(`${restaurantName} ${city}`);
    const searchUrl = `https://www.opentable.co.uk/s?term=${searchQuery}`;

    console.log(`Searching OpenTable UK for: ${restaurantName}`);

    const response = await fetch(searchUrl);
    const html = await response.text();

    const restaurantUrlMatch = html.match(/href="(https:\/\/www\.opentable\.co\.uk\/r\/[^"]+)"/);

    if (restaurantUrlMatch && restaurantUrlMatch[1]) {
      const bookingUrl = restaurantUrlMatch[1];
      console.log(`✓ Found booking URL: ${bookingUrl}`);
      return bookingUrl;
    }

    console.log(`✗ No booking URL found for ${restaurantName}`);
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
  console.log('Fetching London restaurants...');

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, address, city, booking_url')
    .ilike('city', '%london%')
    .eq('visible', true)
    .order('name');

  if (error) {
    console.error('Error fetching restaurants:', error);
    return;
  }

  console.log(`Found ${restaurants.length} London restaurants`);

  let updatedCount = 0;
  let skippedCount = 0;
  let notFoundCount = 0;

  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i] as Restaurant;

    console.log(`\n[${i + 1}/${restaurants.length}] Processing: ${restaurant.name}`);

    if (restaurant.booking_url && restaurant.booking_url.includes('opentable.co.uk')) {
      console.log(`Skipping - already has OpenTable UK booking URL`);
      skippedCount++;
      continue;
    }

    const bookingUrl = await searchOpenTableUK(restaurant.name, restaurant.city);

    if (bookingUrl) {
      const success = await updateRestaurantBookingUrl(restaurant.id, bookingUrl);
      if (success) {
        console.log(`✓ Updated ${restaurant.name}`);
        updatedCount++;
      }
    } else {
      notFoundCount++;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n=== Summary ===');
  console.log(`Total restaurants: ${restaurants.length}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Skipped (already had URL): ${skippedCount}`);
  console.log(`Not found on OpenTable: ${notFoundCount}`);
}

main();
