"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapboxMap } from "@/components/MapboxMap";
import { FilterPanel, FilterState } from "@/components/FilterPanel";
import { QuickAddRestaurantModal } from "@/components/QuickAddRestaurantModal";
import { MobileSearchModal } from "@/components/MobileSearchModal";
import { SuggestRestaurantModal } from "@/components/SuggestRestaurantModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Restaurant } from "@/lib/dummy-restaurants";
import { supabase } from "@/lib/supabase/client";
import {
  parseNaturalLanguageQuery,
  buildSupabaseQuery,
} from "@/lib/natural-language-search";
import {
  Search,
  MapPin,
  Heart,
  SlidersHorizontal,
  UtensilsCrossed,
  Bookmark,
  Menu,
  Home,
  Crown,
  Store,
  Settings,
  User,
  TrendingUp,
  Shield,
  LogOut,
  X,
  Globe,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Columns4,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchSuggestions } from "@/hooks/useRestaurants";
import {
  useUserBookmarks,
  useUserLikes,
  useToggleBookmark,
  useToggleLike,
} from "@/hooks/useUserData";

interface SearchSuggestion {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  type: 'city' | 'restaurant';
  count?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function getFiltersFromURLParams(searchParams: URLSearchParams): FilterState {
  return {
    cuisines: [],
    kidsMenu: searchParams.get("kids_menu") === "true",
    highChairs: searchParams.get("high_chairs") === "true",
    changingTable: searchParams.get("changing_table") === "true",
    wheelchairAccess: searchParams.get("wheelchair_access") === "true",
    babyChangeWomens: searchParams.get("baby_change_womens") === "true",
    babyChangeUnisex: searchParams.get("baby_change_unisex") === "true",
    babyChangeMens: searchParams.get("baby_change_mens") === "true",
    kidsPottyToilet: searchParams.get("kids_potty_toilet") === "true",
    pramStorage: searchParams.get("pram_storage") === "true",
    outdoorSeating: searchParams.get("outdoor_seating") === "true",
    playgroundNearby: searchParams.get("playground_nearby") === "true",
    airConditioning: searchParams.get("air_conditioning") === "true",
    dogFriendly: searchParams.get("dog_friendly") === "true",
    vegetarianOptions: searchParams.get("vegetarian_options") === "true",
    veganOptions: searchParams.get("vegan_options") === "true",
    glutenFreeOptions: searchParams.get("gluten_free_options") === "true",
    smallPlates: searchParams.get("small_plates") === "true",
    healthyOptions: searchParams.get("healthy_options") === "true",
    halal: searchParams.get("halal") === "true",
    kosher: searchParams.get("kosher") === "true",
    funQuirky: searchParams.get("fun_quirky") === "true",
    relaxed: searchParams.get("relaxed") === "true",
    buzzy: searchParams.get("buzzy") === "true",
    posh: searchParams.get("posh") === "true",
    goodForGroups: searchParams.get("good_for_groups") === "true",
    kidsColoring: searchParams.get("kids_coloring") === "true",
    gamesAvailable: searchParams.get("games_available") === "true",
    kidsPlaySpace: searchParams.get("kids_play_space") === "true",
    teenFavourite: searchParams.get("teen_favourite") === "true",
    quickService: searchParams.get("quick_service") === "true",
    friendlyStaff: searchParams.get("friendly_staff") === "true",
    takeaway: searchParams.get("takeaway") === "true",
    freeKidsMeal: searchParams.get("free_kids_meal") === "true",
    onePoundKidsMeal: searchParams.get("one_pound_kids_meal") === "true",
    touristAttractionNearby: searchParams.get("tourist_attraction_nearby") === "true",
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, userProfile, permissions, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredCity, setFilteredCity] = useState<string | null>(null);
  const [cityCoordinates, setCityCoordinates] = useState<
    [number, number] | null
  >(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // City request state
  const [showCityRequestDialog, setShowCityRequestDialog] = useState(false);
  const [cityRequestName, setCityRequestName] = useState("");
  const [cityRequestReason, setCityRequestReason] = useState("");
  const [cityRequestEmail, setCityRequestEmail] = useState("");
  const [isSubmittingCityRequest, setIsSubmittingCityRequest] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0
  });

  // ✅ SWR hooks - automatic caching, deduplication, background refresh
  const { suggestions } = useSearchSuggestions(searchQuery);
  const { bookmarkedIds } = useUserBookmarks();
  const { likedIds } = useUserLikes();
  const { toggleBookmark } = useToggleBookmark();
  const { toggleLike } = useToggleLike();
  const [filters, setFilters] = useState<FilterState>(() => getFiltersFromURLParams(searchParams));
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredRestaurantId, setHoveredRestaurantId] = useState<string | null>(null);
  const [isWideLayout, setIsWideLayout] = useState(false);

  // Drawer state for mobile
  const [drawerPosition, setDrawerPosition] = useState<'collapsed' | 'middle' | 'expanded'>('middle');
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Map filter keys to display labels
  const filterLabels: Record<string, string> = {
    kidsMenu: 'Kids Menu',
    highChairs: 'High Chairs',
    changingTable: 'Changing Table',
    wheelchairAccess: 'Wheelchair Access',
    babyChangeWomens: 'Baby Change (Women)',
    babyChangeUnisex: 'Baby Change (Unisex)',
    babyChangeMens: 'Baby Change (Men)',
    kidsPottyToilet: 'Kids Potty/Toilet',
    pramStorage: 'Pram Storage',
    outdoorSeating: 'Outdoor Seating',
    playgroundNearby: 'Playground Nearby',
    airConditioning: 'Air Conditioning',
    dogFriendly: 'Dog Friendly',
    vegetarianOptions: 'Vegetarian',
    veganOptions: 'Vegan',
    glutenFreeOptions: 'Gluten Free',
    smallPlates: 'Small Plates',
    healthyOptions: 'Healthy Options',
    halal: 'Halal',
    kosher: 'Kosher',
    funQuirky: 'Fun & Quirky',
    relaxed: 'Relaxed',
    buzzy: 'Buzzy',
    posh: 'Posh',
    goodForGroups: 'Good for Groups',
    kidsColoring: 'Kids Coloring',
    gamesAvailable: 'Games Available',
    kidsPlaySpace: 'Kids Play Space',
    teenFavourite: 'Teen Favourite',
    quickService: 'Quick Service',
    friendlyStaff: 'Friendly Staff',
    takeaway: 'Takeaway',
    freeKidsMeal: 'Free Kids Meal',
    onePoundKidsMeal: '£1 Kids Meal',
    touristAttractionNearby: 'Tourist Attraction'
  };

  // Get active filter labels for the heading
  const getActiveFilterLabel = () => {
    const activeFilterKeys = Object.entries(filters)
      .filter(([key, value]) => key !== 'cuisines' && value === true)
      .map(([key]) => key);

    const labels: string[] = [];

    // Add amenity filter labels
    if (activeFilterKeys.length > 0) {
      labels.push(...activeFilterKeys.map(key => filterLabels[key].toLowerCase()));
    }

    // Add cuisine labels
    if (filters.cuisines.length > 0) {
      labels.push(...filters.cuisines.map(c => c.toLowerCase()));
    }

    // If we have labels, join them with commas
    if (labels.length > 0) {
      return labels.join(', ');
    }

    return 'family friendly';
  };
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'discounts' | 'events'>('restaurants');
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const placeholders = [
    "Try: 'Italian with kids menu'",
    "Search: 'cheap vegan near London'",
    "Find: 'Japanese with high chairs'",
    "Look for: 'outdoor seating and wifi'",
    "Discover: 'pizza place with parking'",
    "Explore: 'family-friendly brunch'",
  ];

  // Scroll to hovered card when hovering over a marker
  useEffect(() => {
    if (hoveredRestaurantId) {
      const cardElement = cardRefs.current.get(hoveredRestaurantId);
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [hoveredRestaurantId]);

  // Reset to page 1 when search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside filter panel and outside filter toggle button
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(target) &&
        !(target as Element).closest("[data-filter-toggle]")
      ) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showFilters]);

  useEffect(() => {
    const query = searchParams.get("q");
    const newFilters = getFiltersFromURLParams(searchParams);

    // Update filters when URL params change (e.g., user navigates back/forward)
    setFilters(newFilters);

    // Update search query when URL params change
    if (query) {
      setSearchQuery(query);
    }

    // Remove focus from search input and hide suggestions on page load
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }

    // Mark initial load as complete after a brief delay
    setTimeout(() => {
      isInitialLoad.current = false;
    }, 500);
  }, [searchParams]);

  useEffect(() => {
    const query = searchParams.get("q");
    if (searchQuery) {
      performSearch(searchQuery);
    } else if (!query) {
      loadRestaurants();
    }
  }, [filters, currentPage, searchQuery]);

  // Show suggestions when they're available (handled by SWR hook)
  useEffect(() => {
    if (
      suggestions.length > 0 &&
      searchQuery.trim().length > 1 &&
      !isInitialLoad.current
    ) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [suggestions, searchQuery]);

  const handleSuggestionClick = (suggestion: {
    id: string;
    name: string;
    type: "restaurant" | "city";
  }) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    if (suggestion.type === "city") {
      router.push(`/search?q=${encodeURIComponent(suggestion.name)}`);
    } else {
      router.push(`/restaurant/${suggestion.id}`);
    }
  };

  // Removed: fetchUserBookmarks, fetchUserLikes, fetchSuggestions
  // These are now handled by SWR hooks above

  const handleToggleBookmark = async (
    restaurantId: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    await toggleBookmark(restaurantId);
  };

  const handleToggleLike = async (
    restaurantId: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    await toggleLike(restaurantId);

    // Update local restaurant state for UI feedback
    const isCurrentlyLiked = likedIds.has(restaurantId);
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === restaurantId
          ? {
              ...r,
              likesCount: isCurrentlyLiked
                ? Math.max((r.likesCount || 0) - 1, 0)
                : (r.likesCount || 0) + 1,
            }
          : r
      )
    );
  };

  const handleCityRequest = async () => {
    if (!cityRequestName.trim() || !cityRequestReason.trim()) {
      toast.error("Please fill in city name and reason");
      return;
    }

    setIsSubmittingCityRequest(true);
    try {
      const { error } = await supabase.from("city_requests").insert({
        city_name: cityRequestName.trim(),
        reason: cityRequestReason.trim(),
        email: cityRequestEmail.trim() || null,
        user_id: user?.id || null,
      });

      if (error) throw error;

      toast.success("City request submitted successfully!");
      setShowCityRequestDialog(false);
      setCityRequestName("");
      setCityRequestReason("");
      setCityRequestEmail("");
    } catch (error) {
      console.error("Error submitting city request:", error);
      toast.error("Failed to submit city request. Please try again.");
    } finally {
      setIsSubmittingCityRequest(false);
    }
  };

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
  }, [searchQuery, placeholders.length]);

  const loadRestaurants = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ 
        type: "all",
        page: currentPage.toString(),
        limit: "24"
      });

      // Add filter parameters
      if (filters.cuisines.length > 0) {
        params.append("cuisines", filters.cuisines.join(","));
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (key !== "cuisines" && value === true) {
          params.append(key, "true");
        }
      });

      const response = await fetch(`/api/restaurants?${params.toString()}`);
      const { data, error, pagination: paginationInfo } = await response.json();

      if (error) {
        console.error("API error:", error);
        throw new Error(error);
      }

      // Update pagination state
      if (paginationInfo) {
        setPagination(paginationInfo);
      }

      console.log("Loaded restaurants:", data?.length || 0);
      console.log("First restaurant sample:", data?.[0]);

      const formattedRestaurants: Restaurant[] = (data || []).map((r: any) => {
        const coords: [number, number] = [r.longitude || 0, r.latitude || 0];
        console.log(
          `Restaurant ${r.name}: coords [${coords[0]}, ${coords[1]}]`
        );

        return {
          id: r.id,
          name: r.name,
          cuisine: r.cuisine,
          rating: r.rating || 0,
          reviewCount: r.review_count || 0,
          priceLevel: r.price_level || 2,
          address: r.address,
          coordinates: coords,
          imageUrl:
            r.image_url ||
            "https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400",
          nuggetVerified: r.nugget_verified,
          kidsMenu: r.kids_menu,
          highChairs: r.high_chairs,
          changingTable: r.changing_table,
          likesCount: r.likes_count || 0,
        };
      });

      console.log("Formatted restaurants:", formattedRestaurants.length);
      setRestaurants(formattedRestaurants);

      if (formattedRestaurants.length > 0) {
        console.log(
          "Setting selected restaurant:",
          formattedRestaurants[0].name
        );
        setSelectedRestaurant(formattedRestaurants[0]);
      } else {
        console.warn("No restaurants found!");
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );
      setError(
        error instanceof Error ? error.message : "Failed to load restaurants"
      );
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setFilteredCity(null);
    setCityCoordinates(null);
    console.log("Performing search for:", query);

    try {
      const params = new URLSearchParams({
        type: "search",
        q: query,
        page: currentPage.toString(),
        limit: "24"
      });

      // Add filter parameters
      if (filters.cuisines.length > 0) {
        params.append("cuisines", filters.cuisines.join(","));
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (key !== "cuisines" && value === true) {
          params.append(key, "true");
        }
      });

      const response = await fetch(`/api/restaurants?${params.toString()}`);
      const { data, error, city, cityCoordinates, pagination: paginationInfo } = await response.json();

      if (error) {
        console.error("Search query error:", error);
        throw new Error(error);
      }

      // Update pagination state
      if (paginationInfo) {
        setPagination(paginationInfo);
      }

      console.log("Search results count:", data?.length || 0);
      console.log("City filter:", city);
      console.log("City coordinates:", cityCoordinates);

      if (city) {
        setFilteredCity(city);
      }

      if (cityCoordinates) {
        setCityCoordinates(cityCoordinates);
      }

      const formattedRestaurants: Restaurant[] = (data || []).map((r: any) => {
        const coords: [number, number] = [r.longitude || 0, r.latitude || 0];
        return {
          id: r.id,
          name: r.name,
          cuisine: r.cuisine,
          rating: r.rating || 0,
          reviewCount: r.review_count || 0,
          priceLevel: r.price_level || 2,
          address: r.address,
          coordinates: coords,
          imageUrl:
            r.image_url ||
            "https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400",
          nuggetVerified: r.nugget_verified,
          kidsMenu: r.kids_menu,
          highChairs: r.high_chairs,
          changingTable: r.changing_table,
          likesCount: r.likes_count || 0,
        };
      });

      console.log("Formatted search results:", formattedRestaurants.length);
      setRestaurants(formattedRestaurants);

      if (formattedRestaurants.length > 0) {
        setSelectedRestaurant(formattedRestaurants[0]);
      } else {
        console.warn("No restaurants found for search:", query);
      }
    } catch (error) {
      console.error("Error searching restaurants:", error);
      console.error(
        "Error details:",
        error instanceof Error ? error.message : error
      );
      setError(
        error instanceof Error ? error.message : "Failed to search restaurants"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of restaurant list
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Touch handlers for drawer
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 1024) return; // Only on mobile
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || window.innerWidth >= 1024) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging || window.innerWidth >= 1024) return;

    const deltaY = currentY - startY;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0) {
        // Swiping down
        if (drawerPosition === 'expanded') {
          setDrawerPosition('middle');
        } else if (drawerPosition === 'middle') {
          setDrawerPosition('collapsed');
        }
      } else {
        // Swiping up
        if (drawerPosition === 'collapsed') {
          setDrawerPosition('middle');
        } else if (drawerPosition === 'middle') {
          setDrawerPosition('expanded');
        }
      }
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  const getDrawerTopPosition = () => {
    if (drawerPosition === 'collapsed') return 'top-[70vh]';
    if (drawerPosition === 'middle') return 'top-[50vh]';
    return 'top-[10vh]'; // expanded
  };

  const markers = useMemo(
    () =>
      restaurants.map((restaurant) => ({
        id: restaurant.id,
        coordinates: restaurant.coordinates,
        title: restaurant.name,
        description: restaurant.address,
      })),
    [restaurants]
  );

  const mapCenter = useMemo(
    () => cityCoordinates || selectedRestaurant?.coordinates,
    [cityCoordinates, selectedRestaurant?.coordinates]
  );

  return (
    <div className="flex h-screen bg-white">
      <div className="hidden lg:block">
        <Sidebar onAddClick={() => setShowAddModal(true)} />
      </div>
      <QuickAddRestaurantModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
      <SuggestRestaurantModal
        open={showSuggestModal}
        onOpenChange={setShowSuggestModal}
      />

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <img
                  src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
                  alt="MapSearch"
                  className="h-16 w-auto"
                />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {user ? (
                  <>
                    {!permissions.canAccessOwnerDashboard && (
                      <Link
                        href="/saved"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Bookmark className="h-5 w-5" />
                        <span className="font-medium">Saved Places</span>
                      </Link>
                    )}

                    {/* <Link
                      href="/subscription"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Crown className="h-5 w-5" />
                      <span className="font-medium">My Subscription</span>
                    </Link> */}

                    {permissions.canAccessOwnerDashboard && (
                      <>
                        <div className="pt-4 pb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">
                            Restaurant Owner
                          </p>
                        </div>
                        <Link
                          href="/owner/dashboard"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Store className="h-5 w-5" />
                          <span className="font-medium">Owner Dashboard</span>
                        </Link>
                        <Link
                          href="/owner/restaurants"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="h-5 w-5" />
                          <span className="font-medium">
                            Manage Restaurants
                          </span>
                        </Link>
                      </>
                    )}

                    {permissions.canAccessLocalHeroDashboard && (
                      <>
                        <div className="pt-4 pb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">
                            Local Hero
                          </p>
                        </div>
                        <Link
                          href="/local-hero/dashboard"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <TrendingUp className="h-5 w-5" />
                          <span className="font-medium">Hero Dashboard</span>
                        </Link>
                      </>
                    )}

                    {permissions.canApplyAsLocalHero &&
                      !permissions.canAccessOwnerDashboard && (
                        <Link
                          href="/local-hero/apply"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          <span className="font-medium">
                            Become a Local Hero
                          </span>
                        </Link>
                      )}

                    {permissions.canAccessAdminPanel && (
                      <>
                        <div className="pt-4 pb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">
                            Administration
                          </p>
                        </div>
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Shield className="h-5 w-5" />
                          <span className="font-medium">Admin Dashboard</span>
                        </Link>
                        <Link
                          href="/admin/users"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          <span className="font-medium">Manage Users</span>
                        </Link>
                        <Link
                          href="/admin/local-heroes"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <TrendingUp className="h-5 w-5" />
                          <span className="font-medium">
                            Manage Local Heroes
                          </span>
                        </Link>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/owner/register"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Store className="h-5 w-5" />
                      <span className="font-medium">For Restaurants</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <MobileSearchModal
        open={mobileSearchOpen}
        onOpenChange={setMobileSearchOpen}
        initialQuery={searchQuery}
      />

      {isMobile && (
        <Drawer
          open={showFilters}
          onOpenChange={setShowFilters}
          dismissible={false}
          shouldScaleBackground={false}
          modal={false}
        >
          <DrawerContent
            className="max-h-[85vh]"
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DrawerHeader className="text-left border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DrawerTitle className="text-lg font-bold text-slate-900">
                    Filters
                  </DrawerTitle>
                  {Object.entries(filters).filter(([key, value]) => {
                    if (key === "cuisines") return value.length > 0;
                    return value === true;
                  }).length > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-[#8dbf65] text-white"
                    >
                      {
                        Object.entries(filters).filter(([key, value]) => {
                          if (key === "cuisines") return value.length > 0;
                          return value === true;
                        }).length
                      }
                    </Badge>
                  )}
                </div>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="overflow-y-auto py-6" onPointerDown={(e) => e.stopPropagation()}>
              <FilterPanel
                onFilterChange={setFilters}
                expanded={true}
                searchQuery={searchQuery}
                city={filteredCity || ''}
                isSearching={loading}
                currentFilters={filters}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      <div className="flex flex-1 lg:ml-16 overflow-hidden flex-col lg:flex-row w-full h-full relative">
        {/* Fixed mobile search bar at top */}
        <div className="fixed top-0 left-0 right-0 z-20 lg:hidden bg-white border-b border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="h-10 w-10 flex-shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
            <div className="flex-1 flex items-center gap-2">
              <div
                className="relative flex-1"
                onClick={() => setMobileSearchOpen(true)}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                <Input
                  type="text"
                  placeholder={searchQuery || "london"}
                  value={searchQuery}
                  readOnly
                  aria-label="Search for restaurants"
                  className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 rounded-full cursor-pointer"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-11 w-11 p-0 border-slate-300 rounded-xl flex-shrink-0"
                onClick={() => setShowFilters(!showFilters)}
                aria-label="Open filters"
              >
                <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        {/* Map - Fixed background on mobile, standard layout on desktop */}
        <div className="fixed inset-0 lg:relative lg:flex lg:flex-1 lg:order-2 z-0 lg:z-auto">
          <div
            ref={filterPanelRef}
            className={`hidden lg:flex lg:flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out relative z-50 ${
              showFilters ? "w-80" : "w-20"
            }`}
          >
            <div className="flex-1 overflow-y-auto">
              <FilterPanel
                onFilterChange={setFilters}
                expanded={showFilters}
                searchQuery={searchQuery}
                city={filteredCity || ''}
                isSearching={loading}
                currentFilters={filters}
              />
            </div>
          </div>

          <div className="w-full h-full relative z-0 lg:flex-1">
            <MapboxMap
              coordinates={mapCenter}
              markers={markers}
              onMarkerClick={(id) => {
                const restaurant = restaurants.find((r) => r.id === id);
                if (restaurant) setSelectedRestaurant(restaurant);
              }}
              onMarkerHover={(id) => setHoveredRestaurantId(id)}
              hoveredMarkerId={hoveredRestaurantId}
              zoom={mapCenter ? 13 : 11}
            />

            {/* Layout Toggle Button */}
            <div className="absolute top-4 left-4 z-10 hidden lg:block">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWideLayout(!isWideLayout)}
                className="h-10 w-10 p-0 bg-white shadow-lg border-slate-300 hover:bg-slate-50"
                aria-label={isWideLayout ? "Switch to 2 columns" : "Switch to 4 columns"}
              >
                {isWideLayout ? (
                  <Columns2 className="h-4 w-4 text-slate-600" aria-hidden="true" />
                ) : (
                  <Columns4 className="h-4 w-4 text-slate-600" aria-hidden="true" />
                )}
              </Button>
            </div>

            {restaurants.length > 0 && (
              <div
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-3 sm:px-4 py-2 rounded-full shadow-lg border border-slate-200 max-w-[90vw] sm:max-w-none"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <UtensilsCrossed className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 flex-shrink-0" aria-hidden="true" />
                  <span className="text-slate-600 whitespace-nowrap">
                    Showing{" "}
                    <span className="font-medium text-slate-900">
                      {restaurants.length}
                    </span>
                    {" "}out of{" "}
                    <span className="font-medium text-slate-900">
                      {pagination.total}
                    </span>
                    {" "}restaurant{pagination.total !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content drawer - Slides over map on mobile */}
        <div
          ref={drawerRef}
          className={`absolute lg:relative ${getDrawerTopPosition()} lg:top-0 left-0 right-0 bottom-0 lg:h-full bg-white rounded-t-3xl lg:rounded-none shadow-2xl lg:shadow-none z-10 lg:z-auto flex flex-col lg:border-r border-slate-200 ${
            isDragging ? '' : 'transition-all duration-300'
          } ${
            isWideLayout ? 'lg:w-[calc(100%-300px)]' : 'lg:w-[640px]'
          } lg:order-1`}
        >
          <div className="hidden lg:flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-200">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div ref={searchRef} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10" aria-hidden="true" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder={placeholders[placeholderIndex]}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  aria-label="Search for restaurants, cuisines, or locations"
                  className={`pl-10 h-11 bg-slate-50 border-slate-200 rounded-lg transition-opacity duration-300 ${
                    isAnimating ? "opacity-60" : "opacity-100"
                  }`}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                    {suggestions.map((suggestion: SearchSuggestion, index: number) => (
                      <button
                        key={`${suggestion.type}-${suggestion.id}-${index}`}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          {suggestion.type === "city" ? (
                            <Globe className="h-5 w-5 text-[#8dbf65] mt-0.5 flex-shrink-0" aria-hidden="true" />
                          ) : (
                            <MapPin className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                          )}
                          <div className="flex-1 min-w-0">
                            {suggestion.type === "city" ? (
                              <>
                                <div className="font-semibold text-slate-900 truncate">
                                  {suggestion.name}
                                </div>
                                <div className="text-sm text-slate-600">
                                  Browse all family-friendly restaurants in this city
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
            <Button
              type="submit"
              size="sm"
              className="h-11 px-4 bg-[#8dbf65] hover:bg-[#7aaa56] rounded-lg"
              onClick={handleSearch}
              aria-label="Search"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              data-filter-toggle
              className={`h-11 px-4 rounded-lg relative ${
                Object.entries(filters).some(([key, value]) =>
                  key === "cuisines" ? value.length > 0 : value === true
                )
                  ? "border-[#8dbf65] bg-[#8dbf65]/10"
                  : "border-slate-300"
              }`}
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
              {Object.entries(filters).some(([key, value]) =>
                key === "cuisines" ? value.length > 0 : value === true
              ) && (
                <span className="absolute -top-1 -right-1 bg-[#8dbf65] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {
                    Object.entries(filters).filter(([key, value]) =>
                      key === "cuisines" ? value.length > 0 : value === true
                    ).length
                  }
                </span>
              )}
            </Button>
          </div>

          {/* Drag handle for mobile */}
          <div
            className="lg:hidden w-full flex justify-center py-3 bg-white rounded-t-3xl cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
          </div>

          <div className="flex-1 overflow-y-auto lg:overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="hidden lg:flex items-center gap-3 mb-4">
                <Button
                  variant={activeTab === 'restaurants' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('restaurants')}
                  className={`rounded-full ${activeTab === 'restaurants' ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Restaurants
                </Button>
                <Button
                  variant={activeTab === 'discounts' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('discounts')}
                  className={`rounded-full ${activeTab === 'discounts' ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Discounts
                </Button>
                <Button
                  variant={activeTab === 'events' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('events')}
                  className={`rounded-full ${activeTab === 'events' ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Events
                </Button>
              </div>
              {activeTab === 'restaurants' && (
                <>
                  <h2 className="text-xl font-bold text-slate-900">
                    {filteredCity
                      ? `${pagination.total} ${getActiveFilterLabel()} restaurant${
                          pagination.total !== 1 ? "s" : ""
                        } in ${filteredCity}`
                      : `${pagination.total} ${getActiveFilterLabel()} restaurant${
                          pagination.total !== 1 ? "s" : ""
                        }`}
                  </h2>
                  {pagination.total > 0 && pagination.totalPages > 1 && (
                    <p className="text-sm text-slate-600 mt-1">
                      Page {pagination.page} of {pagination.totalPages}
                    </p>
                  )}
                </>
              )}
              {activeTab === 'discounts' && (
                <h2 className="text-xl font-bold text-slate-900">
                  Restaurant Discounts
                </h2>
              )}
              {activeTab === 'events' && (
                <h2 className="text-xl font-bold text-slate-900">
                  Family Events
                </h2>
              )}
            </div>

            <div className="px-6 py-4">
              {activeTab === 'restaurants' && (
                <>
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Error:</strong> {error}
                      </p>
                    </div>
                  )}
                  <div className={`grid grid-cols-1 gap-4 transition-all duration-300 ${
                    isWideLayout ? 'lg:grid-cols-4' : 'lg:grid-cols-2'
                  }`}>
                    {loading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="border-slate-200">
                        <Skeleton className="h-32 w-full rounded-t-lg" />
                        <CardContent className="pt-3">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : restaurants.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No restaurants found
                    </h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-4">
                      {searchQuery
                        ? `No results for "${searchQuery}". Try a different search term.`
                        : "No restaurants are currently available."}
                    </p>
                    {searchQuery && (
                      <Button
                        onClick={() => {
                          setCityRequestName(searchQuery);
                          setShowCityRequestDialog(true);
                        }}
                        className="mt-2 bg-[#8dbf65] hover:bg-[#7da857] text-white"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Request this city
                      </Button>
                    )}
                  </div>
                ) : (
                  restaurants.map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      href={`/restaurant/${restaurant.id}`}
                      prefetch={false}
                      aria-label={`View details for ${restaurant.name}, ${restaurant.cuisine} restaurant in ${restaurant.address}`}
                    >
                      <Card
                        ref={(el) => {
                          if (el) {
                            cardRefs.current.set(restaurant.id, el);
                          } else {
                            cardRefs.current.delete(restaurant.id);
                          }
                        }}
                        className={`cursor-pointer transition-all overflow-hidden ${
                          hoveredRestaurantId === restaurant.id
                            ? "shadow-xl ring-4 ring-[#8dbf65] ring-opacity-50 scale-[1.02]"
                            : "hover:shadow-lg border-slate-200"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRestaurant(restaurant);
                        }}
                        onMouseEnter={() => setHoveredRestaurantId(restaurant.id)}
                        onMouseLeave={() => setHoveredRestaurantId(null)}
                      >
                        <div className="relative w-full overflow-hidden aspect-video lg:aspect-[4/3]">
                          <img
                            src={restaurant.imageUrl}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 left-2 flex gap-2">
                            <button
                              className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-50"
                              onClick={(e) =>
                                handleToggleLike(restaurant.id, e)
                              }
                              aria-label={likedIds.has(restaurant.id) ? `Unlike ${restaurant.name}` : `Like ${restaurant.name}`}
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  likedIds.has(restaurant.id)
                                    ? "text-red-500 fill-red-500"
                                    : "text-slate-600"
                                }`}
                                aria-hidden="true"
                              />
                            </button>
                            <button
                              className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-50"
                              onClick={(e) =>
                                handleToggleBookmark(restaurant.id, e)
                              }
                              aria-label={bookmarkedIds.has(restaurant.id) ? `Remove ${restaurant.name} from bookmarks` : `Bookmark ${restaurant.name}`}
                            >
                              <Bookmark
                                className={`h-4 w-4 ${
                                  bookmarkedIds.has(restaurant.id)
                                    ? "text-blue-600 fill-blue-600"
                                    : "text-slate-600"
                                }`}
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-semibold text-sm text-slate-900 mb-1 line-clamp-1">
                            {restaurant.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                              <span className="font-medium text-xs">
                                {restaurant.likesCount || 0}
                              </span>
                              <span className="text-xs text-slate-500">
                                likes
                              </span>
                            </div>
                            <span className="text-xs text-slate-600">•</span>
                            <p className="text-xs text-slate-600">
                              {restaurant.cuisine}
                            </p>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1">
                            {restaurant.address}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
                  </div>

                  {/* Pagination Controls */}
                  {!loading && restaurants.length > 0 && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <Button
                          variant={currentPage === 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          className="h-9 w-9 p-0"
                        >
                          1
                        </Button>
                        {currentPage > 4 && (
                          <span className="px-2 text-slate-400">...</span>
                        )}
                      </>
                    )}

                    {/* Pages around current */}
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return page === currentPage || 
                               page === currentPage - 1 || 
                               page === currentPage + 1 ||
                               page === currentPage - 2 ||
                               page === currentPage + 2;
                      })
                      .filter(page => page > 0 && page <= pagination.totalPages)
                      .map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`h-9 w-9 p-0 ${
                            currentPage === page 
                              ? "bg-[#8dbf65] hover:bg-[#7aaa56]" 
                              : ""
                          }`}
                        >
                          {page}
                        </Button>
                      ))}

                    {/* Last page */}
                    {currentPage < pagination.totalPages - 2 && (
                      <>
                        {currentPage < pagination.totalPages - 3 && (
                          <span className="px-2 text-slate-400">...</span>
                        )}
                        <Button
                          variant={currentPage === pagination.totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pagination.totalPages)}
                          className="h-9 w-9 p-0"
                        >
                          {pagination.totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                  )}
                </>
              )}

              {activeTab === 'discounts' && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-gradient-to-br from-[#8dbf65] to-[#7aaa56] text-white rounded-full p-6 mb-6">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Coming Soon
                  </h3>
                  <p className="text-slate-600 max-w-md">
                    We're working on bringing you exclusive restaurant discounts and special offers for families. Be the first to know when we launch!
                  </p>
                </div>
              )}

              {activeTab === 'events' && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-gradient-to-br from-[#8dbf65] to-[#7aaa56] text-white rounded-full p-6 mb-6">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Coming Soon
                  </h3>
                  <p className="text-slate-600 max-w-md">
                    Discover family-friendly events at restaurants near you. From kids' cooking classes to themed dining experiences, we'll help you plan memorable outings!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showCityRequestDialog} onOpenChange={setShowCityRequestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request a City</DialogTitle>
            <DialogDescription>
              Let us know which city you'd like us to add to Nugget
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="city-name">City Name</Label>
              <Input
                id="city-name"
                placeholder="e.g., Melbourne"
                value={cityRequestName}
                onChange={(e) => setCityRequestName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Why this city?</Label>
              <Textarea
                id="reason"
                placeholder="Tell us why you'd like to see restaurants from this city..."
                rows={4}
                value={cityRequestReason}
                onChange={(e) => setCityRequestReason(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={cityRequestEmail}
                onChange={(e) => setCityRequestEmail(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                We'll notify you when this city is added
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCityRequestDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCityRequest}
              disabled={isSubmittingCityRequest}
              className="flex-1"
            >
              {isSubmittingCityRequest ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Floating Action Button - Suggest Restaurant */}
      <button
        onClick={() => setShowSuggestModal(true)}
        className="lg:hidden fixed bottom-20 right-6 z-50 w-14 h-14 bg-[#9DC54B] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#8AB43A] active:scale-95 transition-all duration-300 animate-[slideUp_0.5s_ease-out]"
        style={{
          animation: 'slideUp 0.5s ease-out'
        }}
        aria-label="Suggest a restaurant"
      >
        <Plus className="h-7 w-7" strokeWidth={3} />
      </button>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen bg-white">
          <Sidebar />
          <div className="flex-1 ml-16 flex flex-col">
            <Skeleton className="h-16 w-full" />
            <div className="flex flex-1">
              <div className="w-[560px] p-6">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
