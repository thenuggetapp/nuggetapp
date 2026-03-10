import { FILTER_KEY_TO_DB_COLUMN } from '@/lib/amenities';

export type ParsedFeatures = Partial<Record<keyof typeof FILTER_KEY_TO_DB_COLUMN, boolean>>;

export interface ParsedQuery {
  cuisines: string[];
  foodKeywords: string[];
  features: ParsedFeatures;
  priceLevel?: number;
  location?: string;
  rating?: number;
  searchTerms: string[];
}

const CUISINE_KEYWORDS = [
  'italian', 'chinese', 'japanese', 'indian', 'mexican', 'thai', 'french',
  'american', 'british', 'mediterranean', 'spanish', 'vietnamese', 'korean',
  'greek', 'turkish', 'lebanese', 'brazilian', 'caribbean', 'moroccan',
  'european', 'asian', 'african'
];

const FOOD_KEYWORDS = [
  'pizza', 'burger', 'sushi', 'ramen', 'curry', 'tapas', 'bbq', 'seafood',
  'steak', 'pasta', 'noodles', 'sandwich', 'salad', 'soup', 'wings', 'tacos',
  'burrito', 'wrap', 'kebab', 'falafel', 'shawarma', 'dumplings', 'dim sum',
  'pho', 'pad thai', 'fried rice', 'chow mein', 'biryani', 'tikka', 'masala'
];

const FEATURE_KEYWORDS = {
  kidsMenu: ['kids menu', 'children menu', 'kids meal', 'children\'s menu', 'kid friendly menu'],
  highChairs: ['high chair', 'highchair', 'baby chair'],
  changingTable: ['changing table', 'baby changing', 'changing station', 'diaper changing'],
  wheelchairAccess: ['wheelchair', 'accessible', 'disability access', 'wheelchair accessible'],
  outdoorSeating: ['outdoor', 'outside', 'patio', 'terrace', 'garden', 'alfresco'],
  vegetarianOptions: ['vegetarian', 'veggie options', 'veggie'],
  veganOptions: ['vegan', 'plant based', 'plant-based'],
  glutenFree: ['gluten free', 'gluten-free', 'celiac'],
  halal: ['halal'],
  kosher: ['kosher'],
  parking: ['parking', 'car park'],
  playgroundNearby: ['playground', 'play area'],
  dogFriendly: ['dog friendly', 'pet friendly', 'dogs allowed', 'pets allowed', 'dog'],
  takeaway: ['takeaway', 'takeout', 'to go', 'delivery'],
  quickService: ['quick service', 'fast service', 'fast food'],
  goodForGroups: ['groups', 'large groups', 'parties', 'family groups', 'good for groups'],
  freeKidsMeal: ['free kids meal', 'kids eat free', 'free children meal'],
  airConditioning: ['air conditioning', 'air con', 'ac', 'climate control'],
  kidsPlaySpace: ['kids play space', 'play space', 'play room', 'kids area'],
  kidsColoring: ['coloring', 'colouring', 'crayons', 'coloring activities'],
  gamesAvailable: ['games', 'board games', 'activities'],
  healthyOptions: ['healthy', 'healthy options', 'nutritious'],
  smallPlates: ['small plates', 'tapas', 'sharing plates'],
  buzzy: ['buzzy', 'lively', 'energetic', 'vibrant'],
  relaxed: ['relaxed', 'casual', 'laid back', 'laid-back', 'chill'],
  posh: ['posh', 'upscale', 'fancy', 'fine dining', 'elegant', 'sophisticated'],
  funQuirky: ['quirky', 'fun', 'unique', 'unusual', 'different'],
  babyChangeWomens: ['baby change women', 'changing room women', 'ladies baby change'],
  babyChangeMens: ['baby change men', 'changing room men', 'mens baby change'],
  babyChangeUnisex: ['baby change', 'unisex baby change', 'family bathroom'],
  pramStorage: ['pram storage', 'stroller storage', 'buggy storage']
};

const PRICE_KEYWORDS = {
  1: ['cheap', 'budget', 'inexpensive', 'affordable', '$'],
  2: ['moderate', 'mid-range', 'reasonable', '$$'],
  3: ['expensive', 'upscale', 'fine dining', '$$$'],
  4: ['luxury', 'high-end', 'premium', '$$$$']
};

const RATING_KEYWORDS = [
  { pattern: /highly rated|top rated|best|excellent/i, rating: 4.5 },
  { pattern: /good rating|well rated/i, rating: 4.0 },
  { pattern: /(\d+\.?\d*)\s*(?:star|stars|\+)/i, extract: true }
];

export function parseNaturalLanguageQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase();
  const parsed: ParsedQuery = {
    cuisines: [],
    foodKeywords: [],
    features: {},
    searchTerms: []
  };

  CUISINE_KEYWORDS.forEach(cuisine => {
    if (lowerQuery.includes(cuisine)) {
      parsed.cuisines.push(cuisine);
    }
  });

  FOOD_KEYWORDS.forEach(food => {
    if (lowerQuery.includes(food)) {
      parsed.foodKeywords.push(food);
    }
  });

  Object.entries(FEATURE_KEYWORDS).forEach(([feature, keywords]) => {
    if (!(feature in FILTER_KEY_TO_DB_COLUMN)) return;
    const key = feature as keyof typeof FILTER_KEY_TO_DB_COLUMN;
    keywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) {
        parsed.features[key] = true;
      }
    });
  });

  Object.entries(PRICE_KEYWORDS).forEach(([level, keywords]) => {
    keywords.forEach(keyword => {
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

  // Try to extract location using common prepositions
  const locationMatch = lowerQuery.match(/(?:in|near|at|around)\s+([a-z\s]+?)(?:\s+with|\s+that|\s+has|\s+and|$)/i);
  if (locationMatch && locationMatch[1]) {
    parsed.location = locationMatch[1].trim();
  }

  const commonCities = [
    // UK Cities
    'london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'edinburgh', 'liverpool', 'bristol', 'maidenhead', 'cambridge', 'oxford', 'brighton', 'southampton', 'york', 'nottingham', 'sheffield', 'leicester', 'reading', 'cardiff',
    // US Cities
    'chicago', 'san francisco', 'sanfrancisco', 'new york', 'newyork', 'los angeles', 'losangeles', 'houston', 'phoenix', 'philadelphia', 'san antonio', 'san diego', 'dallas', 'austin', 'seattle', 'boston', 'denver', 'portland', 'miami', 'atlanta', 'detroit', 'minneapolis', 'tampa', 'orlando', 'cleveland', 'pittsburgh', 'sacramento', 'las vegas', 'lasvegas'
  ];

  // Check for multi-word cities first (before splitting)
  if (!parsed.location) {
    for (const city of commonCities) {
      if (lowerQuery.includes(city)) {
        parsed.location = city;
        break;
      }
    }
  }

  const words = query.split(/\s+/).filter(w => w.length > 2);
  parsed.searchTerms = words.filter(word => {
    const lower = word.toLowerCase();

    // Skip if this word is part of the already-detected location
    if (parsed.location && parsed.location.includes(lower)) {
      return false;
    }

    // Check single-word cities
    if (commonCities.includes(lower) && !parsed.location) {
      parsed.location = lower;
      return false;
    }

    return !CUISINE_KEYWORDS.includes(lower) &&
           !FOOD_KEYWORDS.includes(lower) &&
           !Object.values(FEATURE_KEYWORDS).flat().some(k => k.includes(lower)) &&
           !Object.values(PRICE_KEYWORDS).flat().some(k => k.includes(lower));
  });

  return parsed;
}

export function buildSupabaseQuery(parsed: ParsedQuery) {
  const allConditions: string[] = [];

  if (parsed.cuisines.length > 0) {
    parsed.cuisines.forEach(c => {
      allConditions.push(`cuisine.ilike.%${c}%`);
    });
  }

  if (parsed.foodKeywords.length > 0) {
    parsed.foodKeywords.forEach(food => {
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
    parsed.searchTerms.forEach(term => {
      allConditions.push(`name.ilike.%${term}%`);
      allConditions.push(`description.ilike.%${term}%`);
    });
  }

  return {
    conditions: allConditions.length > 0 ? allConditions.join(',') : null,
    features: parsed.features,
    priceLevel: parsed.priceLevel,
    rating: parsed.rating
  };
}
