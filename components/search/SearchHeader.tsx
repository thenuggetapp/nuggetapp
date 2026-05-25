"use client";

import { useRef, useState, useEffect } from "react";
import { Search, Menu, SlidersHorizontal, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchSuggestion {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  type: "city" | "restaurant";
  count?: number;
}

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeFilterCount: number;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  suggestions: SearchSuggestion[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  onSearch: (e: React.FormEvent) => void;
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  onMenuOpen: () => void;
}

const placeholders = [
  "Try: 'Italian with kids menu'",
  "Search: 'cheap vegan near London'",
  "Find: 'Japanese with high chairs'",
  "Look for: 'outdoor seating and wifi'",
  "Discover: 'pizza place with parking'",
  "Explore: 'family-friendly brunch'",
];

export function SearchHeader({
  searchQuery,
  setSearchQuery,
  activeFilterCount,
  showFilters,
  setShowFilters,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  onSearch,
  onSuggestionClick,
  onMenuOpen,
}: SearchHeaderProps) {
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Rotate placeholder text when search is empty
  useEffect(() => {
    if (searchQuery) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowSuggestions]);

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3 px-4 lg:px-6 py-3 lg:py-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuOpen}
          className="lg:hidden h-10 w-10 flex-shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </Button>

        {/* Search input */}
        <form onSubmit={onSearch} className="flex-1">
          <div ref={searchRef} className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10"
              aria-hidden="true"
            />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={placeholders[placeholderIndex]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onKeyDown={(e) => e.key === "Enter" && onSearch(e as any)}
              aria-label="Search for restaurants, cuisines, or locations"
              className={`pl-10 h-11 bg-slate-50 border-slate-200 rounded-full lg:rounded-lg transition-opacity duration-300 ${
                isAnimating ? "opacity-60" : "opacity-100"
              }`}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.id}-${index}`}
                    type="button"
                    onClick={() => onSuggestionClick(suggestion)}
                    className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      {suggestion.type === "city" ? (
                        <Globe className="h-5 w-5 text-[#8dbf65] mt-0.5 flex-shrink-0" />
                      ) : (
                        <MapPin className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        {suggestion.type === "city" ? (
                          <>
                            <div className="font-semibold text-slate-900 truncate">
                              {suggestion.name}
                            </div>
                            <div className="text-sm text-slate-600">
                              Browse all family-friendly restaurants in this
                              city
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-semibold text-slate-900 truncate">
                              {suggestion.name}
                            </div>
                            <div className="text-sm text-slate-600 truncate">
                              {suggestion.cuisine}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {suggestion.address}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Search submit - desktop only */}
        <Button
          type="submit"
          size="sm"
          className="hidden lg:flex h-11 px-4 bg-[#8dbf65] hover:bg-[#7aaa56] rounded-lg"
          onClick={onSearch}
          aria-label="Search"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </Button>

        {/* Filter toggle button */}
        <Button
          variant="outline"
          size="sm"
          data-filter-toggle
          className={`h-11 w-11 lg:w-auto lg:px-4 rounded-xl lg:rounded-lg p-0 lg:p-auto relative flex-shrink-0 ${
            activeFilterCount > 0
              ? "border-[#8dbf65] bg-[#8dbf65]/10"
              : "border-slate-300"
          }`}
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#8dbf65] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
