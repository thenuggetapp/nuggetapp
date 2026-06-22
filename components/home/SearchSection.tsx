"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Globe,
  Clock,
  Navigation,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchSuggestions } from "@/hooks/useRestaurants";
import { MobileSearchModal } from "@/components/MobileSearchModal";
import { parseNaturalLanguageQuery } from "@/lib/search/natural-language-parser";
import { getLocationFromIP } from "@/lib/ip-geolocation";
import { toast } from "sonner";

interface SearchSuggestion {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  type: "city" | "restaurant";
  count?: number;
}

interface SearchSectionProps {
  defaultCity?: string;
  onLocationDetected?: (city: string) => void;
}

const RECENT_SEARCHES_COOKIE = "nugget_recent_searches";
const MAX_RECENT_SEARCHES = 6;

const CITIES = {
  London: { lat: 51.5074, lng: -0.1278 },
  Chicago: { lat: 41.8781, lng: -87.6298 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
};

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 30) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

function getRecentSearches(): string[] {
  const cookie = getCookie(RECENT_SEARCHES_COOKIE);
  if (!cookie) return [];
  try {
    return JSON.parse(decodeURIComponent(cookie));
  } catch {
    return [];
  }
}

function saveRecentSearch(search: string) {
  const recent = getRecentSearches();
  const filtered = recent.filter(
    (s) => s.toLowerCase() !== search.toLowerCase(),
  );
  const updated = [search, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  setCookie(
    RECENT_SEARCHES_COOKIE,
    encodeURIComponent(JSON.stringify(updated)),
  );
  return updated;
}

const placeholderTexts = [
  "Search for dog friendly",
  "Search for vegan restaurants",
  "Search for restaurants with play area",
  "Search for gluten-free options with baby changing",
];

export function SearchSection({
  defaultCity,
  onLocationDetected,
}: SearchSectionProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasBeenFocused, setHasBeenFocused] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | undefined>(defaultCity);
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationNotSupported, setLocationNotSupported] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const { suggestions } = useSearchSuggestions(searchQuery);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    if (defaultCity) {
      setDetectedCity(defaultCity);
    }
  }, [defaultCity]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setHasBeenFocused(false);
      }
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let charIndex = 0;
    let isDeleting = false;
    let timeout: NodeJS.Timeout;

    const type = () => {
      const currentText = placeholderTexts[currentTextIndex];

      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setPlaceholderText(currentText.substring(0, charIndex + 1));
          charIndex++;
          timeout = setTimeout(type, 50);
        } else {
          timeout = setTimeout(() => {
            isDeleting = true;
            type();
          }, 2000);
        }
      } else {
        if (charIndex > 0) {
          setPlaceholderText(currentText.substring(0, charIndex - 1));
          charIndex--;
          timeout = setTimeout(type, 30);
        } else {
          isDeleting = false;
          setCurrentTextIndex((prev) => (prev + 1) % placeholderTexts.length);
        }
      }
    };

    timeout = setTimeout(type, 100);

    return () => clearTimeout(timeout);
  }, [currentTextIndex]);

  useEffect(() => {
    if (!hasBeenFocused) {
      setShowSuggestions(false);
      return;
    }

    if (searchQuery.trim().length > 1 && suggestions.length > 0) {
      setShowSuggestions(true);
    } else if (searchQuery.trim().length === 0 && recentSearches.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [suggestions, searchQuery, recentSearches, hasBeenFocused]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!detectedCity) {
      toast.error("Please select a city first");
      setShowCityDropdown(true);
      return;
    }

    if (searchQuery.trim()) {
      const params = new URLSearchParams({ q: searchQuery.trim() });

      if (detectedCoords) {
        // GPS/IP coords — pass with device flag so search page knows it's a device location
        params.set("lat", detectedCoords.lat.toString());
        params.set("lng", detectedCoords.lng.toString());
        params.set("from_device", "1");
      } else {
        const cityCoords = CITIES[detectedCity as keyof typeof CITIES];
        if (cityCoords) {
          // Known city — pass its coords so search page can sticky them across queries
          params.set("lat", cityCoords.lat.toString());
          params.set("lng", cityCoords.lng.toString());
        } else {
          // Unknown city — fall back to prepending city to query
          const parsed = parseNaturalLanguageQuery(searchQuery.trim());
          if (!parsed.location) {
            params.set("q", `${detectedCity} ${searchQuery.trim()}`);
          }
        }
      }

      const finalQuery = params.get("q") || searchQuery.trim();
      const updated = saveRecentSearch(finalQuery);
      setRecentSearches(updated);
      setShowSuggestions(false);
      setHasBeenFocused(false);
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleRecentSearchClick = (search: string) => {
    setSearchQuery(search);
    setShowSuggestions(false);
    setHasBeenFocused(false);
    router.push(`/search?q=${encodeURIComponent(search)}`);
  };

  const handleSuggestionClick = (suggestion: {
    id: string;
    name: string;
    type: "restaurant" | "city";
  }) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    setHasBeenFocused(false);
    if (suggestion.type === "city") {
      const updated = saveRecentSearch(suggestion.name);
      setRecentSearches(updated);
      router.push(`/search?q=${encodeURIComponent(suggestion.name)}`);
    } else {
      router.push(`/restaurant/${suggestion.id}`);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsDetectingLocation(true);
    setLocationNotSupported(false);

    const applyCoords = (lat: number, lng: number) => {
      const minDist = Math.min(
        ...Object.values(CITIES).map((c) => calculateDistance(lat, lng, c.lat, c.lng)),
      );
      if (minDist > 300) {
        setLocationNotSupported(true);
        return;
      }
      setDetectedCoords({ lat, lng });
      setDetectedCity("Current location");
      localStorage.setItem("nugget_nearest_city", "Current location");
      onLocationDetected?.("Current location");
      setShowCityDropdown(false);
      toast.success("Using your current location");
    };

    try {
      if (!("geolocation" in navigator)) throw new Error("not supported");

      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10_000,
          enableHighAccuracy: true,
          maximumAge: 300_000,
        }),
      );

      applyCoords(position.coords.latitude, position.coords.longitude);
    } catch {
      try {
        const ipLocation = await getLocationFromIP();
        if (ipLocation) {
          applyCoords(ipLocation.latitude, ipLocation.longitude);
        } else {
          toast.error("Unable to detect your location");
        }
      } catch {
        toast.error("Unable to detect your location");
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleCitySelect = (city: string) => {
    setDetectedCity(city);
    localStorage.setItem("nugget_nearest_city", city);
    onLocationDetected?.(city);
    setShowCityDropdown(false);
    toast.success(`Location set to ${city}`);
  };

  return (
    <>
      <MobileSearchModal
        open={mobileSearchOpen}
        onOpenChange={setMobileSearchOpen}
        initialQuery={searchQuery}
        defaultCity={defaultCity}
      />
      <form onSubmit={handleSearch} className="max-w-5xl mx-auto mt-6 md:mt-10">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div
            ref={searchRef}
            className="relative flex-1 bg-white rounded-full shadow-lg z-50"
          >
            <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-slate-400 z-10" />
            <Input
              type="text"
              placeholder={placeholderText}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (window.innerWidth < 768) {
                  setMobileSearchOpen(true);
                } else {
                  setHasBeenFocused(true);
                }
              }}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileSearchOpen(true);
                }
              }}
              readOnly={
                typeof window !== "undefined" && window.innerWidth < 768
              }
              className="h-14 sm:h-16 text-base sm:text-lg border-0 rounded-full focus-visible:ring-2 focus-visible:ring-slate-300 pl-12 sm:pl-16 pr-4"
            />
            {showSuggestions &&
              (recentSearches.length > 0 || suggestions.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 hidden md:block">
                  {searchQuery.trim().length === 0 &&
                    recentSearches.length > 0 && (
                      <>
                        <div className="px-6 py-3">
                          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide text-left">
                            Recent Searches
                          </h3>
                        </div>
                        {recentSearches.map((search, index) => (
                          <button
                            key={`recent-${search}-${index}`}
                            type="button"
                            onClick={() => handleRecentSearchClick(search)}
                            className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                          >
                            <div className="flex items-start gap-3">
                              <Clock className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900 truncate">
                                  {search}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  {searchQuery.trim().length > 1 && suggestions.length > 0 && (
                    <>
                      {suggestions.map(
                        (suggestion: SearchSuggestion, index: number) => (
                          <button
                            key={`${suggestion.type}-${suggestion.id}-${index}`}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
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
                                      {suggestion.count && (
                                        <span className="ml-2 text-sm font-normal text-[#8dbf65]">
                                          ({suggestion.count} restaurants)
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                      Browse all family-friendly restaurants in
                                      this city
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
                        ),
                      )}
                    </>
                  )}
                </div>
              )}
          </div>

          {!detectedCity && (
            <div ref={cityDropdownRef} className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="h-14 sm:h-16 px-6 flex items-center gap-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border-2 border-red-300 bg-red-50 whitespace-nowrap"
              >
                <MapPin className="h-5 w-5 text-red-500" />
                <span className="text-base font-medium text-red-600">
                  Select City *
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-red-400 transition-transform ${showCityDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showCityDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 w-64">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isDetectingLocation}
                    className={`w-full px-6 py-4 text-left transition-colors border-b border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed ${locationNotSupported ? "bg-red-50" : "hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Navigation
                        className={`h-5 w-5 ${locationNotSupported ? "text-red-400" : "text-[#8dbf65]"} ${isDetectingLocation ? "animate-pulse" : ""}`}
                      />
                      <span className={`font-medium ${locationNotSupported ? "text-red-500 line-through" : "text-slate-900"}`}>
                        {isDetectingLocation ? "Detecting..." : "Use Current Location"}
                      </span>
                    </div>
                  </button>

                  {locationNotSupported && (
                    <div className="px-5 py-4 bg-red-50 border-b border-slate-100">
                      <p className="text-sm font-semibold text-red-700 mb-0.5">Nugget isn't in your area yet</p>
                      <p className="text-xs text-red-500 mb-3">We don't have restaurants mapped near your location.</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => router.push("/search?openCityRequest=1")}
                          className="text-xs font-semibold text-white bg-[#8dbf65] hover:bg-[#7aa857] px-3 py-1.5 rounded-full"
                        >
                          Request your city
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocationNotSupported(false)}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  {Object.keys(CITIES).map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-slate-400" />
                        <span className="font-medium text-slate-900">
                          {city}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg rounded-full bg-[#8dbf65] hover:bg-[#7aaa56] text-white shadow-lg w-full md:w-auto"
          >
            Search Restaurants
          </Button>
        </div>
      </form>
    </>
  );
}
