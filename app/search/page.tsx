"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerClose,
// } from "@/components/ui/drawer";
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
import { FilterPanel } from "@/components/search/FilterPanel";
import {
  FilterState,
  getFiltersFromURLParams,
  getActiveFilterCount,
  getFilterLabel,
} from "@/lib/filters";
import { QuickAddRestaurantModal } from "@/components/QuickAddRestaurantModal";
import { MobileSearchModal } from "@/components/MobileSearchModal";
import { SuggestRestaurantModal } from "@/components/SuggestRestaurantModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Restaurant } from "@/lib/dummy-restaurants";
import { getRestaurantDisplayImageUrlOrFallback } from "@/lib/restaurant-image";
import { supabase } from "@/lib/supabase/client";
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
import { isTouchDevice } from "@/lib/utils";
import { SearchHeader } from "@/components/search/SearchHeader";
import { RestaurantGrid } from "@/components/search/RestaurantGrid";

interface SearchSuggestion {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  type: "city" | "restaurant";
  count?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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
    totalPages: 0,
  });

  // ✅ SWR hooks - automatic caching, deduplication, background refresh
  const { suggestions } = useSearchSuggestions(searchQuery);
  const { bookmarkedIds } = useUserBookmarks();
  const { likedIds } = useUserLikes();
  const { toggleBookmark } = useToggleBookmark();
  const { toggleLike } = useToggleLike();
  const [filters, setFilters] = useState<FilterState>(() =>
    getFiltersFromURLParams(searchParams),
  );
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredRestaurantId, setHoveredRestaurantId] = useState<string | null>(
    null,
  );
  const [isWideLayout, setIsWideLayout] = useState(false);

  // Drawer state for mobile
  const [drawerPosition, setDrawerPosition] = useState<
    "collapsed" | "middle" | "expanded"
  >("middle");
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Get active filter labels for the heading
  const getActiveFilterLabel = () => {
    const activeFilterKeys = Object.entries(filters)
      .filter(([key, value]) => key !== "cuisines" && value === true)
      .map(([key]) => key);

    const labels: string[] = [];

    // Add amenity filter labels
    if (activeFilterKeys.length > 0) {
      labels.push(
        ...activeFilterKeys.map((key) => getFilterLabel(key).toLowerCase()),
      );
    }

    // Add cuisine labels
    if (filters.cuisines.length > 0) {
      labels.push(...filters.cuisines.map((c) => c.toLowerCase()));
    }

    // If we have labels, join them with commas
    if (labels.length > 0) {
      return labels.join(", ");
    }

    return "family friendly";
  };

  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "restaurants" | "discounts" | "events"
  >("restaurants");
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

  // Search string for filter panel - include cuisines
  const filterCountsSearchString = useMemo(() => {
    return [searchQuery, ...filters.cuisines].filter(Boolean).join(" ");
  }, [searchQuery, filters.cuisines]);

  const activeFilterCount = getActiveFilterCount(filters);

  // Scroll to hovered card when hovering over a marker
  useEffect(() => {
    if (hoveredRestaurantId) {
      const cardElement = cardRefs.current.get(hoveredRestaurantId);
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
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
      setIsMobile(isTouchDevice() && window.innerWidth < 1024);
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
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(target) &&
        !(target as Element).closest("[data-filter-toggle]")
      ) {
        setShowFilters(false);
      }
    };

    if (showFilters && !isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showFilters, isMobile]);

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
    e: React.MouseEvent,
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
    e: React.MouseEvent,
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
          : r,
      ),
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
        limit: "24",
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
          `Restaurant ${r.name}: coords [${coords[0]}, ${coords[1]}]`,
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
          imageUrl: getRestaurantDisplayImageUrlOrFallback({
            image_url: r.image_url,
            google_place_id: r.google_place_id,
          }),
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
          formattedRestaurants[0].name,
        );
        setSelectedRestaurant(formattedRestaurants[0]);
      } else {
        console.warn("No restaurants found!");
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );
      setError(
        error instanceof Error ? error.message : "Failed to load restaurants",
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
        limit: "24",
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
      const {
        data,
        error,
        city,
        cityCoordinates,
        pagination: paginationInfo,
      } = await response.json();

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
          imageUrl: getRestaurantDisplayImageUrlOrFallback({
            image_url: r.image_url,
            google_place_id: r.google_place_id,
          }),
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
        error instanceof Error ? error.message : error,
      );
      setError(
        error instanceof Error ? error.message : "Failed to search restaurants",
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Touch handlers for drawer
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTouchDevice() || window.innerWidth >= 1024) return; // Only on mobile
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDevice() || window.innerWidth >= 1024) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isTouchDevice() || window.innerWidth >= 1024) return;

    const deltaY = currentY - startY;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0) {
        // Swiping down
        if (drawerPosition === "expanded") {
          setDrawerPosition("middle");
        } else if (drawerPosition === "middle") {
          setDrawerPosition("collapsed");
        }
      } else {
        // Swiping up
        if (drawerPosition === "collapsed") {
          setDrawerPosition("middle");
        } else if (drawerPosition === "middle") {
          setDrawerPosition("expanded");
        }
      }
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  const getDrawerTopPosition = () => {
    if (drawerPosition === "collapsed") return "top-[70vh]";
    if (drawerPosition === "middle") return "top-[50vh]";
    return "top-[10vh]"; // expanded
  };

  const markers = useMemo(
    () =>
      restaurants.map((restaurant) => ({
        id: restaurant.id,
        coordinates: restaurant.coordinates,
        title: restaurant.name,
        description: restaurant.address,
      })),
    [restaurants],
  );

  const mapCenter = useMemo(
    () => cityCoordinates || selectedRestaurant?.coordinates,
    [cityCoordinates, selectedRestaurant?.coordinates],
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Desktop sidebar nav */}
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

      {/* Mobile nav sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <img
                  src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
                  alt="Nugget"
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
                  <Link
                    href="/owner/register"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Store className="h-5 w-5" />
                    <span className="font-medium">For Restaurants</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <MobileSearchModal
        open={mobileSearchOpen && isTouchDevice()}
        onOpenChange={setMobileSearchOpen}
        initialQuery={searchQuery}
      />

      {/* Mobile filter - bottom sheet */}
      {isMobile && (
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent
            side="bottom"
            className="h-[85vh] p-0 pt-6 rounded-t-3xl"
          >
            <FilterPanel
              expanded={true}
              onFilterChange={setFilters}
              onClose={() => setShowFilters(false)}
              resultCount={pagination.total}
              searchQuery={filterCountsSearchString}
              city={filteredCity || ""}
              isSearching={loading}
              currentFilters={filters}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Main layout */}
      <div className="flex flex-1 lg:ml-16 overflow-hidden w-full h-full">
        {/* MOBILE FIXED HEADER - only on mobile, sits above everything */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-30">
            <SearchHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeFilterCount={activeFilterCount}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              suggestions={suggestions}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
              onSearch={handleSearch}
              onSuggestionClick={handleSuggestionClick}
              onMenuOpen={() => setMobileMenuOpen(true)}
            />
          </div>
        )}

        {/* MAP - fixed background on mobile, sits behind the drawer */}
        <div className="fixed inset-0 lg:relative lg:flex lg:flex-1 lg:order-2 z-0 lg:z-auto">
          {/* Desktop filter sidebar */}
          <div
            ref={filterPanelRef}
            className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
              showFilters ? "w-80" : "w-16"
            }`}
          >
            <FilterPanel
              expanded={showFilters}
              onFilterChange={setFilters}
              onClose={() => setShowFilters(false)}
              resultCount={pagination.total}
              searchQuery={filterCountsSearchString}
              city={filteredCity || ""}
              isSearching={loading}
              currentFilters={filters}
            />
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

            <div className="absolute top-4 left-4 z-10 hidden lg:block">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWideLayout(!isWideLayout)}
                className="h-10 w-10 p-0 bg-white shadow-lg border-slate-300 hover:bg-slate-50"
                aria-label={
                  isWideLayout ? "Switch to 2 columns" : "Switch to 4 columns"
                }
              >
                {isWideLayout ? (
                  <Columns2 className="h-4 w-4 text-slate-600" />
                ) : (
                  <Columns4 className="h-4 w-4 text-slate-600" />
                )}
              </Button>
            </div>

            {restaurants.length > 0 && (
              <div
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-3 sm:px-4 py-2 rounded-full shadow-lg border border-slate-200 max-w-[90vw] sm:max-w-none"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <UtensilsCrossed className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 flex-shrink-0" />
                  <span className="text-slate-600 whitespace-nowrap">
                    Showing{" "}
                    <span className="font-medium text-slate-900">
                      {restaurants.length}
                    </span>{" "}
                    out of{" "}
                    <span className="font-medium text-slate-900">
                      {pagination.total}
                    </span>{" "}
                    restaurant{pagination.total !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LEFT PANEL - desktop: static column. Mobile: drawer that slides up over map */}
        <div
          ref={drawerRef}
          className={`
      flex flex-col bg-white
      ${
        isMobile
          ? `fixed left-0 right-0 bottom-0 ${getDrawerTopPosition()} rounded-t-3xl shadow-2xl z-20`
          : "relative w-[640px] h-full order-1 border-r border-slate-200"
      }
      ${isDragging ? "" : "transition-all duration-300"}
    `}
        >
          {/* Desktop search header - inside left panel */}
          {!isMobile && (
            <div className="flex-shrink-0">
              <SearchHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeFilterCount={activeFilterCount}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                suggestions={suggestions}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                onSearch={handleSearch}
                onSuggestionClick={handleSuggestionClick}
                onMenuOpen={() => setMobileMenuOpen(true)}
              />
            </div>
          )}

          {/* Mobile drag handle */}
          {isMobile && (
            <div
              className="flex-shrink-0 w-full flex justify-center py-3 bg-white rounded-t-3xl cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>
          )}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="hidden lg:flex items-center gap-3 mb-4">
                <Button
                  variant={activeTab === "restaurants" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("restaurants")}
                  className={`rounded-full ${activeTab === "restaurants" ? "bg-slate-900 hover:bg-slate-800 text-white" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Restaurants
                </Button>
                <Button
                  variant={activeTab === "discounts" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("discounts")}
                  className={`rounded-full ${activeTab === "discounts" ? "bg-slate-900 hover:bg-slate-800 text-white" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Discounts
                </Button>
                <Button
                  variant={activeTab === "events" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("events")}
                  className={`rounded-full ${activeTab === "events" ? "bg-slate-900 hover:bg-slate-800 text-white" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Events
                </Button>
              </div>
              {activeTab === "restaurants" && (
                <>
                  <h2 className="text-xl font-bold text-slate-900">
                    {filteredCity
                      ? `${pagination.total} ${getActiveFilterLabel()} restaurant${pagination.total !== 1 ? "s" : ""} in ${filteredCity}`
                      : `${pagination.total} ${getActiveFilterLabel()} restaurant${pagination.total !== 1 ? "s" : ""}`}
                  </h2>
                  {pagination.total > 0 && pagination.totalPages > 1 && (
                    <p className="text-sm text-slate-600 mt-1">
                      Page {pagination.page} of {pagination.totalPages}
                    </p>
                  )}
                </>
              )}
              {activeTab === "discounts" && (
                <h2 className="text-xl font-bold text-slate-900">
                  Restaurant Discounts
                </h2>
              )}
              {activeTab === "events" && (
                <h2 className="text-xl font-bold text-slate-900">
                  Family Events
                </h2>
              )}
            </div>

            <div className="px-6 py-4">
              <RestaurantGrid
                restaurants={restaurants}
                loading={loading}
                error={error}
                pagination={pagination}
                currentPage={currentPage}
                isWideLayout={isWideLayout}
                searchQuery={searchQuery}
                hoveredRestaurantId={hoveredRestaurantId}
                likedIds={likedIds}
                bookmarkedIds={bookmarkedIds}
                onPageChange={handlePageChange}
                onRestaurantClick={setSelectedRestaurant}
                onMouseEnter={setHoveredRestaurantId}
                onMouseLeave={() => setHoveredRestaurantId(null)}
                onLike={handleToggleLike}
                onBookmark={handleToggleBookmark}
                onRequestCity={(query) => {
                  setCityRequestName(query);
                  setShowCityRequestDialog(true);
                }}
              />

              {activeTab === "discounts" && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-gradient-to-br from-[#8dbf65] to-[#7aaa56] text-white rounded-full p-6 mb-6">
                    <svg
                      className="h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Coming Soon
                  </h3>
                  <p className="text-slate-600 max-w-md">
                    We're working on bringing you exclusive restaurant discounts
                    and special offers for families.
                  </p>
                </div>
              )}

              {activeTab === "events" && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-gradient-to-br from-[#8dbf65] to-[#7aaa56] text-white rounded-full p-6 mb-6">
                    <svg
                      className="h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Coming Soon
                  </h3>
                  <p className="text-slate-600 max-w-md">
                    Discover family-friendly events at restaurants near you.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowSuggestModal(true)}
        className="lg:hidden fixed bottom-20 right-6 z-50 w-14 h-14 bg-[#9DC54B] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#8AB43A] active:scale-95 transition-all duration-300"
        aria-label="Suggest a restaurant"
      >
        <Plus className="h-7 w-7" strokeWidth={3} />
      </button>

      <Dialog
        open={showCityRequestDialog}
        onOpenChange={setShowCityRequestDialog}
      >
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
          animation: "slideUp 0.5s ease-out",
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
