/**
 * Fetch images for all restaurants missing images from Google Places
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bothvdppmqybygdfoqag.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdGh2ZHBwbXF5YnlnZGZvcWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjQ0OTEsImV4cCI6MjA3NjY0MDQ5MX0.xZz4NX8PPdPI6xNaLisARzcau83UIEIrRQiTJmK5ZxU';
// Note: Using anon key - storage policy allows public uploads during migration
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchImageForRestaurant(restaurant) {
  const { id, name, address } = restaurant;

  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Processing: ${name}`);
    console.log(`Address: ${address}`);
    console.log('='.repeat(80));

    // Step 1: Search for the restaurant on Google Places
    console.log('Step 1: Searching Google Places...');

    const searchQuery = `${name} ${address}`;
    const autocompleteResponse = await fetch(
      `${supabaseUrl}/functions/v1/google-places?action=autocomplete`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: searchQuery,
        }),
      }
    );

    if (!autocompleteResponse.ok) {
      throw new Error(`Autocomplete failed: ${autocompleteResponse.status} ${autocompleteResponse.statusText}`);
    }

    const autocompleteData = await autocompleteResponse.json();

    if (!autocompleteData.predictions || autocompleteData.predictions.length === 0) {
      throw new Error('No results found for this restaurant');
    }

    const placeId = autocompleteData.predictions[0].place_id;
    console.log(`✓ Found place ID: ${placeId}`);

    // Step 2: Get place details including photos
    console.log('Step 2: Fetching place details...');

    const detailsResponse = await fetch(
      `${supabaseUrl}/functions/v1/google-places?action=details`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeId: placeId,
        }),
      }
    );

    if (!detailsResponse.ok) {
      throw new Error(`Details failed: ${detailsResponse.status} ${detailsResponse.statusText}`);
    }

    const detailsData = await detailsResponse.json();
    const place = detailsData.result;

    console.log(`✓ Received place details`);

    // Extract additional data
    const websiteUrl = place.website || null;
    const googleMapsUrl = place.url || null;
    const types = place.types || [];

    // Extract cuisine from types
    const cuisineTypes = types.filter(type =>
      !['point_of_interest', 'establishment', 'food', 'store'].includes(type)
    );
    const cuisine = cuisineTypes.length > 0 ? cuisineTypes[0].replace(/_/g, ' ') : null;

    // Check for wheelchair accessibility
    const wheelchairAccessible = place.wheelchair_accessible_entrance || false;

    if (!place.photos || place.photos.length === 0) {
      throw new Error('No photos found for this restaurant');
    }

    const photoReference = place.photos[0].photo_reference;
    console.log(`✓ Found photo reference`);

    // Step 3: Download the photo
    console.log('Step 3: Downloading photo...');

    const photoResponse = await fetch(
      `${supabaseUrl}/functions/v1/google-places?action=photo&photo_reference=${photoReference}&maxwidth=800`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
      }
    );

    if (!photoResponse.ok) {
      throw new Error(`Photo download failed: ${photoResponse.status} ${photoResponse.statusText}`);
    }

    const imageBlob = await photoResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    console.log(`✓ Downloaded image (${imageBlob.size} bytes)`);

    // Step 4: Upload to Supabase Storage
    console.log('Step 4: Uploading to Supabase Storage...');

    const filename = `${id}-${Date.now()}.jpg`;
    const filePath = `restaurants/${filename}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('restaurant-images')
      .upload(filePath, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    console.log(`✓ Uploaded to storage: ${filePath}`);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log(`✓ Public URL: ${publicUrl}`);

    // Step 5: Add to restaurant_images table
    console.log('Step 5: Adding to restaurant_images table...');

    const { error: insertError } = await supabase
      .from('restaurant_images')
      .insert({
        restaurant_id: id,
        image_url: publicUrl,
        is_featured: true,
        display_order: 1,
      });

    if (insertError) {
      throw insertError;
    }

    console.log(`✓ Image added to restaurant_images table`);

    // Step 6: Update restaurant with additional info
    console.log('Step 6: Updating restaurant with Google Places data...');

    const updateData = {};
    if (websiteUrl) updateData.website_url = websiteUrl;
    if (googleMapsUrl) updateData.google_maps_url = googleMapsUrl;
    if (cuisine) updateData.cuisine = cuisine;
    if (wheelchairAccessible !== null) updateData.wheelchair_access = wheelchairAccessible;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('restaurants')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        console.error('Warning: Could not update restaurant:', updateError.message);
      } else {
        console.log(`✓ Restaurant updated with ${Object.keys(updateData).length} fields`);
      }
    }

    console.log(`✅ SUCCESS: ${name}`);

    return { success: true, restaurant: name };

  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
    return { success: false, restaurant: name, error: error.message };
  }
}

async function main() {
  try {
    console.log('Fetching restaurants without images...\n');

    // Get all restaurants
    const { data: allRestaurants, error: restError } = await supabase
      .from('restaurants')
      .select('id, name, city, address')
      .eq('visible', true)
      .order('name');

    if (restError) {
      throw restError;
    }

    // Get all restaurant IDs that have images
    const { data: restaurantImages, error: imgError } = await supabase
      .from('restaurant_images')
      .select('restaurant_id');

    if (imgError) {
      throw imgError;
    }

    const restaurantIdsWithImages = new Set(restaurantImages.map(img => img.restaurant_id));

    // Filter to only restaurants without images
    const restaurants = allRestaurants.filter(r => !restaurantIdsWithImages.has(r.id));

    if (!restaurants) {
      throw new Error('Failed to fetch restaurants');
    }

    console.log(`Found ${restaurants.length} restaurants without images\n`);

    if (restaurants.length === 0) {
      console.log('All restaurants have images! 🎉');
      return;
    }

    const results = [];

    // Process each restaurant with a delay to avoid rate limits
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      console.log(`\nProcessing ${i + 1}/${restaurants.length}...`);

      const result = await fetchImageForRestaurant(restaurant);
      results.push(result);

      // Wait 2 seconds between requests to avoid rate limits
      if (i < restaurants.length - 1) {
        console.log('\nWaiting 2 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\nTotal: ${results.length}`);
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\nFailed restaurants:');
      failed.forEach(f => {
        console.log(`  - ${f.restaurant}: ${f.error}`);
      });
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
