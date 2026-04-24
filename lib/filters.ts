export type FilterDefinition = {
  key: string;
  label: string;
  category: FilterCategory;
  image: string;
};

export const FILTERS: FilterDefinition[] = [
  {
    key: "airConditioning",
    label: "Air Conditioning",
    category: "Amenities",
    image: "/air-conditioning copy.png",
  },
  {
    key: "babyChangeMens",
    label: "Baby Change (Men)",
    category: "Kids & Family",
    image: "/baby-change-mens.png",
  },
  {
    key: "babyChangeUnisex",
    label: "Baby Change (Unisex)",
    category: "Kids & Family",
    image: "/baby-change-unisex.png",
  },
  {
    key: "babyChangeWomens",
    label: "Baby Change (Women)",
    category: "Kids & Family",
    image: "/baby-change-womens.png",
  },
  {
    key: "buzzy",
    label: "Buzzy",
    category: "Atmosphere",
    image: "/buzzy.png",
  },
  //   {
  //     key: "changingTable",
  //     label: "Changing Table",
  //     category: "Kids & Family",
  //     image: "/placeholder.png",
  //     icon: Baby,
  //   },
  {
    key: "dogFriendly",
    label: "Dog Friendly",
    category: "Amenities",
    image: "/dog-friendly.png",
  },
  {
    key: "freeKidsMeal",
    label: "Free Kids Meal",
    category: "Deals",
    image: "/free-kids-meal.png",
  },
  {
    key: "friendlyStaff",
    label: "Friendly Staff",
    category: "Service",
    image: "/friendly-staff.png",
  },
  {
    key: "funQuirky",
    label: "Fun & Quirky",
    category: "Atmosphere",
    image: "/fun.png",
  },
  {
    key: "gamesAvailable",
    label: "Games Available",
    category: "Kids & Family",
    image: "/games-available.png",
  },
  {
    key: "glutenFreeOptions",
    label: "Gluten Free",
    category: "Dietary",
    image: "/gluten-free.png",
  },
  {
    key: "goodForGroups",
    label: "Good for Groups",
    category: "Service",
    image: "/good-for-groups.png",
  },
  {
    key: "halal",
    label: "Halal",
    category: "Dietary",
    image: "/halal copy.png",
  },
  {
    key: "healthyOptions",
    label: "Healthy Options",
    category: "Dietary",
    image: "/healthy-options.png",
  },
  {
    key: "highChairs",
    label: "High Chairs",
    category: "Kids & Family",
    image: "/high-chairs copy.png",
  },
  {
    key: "kidsColoring",
    label: "Kids Coloring",
    category: "Kids & Family",
    image: "/kids-colouring.png",
  },
  {
    key: "kidsMenu",
    label: "Kids Menu",
    category: "Kids & Family",
    image: "/kids-menu.png",
  },
  {
    key: "kidsPlaySpace",
    label: "Kids Play Space",
    category: "Kids & Family",
    image: "/kids-play-space.png",
  },
  {
    key: "kidsPottyToilet",
    label: "Kids Potty/Toilet",
    category: "Kids & Family",
    image: "/kids-potty-toilet.png",
  },
  {
    key: "kosher",
    label: "Kosher",
    category: "Dietary",
    image: "/kosher copy.png",
  },
  {
    key: "onePoundKidsMeal",
    label: "£1 Kids Meal",
    category: "Deals",
    image: "/placeholder.png", // PLACEHOLDER IMAGE
  },
  {
    key: "outdoorSeating",
    label: "Outdoor Seating",
    category: "Amenities",
    image: "/outdoor copy.png",
  },
  {
    key: "playgroundNearby",
    label: "Playground Nearby",
    category: "Kids & Family",
    image: "/playground_nearby.png",
  },
  {
    key: "posh",
    label: "Posh",
    category: "Atmosphere",
    image: "/posh copy.png",
  },
  {
    key: "pramStorage",
    label: "Pram Storage",
    category: "Kids & Family",
    image: "/pram-storage.png",
  },
  {
    key: "quickService",
    label: "Quick Service",
    category: "Service",
    image: "/quick-service.png",
  },
  {
    key: "relaxed",
    label: "Relaxed",
    category: "Atmosphere",
    image: "/relaxed copy.png",
  },
  {
    key: "smallPlates",
    label: "Small Plates",
    category: "Dietary",
    image: "/small-plates copy.png",
  },
  {
    key: "takeaway",
    label: "Takeaway",
    category: "Service",
    image: "/takeaway-available copy.png",
  },
  {
    key: "teenFavourite",
    label: "Teen Favourite",
    category: "Kids & Family",
    image: "/teen-favourite.png",
  },
  {
    key: "touristAttractionNearby",
    label: "Tourist Attraction",
    category: "Amenities",
    image: "/tourist-attraction-nearby copy.png",
  },
  {
    key: "veganOptions",
    label: "Vegan",
    category: "Dietary",
    image: "/vegan.png",
  },
  {
    key: "vegetarianOptions",
    label: "Vegetarian",
    category: "Dietary",
    image: "/vegetarian.png",
  },
  {
    key: "wheelchairAccess",
    label: "Wheelchair Access",
    category: "Accessibility",
    image: "/wheelchair.png",
  },
];

export type FilterKey = keyof Omit<FilterState, "cuisines">;

export const TOP_FILTERS = [
  "kidsMenu",
  "highChairs",
  "wheelchairAccess",
  "outdoorSeating",
  "dogFriendly",
  "vegetarianOptions",
  "veganOptions",
  "glutenFreeOptions",
] as const;

export type FilterCategory =
  | "Accessibility"
  | "Amenities"
  | "Atmosphere"
  | "Deals"
  | "Dietary"
  | "Kids & Family"
  | "Service";

export const FILTER_CATEGORIES: FilterCategory[] = [
  "Kids & Family",
  "Accessibility",
  "Amenities",
  "Dietary",
  "Atmosphere",
  "Service",
  "Deals",
];

export type FilterState = {
  cuisines: string[];
  airConditioning: boolean;
  babyChangeMens: boolean;
  babyChangeUnisex: boolean;
  babyChangeWomens: boolean;
  buzzy: boolean;
  // changingTable: boolean,
  dogFriendly: boolean;
  freeKidsMeal: boolean;
  friendlyStaff: boolean;
  funQuirky: boolean;
  gamesAvailable: boolean;
  glutenFreeOptions: boolean;
  goodForGroups: boolean;
  halal: boolean;
  healthyOptions: boolean;
  highChairs: boolean;
  kidsColoring: boolean;
  kidsMenu: boolean;
  kidsPlaySpace: boolean;
  kidsPottyToilet: boolean;
  kosher: boolean;
  onePoundKidsMeal: boolean;
  outdoorSeating: boolean;
  playgroundNearby: boolean;
  posh: boolean;
  pramStorage: boolean;
  quickService: boolean;
  relaxed: boolean;
  smallPlates: boolean;
  takeaway: boolean;
  teenFavourite: boolean;
  touristAttractionNearby: boolean;
  veganOptions: boolean;
  vegetarianOptions: boolean;
  wheelchairAccess: boolean;
};

export const emptyFilterState: FilterState = {
  cuisines: [],
  airConditioning: false,
  babyChangeMens: false,
  babyChangeUnisex: false,
  babyChangeWomens: false,
  buzzy: false,
  // changingTable: false,
  dogFriendly: false,
  freeKidsMeal: false,
  friendlyStaff: false,
  funQuirky: false,
  gamesAvailable: false,
  glutenFreeOptions: false,
  goodForGroups: false,
  halal: false,
  healthyOptions: false,
  highChairs: false,
  kidsColoring: false,
  kidsMenu: false,
  kidsPlaySpace: false,
  kidsPottyToilet: false,
  kosher: false,
  onePoundKidsMeal: false,
  outdoorSeating: false,
  playgroundNearby: false,
  posh: false,
  pramStorage: false,
  quickService: false,
  relaxed: false,
  smallPlates: false,
  takeaway: false,
  teenFavourite: false,
  touristAttractionNearby: false,
  veganOptions: false,
  vegetarianOptions: false,
  wheelchairAccess: false,
};
