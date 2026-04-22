import { LucideIcon, Baby, DollarSign } from "lucide-react";

export type FilterDefinition = {
  key: string;
  label: string;
  category: FilterCategory;
  image: string | null;
  icon?: LucideIcon;
};

export const FILTERS = [
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
  //     image: null,
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
    image: null,
    icon: DollarSign,
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
] as const satisfies readonly FilterDefinition[];

export type FilterKey = (typeof FILTERS)[number]["key"];

export const TOP_FILTERS_KEYS = [
  "kidsMenu",
  "highChairs",
  "wheelchairAccess",
  "outdoorSeating",
  "dogFriendly",
  "vegetarianOptions",
  "veganOptions",
  "glutenFreeOptions",
] as const;

export const TOP_FILTERS = FILTERS.filter((f) =>
  (TOP_FILTERS_KEYS as readonly string[]).includes(f.key),
);

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

export const emptyFilterState = {
  cuisines: [] as string[],
  ...Object.fromEntries(FILTERS.map((f) => [f.key, false])),
} as Record<"cuisines", string[]> & Record<FilterKey, boolean>;

export type FilterState = typeof emptyFilterState;
