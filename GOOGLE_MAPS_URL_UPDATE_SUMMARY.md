# Google Maps URL Update Summary

## Overview
Updated Google Maps URLs for all restaurants in the database using the Google Places API.

## Results

### Before Update
- Total restaurants: 600
- With Google Maps URL: 483 (80.5%)
- Without Google Maps URL: 117 (19.5%)

### After Update
- Total restaurants: 600
- With Google Maps URL: 568 (94.7%)
- Without Google Maps URL: 32 (5.3%)

### Summary
- **85 new URLs added** successfully
- **32 restaurants** could not be found via Google Places API

## Process

1. **Script Created**: `scripts/update-google-maps-urls.ts`
2. **Method Used**:
   - Google Places Autocomplete API to find restaurants by name and address
   - Google Places Details API to retrieve the official Google Maps URL
   - Automatic update to database for successful matches

3. **URL Format**: New URLs use the format `https://maps.google.com/?cid=XXXXXXXXXX`

## Restaurants Without Google Maps URLs (32 remaining)

These restaurants could not be found through the Google Places API. Possible reasons:
- Business may have closed or moved
- Address information may be incorrect
- Very small or new businesses not yet indexed by Google
- Name variations not matching Google's records

### List of Restaurants Without URLs:

1. 1840 Brewing Company - Milwaukee
2. 3 Sheeps Brewing - Milwaukee
3. All Star Lanes Holborn - London
4. Allie Boy's Bagelry & Luncheonette - Milwaukee
5. Amaranth Bakery & Café - Milwaukee
6. American Girl Place - Chicago
7. Amorphic Beer - Milwaukee
8. Big Penny Social - London
9. Brigit's Bakery & Afternoon Tea Bus Tours - London
10. CAC Brewing - San Francisco
11. Colectivo Foundry - San Francisco
12. Colectivo Humboldt Blvd. - Milwaukee
13. Component Brewing Company - Milwaukee
14. Dead Bird Brewing Company - Milwaukee
15. Dreami Play Café - London
16. Enlightened Brewing Company - Milwaukee
17. Gathering Place Brewing Company - Milwaukee
18. Gordon Ramsay Street Burger x Street Pizza - Kensington High Street - London
19. Harrods Food Halls - London
20. Miller: The Brewery - Milwaukee
21. MobCraft Beer Tap Room + Sour House - Milwaukee
22. Newaukee Night Market - Milwaukee
23. Pint Size Bakery & Coffee - Milwaukee
24. Protohype Brewing - Milwaukee
25. Romare restaurant & cocktail bar - London
26. The Annex by Poke Co - Milwaukee
27. The Good Place - Milwaukee
28. The Ship & Shovell - London
29. Torzala Brewing Co. - Milwaukee
30. Urban Beets Cafe and Juicery - Milwaukee
31. Vanguard Bar & Lounge - Milwaukee
32. Young's Pub and Grill - Milwaukee

## Recommendations

For the remaining 32 restaurants:

1. **Manual Research**: Search Google Maps manually and add URLs
2. **Verify Business Status**: Check if restaurants are still operating
3. **Update Address Information**: Correct any address errors that might prevent API matches
4. **Contact Restaurants**: Reach out to confirm current location and Google Maps listing

## Script Location

The update script is saved at: `scripts/update-google-maps-urls.ts`

To run again in the future:
```bash
npx tsx scripts/update-google-maps-urls.ts
```

## Notes

- The script includes rate limiting (500ms delay between requests) to avoid API throttling
- Existing URLs were preserved - only null values were updated
- All updates are logged during script execution
- URLs are in the standard Google Maps CID format which provides stable, permanent links
