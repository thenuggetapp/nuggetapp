"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Smile,
  Utensils,
  Car,
  Wifi,
  Volume2,
  Users,
  Accessibility,
  Trees,
  Baby,
  Droplets,
  Dog,
  Leaf,
  Wheat,
  Heart,
  Pizza,
  Clock,
  UtensilsCrossed,
  Sparkles,
  Music,
  PartyPopper,
  GlassWater,
  Gift,
  MapPin,
  DollarSign,
  Shirt,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FILTER_KEY_TO_DB_COLUMN, ALL_CUISINE_TYPES } from "@/lib/amenities";

interface FilterPanelProps {
  onFilterChange?: (filters: FilterState) => void;
  expanded?: boolean;
  searchQuery?: string;
  city?: string;
  isSearching?: boolean;
  currentFilters?: FilterState;
}

export interface FilterState {
  cuisines: string[];
  kidsMenu: boolean;
  highChairs: boolean;
  changingTable: boolean;
  wheelchairAccess: boolean;
  babyChangeWomens: boolean;
  babyChangeUnisex: boolean;
  babyChangeMens: boolean;
  kidsPottyToilet: boolean;
  pramStorage: boolean;
  outdoorSeating: boolean;
  playgroundNearby: boolean;
  airConditioning: boolean;
  dogFriendly: boolean;
  vegetarianOptions: boolean;
  veganOptions: boolean;
  glutenFreeOptions: boolean;
  smallPlates: boolean;
  healthyOptions: boolean;
  halal: boolean;
  kosher: boolean;
  funQuirky: boolean;
  relaxed: boolean;
  buzzy: boolean;
  posh: boolean;
  goodForGroups: boolean;
  kidsColoring: boolean;
  gamesAvailable: boolean;
  kidsPlaySpace: boolean;
  teenFavourite: boolean;
  quickService: boolean;
  friendlyStaff: boolean;
  takeaway: boolean;
  freeKidsMeal: boolean;
  onePoundKidsMeal: boolean;
  touristAttractionNearby: boolean;
}

export function FilterPanel({
  onFilterChange,
  expanded = false,
  searchQuery = "",
  city = "",
  isSearching = false,
  currentFilters,
}: FilterPanelProps) {
  const [activeFilters, setActiveFilters] = useState<FilterState>(
    currentFilters || {
      cuisines: [],
      kidsMenu: false,
      highChairs: false,
      changingTable: false,
      wheelchairAccess: false,
      babyChangeWomens: false,
      babyChangeUnisex: false,
      babyChangeMens: false,
      kidsPottyToilet: false,
      pramStorage: false,
      outdoorSeating: false,
      playgroundNearby: false,
      airConditioning: false,
      dogFriendly: false,
      vegetarianOptions: false,
      veganOptions: false,
      glutenFreeOptions: false,
      smallPlates: false,
      healthyOptions: false,
      halal: false,
      kosher: false,
      funQuirky: false,
      relaxed: false,
      buzzy: false,
      posh: false,
      goodForGroups: false,
      kidsColoring: false,
      gamesAvailable: false,
      kidsPlaySpace: false,
      teenFavourite: false,
      quickService: false,
      friendlyStaff: false,
      takeaway: false,
      freeKidsMeal: false,
      onePoundKidsMeal: false,
      touristAttractionNearby: false,
    },
  );

  useEffect(() => {
    if (currentFilters) {
      setActiveFilters(currentFilters);
    }
  }, [currentFilters]);

  const [filterCounts, setFilterCounts] = useState<{
    amenities: Record<string, number>;
    cuisines: Record<string, number>;
  }>({
    amenities: {},
    cuisines: {},
  });
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    if (isSearching) {
      setLoadingCounts(true);
      return;
    }

    const fetchFilterCounts = async () => {
      try {
        const params = new URLSearchParams();
        if (city) {
          params.append("city", city);
        }
        if (searchQuery) {
          params.append("q", searchQuery);
        }

        const response = await fetch(`/api/filter-counts?${params.toString()}`);
        const data = await response.json();

        if (data.amenities && data.cuisines) {
          setFilterCounts({
            amenities: data.amenities,
            cuisines: data.cuisines,
          });
        }
      } catch (error) {
        console.error("Error fetching filter counts:", error);
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchFilterCounts();
  }, [searchQuery, city, isSearching]);

  const toggleFilter = (
    key: keyof Omit<FilterState, "cuisines">,
    e?: React.MouseEvent | React.PointerEvent,
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newFilters = {
      ...activeFilters,
      [key]: !activeFilters[key],
    };
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const toggleCuisine = (
    cuisine: string,
    e?: React.MouseEvent | React.PointerEvent,
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newCuisines = activeFilters.cuisines.includes(cuisine)
      ? activeFilters.cuisines.filter((c) => c !== cuisine)
      : [...activeFilters.cuisines, cuisine];

    const newFilters = {
      ...activeFilters,
      cuisines: newCuisines,
    };
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      cuisines: [],
      kidsMenu: false,
      highChairs: false,
      changingTable: false,
      wheelchairAccess: false,
      babyChangeWomens: false,
      babyChangeUnisex: false,
      babyChangeMens: false,
      kidsPottyToilet: false,
      pramStorage: false,
      outdoorSeating: false,
      playgroundNearby: false,
      airConditioning: false,
      dogFriendly: false,
      vegetarianOptions: false,
      veganOptions: false,
      glutenFreeOptions: false,
      smallPlates: false,
      healthyOptions: false,
      halal: false,
      kosher: false,
      funQuirky: false,
      relaxed: false,
      buzzy: false,
      posh: false,
      goodForGroups: false,
      kidsColoring: false,
      gamesAvailable: false,
      kidsPlaySpace: false,
      teenFavourite: false,
      quickService: false,
      friendlyStaff: false,
      takeaway: false,
      freeKidsMeal: false,
      onePoundKidsMeal: false,
      touristAttractionNearby: false,
    };
    setActiveFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const mapFilterKeyToDbColumn = (key: string): string => {
    return FILTER_KEY_TO_DB_COLUMN[key] || key;
  };

  const getFilterCount = (key: string): number => {
    const dbColumn = mapFilterKeyToDbColumn(key);
    return filterCounts.amenities[dbColumn] || 0;
  };

  const cuisineTypes = ALL_CUISINE_TYPES.filter((cuisine) => {
    if (loadingCounts) return true;
    return (filterCounts.cuisines[cuisine] || 0) > 0;
  });

  const allFilterCategories = [
    {
      title: "Kids & Family",
      filters: [
        {
          key: "kidsMenu" as keyof Omit<FilterState, "cuisines">,
          icon: Smile,
          label: "Kids Menu",
        },
        {
          key: "highChairs" as keyof Omit<FilterState, "cuisines">,
          icon: Utensils,
          label: "High Chairs",
        },
        {
          key: "babyChangeWomens" as keyof Omit<FilterState, "cuisines">,
          icon: Droplets,
          label: "Baby Change\n(Women)",
        },
        {
          key: "babyChangeUnisex" as keyof Omit<FilterState, "cuisines">,
          icon: Droplets,
          label: "Baby Change\n(Unisex)",
        },
        {
          key: "babyChangeMens" as keyof Omit<FilterState, "cuisines">,
          icon: Droplets,
          label: "Baby Change\n(Men)",
        },
        {
          key: "kidsPottyToilet" as keyof Omit<FilterState, "cuisines">,
          icon: Baby,
          label: "Kids Potty/Toilet",
        },
        {
          key: "pramStorage" as keyof Omit<FilterState, "cuisines">,
          icon: Car,
          label: "Pram Storage",
        },
        {
          key: "kidsColoring" as keyof Omit<FilterState, "cuisines">,
          icon: Sparkles,
          label: "Kids Coloring",
        },
        {
          key: "gamesAvailable" as keyof Omit<FilterState, "cuisines">,
          icon: PartyPopper,
          label: "Games Available",
        },
        {
          key: "kidsPlaySpace" as keyof Omit<FilterState, "cuisines">,
          icon: Users,
          label: "Kids Play Space",
        },
        {
          key: "teenFavourite" as keyof Omit<FilterState, "cuisines">,
          icon: Heart,
          label: "Teen Favourite",
        },
        {
          key: "playgroundNearby" as keyof Omit<FilterState, "cuisines">,
          icon: MapPin,
          label: "Playground Nearby",
        },
      ],
    },
    {
      title: "Accessibility",
      filters: [
        {
          key: "wheelchairAccess" as keyof Omit<FilterState, "cuisines">,
          icon: Accessibility,
          label: "Wheelchair Access",
        },
      ],
    },
    {
      title: "Amenities",
      filters: [
        {
          key: "outdoorSeating" as keyof Omit<FilterState, "cuisines">,
          icon: Trees,
          label: "Outdoor Seating",
        },
        {
          key: "airConditioning" as keyof Omit<FilterState, "cuisines">,
          icon: Wifi,
          label: "Air Conditioning",
        },
        {
          key: "dogFriendly" as keyof Omit<FilterState, "cuisines">,
          icon: Dog,
          label: "Dog Friendly",
        },
        {
          key: "touristAttractionNearby" as keyof Omit<FilterState, "cuisines">,
          icon: MapPin,
          label: "Tourist Attraction",
        },
      ],
    },
    {
      title: "Dietary",
      filters: [
        {
          key: "vegetarianOptions" as keyof Omit<FilterState, "cuisines">,
          icon: Leaf,
          label: "Vegetarian",
        },
        {
          key: "veganOptions" as keyof Omit<FilterState, "cuisines">,
          icon: Leaf,
          label: "Vegan",
        },
        {
          key: "glutenFreeOptions" as keyof Omit<FilterState, "cuisines">,
          icon: Wheat,
          label: "Gluten Free",
        },
        {
          key: "halal" as keyof Omit<FilterState, "cuisines">,
          icon: UtensilsCrossed,
          label: "Halal",
        },
        {
          key: "kosher" as keyof Omit<FilterState, "cuisines">,
          icon: UtensilsCrossed,
          label: "Kosher",
        },
        {
          key: "smallPlates" as keyof Omit<FilterState, "cuisines">,
          icon: Pizza,
          label: "Small Plates",
        },
        {
          key: "healthyOptions" as keyof Omit<FilterState, "cuisines">,
          icon: Heart,
          label: "Healthy Options",
        },
      ],
    },
    {
      title: "Atmosphere",
      filters: [
        {
          key: "funQuirky" as keyof Omit<FilterState, "cuisines">,
          icon: PartyPopper,
          label: "Fun & Quirky",
        },
        {
          key: "relaxed" as keyof Omit<FilterState, "cuisines">,
          icon: Volume2,
          label: "Relaxed",
        },
        {
          key: "buzzy" as keyof Omit<FilterState, "cuisines">,
          icon: Music,
          label: "Buzzy",
        },
        {
          key: "posh" as keyof Omit<FilterState, "cuisines">,
          icon: Sparkles,
          label: "Posh",
        },
      ],
    },
    {
      title: "Service",
      filters: [
        {
          key: "quickService" as keyof Omit<FilterState, "cuisines">,
          icon: Clock,
          label: "Quick Service",
        },
        {
          key: "friendlyStaff" as keyof Omit<FilterState, "cuisines">,
          icon: Smile,
          label: "Friendly Staff",
        },
        {
          key: "goodForGroups" as keyof Omit<FilterState, "cuisines">,
          icon: Users,
          label: "Good for Groups",
        },
        {
          key: "takeaway" as keyof Omit<FilterState, "cuisines">,
          icon: UtensilsCrossed,
          label: "Takeaway",
        },
      ],
    },
    {
      title: "Deals",
      filters: [
        {
          key: "freeKidsMeal" as keyof Omit<FilterState, "cuisines">,
          icon: Gift,
          label: "Free Kids Meal",
        },
        {
          key: "onePoundKidsMeal" as keyof Omit<FilterState, "cuisines">,
          icon: DollarSign,
          label: "£1 Kids Meal",
        },
      ],
    },
  ];

  const filterCategories = allFilterCategories
    .map((category) => ({
      ...category,
      filters: category.filters.filter((filter) => {
        if (loadingCounts) return true;
        return getFilterCount(filter.key) > 0;
      }),
    }))
    .filter((category) => category.filters.length > 0);

  const activeFilterCount = Object.entries(activeFilters).filter(
    ([key, value]) => {
      if (key === "cuisines") return value.length > 0;
      return value === true;
    },
  ).length;

  if (expanded) {
    return (
      <ScrollArea className="h-full w-full">
        <div className="space-y-6 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900">
                Active Filters
              </h4>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="bg-[#8dbf65] text-white">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            {activeFilterCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="text-xs text-slate-600 hover:text-slate-900"
              >
                Clear All
              </Button>
            )}
          </div>

          {filterCategories.map((category) => (
            <div key={category.title}>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">
                {category.title}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {category.filters.map(({ key, icon: Icon, label }) => (
                  <Button
                    key={key}
                    type="button"
                    variant="outline"
                    onClick={(e) => toggleFilter(key, e)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className={`h-20 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
                      activeFilters[key]
                        ? "bg-[#8dbf65] text-white border-[#8dbf65] hover:bg-[#7aaa56] hover:border-[#7aaa56]"
                        : "border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {key === "highChairs" ? (
                      <img
                        src="/high-chairs copy.png"
                        alt="High Chairs"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "kidsMenu" ? (
                      <img
                        src="/kids-menu.png"
                        alt="Kids Menu"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "babyChangeWomens" ? (
                      <img
                        src="/baby-change-womens.png"
                        alt="Baby Change Women"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "babyChangeUnisex" ? (
                      <img
                        src="/baby-change-unisex.png"
                        alt="Baby Change Unisex"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "babyChangeMens" ? (
                      <img
                        src="/baby-change-mens.png"
                        alt="Baby Change Mens"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "veganOptions" ? (
                      <img
                        src="/vegan.png"
                        alt="Vegan"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "vegetarianOptions" ? (
                      <img
                        src="/vegetarian.png"
                        alt="Vegetarian"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "dogFriendly" ? (
                      <img
                        src="/dog-friendly.png"
                        alt="Dog Friendly"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "wheelchairAccess" ? (
                      <img
                        src="/wheelchair.png"
                        alt="Wheelchair Access"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "glutenFreeOptions" ? (
                      <img
                        src="/gluten-free.png"
                        alt="Gluten Free"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "outdoorSeating" ? (
                      <img
                        src="/outdoor copy.png"
                        alt="Outdoor Seating"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "playgroundNearby" ? (
                      <img
                        src="/playground_nearby.png"
                        alt="Playground Nearby"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "kidsColoring" ? (
                      <img
                        src="/kids-colouring.png"
                        alt="Kids Coloring"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "teenFavourite" ? (
                      <img
                        src="/teen-favourite.png"
                        alt="Teen Favourite"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "pramStorage" ? (
                      <img
                        src="/pram-storage.png"
                        alt="Pram Storage"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "kidsPottyToilet" ? (
                      <img
                        src="/kids-potty-toilet.png"
                        alt="Kids Potty/Toilet"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "kidsPlaySpace" ? (
                      <img
                        src="/kids-play-space.png"
                        alt="Kids Play Space"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "gamesAvailable" ? (
                      <img
                        src="/games-available.png"
                        alt="Games Available"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "kosher" ? (
                      <img
                        src="/kosher copy.png"
                        alt="Kosher"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "halal" ? (
                      <img
                        src="/halal copy.png"
                        alt="Halal"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "smallPlates" ? (
                      <img
                        src="/small-plates copy.png"
                        alt="Small Plates"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "touristAttractionNearby" ? (
                      <img
                        src="/tourist-attraction-nearby copy.png"
                        alt="Tourist Attraction"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "airConditioning" ? (
                      <img
                        src="/air-conditioning copy.png"
                        alt="Air Conditioning"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "healthyOptions" ? (
                      <img
                        src="/healthy-options.png"
                        alt="Healthy Options"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "funQuirky" ? (
                      <img
                        src="/fun.png"
                        alt="Fun & Quirky"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "relaxed" ? (
                      <img
                        src="/relaxed copy.png"
                        alt="Relaxed"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "posh" ? (
                      <img
                        src="/posh copy.png"
                        alt="Posh"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "takeaway" ? (
                      <img
                        src="/takeaway-available copy.png"
                        alt="Takeaway"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "freeKidsMeal" ? (
                      <img
                        src="/free-kids-meal.png"
                        alt="Free Kids Meal"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "buzzy" ? (
                      <img
                        src="/buzzy.png"
                        alt="Buzzy"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "quickService" ? (
                      <img
                        src="/quick-service.png"
                        alt="Quick Service"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "goodForGroups" ? (
                      <img
                        src="/good-for-groups.png"
                        alt="Good for Groups"
                        className="h-7 w-7 object-contain"
                      />
                    ) : key === "friendlyStaff" ? (
                      <img
                        src="/friendly-staff.png"
                        alt="Friendly Staff"
                        className="h-7 w-7 object-contain"
                      />
                    ) : (
                      <Icon className="h-7 w-7" />
                    )}
                    <span className="text-xs font-medium text-center leading-tight whitespace-pre-line">
                      {label}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          ))}

          <Separator />

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              Cuisine Type
            </h4>
            <div className="flex flex-wrap gap-2">
              {cuisineTypes.map((cuisine) => (
                <Button
                  key={cuisine}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => toggleCuisine(cuisine, e)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className={`transition-colors cursor-pointer ${
                    activeFilters.cuisines.includes(cuisine)
                      ? "bg-[#8dbf65] text-white border-[#8dbf65] hover:bg-[#7aaa56] hover:border-[#7aaa56]"
                      : "border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {cuisine}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  }

  // Top filters to show in collapsed view
  const allTopFilters = [
    {
      key: "kidsMenu" as keyof Omit<FilterState, "cuisines">,
      icon: Smile,
      label: "Kids Menu",
    },
    {
      key: "highChairs" as keyof Omit<FilterState, "cuisines">,
      icon: Utensils,
      label: "High Chairs",
    },
    {
      key: "wheelchairAccess" as keyof Omit<FilterState, "cuisines">,
      icon: Accessibility,
      label: "Wheelchair",
    },
    {
      key: "outdoorSeating" as keyof Omit<FilterState, "cuisines">,
      icon: Trees,
      label: "Outdoor",
    },
    {
      key: "dogFriendly" as keyof Omit<FilterState, "cuisines">,
      icon: Dog,
      label: "Dog Friendly",
    },
    {
      key: "vegetarianOptions" as keyof Omit<FilterState, "cuisines">,
      icon: Leaf,
      label: "Vegetarian",
    },
    {
      key: "veganOptions" as keyof Omit<FilterState, "cuisines">,
      icon: Leaf,
      label: "Vegan",
    },
    {
      key: "glutenFreeOptions" as keyof Omit<FilterState, "cuisines">,
      icon: Wheat,
      label: "Gluten Free",
    },
  ];

  const topFilters = allTopFilters.filter((filter) => {
    if (loadingCounts) return true;
    return getFilterCount(filter.key) > 0;
  });

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col items-center h-full py-6 relative z-10">
        <div className="flex flex-col items-center gap-6 flex-1">
          {topFilters.map(({ key, icon: Icon, label }) => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => toggleFilter(key, e)}
                  className={`w-[46px] h-[46px] rounded-lg transition-colors relative cursor-pointer ${
                    activeFilters[key]
                      ? "bg-[#8dbf65] text-white hover:bg-[#7aaa56]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {key === "highChairs" ? (
                    <img
                      src="/high-chairs copy.png"
                      alt="High Chairs"
                      className="h-7 w-7 object-contain"
                    />
                  ) : key === "kidsMenu" ? (
                    <img
                      src="/kids-menu.png"
                      alt="Kids Menu"
                      className="h-7 w-7 object-contain"
                    />
                  ) : key === "veganOptions" ? (
                    <img
                      src="/vegan.png"
                      alt="Vegan"
                      className="h-7 w-7 object-contain"
                    />
                  ) : key === "vegetarianOptions" ? (
                    <img
                      src="/vegetarian.png"
                      alt="Vegetarian"
                      className="h-7 w-7 object-contain"
                    />
                  ) : key === "dogFriendly" ? (
                    <img
                      src="/dog-friendly.png"
                      alt="Dog Friendly"
                      className="h-7 w-7 object-contain"
                    />
                  ) : key === "wheelchairAccess" ? (
                    <img
                      src="/wheelchair.png"
                      alt="Wheelchair Access"
                      className="h-7 w-7 object-contain"
                    />
                  ) : key === "glutenFreeOptions" ? (
                    <img
                      src="/gluten-free.png"
                      alt="Gluten Free"
                      className="h-7 w-7 object-contain"
                    />
                  ) : key === "outdoorSeating" ? (
                    <img
                      src="/outdoor copy.png"
                      alt="Outdoor Seating"
                      className="h-7 w-7 object-contain"
                    />
                  ) : (
                    <Icon className="h-7 w-7" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-slate-900 text-white border-slate-800"
              >
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
