# Search Improvements Summary

## Problem Identified

The search functionality wasn't working properly for food-related terms like "pizza", "burger", "sushi", etc.

### Root Cause

1. **Food terms were treated as cuisine filters**: Terms like "pizza" were in the `CUISINE_KEYWORDS` array, which meant they were only searched in the `cuisine` database column
2. **Restaurants use generic cuisines**: Most restaurants have cuisine types like "Italian", "American", or "Japanese" rather than specific foods like "pizza"
3. **Limited search scope**: When a food keyword was detected, the search only looked at the `cuisine` column, missing restaurants with these terms in their name or description

### Example Failure
- Searching for "pizza" would only query: `cuisine ILIKE '%pizza%'`
- A restaurant named "Mario's Pizza House" with `cuisine='Italian'` would NOT be found
- The `name` and `description` fields were never searched for food keywords

## Solution Implemented

### 1. Separated Food Keywords from Cuisine Keywords

Created a new `FOOD_KEYWORDS` array with common food items:
```typescript
const FOOD_KEYWORDS = [
  'pizza', 'burger', 'sushi', 'ramen', 'curry', 'tapas', 'bbq', 'seafood',
  'steak', 'pasta', 'noodles', 'sandwich', 'salad', 'soup', 'wings', 'tacos',
  'burrito', 'wrap', 'kebab', 'falafel', 'shawarma', 'dumplings', 'dim sum',
  'pho', 'pad thai', 'fried rice', 'chow mein', 'biryani', 'tikka', 'masala'
];
```

### 2. Multi-Field Search for Food Keywords

Food keywords now search across THREE fields:
- **Restaurant name**: `name ILIKE '%pizza%'`
- **Description**: `description ILIKE '%pizza%'`
- **Cuisine type**: `cuisine ILIKE '%pizza%'`

This ensures comprehensive coverage and finds relevant restaurants regardless of where the food term appears.

### 3. Enhanced Generic Search

Updated the fallback generic search to include the `description` field:
```sql
name.ilike.%term% OR
description.ilike.%term% OR
cuisine.ilike.%term% OR
address.ilike.%term% OR
city.ilike.%term%
```

### 4. Improved Suggestions

The autocomplete/suggestions feature now also searches the `description` field, providing better search suggestions as users type.

## Files Modified

1. **`lib/natural-language-search.ts`**:
   - Added `FOOD_KEYWORDS` constant
   - Added `foodKeywords` to `ParsedQuery` interface
   - Updated parser to detect food keywords separately
   - Modified `buildSupabaseQuery` to search food keywords across multiple fields

2. **`app/api/restaurants/route.ts`**:
   - Added food keyword filtering that searches name, description, and cuisine
   - Updated generic search to include description field
   - Enhanced suggestions to search description field

## Search Behavior Now

### Searching for "pizza":
1. Detects "pizza" as a food keyword
2. Creates OR conditions for:
   - `name ILIKE '%pizza%'` (finds "Mario's Pizza", "Pizza Palace", etc.)
   - `description ILIKE '%pizza%'` (finds restaurants mentioning pizza in description)
   - `cuisine ILIKE '%pizza%'` (finds restaurants with pizza as cuisine type)
3. Returns all matching restaurants from any of these fields

### Searching for "italian":
1. Detects "italian" as a cuisine keyword
2. Searches only `cuisine ILIKE '%italian%'`
3. This is correct behavior as Italian is a cuisine type

### Searching for "pizza in london":
1. Detects "pizza" as food keyword
2. Detects "london" as location
3. Searches for:
   - Pizza in name, description, or cuisine
   - AND city/address matching London
4. Returns London restaurants with pizza

## Benefits

1. **Comprehensive coverage**: Searches all relevant text fields
2. **Better user experience**: Users can search for specific foods and find relevant restaurants
3. **Flexible matching**: Works whether food is in name, description, or cuisine
4. **Backward compatible**: Existing searches still work as expected
5. **Extensible**: Easy to add more food keywords as needed

## Testing Recommendations

Test these search terms to verify improvements:
- "pizza" - Should find pizza restaurants
- "burger" - Should find burger places
- "sushi" - Should find sushi restaurants
- "pizza london" - Should find London pizza places
- "italian" - Should still work as cuisine filter
- Generic terms not in keywords - Should use multi-field generic search

## Future Enhancements

Consider these improvements for even better search:

1. **PostgreSQL Full-Text Search**: Use `to_tsvector` and `to_tsquery` for better text matching
2. **Search weighting**: Prioritize matches in name over description
3. **Fuzzy matching**: Handle typos and variations
4. **Synonym expansion**: Map "BBQ" to "barbecue", "barbeque", etc.
5. **User feedback**: Track which results users click to improve ranking
