"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MapboxMap } from "@/components/MapboxMap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ImageCarousel } from "@/components/ImageCarousel";
import { Restaurant } from "@/lib/dummy-restaurants";
import { useAuth } from "@/contexts/AuthContext";
import {
  generateRestaurantStructuredData,
  generateBreadcrumbStructuredData,
} from "@/lib/structured-data";
import {
  getRestaurantDisplayImageUrl,
  toAbsolutePublicImageUrl,
} from "@/lib/restaurant-image";
import { useRestaurantDetail } from "@/hooks/useRestaurants";
import {
  useUserBookmarks,
  useUserLikes,
  useToggleBookmark,
  useToggleLike,
} from "@/hooks/useUserData";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Heart,
  Smile,
  Utensils,
  Baby,
  Bookmark,
  Menu,
  Crown,
  Store,
  Settings,
  User,
  TrendingUp,
  Shield,
  ExternalLink,
} from "lucide-react";

interface RestaurantDetailProps {
  slug: string;
}

export default function RestaurantDetail({ slug }: RestaurantDetailProps) {
  const router = useRouter();
  const { user, userProfile, permissions } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ SWR hooks - automatic caching, deduplication, background refresh
  const { restaurant: restaurantData, isLoading: loading } =
    useRestaurantDetail(slug);
  const { bookmarkedIds } = useUserBookmarks();
  const { likedIds } = useUserLikes();
  const { toggleBookmark } = useToggleBookmark();
  const { toggleLike } = useToggleLike();

  // Format restaurant data
  const restaurant = useMemo(() => {
    if (!restaurantData) return null;

    const data = restaurantData;
    const addedByProfile = Array.isArray(data.added_by)
      ? data.added_by[0]
      : data.added_by;

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      cuisine: data.cuisine,
      rating: data.rating || 0,
      reviewCount: data.review_count || 0,
      priceLevel: data.price_level || 2,
      address: data.address,
      city: data.city,
      country: data.country,
      phone: data.phone,
      description: data.description,
      coordinates: [data.longitude, data.latitude] as [number, number],
      imageUrl:
        getRestaurantDisplayImageUrl({
          image_url: data.image_url,
          google_place_id: data.google_place_id,
        }) || "/nugget_colour_logo.png",
      googleMapsUrl: data.google_maps_url,
      googlePlaceId: data.google_place_id,
      websiteUrl: data.website_url,
      bookingUrl: data.booking_url,
      openingTimes: data.opening_times,
      nuggetVerified: data.nugget_verified,
      kidsMenu: data.kids_menu,
      highChairs: data.high_chairs,
      changingTable: data.changing_table,
      wheelchairAccess: data.wheelchair_access,
      outdoorSeating: data.outdoor_seating,
      playgroundNearby: data.playground_nearby,
      airConditioning: data.air_conditioning,
      dogFriendly: data.dog_friendly,
      vegetarianOptions: data.vegetarian_options,
      veganOptions: data.vegan_options,
      glutenFreeOptions: data.gluten_free_options,
      halal: data.halal,
      kosher: data.kosher,
      healthyOptions: data.healthy_options,
      smallPlates: data.small_plates,
      takeaway: data.takeaway,
      funQuirky: data.fun_quirky,
      relaxed: data.relaxed,
      buzzy: data.buzzy,
      posh: data.posh,
      goodForGroups: data.good_for_groups,
      kidsColoring: data.kids_coloring,
      gamesAvailable: data.games_available,
      kidsPlaySpace: data.kids_play_space,
      kidsPottyToilet: data.kids_potty_toilet,
      teenFavourite: data.teen_favourite,
      quickService: data.quick_service,
      friendlyStaff: data.friendly_staff,
      freeKidsMeal: data.free_kids_meal,
      onePoundKidsMeal: data.one_pound_kids_meal,
      touristAttractionNearby: data.tourist_attraction_nearby,
      babyChangeWomens: data.baby_change_womens,
      babyChangeMens: data.baby_change_mens,
      babyChangeUnisex: data.baby_change_unisex,
      pramStorage: data.pram_storage,
      likesCount: data.likes_count || 0,
      visible: data.visible,
      addedBy: addedByProfile
        ? {
            id: addedByProfile.id,
            fullName: addedByProfile.full_name,
            website: addedByProfile.website,
          }
        : null,
    } as Restaurant;
  }, [restaurantData]);

  const isLiked = restaurant ? likedIds.has(restaurant.id) : false;
  const isBookmarked = restaurant ? bookmarkedIds.has(restaurant.id) : false;

  // Removed: loadRestaurant, checkIfLiked, checkIfBookmarked, old toggleLike, old toggleBookmark
  // These are now handled by SWR hooks above

  const handleToggleLike = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!restaurant) return;

    await toggleLike(restaurant.id);
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!restaurant) return;

    await toggleBookmark(restaurant.id);
  };

  const structuredData = restaurant
    ? generateRestaurantStructuredData(restaurant)
    : null;

  const breadcrumbData = restaurant
    ? generateBreadcrumbStructuredData([
        { name: "Home", url: "/" },
        { name: "Search", url: "/search" },
        {
          name: restaurant.name,
          url: `/restaurant/${restaurant.id}`,
        },
      ])
    : null;

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 lg:ml-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8dbf65] mx-auto mb-4"></div>
            <p className="text-slate-600">Loading restaurant details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex h-screen bg-white">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 lg:ml-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Restaurant not found
            </h1>
            <Button onClick={() => router.push("/search")}>
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const markers = [
    {
      id: restaurant.id,
      coordinates: restaurant.coordinates,
      title: restaurant.name,
      description: restaurant.address,
    },
  ];

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
      )}
      <div className="flex h-screen bg-white">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

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

              <div
                className="flex-1 overflow-y-auto p-6"
                tabIndex={0}
                role="region"
                aria-label="Map and actions"
              >
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

        <div className="restaurant-detail-layout flex-1 flex flex-col lg:ml-16 w-full lg:flex-row">
          <div className="detail-content-wrapper flex-1 flex flex-col overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-4 py-3 lg:relative lg:bg-white lg:border-b lg:border-slate-200 lg:px-6 lg:py-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="h-10 w-10 flex-shrink-0 lg:hidden bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-10 w-10 lg:bg-transparent lg:shadow-none bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>

            <div className="detail-panels-container flex flex-1 overflow-hidden flex-col lg:flex-row lg:pt-0">
              <div
                className="detail-panels-scroll-wrapper w-full lg:flex-1 flex flex-col lg:flex-row bg-white overflow-y-auto pb-20 lg:pb-0"
                tabIndex={0}
                role="main"
                aria-label="Restaurant details"
              >
                <div className="restaurant-info-column flex-1 lg:w-[65%] flex flex-col lg:border-r border-slate-200">
                  <div className="hero-image-container relative w-full flex-shrink-0 lg:mt-0">
                    <ImageCarousel
                      restaurantId={restaurant.id}
                      fallbackImage={restaurant.imageUrl}
                      restaurantName={restaurant.name}
                      googlePlaceId={restaurant.googlePlaceId || null}
                    />
                    <div className="action-buttons-overlay absolute bottom-4 left-4 flex items-center gap-2 z-10">
                      <Button
                        size="icon"
                        onClick={handleToggleLike}
                        className="h-10 w-10 bg-white hover:bg-slate-100 text-slate-900 shadow-lg"
                        aria-label={
                          isLiked ? "Unlike restaurant" : "Like restaurant"
                        }
                      >
                        <Heart
                          className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                        />
                      </Button>
                      <Button
                        size="icon"
                        onClick={handleToggleBookmark}
                        className="h-10 w-10 bg-white hover:bg-slate-100 text-slate-900 shadow-lg"
                        aria-label={
                          isBookmarked
                            ? "Remove bookmark"
                            : "Bookmark restaurant"
                        }
                      >
                        <Bookmark
                          className={`h-5 w-5 ${isBookmarked ? "fill-slate-900" : ""}`}
                        />
                      </Button>
                    </div>
                  </div>

                  <div
                    className="restaurant-details-content flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-y-auto"
                    tabIndex={0}
                    role="article"
                    aria-label="Restaurant information"
                  >
                    <div className="restaurant-header-section">
                      <h1 className="restaurant-name text-2xl font-bold text-slate-900 mb-3">
                        {restaurant.name}
                      </h1>
                      <div className="restaurant-meta-info flex items-center gap-2 lg:gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                          <span className="font-bold text-base lg:text-lg text-slate-900">
                            {restaurant.likesCount || 0}
                          </span>
                          <span className="text-sm lg:text-base text-slate-600">
                            likes
                          </span>
                        </div>
                        <span className="text-slate-400">•</span>
                        <span className="text-sm lg:text-base text-slate-600">
                          {"$".repeat(restaurant.priceLevel)}
                        </span>
                        <span className="text-slate-400">•</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm lg:text-base text-slate-600">
                            {restaurant.cuisine}
                          </span>
                          {restaurant.addedBy?.fullName && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className="text-sm lg:text-base text-slate-600">
                                by{" "}
                                {restaurant.addedBy.website ? (
                                  <a
                                    href={restaurant.addedBy.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#4a7c37] hover:underline font-medium"
                                  >
                                    {restaurant.addedBy.fullName}
                                  </a>
                                ) : (
                                  restaurant.addedBy.fullName
                                )}
                              </span>
                            </>
                          )}
                          {restaurant.nuggetVerified && (
                            <Badge className="bg-[#8dbf65] hover:bg-[#7aaa56] text-white border-0 flex items-center gap-1 px-2 py-0.5">
                              <Shield className="h-3 w-3" />
                              <span className="text-xs font-medium">
                                Nugget Verified
                              </span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mobile-family-features lg:hidden">
                      <h2 className="section-title text-base font-bold text-slate-900 mb-3">
                        Family Features
                      </h2>
                      <div className="features-grid grid grid-cols-2 gap-2">
                        {restaurant.kidsMenu && (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/kids-menu.png"
                                alt="Kids Menu"
                                className="h-4 w-4 object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-900">
                              Kids Menu
                            </span>
                          </div>
                        )}
                        {restaurant.highChairs && (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/high-chairs copy.png"
                                alt="High Chairs"
                                className="h-4 w-4 object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-900">
                              High Chairs
                            </span>
                          </div>
                        )}
                        {restaurant.playgroundNearby && (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/playground_nearby.png"
                                alt="Playground Nearby"
                                className="h-4 w-4 object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-900">
                              Playground
                            </span>
                          </div>
                        )}
                        {restaurant.kidsPlaySpace && (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/kids-play-space.png"
                                alt="Kids Play Space"
                                className="h-4 w-4 object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-900">
                              Play Space
                            </span>
                          </div>
                        )}
                        {restaurant.kidsColoring && (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/kids-colouring.png"
                                alt="Kids Coloring"
                                className="h-4 w-4 object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-900">
                              Coloring
                            </span>
                          </div>
                        )}
                        {restaurant.gamesAvailable && (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/games-available.png"
                                alt="Games Available"
                                className="h-4 w-4 object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-900">
                              Games
                            </span>
                          </div>
                        )}
                        {restaurant.freeKidsMeal && (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/free-kids-meal.png"
                                alt="Free Kids Meal"
                                className="h-4 w-4 object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-900">
                              Free Kids Meal
                            </span>
                          </div>
                        )}
                        {restaurant.babyChangeWomens && (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/baby-change-womens.png"
                                alt="Baby Change Women"
                                className="h-4 w-4 object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-900">
                              Baby Change (W)
                            </span>
                          </div>
                        )}
                        {restaurant.babyChangeMens && (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/baby-change-mens.png"
                                alt="Baby Change Mens"
                                className="h-4 w-4 object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-900">
                              Baby Change (M)
                            </span>
                          </div>
                        )}
                        {restaurant.babyChangeUnisex && (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/baby-change-unisex.png"
                                alt="Baby Change Unisex"
                                className="h-4 w-4 object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-900">
                              Baby Change
                            </span>
                          </div>
                        )}
                        {restaurant.pramStorage && (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/pram-storage.png"
                                alt="Pram Storage"
                                className="h-4 w-4 object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-900">
                              Pram Storage
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile Dietary Options */}
                    {(restaurant.vegetarianOptions ||
                      restaurant.veganOptions ||
                      restaurant.glutenFreeOptions ||
                      restaurant.halal ||
                      restaurant.kosher ||
                      restaurant.healthyOptions) && (
                      <div className="mobile-dietary-options lg:hidden border-t border-slate-200 pt-4">
                        <h2 className="section-title text-base font-bold text-slate-900 mb-3">
                          Dietary Options
                        </h2>
                        <div className="features-grid grid grid-cols-2 gap-2">
                          {restaurant.vegetarianOptions && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/vegetarian.png"
                                  alt="Vegetarian"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Vegetarian
                              </span>
                            </div>
                          )}
                          {restaurant.veganOptions && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/vegan.png"
                                  alt="Vegan"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Vegan
                              </span>
                            </div>
                          )}
                          {restaurant.glutenFreeOptions && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/gluten-free.png"
                                  alt="Gluten Free"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Gluten-Free
                              </span>
                            </div>
                          )}
                          {restaurant.halal && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/halal copy.png"
                                  alt="Halal"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Halal
                              </span>
                            </div>
                          )}
                          {restaurant.kosher && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/kosher copy.png"
                                  alt="Kosher"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Kosher
                              </span>
                            </div>
                          )}
                          {restaurant.healthyOptions && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/healthy-options.png"
                                  alt="Healthy Options"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Healthy Options
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mobile Accessibility & Amenities */}
                    {(restaurant.wheelchairAccess ||
                      restaurant.outdoorSeating ||
                      restaurant.dogFriendly ||
                      restaurant.airConditioning) && (
                      <div className="mobile-accessibility-amenities lg:hidden border-t border-slate-200 pt-4">
                        <h2 className="section-title text-base font-bold text-slate-900 mb-3">
                          Accessibility & Amenities
                        </h2>
                        <div className="features-grid grid grid-cols-2 gap-2">
                          {restaurant.wheelchairAccess && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/wheelchair.png"
                                  alt="Wheelchair Access"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Wheelchair Access
                              </span>
                            </div>
                          )}
                          {restaurant.outdoorSeating && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/outdoor copy.png"
                                  alt="Outdoor Seating"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Outdoor Seating
                              </span>
                            </div>
                          )}
                          {restaurant.dogFriendly && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/dog-friendly.png"
                                  alt="Dog Friendly"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Dog Friendly
                              </span>
                            </div>
                          )}
                          {restaurant.airConditioning && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/air-conditioning copy.png"
                                  alt="Air Conditioning"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Air Conditioning
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mobile Service & Atmosphere */}
                    {(restaurant.takeaway ||
                      restaurant.quickService ||
                      restaurant.goodForGroups ||
                      restaurant.buzzy ||
                      restaurant.relaxed ||
                      restaurant.posh ||
                      restaurant.funQuirky) && (
                      <div className="mobile-service-atmosphere lg:hidden border-t border-slate-200 pt-4">
                        <h2 className="section-title text-base font-bold text-slate-900 mb-3">
                          Service & Atmosphere
                        </h2>
                        <div className="features-grid grid grid-cols-2 gap-2">
                          {restaurant.takeaway && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/takeaway-available copy.png"
                                  alt="Takeaway"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Takeaway
                              </span>
                            </div>
                          )}
                          {restaurant.quickService && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/quick-service.png"
                                  alt="Quick Service"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Quick Service
                              </span>
                            </div>
                          )}
                          {restaurant.goodForGroups && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/good-for-groups.png"
                                  alt="Good for Groups"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Good for Groups
                              </span>
                            </div>
                          )}
                          {restaurant.buzzy && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/buzzy.png"
                                  alt="Buzzy"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Buzzy
                              </span>
                            </div>
                          )}
                          {restaurant.relaxed && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/relaxed copy.png"
                                  alt="Relaxed"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Relaxed
                              </span>
                            </div>
                          )}
                          {restaurant.posh && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/posh copy.png"
                                  alt="Posh"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Upscale
                              </span>
                            </div>
                          )}
                          {restaurant.funQuirky && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src="/fun.png"
                                  alt="Fun & Quirky"
                                  className="h-4 w-4 object-contain"
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-900">
                                Fun & Quirky
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="desktop-action-buttons hidden lg:block">
                      <div className="action-buttons-group flex gap-2">
                        {restaurant.bookingUrl ? (
                          <Button
                            asChild
                            className="flex-1 bg-[#8dbf65] hover:bg-[#7aaa56] h-12 text-base font-medium"
                          >
                            <a
                              href={restaurant.bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Make a Reservation
                            </a>
                          </Button>
                        ) : (
                          <Button
                            disabled
                            className="flex-1 bg-slate-300 cursor-not-allowed h-12 text-base font-medium text-[#101729]"
                          >
                            Booking link coming soon
                          </Button>
                        )}
                        {restaurant.websiteUrl && (
                          <Button
                            asChild
                            size="icon"
                            className="h-12 w-12 bg-[#101729] hover:bg-[#1a2238] text-white flex-shrink-0"
                          >
                            <a
                              href={restaurant.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Visit restaurant website"
                            >
                              <ExternalLink className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="about-section space-y-3 lg:space-y-4">
                      <h2 className="section-title text-base lg:text-lg font-bold text-slate-900 mb-3 lg:mb-4">
                        About
                      </h2>
                      <p className="text-sm lg:text-base text-slate-600 leading-relaxed">
                        {restaurant.description ||
                          `${restaurant.name} is a wonderful${restaurant.nuggetVerified ? " family-friendly" : ""} restaurant offering delicious ${restaurant.cuisine.toLowerCase()} cuisine. With a welcoming atmosphere and excellent service, it's perfect for${restaurant.nuggetVerified ? " families" : " diners"} looking for a great dining experience. The restaurant features comfortable seating and a menu that caters to ${restaurant.nuggetVerified ? "both adults and children" : "a variety of tastes"}.`}
                      </p>
                    </div>

                    <div className="contact-info-section border-t border-slate-200 pt-4 lg:pt-6 space-y-3 lg:space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm lg:text-base text-slate-900">
                            Address
                          </p>
                          {restaurant.googleMapsUrl ? (
                            <a
                              href={restaurant.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm lg:text-base text-[#4a7c37] hover:underline font-medium"
                              aria-label={`View ${restaurant.name} on Google Maps`}
                            >
                              {restaurant.address}
                            </a>
                          ) : (
                            <p className="text-sm lg:text-base text-slate-600">
                              {restaurant.address}
                            </p>
                          )}
                        </div>
                      </div>

                      {restaurant.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm lg:text-base text-slate-900">
                              Phone
                            </p>
                            <a
                              href={`tel:${restaurant.phone}`}
                              className="text-sm lg:text-base text-[#4a7c37] hover:underline font-medium"
                              aria-label={`Call ${restaurant.name}`}
                            >
                              {restaurant.phone}
                            </a>
                          </div>
                        </div>
                      )}

                      {restaurant.openingTimes && (
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                          <div className="w-full">
                            <p className="font-medium text-sm lg:text-base text-slate-900 mb-2">
                              Hours
                            </p>
                            <div className="space-y-1">
                              {[
                                "monday",
                                "tuesday",
                                "wednesday",
                                "thursday",
                                "friday",
                                "saturday",
                                "sunday",
                              ].map((day) => {
                                const dayData = restaurant.openingTimes[day];
                                if (!dayData) return null;

                                const dayName =
                                  day.charAt(0).toUpperCase() + day.slice(1);
                                const displayDay = dayName.slice(0, 3);

                                return (
                                  <div
                                    key={day}
                                    className="flex text-sm lg:text-base"
                                  >
                                    <span className="text-slate-900 font-medium">
                                      {displayDay}:
                                    </span>
                                    <span className="text-slate-600 ml-1">
                                      {dayData.open} - {dayData.close}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {restaurant.addedBy?.fullName && (
                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm lg:text-base text-slate-900">
                              Recommended by
                            </p>
                            {restaurant.addedBy.website ? (
                              <a
                                href={restaurant.addedBy.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm lg:text-base text-[#4a7c37] hover:underline font-medium"
                              >
                                {restaurant.addedBy.fullName}
                              </a>
                            ) : (
                              <p className="text-sm lg:text-base text-slate-600">
                                {restaurant.addedBy.fullName}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mobile-map-section border-t border-slate-200 pt-4 lg:pt-6 lg:hidden">
                      <h2 className="section-title text-base font-bold text-slate-900 mb-3">
                        Location
                      </h2>
                      <div className="map-container w-full h-64 rounded-lg overflow-hidden border border-slate-200">
                        <MapboxMap
                          coordinates={restaurant.coordinates}
                          markers={markers}
                          zoom={15}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="features-sidebar hidden lg:block w-full lg:w-[30%] p-6 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 overflow-y-auto"
                  tabIndex={0}
                  role="complementary"
                  aria-label="Family features"
                >
                  <h2 className="section-title text-lg font-bold text-slate-900 mb-4">
                    Family Features
                  </h2>
                  <div className="features-list space-y-3">
                    {restaurant.kidsMenu && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <img
                            src="/kids-menu.png"
                            alt="Kids Menu"
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            Kids Menu
                          </p>
                          <p className="text-xs text-slate-600">Available</p>
                        </div>
                      </div>
                    )}

                    {restaurant.highChairs && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <img
                            src="/high-chairs copy.png"
                            alt="High Chairs"
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            High Chairs
                          </p>
                          <p className="text-xs text-slate-600">Available</p>
                        </div>
                      </div>
                    )}

                    {restaurant.playgroundNearby && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <img
                            src="/playground_nearby.png"
                            alt="Playground Nearby"
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            Playground Nearby
                          </p>
                          <p className="text-xs text-slate-600">Available</p>
                        </div>
                      </div>
                    )}

                    {restaurant.kidsPlaySpace && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <img
                            src="/kids-play-space.png"
                            alt="Kids Play Space"
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            Play Space
                          </p>
                          <p className="text-xs text-slate-600">Available</p>
                        </div>
                      </div>
                    )}

                    {restaurant.kidsColoring && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <img
                            src="/kids-colouring.png"
                            alt="Kids Coloring"
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            Coloring Activities
                          </p>
                          <p className="text-xs text-slate-600">Available</p>
                        </div>
                      </div>
                    )}

                    {restaurant.gamesAvailable && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <img
                            src="/games-available.png"
                            alt="Games Available"
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            Games
                          </p>
                          <p className="text-xs text-slate-600">Available</p>
                        </div>
                      </div>
                    )}

                    {restaurant.freeKidsMeal && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <img
                            src="/free-kids-meal.png"
                            alt="Free Kids Meal"
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            Free Kids Meal
                          </p>
                          <p className="text-xs text-slate-600">Available</p>
                        </div>
                      </div>
                    )}

                    {restaurant.babyChangeWomens && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <img
                            src="/baby-change-womens.png"
                            alt="Baby Change Women"
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            Baby Change (Women's)
                          </p>
                          <p className="text-xs text-slate-600">Available</p>
                        </div>
                      </div>
                    )}

                    {restaurant.babyChangeMens && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <img
                            src="/baby-change-mens.png"
                            alt="Baby Change Mens"
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            Baby Change (Men's)
                          </p>
                          <p className="text-xs text-slate-600">Available</p>
                        </div>
                      </div>
                    )}

                    {restaurant.babyChangeUnisex && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <img
                            src="/baby-change-unisex.png"
                            alt="Baby Change Unisex"
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            Baby Change (Unisex)
                          </p>
                          <p className="text-xs text-slate-600">Available</p>
                        </div>
                      </div>
                    )}

                    {restaurant.pramStorage && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <img
                            src="/pram-storage.png"
                            alt="Pram Storage"
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            Pram Storage
                          </p>
                          <p className="text-xs text-slate-600">Available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dietary Options */}
                  {(restaurant.vegetarianOptions ||
                    restaurant.veganOptions ||
                    restaurant.glutenFreeOptions ||
                    restaurant.halal ||
                    restaurant.kosher ||
                    restaurant.healthyOptions) && (
                    <>
                      <h2 className="section-title text-lg font-bold text-slate-900 mb-4 mt-6">
                        Dietary Options
                      </h2>
                      <div className="dietary-options-list space-y-3">
                        {restaurant.vegetarianOptions && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/vegetarian.png"
                                alt="Vegetarian"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Vegetarian Options
                              </p>
                              <p className="text-xs text-slate-600">
                                Available
                              </p>
                            </div>
                          </div>
                        )}
                        {restaurant.veganOptions && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/vegan.png"
                                alt="Vegan"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Vegan Options
                              </p>
                              <p className="text-xs text-slate-600">
                                Available
                              </p>
                            </div>
                          </div>
                        )}
                        {restaurant.glutenFreeOptions && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/gluten-free.png"
                                alt="Gluten Free"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Gluten-Free Options
                              </p>
                              <p className="text-xs text-slate-600">
                                Available
                              </p>
                            </div>
                          </div>
                        )}
                        {restaurant.halal && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/halal copy.png"
                                alt="Halal"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Halal
                              </p>
                              <p className="text-xs text-slate-600">
                                Available
                              </p>
                            </div>
                          </div>
                        )}
                        {restaurant.kosher && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/kosher copy.png"
                                alt="Kosher"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Kosher
                              </p>
                              <p className="text-xs text-slate-600">
                                Available
                              </p>
                            </div>
                          </div>
                        )}
                        {restaurant.healthyOptions && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/healthy-options.png"
                                alt="Healthy Options"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Healthy Options
                              </p>
                              <p className="text-xs text-slate-600">
                                Available
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Accessibility & Amenities */}
                  {(restaurant.wheelchairAccess ||
                    restaurant.outdoorSeating ||
                    restaurant.dogFriendly ||
                    restaurant.airConditioning) && (
                    <>
                      <h2 className="section-title text-lg font-bold text-slate-900 mb-4 mt-6">
                        Accessibility & Amenities
                      </h2>
                      <div className="amenities-list space-y-3">
                        {restaurant.wheelchairAccess && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/wheelchair.png"
                                alt="Wheelchair Access"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Wheelchair Accessible
                              </p>
                              <p className="text-xs text-slate-600">
                                Available
                              </p>
                            </div>
                          </div>
                        )}
                        {restaurant.outdoorSeating && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/outdoor copy.png"
                                alt="Outdoor Seating"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Outdoor Seating
                              </p>
                              <p className="text-xs text-slate-600">
                                Available
                              </p>
                            </div>
                          </div>
                        )}
                        {restaurant.dogFriendly && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/dog-friendly.png"
                                alt="Dog Friendly"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Dog Friendly
                              </p>
                              <p className="text-xs text-slate-600">
                                Pets Welcome
                              </p>
                            </div>
                          </div>
                        )}
                        {restaurant.airConditioning && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/air-conditioning copy.png"
                                alt="Air Conditioning"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Air Conditioning
                              </p>
                              <p className="text-xs text-slate-600">
                                Available
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Service & Atmosphere */}
                  {(restaurant.takeaway ||
                    restaurant.quickService ||
                    restaurant.goodForGroups ||
                    restaurant.buzzy ||
                    restaurant.relaxed ||
                    restaurant.posh ||
                    restaurant.funQuirky) && (
                    <>
                      <h2 className="section-title text-lg font-bold text-slate-900 mb-4 mt-6">
                        Service & Atmosphere
                      </h2>
                      <div className="service-atmosphere-list space-y-3">
                        {restaurant.takeaway && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/takeaway-available copy.png"
                                alt="Takeaway"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Takeaway
                              </p>
                              <p className="text-xs text-slate-600">
                                Available
                              </p>
                            </div>
                          </div>
                        )}
                        {restaurant.quickService && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/quick-service.png"
                                alt="Quick Service"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Quick Service
                              </p>
                              <p className="text-xs text-slate-600">
                                Fast Dining
                              </p>
                            </div>
                          </div>
                        )}
                        {restaurant.goodForGroups && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/good-for-groups.png"
                                alt="Good for Groups"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Good for Groups
                              </p>
                              <p className="text-xs text-slate-600">
                                Group Friendly
                              </p>
                            </div>
                          </div>
                        )}
                        {restaurant.buzzy && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/buzzy.png"
                                alt="Buzzy"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Buzzy Atmosphere
                              </p>
                              <p className="text-xs text-slate-600">
                                Lively & Energetic
                              </p>
                            </div>
                          </div>
                        )}
                        {restaurant.relaxed && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/relaxed copy.png"
                                alt="Relaxed"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Relaxed Atmosphere
                              </p>
                              <p className="text-xs text-slate-600">
                                Casual & Laid-back
                              </p>
                            </div>
                          </div>
                        )}
                        {restaurant.posh && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/posh copy.png"
                                alt="Posh"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Upscale
                              </p>
                              <p className="text-xs text-slate-600">
                                Sophisticated Dining
                              </p>
                            </div>
                          </div>
                        )}
                        {restaurant.funQuirky && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src="/fun.png"
                                alt="Fun & Quirky"
                                className="h-5 w-5 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                Fun & Quirky
                              </p>
                              <p className="text-xs text-slate-600">
                                Unique Experience
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="map-panel hidden lg:block lg:w-[35%] relative h-1/2 lg:h-full lg:border-l border-slate-200">
            <MapboxMap
              coordinates={restaurant.coordinates}
              markers={markers}
              zoom={15}
            />
          </div>
        </div>

        <div className="mobile-bottom-bar lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-50">
          <div className="action-buttons-group flex gap-2">
            {restaurant.bookingUrl ? (
              <Button
                asChild
                className="flex-1 bg-[#8dbf65] hover:bg-[#7aaa56] h-12 text-base font-medium"
              >
                <a
                  href={restaurant.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Make a Reservation
                </a>
              </Button>
            ) : (
              <Button
                disabled
                className="flex-1 bg-slate-300 cursor-not-allowed h-12 text-base font-medium text-[#101729]"
              >
                Booking coming soon
              </Button>
            )}
            {restaurant.websiteUrl && (
              <Button
                asChild
                size="icon"
                className="h-12 w-12 bg-[#101729] hover:bg-[#1a2238] text-white flex-shrink-0"
              >
                <a
                  href={restaurant.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit restaurant website"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
