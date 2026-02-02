# Update "Various" Cuisines Script

This script updates all restaurants with cuisine "Various" by fetching their details from Google Places API and mapping the types to proper cuisine categories.

## How It Works

1. Fetches all restaurants where `cuisine = "Various"` and `google_place_id` is not null
2. For each restaurant, calls your `google-places` edge function to get place details
3. Extracts cuisine from Google Places `types` field
4. Updates the database with the proper cuisine

## Prerequisites

- Node.js installed
- Supabase edge function `google-places` deployed
- Environment variables configured in `.env`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GOOGLE_PLACES_API_KEY` (configured in Supabase secrets)

## Usage

```bash
# Install dependencies (if not already installed)
npm install

# Run the script
npx tsx scripts/update-various-cuisines.ts
```

## Cuisine Mapping

The script maps Google Places types to these cuisines:

- `american_restaurant` → American
- `chinese_restaurant` → Chinese
- `italian_restaurant` → Italian
- `japanese_restaurant` → Japanese
- `mexican_restaurant` → Mexican
- `thai_restaurant` → Thai
- `indian_restaurant` → Indian
- `vietnamese_restaurant` → Vietnamese
- `korean_restaurant` → Korean
- `pizza_restaurant` → Pizza
- `sushi_restaurant` → Sushi
- `hamburger_restaurant` → Burgers
- `steak_house` → Steakhouse
- `seafood_restaurant` → Seafood
- `vegan_restaurant` → Vegan
- `vegetarian_restaurant` → Vegetarian
- `cafe` → Cafe
- `bakery` → Bakery
- And more...

## Rate Limiting

The script includes a 100ms delay between requests to avoid hitting rate limits.

## Output

The script provides real-time progress updates and a summary at the end:

```
📊 Found 341 restaurants to update

[1/341] Processing: Restaurant Name
  ✅ Updated to: Italian

[2/341] Processing: Another Restaurant
  ➡️  Still "Various" (types: food, point_of_interest)

...

==================================================
📈 Summary:
  ✅ Updated: 285
  ➡️  Unchanged: 45
  ❌ Failed: 11
  📊 Total: 341
==================================================
```

## Notes

- Restaurants without `google_place_id` are skipped
- If Google Places returns only generic types like "restaurant", "food", "establishment", the cuisine remains "Various"
- Failed API calls are logged and counted
