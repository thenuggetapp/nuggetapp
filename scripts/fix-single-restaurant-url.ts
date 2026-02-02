import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const googlePlacesUrl = `${supabaseUrl}/functions/v1/google-places`;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function searchAndUpdateRestaurant(restaurantId: string, name: string, address: string) {
  const searchQueries = [
    `Arch 545 Brixton Station Road London`,
    `Ice cream Arch 545 Brixton Station`,
    `Jefferson Ice Cream London`,
    `Jeffersons Brixton`,
  ];

  for (const searchQuery of searchQueries) {
    console.log(`Trying: "${searchQuery}"`);

    try {
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
        console.log(`\nFound ${autocompleteData.predictions.length} results:`);

        for (let i = 0; i < Math.min(3, autocompleteData.predictions.length); i++) {
          const prediction = autocompleteData.predictions[i];
          console.log(`\n  ${i + 1}. ${prediction.description}`);

          const placeId = prediction.place_id;
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
            console.log(`     Name: ${detailsData.result.name}`);
            console.log(`     Address: ${detailsData.result.formatted_address}`);
            console.log(`     URL: ${detailsData.result.url}`);

            if (i === 0) {
              console.log('\n✓ Using first result to update database...');
              const { error } = await supabase
                .from('restaurants')
                .update({ google_maps_url: detailsData.result.url })
                .eq('id', restaurantId);

              if (error) {
                console.error('❌ Failed to update:', error.message);
              } else {
                console.log('✓ Successfully updated restaurant URL!');
                return;
              }
            }
          }

          await new Promise(resolve => setTimeout(resolve, 300));
        }

        return;
      } else {
        console.log('  No results\n');
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n❌ Could not find restaurant in Google Places');
}

const restaurantId = '1602f7fe-46d8-4738-871f-5ce42d19bc64';
const name = "Jefferson's Ice Cream Brixton";
const address = "Arch 545 Brixton Station Rd, London SW9 8PF, UK";

searchAndUpdateRestaurant(restaurantId, name, address);
