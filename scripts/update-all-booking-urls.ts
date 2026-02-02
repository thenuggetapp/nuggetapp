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

const BATCH_SIZE = 50;
const DELAY_BETWEEN_REQUESTS = 2000;

async function searchOpenTable(restaurantName: string, city: string, isUK: boolean): Promise<string | null> {
  try {
    const searchQuery = encodeURIComponent(`${restaurantName} ${city}`);
    const domain = isUK ? 'opentable.co.uk' : 'opentable.com';
    const searchUrl = `https://www.${domain}/s?term=${searchQuery}`;

    console.log(`Searching ${domain} for: ${restaurantName}`);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.log(`✗ HTTP ${response.status} for ${restaurantName}`);
      return null;
    }

    const html = await response.text();
    const urlPattern = new RegExp(`href="(https:\\/\\/www\\.${domain.replace('.', '\\.')}\\/r\\/[^"]+)"`, 'i');
    const restaurantUrlMatch = html.match(urlPattern);

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

function isUKCity(city: string): boolean {
  const ukCities = [
    'london', 'birmingham', 'manchester', 'liverpool', 'leeds', 'glasgow',
    'edinburgh', 'bristol', 'cardiff', 'belfast', 'nottingham', 'sheffield',
    'woodford green', 'richmond', 'rye', 'guildford', 'tadworth', 'loughton',
    'northwood', 'hampton'
  ];
  return ukCities.some(ukCity => city.toLowerCase().includes(ukCity));
}

function isUSCity(city: string): boolean {
  const usCities = [
    'chicago', 'san francisco', 'new york', 'los angeles', 'milwaukee',
    'schaumburg', 'oak brook', 'lombard', 'glen ellyn', 'south barrington'
  ];
  return usCities.some(usCity => city.toLowerCase().includes(usCity));
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

async function processBatch(restaurants: Restaurant[], startIndex: number) {
  let updatedCount = 0;
  let notFoundCount = 0;

  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i];
    const globalIndex = startIndex + i;

    console.log(`\n[${globalIndex + 1}] Processing: ${restaurant.name} (${restaurant.city})`);

    const isUK = isUKCity(restaurant.city);
    const isUS = isUSCity(restaurant.city);

    let bookingUrl = null;

    if (isUK) {
      bookingUrl = await searchOpenTable(restaurant.name, restaurant.city, true);
    } else if (isUS) {
      bookingUrl = await searchOpenTable(restaurant.name, restaurant.city, false);
    } else {
      console.log(`Skipping - city not recognized: ${restaurant.city}`);
      notFoundCount++;
      continue;
    }

    if (bookingUrl) {
      const success = await updateRestaurantBookingUrl(restaurant.id, bookingUrl);
      if (success) {
        console.log(`✓ Updated ${restaurant.name}`);
        updatedCount++;
      }
    } else {
      notFoundCount++;
    }

    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
  }

  return { updatedCount, notFoundCount };
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

  for (let i = 0; i < restaurants.length; i += BATCH_SIZE) {
    const batch = restaurants.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(restaurants.length / BATCH_SIZE);

    console.log(`\n\n========== BATCH ${batchNumber}/${totalBatches} ==========`);
    console.log(`Processing restaurants ${i + 1} to ${Math.min(i + BATCH_SIZE, restaurants.length)}`);

    const { updatedCount, notFoundCount } = await processBatch(batch, i);

    totalUpdated += updatedCount;
    totalNotFound += notFoundCount;

    console.log(`\n--- Batch ${batchNumber} Summary ---`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Not found: ${notFoundCount}`);
  }

  console.log('\n\n=== FINAL SUMMARY ===');
  console.log(`Total restaurants processed: ${restaurants.length}`);
  console.log(`Total updated: ${totalUpdated}`);
  console.log(`Total not found: ${totalNotFound}`);
  console.log(`Success rate: ${((totalUpdated / restaurants.length) * 100).toFixed(1)}%`);
}

main();
