'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, ArrowLeft, X, Globe, Navigation } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { getLocationFromIP } from '@/lib/ip-geolocation';
import { parseNaturalLanguageQuery } from '@/lib/natural-language-search';
import { getRestaurantDisplayImageUrlOrFallback } from '@/lib/restaurant-image';

const RECENT_SEARCHES_COOKIE = 'nugget_recent_searches';
const MAX_RECENT_SEARCHES = 6;

const CITIES = {
  London: { lat: 51.5074, lng: -0.1278 },
  Chicago: { lat: 41.8781, lng: -87.6298 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 }
};

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestCity(userLat: number, userLng: number): string {
  let nearestCity = 'London';
  let minDistance = Infinity;

  for (const [city, coords] of Object.entries(CITIES)) {
    const distance = calculateDistance(userLat, userLng, coords.lat, coords.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }

  return nearestCity;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 30) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
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
  const filtered = recent.filter(s => s.toLowerCase() !== search.toLowerCase());
  const updated = [search, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  setCookie(RECENT_SEARCHES_COOKIE, encodeURIComponent(JSON.stringify(updated)));
  return updated;
}

interface SearchSuggestion {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  imageUrl?: string;
  type: 'restaurant' | 'city';
}

interface MobileSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
  defaultCity?: string;
}

export function MobileSearchModal({ open, onOpenChange, initialQuery = '', defaultCity }: MobileSearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(defaultCity);
  const [showCitySelector, setShowCitySelector] = useState(false);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    const storedCity = localStorage.getItem('nugget_nearest_city');
    if (storedCity) {
      setSelectedCity(storedCity);
    } else if (defaultCity) {
      setSelectedCity(defaultCity);
    }
  }, [defaultCity]);

  useEffect(() => {
    if (open) {
      setSearchQuery(initialQuery);
      setRecentSearches(getRecentSearches());
      if (initialQuery.trim().length > 1) {
        fetchSuggestions(initialQuery);
      }
    }
  }, [open, initialQuery]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const debounce = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const fetchSuggestions = async (query: string) => {
    try {
      const searchTerm = `%${query.toLowerCase()}%`;

      const [restaurantsResult, citiesResult] = await Promise.all([
        supabase
          .from('restaurants')
          .select('id, name, cuisine, address, image_url, google_place_id, city')
          .eq('visible', true)
          .or(`name.ilike.${searchTerm},cuisine.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .order('rating', { ascending: false })
          .limit(8),
        supabase
          .from('restaurants')
          .select('city')
          .eq('visible', true)
          .not('city', 'is', null)
          .neq('city', '')
          .ilike('city', searchTerm)
          .limit(5)
      ]);

      if (restaurantsResult.error) throw restaurantsResult.error;
      if (citiesResult.error) throw citiesResult.error;

      const uniqueCities = Array.from(new Set(
        (citiesResult.data || [])
          .map(r => r.city)
          .filter(Boolean)
          .map(city => city.charAt(0).toUpperCase() + city.slice(1).toLowerCase())
      ));

      const citySuggestions: SearchSuggestion[] = uniqueCities.map(city => ({
        id: city,
        name: city,
        cuisine: '',
        address: '',
        type: 'city' as const
      }));

      const restaurantSuggestions: SearchSuggestion[] = (restaurantsResult.data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        address: r.address,
        imageUrl: getRestaurantDisplayImageUrlOrFallback({
          image_url: r.image_url,
          google_place_id: r.google_place_id,
        }),
        type: 'restaurant' as const
      }));

      const allSuggestions = [...citySuggestions, ...restaurantSuggestions].slice(0, 10);
      setSuggestions(allSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSearch = (query: string) => {
    if (!selectedCity) {
      toast.error('Please select a city first');
      setShowCitySelector(true);
      return;
    }

    if (query.trim()) {
      let finalQuery = query.trim();

      const parsed = parseNaturalLanguageQuery(finalQuery);
      if (!parsed.location) {
        finalQuery = `${selectedCity} ${finalQuery}`;
      }

      const updated = saveRecentSearch(finalQuery);
      setRecentSearches(updated);
      onOpenChange(false);
      router.push(`/search?q=${encodeURIComponent(finalQuery)}`);
    }
  };

  const handleRecentSearch = (search: string) => {
    setSearchQuery(search);
    handleSearch(search);
  };

  const handleRestaurantClick = (restaurantId: string) => {
    onOpenChange(false);
    router.push(`/restaurant/${restaurantId}`);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'city') {
      const updated = saveRecentSearch(suggestion.name);
      setRecentSearches(updated);
    }
    onOpenChange(false);
    if (suggestion.type === 'city') {
      router.push(`/search?q=${encodeURIComponent(suggestion.name)}`);
    } else {
      router.push(`/restaurant/${suggestion.id}`);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const getLocationViaGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/mapbox-geocode?longitude=${longitude}&latitude=${latitude}`,
        {
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get location information');
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const place = data.features[0];
        return place.text || place.place_name;
      }

      return null;
    } catch (error) {
      console.error('Error geocoding location:', error);
      return null;
    }
  };

  const handleIPFallback = async () => {
    try {
      const ipLocation = await getLocationFromIP();

      if (ipLocation) {
        const cityName = ipLocation.city;
        onOpenChange(false);
        router.push(`/search?q=${encodeURIComponent(cityName)}`);
        toast.success(`Searching restaurants in ${cityName} (via IP location)`);
      } else {
        toast.error('Could not determine your location. Please search manually.');
      }
    } catch (error) {
      console.error('Error with IP geolocation:', error);
      toast.error('Could not determine your location. Please search manually.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.info('Browser geolocation not available, using IP location...');
      setIsGettingLocation(true);
      handleIPFallback();
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const nearestCity = findNearestCity(latitude, longitude);

        setSelectedCity(nearestCity);
        localStorage.setItem('nugget_nearest_city', nearestCity);
        setShowCitySelector(false);
        toast.success(`Location set to ${nearestCity}`);
        setIsGettingLocation(false);
      },
      async (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          toast.info('Location permission denied. Using IP location instead...');
          try {
            const ipLocation = await getLocationFromIP();
            if (ipLocation) {
              const nearestCity = findNearestCity(ipLocation.latitude, ipLocation.longitude);
              setSelectedCity(nearestCity);
              localStorage.setItem('nugget_nearest_city', nearestCity);
              setShowCitySelector(false);
              toast.success(`Location set to ${nearestCity}`);
            } else {
              toast.error('Unable to detect your location');
            }
          } catch (ipError) {
            toast.error('Unable to detect your location');
          } finally {
            setIsGettingLocation(false);
          }
        } else {
          setIsGettingLocation(false);
          switch (error.code) {
            case error.POSITION_UNAVAILABLE:
              toast.error('Location information is unavailable.');
              break;
            case error.TIMEOUT:
              toast.error('Location request timed out.');
              break;
            default:
              toast.error('Failed to get your location.');
          }
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem('nugget_nearest_city', city);
    setShowCitySelector(false);
    toast.success(`Location set to ${city}`);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content className="fixed inset-0 z-50 w-full h-full bg-white md:hidden focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
          <div className="flex flex-col h-full">
          <div className="border-b border-slate-200">
            <div className="flex items-center gap-3 px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-10 w-10 p-0"
              >
                <ArrowLeft className="h-6 w-6 text-slate-700" />
              </Button>

              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                <Input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchQuery);
                    }
                  }}
                  autoFocus
                  className="pl-12 pr-12 h-12 text-base border-slate-300 rounded-full focus-visible:ring-2 focus-visible:ring-slate-300"
                />
                {searchQuery && (
                  <button
                    onClick={handleClear}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-slate-200 rounded-full hover:bg-slate-300"
                  >
                    <X className="h-4 w-4 text-slate-600" />
                  </button>
                )}
              </div>
            </div>

            <div className="px-4 pb-3">
              <button
                type="button"
                onClick={() => setShowCitySelector(!showCitySelector)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                  !selectedCity ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className={`h-5 w-5 ${!selectedCity ? 'text-red-500' : 'text-[#8dbf65]'}`} />
                  <span className={`text-base font-medium ${!selectedCity ? 'text-red-600' : 'text-slate-900'}`}>
                    {selectedCity || 'Select City *'}
                  </span>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${!selectedCity ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                  {!selectedCity ? 'Required' : 'Change'}
                </div>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {showCitySelector && (
              <div className="p-4 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Select Your City</h3>
                <button
                  onClick={handleUseLocation}
                  disabled={isGettingLocation}
                  className="w-full flex items-center gap-3 p-3 mb-2 bg-white hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
                >
                  <Navigation className={`h-5 w-5 text-[#8dbf65] ${isGettingLocation ? 'animate-pulse' : ''}`} />
                  <span className="text-base font-medium text-slate-900">
                    {isGettingLocation ? 'Detecting location...' : 'Use Current Location'}
                  </span>
                </button>
                <div className="space-y-2">
                  {Object.keys(CITIES).map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                        selectedCity === city
                          ? 'border-[#8dbf65] bg-[#8dbf65]/10'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <Globe className={`h-5 w-5 ${selectedCity === city ? 'text-[#8dbf65]' : 'text-slate-400'}`} />
                      <span className={`text-base font-medium ${selectedCity === city ? 'text-[#8dbf65]' : 'text-slate-900'}`}>
                        {city}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!searchQuery.trim() && !showCitySelector && (
              <div className="p-4">

                {recentSearches.length > 0 ? (
                  <>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 text-left">Recent searches</h3>
                    <div className="space-y-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={`${search}-${index}`}
                          onClick={() => handleRecentSearch(search)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
                          <span className="text-base text-slate-900">{search}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                      Your recent searches will appear here
                    </p>
                  </div>
                )}
              </div>
            )}

            {searchQuery.trim() && suggestions.length === 0 && (
              <div className="p-4">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No results found</h3>
                  <p className="text-sm text-slate-500">
                    Try searching for a different restaurant, cuisine, or location
                  </p>
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  {suggestions.length} {suggestions.length === 1 ? 'result' : 'results'}
                </h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.id}-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      {suggestion.type === 'city' ? (
                        <>
                          <div className="w-14 h-14 rounded-lg flex-shrink-0 bg-[#8dbf65] flex items-center justify-center">
                            <Globe className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-semibold text-base text-slate-900 truncate">
                              {suggestion.name}
                            </div>
                            <div className="text-sm text-slate-600">
                              Search all restaurants in this city
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                            <img
                              src={suggestion.imageUrl}
                              alt={suggestion.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-semibold text-base text-slate-900 truncate">
                              {suggestion.name}
                            </div>
                            <div className="text-sm text-slate-600 truncate">
                              {suggestion.cuisine}
                            </div>
                            <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {suggestion.address}
                            </div>
                          </div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
