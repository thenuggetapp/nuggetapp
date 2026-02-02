/**
 * Download image from Google Places and upload to Supabase Storage
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bothvdppmqybygdfoqag.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdGh2ZHBwbXF5YnlnZGZvcWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjQ0OTEsImV4cCI6MjA3NjY0MDQ5MX0.xZz4NX8PPdPI6xNaLisARzcau83UIEIrRQiTJmK5ZxU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const restaurantId = '51c9a2c8-6cc5-47ef-a01a-fda92fe58b59';
const restaurantName = 'Tuco And Blondie';
const photoReference = 'AWn5SU4hmImDJmyDybDYeVFaG6_Zj6MHxmy5FU2STSNjuTSY1xX3M7MW2LqVy4vVw_22TgTO8mmUmRVtuHzFTasTFxwv9udQ3tNsi2cvmxo_rOfN8rKcH0lYuaGxDSpxGR1KOMT9RmpD92aRx2iJMomZZXuin1BQloJaqts3VKZ2RSrOC8k6W7gdnbfGtCYyR7-q5VIW5fnuyN-1fhTP7Ckn3HzlvWYK77_6EIZL-OoczGqM0Dxi6ftELiIBEbuaijPlkalmSyBFK5lJSSOU0qDjIEX_EXv6gLQVUHtl6O7Rac-n5w';

async function downloadAndUploadImage() {
  try {
    console.log('Step 1: Fetching image from Google Places with authentication...\n');

    // Fetch the image using the edge function WITH authentication
    const imageResponse = await fetch(
      `${supabaseUrl}/functions/v1/google-places?action=photo&photo_reference=${photoReference}&maxwidth=800`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
      }
    );

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    console.log(`✓ Downloaded image (${imageBlob.size} bytes, ${imageBlob.type})\n`);

    // Generate a unique filename
    const filename = `${restaurantId}-${Date.now()}.jpg`;
    const filePath = `restaurants/${filename}`;

    console.log('Step 2: Uploading to Supabase Storage...\n');

    // Upload to Supabase Storage
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

    console.log('Step 3: Updating restaurant_images table...\n');

    // Update the restaurant_images table with the new URL
    const { error: updateError } = await supabase
      .from('restaurant_images')
      .update({ image_url: publicUrl })
      .eq('restaurant_id', restaurantId);

    if (updateError) {
      throw updateError;
    }

    console.log('✅ SUCCESS! Image uploaded and database updated.\n');
    console.log(`Restaurant: ${restaurantName}`);
    console.log(`Image URL: ${publicUrl}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

downloadAndUploadImage();
