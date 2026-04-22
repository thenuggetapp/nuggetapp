"use client";

import { useState, useEffect } from "react";
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
import {
  FILTERS,
  FILTER_CATEGORIES,
  FilterKey,
  TOP_FILTERS,
  emptyFilterState,
  FilterState,
} from "@/lib/filters";

interface FilterPanelProps {
  onFilterChange?: (filters: FilterState) => void;
  expanded?: boolean;
  searchQuery?: string;
  city?: string;
  isSearching?: boolean;
  currentFilters?: FilterState;
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
    currentFilters || emptyFilterState,
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
    setActiveFilters(emptyFilterState);
    if (onFilterChange) onFilterChange(emptyFilterState);
  };

  const mapFilterKeyToDbColumn = (key: string): string => {
    return FILTER_KEY_TO_DB_COLUMN[key] || key;
  };

  const getFilterCount = (key: string): number => {
    const dbColumn = mapFilterKeyToDbColumn(key);
    return filterCounts.amenities[dbColumn] || 0;
  };

  const cuisineTypes = ALL_CUISINE_TYPES.filter((cuisine) => {
    const hasNoCuisineData = Object.keys(filterCounts.cuisines).length === 0;
    if (loadingCounts && hasNoCuisineData) return true;

    return (filterCounts.cuisines[cuisine] || 0) > 0;
  });

  const allFilterCategories = FILTER_CATEGORIES.map((category) => ({
    title: category,
    filters: FILTERS.filter((f) => f.category === category),
  }));

  const filterCategories = allFilterCategories
    .map((category) => ({
      ...category,
      filters: category.filters.filter((filter) => {
        const hasNoData = Object.keys(filterCounts.amenities).length === 0;
        if (loadingCounts && hasNoData) return true;

        return getFilterCount(filter.key) > 0;
      }),
    }))
    .filter((category) => category.filters.length > 0);

  const activeFilterCount = Object.values(activeFilters).filter((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value === true;
  }).length;

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
                {category.filters.map(({ key, label, image, icon: Icon }) => (
                  <Button
                    key={key}
                    type="button"
                    variant="outline"
                    onClick={(e) => toggleFilter(key as FilterKey, e)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className={`h-20 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
                      activeFilters[key as FilterKey]
                        ? "bg-[#8dbf65] text-white border-[#8dbf65] hover:bg-[#7aaa56] hover:border-[#7aaa56]"
                        : "border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={label}
                        className="h-7 w-7 object-contain"
                      />
                    ) : Icon ? (
                      <Icon className="h-7 w-7" />
                    ) : (
                      <span className="h-7 w-7" />
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
  const topFilters = TOP_FILTERS.filter((filter) => {
    const hasNoData = Object.keys(filterCounts.amenities).length === 0;
    if (loadingCounts && hasNoData) return true;

    return getFilterCount(filter.key) > 0;
  });

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col items-center h-full py-6 relative z-10">
        <div className="flex flex-col items-center gap-6 flex-1">
          {topFilters.map(({ key, label, image, icon: Icon }) => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => toggleFilter(key as FilterKey, e)}
                  className={`w-[46px] h-[46px] rounded-lg transition-colors relative cursor-pointer ${
                    activeFilters[key as FilterKey]
                      ? "bg-[#8dbf65] text-white hover:bg-[#7aaa56]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={label}
                      className="h-7 w-7 object-contain"
                    />
                  ) : Icon ? (
                    <Icon className="h-7 w-7" />
                  ) : (
                    <span className="h-7 w-7" />
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
