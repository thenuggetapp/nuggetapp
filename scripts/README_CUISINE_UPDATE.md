# Cuisine Data Update Script

This script automatically fetches and updates cuisine types for restaurants in the database using the Google Places API.

## What It Does

1. Fetches restaurants with "Various" as their cuisine type
2. Searches Google Places API for each restaurant by name and location
3. Extracts specific cuisine types from Google's place data
4. Updates the restaurant records with accurate cuisine classifications

## Features

- **Smart Cuisine Inference**: Prioritizes specific cuisines (Chinese, Italian, etc.) over generic types (Bar, Cafe)
- **Rate Limiting**: Built-in delays to respect API quotas
- **Batch Processing**: Processes 30 restaurants at a time
- **Progress Tracking**: Shows detailed progress and results
- **Error Handling**: Continues processing even if individual lookups fail

## Usage

### Prerequisites

Make sure your `.env` file contains:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for database updates)

To get your service role key:
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the `service_role` key (keep this secret!)
4. Add it to your `.env` file

The Google Places API key is configured in the Supabase Edge Function and doesn't need to be in your `.env` file.

### Running the Script

```bash
npx tsx scripts/update-cuisines-via-edge-function.ts
```

### What to Expect

The script will:
- Process 30 restaurants per run
- Show progress for each restaurant
- Display a summary at the end
- Take approximately 6-10 seconds per batch (due to rate limiting)

Example output:
```
🍽️  Starting cuisine update process...

📊 Found 30 restaurants to update.

[1/30] Cafe Ba-Ba-Reeba! (Chicago)
  ✓ Spanish (spanish_restaurant, bar, establishment)

...

==================================================
📈 Summary
==================================================
Total processed:      30
✓ Successfully updated: 19
⊘ Skipped (generic):    9
❌ Failed:              2
==================================================

💡 To process more restaurants, run this script again.
```

### Running Multiple Times

Since the script processes 30 restaurants at a time, you can run it multiple times to update more restaurants:

```bash
# Run once
npx tsx scripts/update-cuisines-via-edge-function.ts

# Wait a few seconds, then run again
npx tsx scripts/update-cuisines-via-edge-function.ts

# Repeat until no more restaurants need updating
```

### Checking Results

Query the database to see cuisine distribution:

```sql
SELECT cuisine, COUNT(*) as count
FROM restaurants
GROUP BY cuisine
ORDER BY count DESC;
```

## Cuisine Categories

The script maps Google Places types to these cuisine categories:

### Specific Cuisines (Priority 1)
- Chinese, Italian, Japanese, Indian, Mexican
- Thai, French, Spanish, Greek, Korean
- Vietnamese, American, Mediterranean
- Middle Eastern, Turkish, Lebanese, Brazilian
- Persian, Ethiopian, Asian

### Specific Food Types (Priority 2)
- Pizza, Seafood, Steakhouse, BBQ
- Burgers, Sandwiches, Soul Food

### Generic Types (Priority 3)
- Fast Food, Cafe, Bakery, Bar & Grill

## Troubleshooting

### No restaurants found
If you see "No restaurants with 'Various' cuisine found", all restaurants have been processed.

### Failed lookups
Some restaurants may fail if:
- They're not found in Google Places
- They have unusual names or addresses
- The Google Places API returns no specific type data

This is normal and expected for a small percentage of restaurants.

### API rate limits
If you encounter rate limit errors, wait a few minutes before running the script again.

## Notes

- The script uses the existing Supabase Edge Function for Google Places API calls
- It automatically handles CORS and authentication
- Results are immediately saved to the database
- The script can be safely re-run multiple times
