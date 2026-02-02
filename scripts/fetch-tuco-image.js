/**
 * Script to fetch Tuco And Blondie image from Google Places
 */

const supabaseUrl = 'https://bothvdppmqybygdfoqag.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdGh2ZHBwbXF5YnlnZGZvcWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjQ0OTEsImV4cCI6MjA3NjY0MDQ5MX0.xZz4NX8PPdPI6xNaLisARzcau83UIEIrRQiTJmK5ZxU';

async function fetchImage() {
  try {
    console.log('Step 1: Searching Google Places for "Tuco And Blondie Chicago"...\n');

    // Step 1: Autocomplete search
    const autocompleteResponse = await fetch(
      `${supabaseUrl}/functions/v1/google-places?action=autocomplete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          input: 'Tuco And Blondie Chicago',
        }),
      }
    );

    const autocompleteData = await autocompleteResponse.json();
    console.log('Autocomplete response:', JSON.stringify(autocompleteData, null, 2));

    if (!autocompleteData.predictions || autocompleteData.predictions.length === 0) {
      console.log('❌ No results found');
      return;
    }

    const placeId = autocompleteData.predictions[0].place_id;
    const placeName = autocompleteData.predictions[0].description;
    console.log(`\n✓ Found: ${placeName}`);
    console.log(`  Place ID: ${placeId}\n`);

    // Step 2: Get place details
    console.log('Step 2: Fetching place details...\n');
    const detailsResponse = await fetch(
      `${supabaseUrl}/functions/v1/google-places?action=details`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ placeId }),
      }
    );

    const detailsData = await detailsResponse.json();

    if (detailsData.result?.photos && detailsData.result.photos.length > 0) {
      const photoReference = detailsData.result.photos[0].photo_reference;
      console.log(`✓ Found ${detailsData.result.photos.length} photos`);
      console.log(`  Photo reference: ${photoReference.substring(0, 50)}...\n`);

      // Generate photo URL
      const photoUrl = `${supabaseUrl}/functions/v1/google-places?action=photo&photo_reference=${photoReference}&maxwidth=800`;

      console.log('Step 3: Generated image URL:\n');
      console.log(`  ${photoUrl}\n`);
      console.log('✅ SUCCESS! Use this URL to update the restaurant image_url field.');
      console.log('\nRun this SQL to update the database:');
      console.log(`\nUPDATE restaurants SET image_url = '${photoUrl}' WHERE id = '51c9a2c8-6cc5-47ef-a01a-fda92fe58b59';`);

      return photoUrl;
    } else {
      console.log('❌ No photos found for this place');
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchImage();
