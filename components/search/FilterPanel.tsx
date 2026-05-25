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
import { FILTER_KEY_TO_DB_COLUMN, ALL_CUISINE_TYPES } from "@/lib/db-amenities";
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
  onClose?: () => void;
  expanded?: boolean;
  searchQuery?: string;
  city?: string;
  isSearching?: boolean;
  currentFilters?: FilterState;
  resultCount?: number;
}

export function FilterPanel({
  onFilterChange,
  onClose,
  expanded = false,
  searchQuery = "",
  city = "",
  isSearching = false,
  currentFilters,
  resultCount,
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
        if (city) params.append("city", city);
        if (searchQuery) params.append("q", searchQuery);

        const data = await fetch(`/api/filter-counts?${params}`).then((r) =>
          r.json(),
        );
        if (data.amenities && data.cuisines) setFilterCounts(data);
      } catch (error) {
        console.error("Error fetching filter counts:", error);
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchFilterCounts();
  }, [searchQuery, city, isSearching]);

  const applyFilters = (newFilters: FilterState) => {
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const toggleFilter = (
    key: FilterKey,
    e?: React.MouseEvent | React.PointerEvent,
  ) => {
    e?.preventDefault();
    e?.stopPropagation();
    applyFilters({ ...activeFilters, [key]: !activeFilters[key] });
  };

  const toggleCuisine = (
    cuisine: string,
    e?: React.MouseEvent | React.PointerEvent,
  ) => {
    e?.preventDefault();
    e?.stopPropagation();
    const cuisines = activeFilters.cuisines.includes(cuisine)
      ? activeFilters.cuisines.filter((c) => c !== cuisine)
      : [...activeFilters.cuisines, cuisine];
    applyFilters({ ...activeFilters, cuisines });
  };

  const getFilterCount = (key: string) =>
    filterCounts.amenities[FILTER_KEY_TO_DB_COLUMN[key] ?? key] ?? 0;

  const shouldShow = (key: string) => {
    if (loadingCounts && Object.keys(filterCounts.amenities).length === 0)
      return true;
    return getFilterCount(key) > 0;
  };

  const cuisineTypes = ALL_CUISINE_TYPES.filter((cuisine) => {
    if (loadingCounts && Object.keys(filterCounts.cuisines).length === 0)
      return true;
    return (filterCounts.cuisines[cuisine] ?? 0) > 0;
  });

  const filterCategories = FILTER_CATEGORIES.map((title) => ({
    title,
    filters: FILTERS.filter((f) => f.category === title && shouldShow(f.key)),
  })).filter((c) => c.filters.length > 0);

  const activeFilterCount = Object.values(activeFilters).filter((v) =>
    Array.isArray(v) ? v.length > 0 : v === true,
  ).length;

  const stopProp = {
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    onTouchStart: (e: React.TouchEvent) => e.stopPropagation(),
  };

  const activeClass =
    "bg-[#8dbf65] text-white border-[#8dbf65] hover:bg-[#7aaa56] hover:border-[#7aaa56]";
  const inactiveClass = "border-slate-300 hover:bg-slate-50";

  if (expanded) {
    return (
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-1">
          <div className="space-y-6 px-6 py-6">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-900">
                  Active Filters
                </h4>
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-[#8dbf65] text-white"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
              {activeFilterCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFilters(emptyFilterState)}
                  {...stopProp}
                  className="text-xs text-slate-600 hover:text-slate-900"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Filter categories */}
            {filterCategories.map((category) => (
              <div key={category.title}>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  {category.title}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {category.filters.map(({ key, label, image }) => (
                    <Button
                      key={key}
                      type="button"
                      variant="outline"
                      onClick={(e) => toggleFilter(key as FilterKey, e)}
                      {...stopProp}
                      className={`h-20 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
                        activeFilters[key as FilterKey]
                          ? activeClass
                          : inactiveClass
                      }`}
                    >
                      <img
                        src={image}
                        alt={label}
                        className="h-7 w-7 object-contain"
                      />
                      <span className="text-xs font-medium text-center leading-tight whitespace-pre-line">
                        {label}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            <Separator />

            {/* Cuisine types */}
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
                    {...stopProp}
                    className={`transition-colors cursor-pointer ${
                      activeFilters.cuisines.includes(cuisine)
                        ? activeClass
                        : inactiveClass
                    }`}
                  >
                    {cuisine}
                  </Button>
                ))}
              </div>
            </div>

            {/* Bottom padding so content doesn't hide behind sticky button */}
            <div className="h-4" />
          </div>
        </ScrollArea>

        {/* Sticky show results button */}
        {onClose && (
          <div className="flex-shrink-0 sticky bottom-0 bg-white border-t border-slate-200 p-4">
            <Button
              className="w-full bg-[#8dbf65] hover:bg-[#7aaa56] text-white font-semibold h-12 text-base"
              onClick={onClose}
              {...stopProp}
            >
              {resultCount !== undefined
                ? `Show ${resultCount} restaurant${resultCount !== 1 ? "s" : ""}`
                : "Show results"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Collapsed icon sidebar
  const topFilters = TOP_FILTERS.map(
    (key) => FILTERS.find((f) => f.key === key)!,
  ).filter((f) => shouldShow(f.key));

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col items-center h-full py-6 relative z-10">
        <div className="flex flex-col items-center gap-6 flex-1">
          {topFilters.map(({ key, label, image }) => (
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
                  <img
                    src={image}
                    alt={label}
                    className="h-7 w-7 object-contain"
                  />
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
