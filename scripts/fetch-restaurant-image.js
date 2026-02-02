/**
 * Fetch restaurant image from Google Places and upload to Supabase Storage
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bothvdppmqybygdfoqag.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdGh2ZHBwbXF5YnlnZGZvcWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjQ0OTEsImV4cCI6MjA3NjY0MDQ5MX0.xZz4NX8PPdPI6xNaLisARzcau83UIEIrRQiTJmK5ZxU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const restaurantId = '2279b348-a3c3-4f1e-8112-b448d800d2a1';
const restaurantName = 'Tacolicious - Marina';
const restaurantAddress = '2250 Chestnut Street, San Francisco, CA, 94123';

async function fetchRestaurantImage() {
  try {
    console.log(`Fetching image for: ${restaurantName}`);
    console.log(`Address: ${restaurantAddress}\n`);

    // Step 1: Search for the restaurant on Google Places
    console.log('Step 1: Searching Google Places...\n');

    const searchQuery = `${restaurantName} ${restaurantAddress}`;
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
    console.log(`✓ Found place ID: ${placeId}\n`);

    // Step 2: Get place details including photos
    console.log('Step 2: Fetching place details...\n');

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

    console.log(`✓ Received place details\n`);

    // Extract additional data
    console.log('Extracting place information...\n');

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

    console.log(`  Website: ${websiteUrl || 'Not available'}`);
    console.log(`  Google Maps: ${googleMapsUrl || 'Not available'}`);
    console.log(`  Cuisine: ${cuisine || 'Not available'}`);
    console.log(`  Types: ${types.join(', ')}`);
    console.log(`  Wheelchair Accessible: ${wheelchairAccessible}\n`);

    if (!place.photos || place.photos.length === 0) {
      throw new Error('No photos found for this restaurant');
    }

    const photoReference = place.photos[0].photo_reference;
    console.log(`✓ Found photo reference\n`);

    // Step 3: Download the photo
    console.log('Step 3: Downloading photo...\n');

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
    console.log(`✓ Downloaded image (${imageBlob.size} bytes)\n`);

    // Step 4: Upload to Supabase Storage
    console.log('Step 4: Uploading to Supabase Storage...\n');

    const filename = `${restaurantId}-${Date.now()}.jpg`;
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

    console.log(`✓ Uploaded to storage: ${filePath}\n`);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log(`✓ Public URL: ${publicUrl}\n`);

    // Step 5: Add to restaurant_images table
    console.log('Step 5: Adding to restaurant_images table...\n');

    const { error: insertError } = await supabase
      .from('restaurant_images')
      .insert({
        restaurant_id: restaurantId,
        image_url: publicUrl,
        is_featured: true,
        display_order: 1,
      });

    if (insertError) {
      throw insertError;
    }

    console.log(`✓ Image added to restaurant_images table\n`);

    // Step 6: Update restaurant with additional info
    console.log('Step 6: Updating restaurant with Google Places data...\n');

    const updateData = {};
    if (websiteUrl) updateData.website_url = websiteUrl;
    if (googleMapsUrl) updateData.google_maps_url = googleMapsUrl;
    if (cuisine) updateData.cuisine = cuisine;
    if (wheelchairAccessible !== null) updateData.wheelchair_access = wheelchairAccessible;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('restaurants')
        .update(updateData)
        .eq('id', restaurantId);

      if (updateError) {
        console.error('Warning: Could not update restaurant:', updateError.message);
      } else {
        console.log(`✓ Restaurant updated with ${Object.keys(updateData).length} fields\n`);
      }
    }

    console.log('✅ SUCCESS!\n');
    console.log(`Restaurant: ${restaurantName}`);
    console.log(`Image URL: ${publicUrl}`);
    if (websiteUrl) console.log(`Website: ${websiteUrl}`);
    if (cuisine) console.log(`Cuisine: ${cuisine}`);
    if (wheelchairAccessible) console.log(`Wheelchair Accessible: Yes`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

fetchRestaurantImage();
