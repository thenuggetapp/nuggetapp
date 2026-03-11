// Mapping from FilterPanel keys to DB columns
// TODO the allowed filters can be read from the database schema via a query to information_schema.columns
export const FILTER_KEY_TO_DB_COLUMN: Record<string, string> = {
  kidsMenu: 'kids_menu',
  highChairs: 'high_chairs',
  changingTable: 'changing_table',
  wheelchairAccess: 'wheelchair_access',
  babyChangeWomens: 'baby_change_womens',
  babyChangeUnisex: 'baby_change_unisex',
  babyChangeMens: 'baby_change_mens',
  kidsPottyToilet: 'kids_potty_toilet',
  pramStorage: 'pram_storage',
  outdoorSeating: 'outdoor_seating',
  playgroundNearby: 'playground_nearby',
  airConditioning: 'air_conditioning',
  dogFriendly: 'dog_friendly',
  vegetarianOptions: 'vegetarian_options',
  veganOptions: 'vegan_options',
  glutenFree: 'gluten_free_options',
  glutenFreeOptions: 'gluten_free_options',
  smallPlates: 'small_plates',
  healthyOptions: 'healthy_options',
  halal: 'halal',
  kosher: 'kosher',
  funQuirky: 'fun_quirky',
  relaxed: 'relaxed',
  buzzy: 'buzzy',
  posh: 'posh',
  goodForGroups: 'good_for_groups',
  kidsColoring: 'kids_coloring',
  gamesAvailable: 'games_available',
  kidsPlaySpace: 'kids_play_space',
  teenFavourite: 'teen_favourite',
  quickService: 'quick_service',
  friendlyStaff: 'friendly_staff',
  takeaway: 'takeaway',
  freeKidsMeal: 'free_kids_meal',
  onePoundKidsMeal: 'one_pound_kids_meal',
  touristAttractionNearby: 'tourist_attraction_nearby',
};

export const AMENITY_DB_COLUMNS: readonly string[] = Array.from(
  new Set(Object.values(FILTER_KEY_TO_DB_COLUMN))
);

export const ALL_CUISINE_TYPES = [
  'American', 'Asian', 'Bakery', 'Bar & Grill', 'BBQ', 'Breakfast',
  'British', 'Burgers', 'Cafe', 'Chinese', 'Dessert', 'European',
  'Filipino', 'French', 'Greek', 'Indian', 'International', 'Italian',
  'Japanese', 'Korean', 'Kosher', 'Latin American', 'Mediterranean',
  'Mexican', 'Middle Eastern', 'Persian', 'Peruvian', 'Portuguese',
  'Pub', 'Sandwiches', 'Seafood', 'Spanish', 'Steakhouse', 'Thai',
  'Turkish', 'Vegetarian'
];
