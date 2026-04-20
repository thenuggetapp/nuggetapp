import { ALL_CUISINE_TYPES, FILTER_KEY_TO_DB_COLUMN } from "@/lib/amenities";
import {
  CUISINE_KEYWORDS,
  FOOD_KEYWORDS,
  FEATURE_KEYWORDS,
  PRICE_KEYWORDS,
  RATING_KEYWORDS,
  STOP_WORDS,
  COMMON_CITIES,
} from "./search/keywords";
import Fuse from "fuse.js";

export type ParsedFeatures = Partial<
  Record<keyof typeof FILTER_KEY_TO_DB_COLUMN, boolean>
>;

export interface ParsedQuery {
  cuisines: string[];
  foodKeywords: string[];
  features: ParsedFeatures;
  priceLevel?: number;
  location?: string;
  rating?: number;
  searchTerms: string[];
}

const cuisineFuse = new Fuse(CUISINE_KEYWORDS, { threshold: 0.1 });
const foodFuse = new Fuse(FOOD_KEYWORDS, { threshold: 0.15 });

export function parseNaturalLanguageQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase();

  const cleanQuery = query
    .toLowerCase()
    .replace(/[.,!?]/g, " ")
    .trim();

  const queryWords = cleanQuery
    .split(" ")
    .filter((queryWord) => queryWord.length > 2)
    .filter((queryWord) => !STOP_WORDS.has(queryWord));

  const parsed: ParsedQuery = {
    cuisines: [],
    foodKeywords: [],
    features: {},
    searchTerms: [],
  };

  // Check for multi-word cities first (before splitting)
  if (!parsed.location) {
    for (const city of COMMON_CITIES) {
      if (lowerQuery.includes(city)) {
        parsed.location = city;
        break;
      }
    }
  }

  const cuisineMatches = new Set<string>();
  const foodMatches = new Set<string>();

  // Use Fuses on each word
  queryWords.forEach((queryWord) => {
    if (parsed.location && parsed.location.split(" ").includes(queryWord))
      return;

    const cuisineMatch = cuisineFuse.search(queryWord);
    if (cuisineMatch.length > 0) cuisineMatches.add(cuisineMatch[0].item);

    const foodMatch = foodFuse.search(queryWord);
    if (foodMatch.length > 0) foodMatches.add(foodMatch[0].item);
  });

  // Use Food Fuse on full search phrase
  const fullFoodMatch = foodFuse.search(cleanQuery);
  if (fullFoodMatch.length > 0) foodMatches.add(fullFoodMatch[0].item);

  // Convert sets to arrays
  parsed.cuisines = Array.from(cuisineMatches);
  parsed.foodKeywords = Array.from(foodMatches);

  Object.entries(FEATURE_KEYWORDS).forEach(([feature, keywords]) => {
    if (!(feature in FILTER_KEY_TO_DB_COLUMN)) return;
    const key = feature as keyof typeof FILTER_KEY_TO_DB_COLUMN;
    keywords.forEach((keyword) => {
      if (lowerQuery.includes(keyword)) {
        parsed.features[key] = true;
      }
    });
  });

  // Build a set of all words that belong to detected feature phrases
  const featureWords = new Set<string>();
  Object.entries(parsed.features).forEach(([feature, active]) => {
    if (!active) return;
    const phrases = FEATURE_KEYWORDS[feature] ?? [];
    phrases.forEach((phrase) => {
      phrase.split(" ").forEach((word) => featureWords.add(word));
    });
  });

  Object.entries(PRICE_KEYWORDS).forEach(([level, keywords]) => {
    keywords.forEach((keyword) => {
      if (lowerQuery.includes(keyword)) {
        parsed.priceLevel = parseInt(level);
      }
    });
  });

  RATING_KEYWORDS.forEach(({ pattern, rating, extract }) => {
    const match = lowerQuery.match(pattern);
    if (match) {
      if (extract && match[1]) {
        parsed.rating = parseFloat(match[1]);
      } else if (rating) {
        parsed.rating = rating;
      }
    }
  });

  const words = query.split(/\s+/).filter((w) => w.length > 2);
  parsed.searchTerms = words.filter((word) => {
    const lower = word.toLowerCase();

    if (featureWords.has(lower)) return false;

    // Skip if this word is part of the already-detected location
    if (parsed.location && parsed.location.includes(lower)) {
      return false;
    }

    // Check single-word cities
    if (COMMON_CITIES.includes(lower) && !parsed.location) {
      parsed.location = lower;
      return false;
    }

    return (
      !CUISINE_KEYWORDS.includes(lower) &&
      !FOOD_KEYWORDS.includes(lower) &&
      !Object.values(PRICE_KEYWORDS)
        .flat()
        .some((k) => k.includes(lower))
    );
  });

  return parsed;
}

export function buildSupabaseQuery(parsed: ParsedQuery) {
  const allConditions: string[] = [];

  if (parsed.cuisines.length > 0) {
    parsed.cuisines.forEach((c) => {
      allConditions.push(`cuisine.ilike.%${c}%`);
    });
  }

  if (parsed.foodKeywords.length > 0) {
    parsed.foodKeywords.forEach((food) => {
      allConditions.push(`name.ilike.%${food}%`);
      allConditions.push(`description.ilike.%${food}%`);
      allConditions.push(`cuisine.ilike.%${food}%`);
    });
  }

  if (parsed.location) {
    allConditions.push(`city.ilike.%${parsed.location}%`);
    allConditions.push(`address.ilike.%${parsed.location}%`);
  }

  if (parsed.searchTerms.length > 0) {
    parsed.searchTerms.forEach((term) => {
      allConditions.push(`name.ilike.%${term}%`);
      allConditions.push(`description.ilike.%${term}%`);
    });
  }

  return {
    conditions: allConditions.length > 0 ? allConditions.join(",") : null,
    features: parsed.features,
    priceLevel: parsed.priceLevel,
    rating: parsed.rating,
  };
}
