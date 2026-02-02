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

async function searchPlaceAndGetDetails(name: string, address: string) {
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

      if (detailsData.result) {
        return {
          url: detailsData.result.url || null,
          name: detailsData.result.name || null,
          address: detailsData.result.formatted_address || null,
        };
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

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isNameMatch(dbName: string, googleName: string): boolean {
  const normDb = normalizeString(dbName);
  const normGoogle = normalizeString(googleName);

  if (normDb === normGoogle) return true;
  if (normGoogle.includes(normDb)) return true;
  if (normDb.includes(normGoogle)) return true;

  const dbWords = normDb.split(' ');
  const googleWords = normGoogle.split(' ');
  const matchingWords = dbWords.filter(word => googleWords.includes(word));

  return matchingWords.length >= Math.min(dbWords.length, googleWords.length) * 0.6;
}

async function main() {
  console.log('Starting comprehensive Google Maps URL validation...\n');

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, address, city, latitude, longitude, google_maps_url')
    .order('name');

  if (error) {
    console.error('Error fetching restaurants:', error);
    return;
  }

  if (!restaurants || restaurants.length === 0) {
    console.log('No restaurants found!');
    return;
  }

  console.log(`Found ${restaurants.length} restaurants to validate\n`);

  let processed = 0;
  let correct = 0;
  let corrected = 0;
  let added = 0;
  let failed = 0;
  const issues: Array<{restaurant: string, issue: string}> = [];

  for (const restaurant of restaurants) {
    processed++;
    console.log(`\n[${processed}/${restaurants.length}] ${restaurant.name}`);
    console.log(`  Current URL: ${restaurant.google_maps_url || 'None'}`);

    const placeDetails = await searchPlaceAndGetDetails(restaurant.name, restaurant.address);

    if (placeDetails && placeDetails.url) {
      console.log(`  Google found: "${placeDetails.name}"`);
      console.log(`  Google URL: ${placeDetails.url}`);

      if (!isNameMatch(restaurant.name, placeDetails.name)) {
        console.log(`  ⚠️  WARNING: Name mismatch!`);
        console.log(`     Database: "${restaurant.name}"`);
        console.log(`     Google:   "${placeDetails.name}"`);
        issues.push({
          restaurant: `${restaurant.name} (${restaurant.id})`,
          issue: `Name mismatch - Google shows "${placeDetails.name}"`
        });
      }

      if (!restaurant.google_maps_url) {
        console.log(`  ✓ Adding new URL`);
        const success = await updateRestaurantUrl(restaurant.id, placeDetails.url);
        if (success) {
          added++;
        } else {
          failed++;
        }
      } else if (restaurant.google_maps_url !== placeDetails.url) {
        console.log(`  ⚠️  URL mismatch - updating`);
        console.log(`     Old: ${restaurant.google_maps_url}`);
        console.log(`     New: ${placeDetails.url}`);
        const success = await updateRestaurantUrl(restaurant.id, placeDetails.url);
        if (success) {
          corrected++;
          issues.push({
            restaurant: `${restaurant.name} (${restaurant.id})`,
            issue: 'URL was incorrect and has been corrected'
          });
        } else {
          failed++;
        }
      } else {
        console.log(`  ✓ URL is correct`);
        correct++;
      }
    } else {
      console.log(`  ✗ Could not find on Google Places`);
      if (!restaurant.google_maps_url) {
        failed++;
      } else {
        console.log(`  ⚠️  Keeping existing URL (unverifiable)`);
        issues.push({
          restaurant: `${restaurant.name} (${restaurant.id})`,
          issue: 'Could not verify URL via Google Places API'
        });
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    if (processed % 50 === 0) {
      console.log(`\n--- Progress: ${processed}/${restaurants.length} ---\n`);
    }
  }

  console.log(`\n\n${'='.repeat(60)}`);
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total restaurants processed: ${processed}`);
  console.log(`URLs that were correct: ${correct}`);
  console.log(`URLs corrected: ${corrected}`);
  console.log(`New URLs added: ${added}`);
  console.log(`Failed/Could not verify: ${failed}`);
  console.log(`\nTotal issues found: ${issues.length}`);

  if (issues.length > 0) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('ISSUES FOUND');
    console.log('='.repeat(60));
    issues.forEach((item, idx) => {
      console.log(`\n${idx + 1}. ${item.restaurant}`);
      console.log(`   ${item.issue}`);
    });
  }
}

main().catch(console.error);
