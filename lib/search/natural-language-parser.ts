import { FILTER_KEY_TO_DB_COLUMN } from "@/lib/db-amenities";
import {
  CUISINE_KEYWORDS,
  FOOD_KEYWORDS,
  FEATURE_KEYWORDS,
  PRICE_KEYWORDS,
  RATING_KEYWORDS,
  STOP_WORDS,
  VENUE_WORDS,
  COMMON_CITIES,
} from "./synonym-map";
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

const cuisineFuse = new Fuse(CUISINE_KEYWORDS, { threshold: 0.15 });
const foodFuse = new Fuse(FOOD_KEYWORDS, { threshold: 0.15 });
const venueFuse = new Fuse([...VENUE_WORDS], { threshold: 0.2 });
const cityFuse = new Fuse(COMMON_CITIES, { threshold: 0.15 });

function stem(word: string): string {
  if (word.endsWith("ies")) return word.slice(0, -3) + "y"; // burritos → burrito (catches parties etc)
  if (word.endsWith("es")) return word.slice(0, -2); // sandwiches → sandwich
  if (word.endsWith("s") && word.length > 4) return word.slice(0, -1); // burgers → burger, pizzas → pizza
  return word;
}

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

  // Multi-word cities first (exact)
  if (!parsed.location) {
    for (const city of COMMON_CITIES) {
      if (city.includes(" ") && lowerQuery.includes(city)) {
        parsed.location = city;
        break;
      }
    }
  }

  // Single-word cities fuzzy
  if (!parsed.location) {
    for (const queryWord of queryWords) {
      const cityMatch = cityFuse.search(queryWord);
      if (cityMatch.length > 0 && !cityMatch[0].item.includes(" ")) {
        parsed.location = cityMatch[0].item;
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

    let cuisineMatch = cuisineFuse.search(queryWord);
    if (cuisineMatch.length === 0)
      cuisineMatch = cuisineFuse.search(stem(queryWord));
    if (cuisineMatch.length > 0) cuisineMatches.add(cuisineMatch[0].item);

    let foodMatch = foodFuse.search(queryWord);
    if (foodMatch.length === 0) foodMatch = foodFuse.search(stem(queryWord));
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

  const featureWords = new Set<string>();
  Object.entries(parsed.features).forEach(([feature, active]) => {
    if (!active) return;
    const phrases = FEATURE_KEYWORDS[feature] ?? [];
    phrases.forEach((phrase) => {
      phrase.split(" ").forEach((word) => featureWords.add(word));
    });
  });
  // console.log("featureWords:", Array.from(featureWords));

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
    const stemmed = stem(lower);
    if (STOP_WORDS.has(lower)) return false;
    if (featureWords.has(lower)) return false;
    const isVenueWord =
      VENUE_WORDS.has(lower) ||
      VENUE_WORDS.has(stemmed) ||
      venueFuse.search(lower).length > 0 ||
      venueFuse.search(stemmed).length > 0;
    if (isVenueWord) return false;

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
      !CUISINE_KEYWORDS.includes(stemmed) &&
      !FOOD_KEYWORDS.includes(lower) &&
      !FOOD_KEYWORDS.includes(stemmed) &&
      !Object.values(PRICE_KEYWORDS)
        .flat()
        .some((k) => k.includes(lower))
    );
  });

  return parsed;
}
