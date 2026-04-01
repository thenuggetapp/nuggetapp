"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import {
  useAdminRestaurants,
  useCreateRestaurant,
  useUpdateRestaurant,
  useDeleteRestaurant,
  useToggleRestaurantVisibility,
} from "@/hooks/useAdminRestaurants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Heart,
  MapPin,
  Users,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  UserPlus,
  TrendingUp,
} from "lucide-react";
import { GooglePlacesAutocomplete } from "@/components/GooglePlacesAutocomplete";
import { mapGooglePlaceToRestaurant } from "@/lib/google-places-mapper";
import { getRestaurantDisplayImageUrl } from "@/lib/restaurant-image";
import { AdminSidebar } from "@/components/AdminSidebar";

interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

interface OpeningTimes {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

interface Restaurant {
  id?: string;
  name: string;
  slug?: string;
  cuisine: string;
  likes_count: number;
  price_level: number;
  address: string;
  city?: string;
  country?: string;
  phone?: string;
  description?: string;
  latitude: number;
  longitude: number;
  google_maps_url?: string;
  website_url?: string;
  booking_url?: string;
  nugget_verified: boolean;
  kids_menu: boolean;
  high_chairs: boolean;
  wheelchair_access: boolean;
  outdoor_seating: boolean;
  changing_table: boolean;
  vegetarian_options: boolean;
  vegan_options: boolean;
  gluten_free_options: boolean;
  image_url?: string;
  google_place_id?: string;
  dog_friendly: boolean;
  playground_nearby: boolean;
  quick_service: boolean;
  good_for_groups: boolean;
  air_conditioning: boolean;
  baby_change_mens: boolean;
  baby_change_unisex: boolean;
  baby_change_womens: boolean;
  buzzy: boolean;
  free_kids_meal: boolean;
  friendly_staff: boolean;
  fun_quirky: boolean;
  games_available: boolean;
  halal: boolean;
  healthy_options: boolean;
  kids_coloring: boolean;
  kids_play_space: boolean;
  kids_potty_toilet: boolean;
  kosher: boolean;
  one_pound_kids_meal: boolean;
  posh: boolean;
  pram_storage: boolean;
  relaxed: boolean;
  small_plates: boolean;
  takeaway: boolean;
  teen_favourite: boolean;
  tourist_attraction_nearby: boolean;
  visible: boolean;
  opening_times?: OpeningTimes;
}

const emptyRestaurant: Restaurant = {
  name: "",
  cuisine: "",
  likes_count: 0,
  price_level: 2,
  address: "",
  city: "",
  country: "",
  phone: "",
  description: "",
  latitude: 0,
  longitude: 0,
  nugget_verified: false,
  kids_menu: false,
  high_chairs: false,
  wheelchair_access: false,
  outdoor_seating: false,
  changing_table: false,
  vegetarian_options: false,
  vegan_options: false,
  gluten_free_options: false,
  image_url: "",
  google_place_id: "",
  google_maps_url: "",
  website_url: "",
  booking_url: "",
  dog_friendly: false,
  playground_nearby: false,
  quick_service: false,
  good_for_groups: false,
  air_conditioning: false,
  baby_change_mens: false,
  baby_change_unisex: false,
  baby_change_womens: false,
  buzzy: false,
  free_kids_meal: false,
  friendly_staff: false,
  fun_quirky: false,
  games_available: false,
  halal: false,
  healthy_options: false,
  kids_coloring: false,
  kids_play_space: false,
  kids_potty_toilet: false,
  kosher: false,
  one_pound_kids_meal: false,
  posh: false,
  pram_storage: false,
  relaxed: false,
  small_plates: false,
  takeaway: false,
  teen_favourite: false,
  tourist_attraction_nearby: false,
  visible: true,
  opening_times: {},
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, signOut } = useAuth();

  // ✅ SWR hooks - automatic caching, deduplication, background refresh
  const {
    restaurants,
    isLoading: loading,
    refresh: refreshRestaurants,
  } = useAdminRestaurants();
  const { createRestaurant } = useCreateRestaurant();
  const { updateRestaurant } = useUpdateRestaurant();
  const { deleteRestaurant } = useDeleteRestaurant();
  const { toggleVisibility } = useToggleRestaurantVisibility();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null
  );
  const [deletingRestaurantId, setDeletingRestaurantId] = useState<
    string | null
  >(null);
  const [formData, setFormData] = useState<Restaurant>(emptyRestaurant);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocalHeroDialogOpen, setIsLocalHeroDialogOpen] = useState(false);
  const [localHeroFormData, setLocalHeroFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    cityPreference: "",
  });
  const [isCreatingLocalHero, setIsCreatingLocalHero] = useState(false);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // 🚀 Computed values with useMemo for performance
  const filteredRestaurants = useMemo(() => {
    if (searchQuery.trim() === "") {
      return restaurants;
    }
    const query = searchQuery.toLowerCase();
    return restaurants.filter(
      (r: Restaurant) =>
        r.name.toLowerCase().includes(query) ||
        r.cuisine.toLowerCase().includes(query) ||
        (r.city && r.city.toLowerCase().includes(query)) ||
        r.address.toLowerCase().includes(query)
    );
  }, [searchQuery, restaurants]);

  const stats = useMemo(() => {
    const total = restaurants.length;
    const nuggetVerified = restaurants.filter(
      (r: Restaurant) => r.nugget_verified
    ).length;
    const avgLikes =
      restaurants.reduce(
        (sum: number, r: Restaurant) => sum + (r.likes_count || 0),
        0
      ) / total || 0;

    // Calculate top cuisines
    const cuisineMap = new Map<string, number>();
    restaurants.forEach((r: Restaurant) => {
      const count = cuisineMap.get(r.cuisine) || 0;
      cuisineMap.set(r.cuisine, count + 1);
    });

    const topCuisines = Array.from(cuisineMap.entries())
      .map(([cuisine, count]) => ({ cuisine, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total,
      nuggetVerified,
      avgRating: avgLikes,
      topCuisines,
    };
  }, [restaurants]);

  // 🔒 Auth check - redirect if not authenticated or not admin
  useEffect(() => {
    // Wait for auth to fully initialize before making any redirect decisions
    if (authLoading) return;

    // If auth loading is complete but we still don't have a user, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // If we have a user but profile is still loading, wait for it
    // Only show error if profile fails to load after reasonable time
    if (!userProfile) {
      const timeout = setTimeout(() => {
        toast({
          title: "Profile Loading Error",
          description: "Unable to load user profile. Please try refreshing.",
          variant: "destructive",
        });
      }, 8000);
      return () => clearTimeout(timeout);
    }

    // Once we have both user and profile, check role
    if (userProfile.role !== "admin") {
      toast({
        title: "Access Denied",
        description: `You do not have permission to access this page. Your role: ${userProfile.role}. Expected: admin`,
        variant: "destructive",
      });
      router.push("/");
      return;
    }
  }, [user, userProfile, authLoading, router, toast]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Removed: loadRestaurants and calculateStats
  // These are now handled by SWR hook and useMemo above

  const handleCreate = () => {
    setEditingRestaurant(null);
    setFormData(emptyRestaurant);
    setIsDialogOpen(true);
  };

  const handlePlaceSelect = (placeData: any) => {
    const mappedData = mapGooglePlaceToRestaurant(placeData);
    setFormData((prev) => ({
      ...prev,
      ...mappedData,
      image_url: prev.image_url || mappedData.image_url,
    }));
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData(restaurant);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingRestaurantId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingRestaurantId) return;

    const result = await deleteRestaurant(deletingRestaurantId);

    if (result.success) {
      toast({
        title: "Success",
        description: "Restaurant deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete restaurant",
        variant: "destructive",
      });
    }

    setIsDeleteDialogOpen(false);
    setDeletingRestaurantId(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.cuisine || !formData.address) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields: name, cuisine, and address",
        variant: "destructive",
      });
      return;
    }

    if (!formData.city || formData.city.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Please enter a city",
        variant: "destructive",
      });
      return;
    }

    if (formData.latitude === 0 || formData.longitude === 0) {
      toast({
        title: "Validation Error",
        description: "Please enter valid latitude and longitude coordinates",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    const dataToSave = {
      ...formData,
      city: formData.city?.trim() || undefined,
      country: formData.country?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      image_url: formData.image_url?.trim() || undefined,
      google_place_id: formData.google_place_id?.trim() || undefined,
      website_url: formData.website_url?.trim() || undefined,
      google_maps_url: formData.google_maps_url?.trim() || undefined,
      opening_times: formData.opening_times || {},
    };

    let result;
    if (editingRestaurant?.id) {
      const { slug: _omitSlug, ...updatePayload } = dataToSave as typeof dataToSave & {
        slug?: string;
      };
      result = await updateRestaurant(editingRestaurant.id, updatePayload);
    } else {
      const baseSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      let slug = baseSlug;
      const { data: slugConflict } = await supabase
        .from("restaurants")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (slugConflict) {
        const timestamp = Date.now().toString().slice(-6);
        slug = `${slug}-${timestamp}`;
      }
      result = await createRestaurant({ ...dataToSave, slug } as Restaurant);
    }

    if (result.success) {
      toast({
        title: "Success",
        description: editingRestaurant?.id
          ? "Restaurant updated successfully"
          : "Restaurant created successfully",
      });
      setIsDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to save restaurant",
        variant: "destructive",
      });
    }

    setIsSaving(false);
  };

  const getPriceLevelSymbol = (level: number) => {
    return "$".repeat(level);
  };

  const handleCreateLocalHero = async () => {
    if (
      !localHeroFormData.email ||
      !localHeroFormData.password ||
      !localHeroFormData.fullName
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingLocalHero(true);
    console.log("Creating Local Hero account...", {
      email: localHeroFormData.email,
    });

    try {
      console.log("Step 1: Calling signUp...");
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: localHeroFormData.email,
          password: localHeroFormData.password,
          options: {
            data: {
              full_name: localHeroFormData.fullName,
            },
            emailRedirectTo: undefined,
          },
        }
      );

      console.log("Step 1 complete:", { authData, signUpError });

      if (signUpError) {
        console.error("SignUp error:", signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        console.error("No user returned from signUp");
        throw new Error("User creation failed - no user returned");
      }

      console.log("Step 2: Updating user profile role...");
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          role: "local_hero",
        })
        .eq("id", authData.user.id);

      console.log("Step 2 complete:", { profileError });

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      if (localHeroFormData.cityPreference) {
        console.log("Step 3: Creating application record...");
        const { error: applicationError } = await supabase
          .from("local_hero_applications")
          .insert({
            user_id: authData.user.id,
            city_preference: localHeroFormData.cityPreference,
            motivation: "Created by admin",
            status: "approved",
            submitted_at: new Date().toISOString(),
            reviewed_at: new Date().toISOString(),
            reviewed_by: user?.id,
          });

        console.log("Step 3 complete:", { applicationError });

        if (applicationError) {
          console.error("Application creation error:", applicationError);
          throw applicationError;
        }

        console.log("Step 4: Creating city assignment...");
        const { error: assignmentError } = await supabase
          .from("local_hero_assignments")
          .insert({
            user_id: authData.user.id,
            city_name: localHeroFormData.cityPreference,
            assigned_by: user?.id,
            is_active: true,
          });

        console.log("Step 4 complete:", { assignmentError });

        if (assignmentError) {
          console.error("Assignment creation error:", assignmentError);
          throw assignmentError;
        }
      }

      console.log("All steps complete! Success!");
      toast({
        title: "Success",
        description: "Local Hero account created successfully",
      });

      setIsLocalHeroDialogOpen(false);
      setLocalHeroFormData({
        email: "",
        password: "",
        fullName: "",
        cityPreference: "",
      });
    } catch (error: any) {
      console.error("Error creating Local Hero:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create Local Hero account",
        variant: "destructive",
      });
    } finally {
      setIsCreatingLocalHero(false);
      console.log("handleCreateLocalHero complete");
    }
  };

  // Show loading state while auth is initializing OR profile is loading
  // Only show the page once we have both user and userProfile
  if (authLoading || (user && !userProfile)) {
    // Determine what we're waiting for
    let loadingMessage = "Loading...";
    let loadingSubtext = "Please wait...";
    if (authLoading && !user) {
      loadingMessage = "Checking authentication";
      loadingSubtext = "Verifying your credentials...";
    } else if (user && !userProfile) {
      loadingMessage = "Loading your profile";
      loadingSubtext = "Getting your dashboard ready...";
    }

    console.log("[Admin] Rendering loading screen:", loadingMessage);

    return (
      <div className="min-h-screen bg-slate-50 flex">
        <AdminSidebar />

        {/* Main Content Skeleton */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Actions */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <Skeleton className="h-10 w-full max-w-md" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Table Skeleton */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg"
                  >
                    <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Loading Status Overlay */}
          <div className="fixed bottom-8 right-8 bg-white border border-slate-200 rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-bottom-4">
            <div className="flex items-start gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-300 border-t-[#8dbf65] flex-shrink-0 mt-0.5"></div>
              <div className="flex-1">
                <p className="text-slate-900 font-medium text-sm mb-1">
                  {loadingMessage}
                </p>
                <p className="text-slate-500 text-xs">{loadingSubtext}</p>
                {/* Progress bar animation */}
                <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8dbf65] rounded-full animate-progress"></div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Add custom animation for progress bar */}
        <style jsx>{`
          @keyframes progress {
            0% {
              width: 0%;
            }
            50% {
              width: 60%;
            }
            100% {
              width: 90%;
            }
          }
          .animate-progress {
            animation: progress 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage all restaurants and view analytics
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    refreshRestaurants();
                    toast({
                      title: "Refreshing",
                      description: "Updating restaurants data...",
                    });
                  }}
                  className="gap-2"
                  type="button"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  size="sm"
                  className="bg-[#8dbf65] hover:bg-[#7aaa56] gap-2"
                  onClick={handleCreate}
                >
                  <Plus className="h-4 w-4" />
                  Add Restaurant
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => setIsLocalHeroDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Create Local Hero
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Restaurants
                  </CardTitle>
                  <Users className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.total}</div>
                  )}
                  {loading ? (
                    <Skeleton className="h-4 w-24 mt-1" />
                  ) : (
                    <p className="text-xs text-slate-600 mt-1">
                      {stats.nuggetVerified} Nugget Verified
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Likes
                  </CardTitle>
                  <Heart className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {stats.avgRating.toFixed(1)}
                    </div>
                  )}
                  {loading ? (
                    <Skeleton className="h-4 w-32 mt-1" />
                  ) : (
                    <p className="text-xs text-slate-600 mt-1">
                      Across all restaurants
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Top Cuisine
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {stats.topCuisines[0]?.cuisine || "N/A"}
                    </div>
                  )}
                  {loading ? (
                    <Skeleton className="h-4 w-20 mt-1" />
                  ) : (
                    <p className="text-xs text-slate-600 mt-1">
                      {stats.topCuisines[0]?.count || 0} restaurants
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Search Results
                  </CardTitle>
                  <Filter className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {filteredRestaurants.length}
                    </div>
                  )}
                  {loading ? (
                    <Skeleton className="h-4 w-24 mt-1" />
                  ) : (
                    <p className="text-xs text-slate-600 mt-1">
                      Matching filters
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Restaurants</CardTitle>
                    <CardDescription>
                      View and manage all restaurant listings
                    </CardDescription>
                  </div>
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by name, cuisine, or city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Cuisine</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Likes</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Features</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRestaurants.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-8 text-slate-500"
                            >
                              No restaurants found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRestaurants
                            .slice(
                              (currentPage - 1) * itemsPerPage,
                              currentPage * itemsPerPage
                            )
                            .map((restaurant: Restaurant) => (
                              <TableRow key={restaurant.id}>
                                <TableCell className="font-medium">
                                  {restaurant.name}
                                </TableCell>
                                <TableCell>{restaurant.cuisine}</TableCell>
                                <TableCell>{restaurant.city}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-3.5 w-3.5 fill-red-400 text-red-400" />
                                    <span className="font-medium">
                                      {restaurant.likes_count || 0}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-slate-600">
                                    {getPriceLevelSymbol(
                                      restaurant.price_level
                                    )}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {restaurant.visible ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                      Visible
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="secondary"
                                      className="bg-slate-200 text-slate-600"
                                    >
                                      Hidden
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {restaurant.nugget_verified && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Nugget Verified
                                      </Badge>
                                    )}
                                    {restaurant.kids_menu && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Kids Menu
                                      </Badge>
                                    )}
                                    {restaurant.high_chairs && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        High Chairs
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={async () => {
                                        if (!restaurant.id) return;
                                        const result = await toggleVisibility(
                                          restaurant.id,
                                          restaurant.visible
                                        );
                                        if (result.success) {
                                          toast({
                                            title: "Success",
                                            description: `Restaurant ${
                                              restaurant.visible
                                                ? "hidden"
                                                : "made visible"
                                            }`,
                                          });
                                        } else {
                                          toast({
                                            title: "Error",
                                            description:
                                              result.error ||
                                              "Failed to update visibility",
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                      title={
                                        restaurant.visible
                                          ? "Hide restaurant"
                                          : "Show restaurant"
                                      }
                                    >
                                      {restaurant.visible ? (
                                        <Eye className="h-4 w-4" />
                                      ) : (
                                        <EyeOff className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleEdit(restaurant)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:text-red-700"
                                      onClick={() =>
                                        restaurant.id &&
                                        handleDelete(restaurant.id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {!loading && filteredRestaurants.length > 0 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-slate-600">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredRestaurants.length
                      )}{" "}
                      of {filteredRestaurants.length} restaurants
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          {
                            length: Math.ceil(
                              filteredRestaurants.length / itemsPerPage
                            ),
                          },
                          (_, i) => i + 1
                        )
                          .filter((page) => {
                            const totalPages = Math.ceil(
                              filteredRestaurants.length / itemsPerPage
                            );
                            if (totalPages <= 7) return true;
                            if (page === 1 || page === totalPages) return true;
                            if (
                              page >= currentPage - 1 &&
                              page <= currentPage + 1
                            )
                              return true;
                            if (page === 2 && currentPage <= 3) return true;
                            if (
                              page === totalPages - 1 &&
                              currentPage >= totalPages - 2
                            )
                              return true;
                            return false;
                          })
                          .map((page, index, array) => {
                            const prevPage = array[index - 1];
                            const showEllipsis =
                              prevPage && page - prevPage > 1;
                            return (
                              <React.Fragment key={`page-${page}`}>
                                {showEllipsis && (
                                  <span className="px-2 text-slate-400">
                                    ...
                                  </span>
                                )}
                                <Button
                                  variant={
                                    currentPage === page ? "default" : "outline"
                                  }
                                  size="sm"
                                  className={
                                    currentPage === page
                                      ? "bg-[#8dbf65] hover:bg-[#7aaa56]"
                                      : ""
                                  }
                                  onClick={() => setCurrentPage(page)}
                                >
                                  {page}
                                </Button>
                              </React.Fragment>
                            );
                          })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              Math.ceil(
                                filteredRestaurants.length / itemsPerPage
                              ),
                              prev + 1
                            )
                          )
                        }
                        disabled={
                          currentPage ===
                          Math.ceil(filteredRestaurants.length / itemsPerPage)
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRestaurant
                      ? "Edit Restaurant"
                      : "Add New Restaurant"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingRestaurant
                      ? "Update the restaurant information below"
                      : "Fill in the details to add a new restaurant"}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  {!editingRestaurant && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Quick Tip:</strong> Search for the restaurant using Google Places to auto-fill all fields with accurate data.
                        </p>
                      </div>

                      <GooglePlacesAutocomplete
                        onPlaceSelect={handlePlaceSelect}
                        placeholder="Search Google Places..."
                        label="Search Restaurant"
                        defaultValue={formData.name}
                      />

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-muted-foreground">
                            Or enter manually
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Restaurant Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter restaurant name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cuisine">Cuisine *</Label>
                      <Input
                        id="cuisine"
                        value={formData.cuisine}
                        onChange={(e) =>
                          setFormData({ ...formData, cuisine: e.target.value })
                        }
                        placeholder="e.g., Italian, Chinese"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Enter full address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        placeholder="United Kingdom"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude *</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            latitude: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="51.5074"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude *</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            longitude: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="-0.1278"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price_level">Price Level</Label>
                      <Select
                        value={(formData.price_level || 2).toString()}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            price_level: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">$ - Budget</SelectItem>
                          <SelectItem value="2">$$ - Moderate</SelectItem>
                          <SelectItem value="3">$$$ - Expensive</SelectItem>
                          <SelectItem value="4">
                            $$$$ - Very Expensive
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label
                          htmlFor="visible"
                          className="cursor-pointer font-semibold"
                        >
                          Restaurant Visibility
                        </Label>
                        <p className="text-sm text-slate-600 mt-1">
                          {formData.visible
                            ? "This restaurant is visible to the public"
                            : "This restaurant is hidden from the public"}
                        </p>
                      </div>
                      <Switch
                        id="visible"
                        checked={formData.visible}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, visible: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="likes_count">Likes Count</Label>
                    <Input
                      id="likes_count"
                      type="number"
                      value={formData.likes_count}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          likes_count: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>

                  {editingRestaurant?.id ? (
                    <MultiImageUpload
                      restaurantId={editingRestaurant.id}
                      googlePlaceId={formData.google_place_id}
                      restaurantName={formData.name}
                      heroPreviewUrl={
                        getRestaurantDisplayImageUrl({
                          image_url: formData.image_url,
                          google_place_id: formData.google_place_id,
                        }) || undefined
                      }
                      onImagesChange={() => {
                        toast({
                          title: "Images Updated",
                          description: "Restaurant images have been updated successfully",
                        });
                      }}
                    />
                  ) : (
                    <>
                      <ImageUpload
                        currentImageUrl={formData.image_url}
                        onImageChange={(url) =>
                          setFormData((prev) => ({ ...prev, image_url: url }))
                        }
                        restaurantId={formData.id}
                        label="Restaurant Image"
                      />
                      {formData.google_place_id?.trim() ? (
                        <MultiImageUpload
                          googlePlaceId={formData.google_place_id}
                          restaurantName={formData.name || "Restaurant"}
                          heroPreviewUrl={
                            getRestaurantDisplayImageUrl({
                              image_url: formData.image_url,
                              google_place_id: formData.google_place_id,
                            }) || undefined
                          }
                        />
                      ) : null}
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+44 20 1234 5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter a brief description of the restaurant..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website_url">Website URL</Label>
                      <Input
                        id="website_url"
                        value={formData.website_url || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            website_url: e.target.value,
                          })
                        }
                        placeholder="https://www.restaurant.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="google_maps_url">Google Maps URL</Label>
                      <Input
                        id="google_maps_url"
                        value={formData.google_maps_url || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            google_maps_url: e.target.value,
                          })
                        }
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="booking_url">Booking/Reservation URL</Label>
                    <Input
                      id="booking_url"
                      value={formData.booking_url || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          booking_url: e.target.value,
                        })
                      }
                      placeholder="https://opentable.com/... or https://resy.com/..."
                    />
                    <p className="text-sm text-slate-500">
                      Link to make reservations (OpenTable, Resy, etc.)
                    </p>
                  </div>

                  <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-slate-600" />
                      <Label className="font-semibold text-base">
                        Opening Hours
                      </Label>
                    </div>
                    {[
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                      "sunday",
                    ].map((day) => {
                      const dayHours =
                        formData.opening_times?.[day as keyof OpeningTimes];
                      return (
                        <div
                          key={day}
                          className="grid grid-cols-12 gap-3 items-center"
                        >
                          <Label className="col-span-3 capitalize">{day}</Label>
                          <div className="col-span-3">
                            <Input
                              type="time"
                              value={dayHours?.open || ""}
                              onChange={(e) => {
                                const newOpeningTimes = {
                                  ...formData.opening_times,
                                };
                                if (
                                  !newOpeningTimes[day as keyof OpeningTimes]
                                ) {
                                  newOpeningTimes[day as keyof OpeningTimes] = {
                                    open: "",
                                    close: "",
                                  };
                                }
                                newOpeningTimes[
                                  day as keyof OpeningTimes
                                ]!.open = e.target.value;
                                if (
                                  newOpeningTimes[day as keyof OpeningTimes]!
                                    .closed
                                ) {
                                  newOpeningTimes[
                                    day as keyof OpeningTimes
                                  ]!.closed = false;
                                }
                                setFormData({
                                  ...formData,
                                  opening_times: newOpeningTimes,
                                });
                              }}
                              disabled={dayHours?.closed}
                              placeholder="09:00"
                            />
                          </div>
                          <span className="col-span-1 text-center text-slate-500">
                            to
                          </span>
                          <div className="col-span-3">
                            <Input
                              type="time"
                              value={dayHours?.close || ""}
                              onChange={(e) => {
                                const newOpeningTimes = {
                                  ...formData.opening_times,
                                };
                                if (
                                  !newOpeningTimes[day as keyof OpeningTimes]
                                ) {
                                  newOpeningTimes[day as keyof OpeningTimes] = {
                                    open: "",
                                    close: "",
                                  };
                                }
                                newOpeningTimes[
                                  day as keyof OpeningTimes
                                ]!.close = e.target.value;
                                if (
                                  newOpeningTimes[day as keyof OpeningTimes]!
                                    .closed
                                ) {
                                  newOpeningTimes[
                                    day as keyof OpeningTimes
                                  ]!.closed = false;
                                }
                                setFormData({
                                  ...formData,
                                  opening_times: newOpeningTimes,
                                });
                              }}
                              disabled={dayHours?.closed}
                              placeholder="17:00"
                            />
                          </div>
                          <div className="col-span-2 flex items-center gap-2">
                            <Switch
                              checked={dayHours?.closed || false}
                              onCheckedChange={(checked) => {
                                const newOpeningTimes = {
                                  ...formData.opening_times,
                                };
                                if (
                                  !newOpeningTimes[day as keyof OpeningTimes]
                                ) {
                                  newOpeningTimes[day as keyof OpeningTimes] = {
                                    open: "",
                                    close: "",
                                  };
                                }
                                newOpeningTimes[
                                  day as keyof OpeningTimes
                                ]!.closed = checked;
                                setFormData({
                                  ...formData,
                                  opening_times: newOpeningTimes,
                                });
                              }}
                            />
                            <Label className="text-xs text-slate-600">
                              Closed
                            </Label>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    <Label>Features & Amenities</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="nugget_verified"
                          className="cursor-pointer"
                        >
                          Nugget Verified
                        </Label>
                        <Switch
                          id="nugget_verified"
                          checked={formData.nugget_verified}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              nugget_verified: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label htmlFor="kids_menu" className="cursor-pointer">
                          Kids Menu
                        </Label>
                        <Switch
                          id="kids_menu"
                          checked={formData.kids_menu}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, kids_menu: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label htmlFor="high_chairs" className="cursor-pointer">
                          High Chairs
                        </Label>
                        <Switch
                          id="high_chairs"
                          checked={formData.high_chairs}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, high_chairs: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="changing_table"
                          className="cursor-pointer"
                        >
                          Changing Table
                        </Label>
                        <Switch
                          id="changing_table"
                          checked={formData.changing_table}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              changing_table: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="wheelchair_access"
                          className="cursor-pointer"
                        >
                          Wheelchair Access
                        </Label>
                        <Switch
                          id="wheelchair_access"
                          checked={formData.wheelchair_access}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              wheelchair_access: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="outdoor_seating"
                          className="cursor-pointer"
                        >
                          Outdoor Seating
                        </Label>
                        <Switch
                          id="outdoor_seating"
                          checked={formData.outdoor_seating}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              outdoor_seating: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="dog_friendly"
                          className="cursor-pointer"
                        >
                          Dog Friendly
                        </Label>
                        <Switch
                          id="dog_friendly"
                          checked={formData.dog_friendly}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, dog_friendly: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="playground_nearby"
                          className="cursor-pointer"
                        >
                          Playground Nearby
                        </Label>
                        <Switch
                          id="playground_nearby"
                          checked={formData.playground_nearby}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              playground_nearby: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="quick_service"
                          className="cursor-pointer"
                        >
                          Quick Service
                        </Label>
                        <Switch
                          id="quick_service"
                          checked={formData.quick_service}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, quick_service: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="good_for_groups"
                          className="cursor-pointer"
                        >
                          Good for Groups
                        </Label>
                        <Switch
                          id="good_for_groups"
                          checked={formData.good_for_groups}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              good_for_groups: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="vegetarian_options"
                          className="cursor-pointer"
                        >
                          Vegetarian Options
                        </Label>
                        <Switch
                          id="vegetarian_options"
                          checked={formData.vegetarian_options}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              vegetarian_options: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="vegan_options"
                          className="cursor-pointer"
                        >
                          Vegan Options
                        </Label>
                        <Switch
                          id="vegan_options"
                          checked={formData.vegan_options}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, vegan_options: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="gluten_free_options"
                          className="cursor-pointer"
                        >
                          Gluten-Free Options
                        </Label>
                        <Switch
                          id="gluten_free_options"
                          checked={formData.gluten_free_options}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              gluten_free_options: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label htmlFor="halal" className="cursor-pointer">
                          Halal
                        </Label>
                        <Switch
                          id="halal"
                          checked={formData.halal}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, halal: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label htmlFor="kosher" className="cursor-pointer">
                          Kosher
                        </Label>
                        <Switch
                          id="kosher"
                          checked={formData.kosher}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, kosher: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="healthy_options"
                          className="cursor-pointer"
                        >
                          Healthy Options
                        </Label>
                        <Switch
                          id="healthy_options"
                          checked={formData.healthy_options}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              healthy_options: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="small_plates"
                          className="cursor-pointer"
                        >
                          Small Plates
                        </Label>
                        <Switch
                          id="small_plates"
                          checked={formData.small_plates}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, small_plates: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label htmlFor="takeaway" className="cursor-pointer">
                          Takeaway
                        </Label>
                        <Switch
                          id="takeaway"
                          checked={formData.takeaway}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, takeaway: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="air_conditioning"
                          className="cursor-pointer"
                        >
                          Air Conditioning
                        </Label>
                        <Switch
                          id="air_conditioning"
                          checked={formData.air_conditioning}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              air_conditioning: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="games_available"
                          className="cursor-pointer"
                        >
                          Games Available
                        </Label>
                        <Switch
                          id="games_available"
                          checked={formData.games_available}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              games_available: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="free_kids_meal"
                          className="cursor-pointer"
                        >
                          Free Kids Meal
                        </Label>
                        <Switch
                          id="free_kids_meal"
                          checked={formData.free_kids_meal}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              free_kids_meal: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="one_pound_kids_meal"
                          className="cursor-pointer"
                        >
                          £1 Kids Meal
                        </Label>
                        <Switch
                          id="one_pound_kids_meal"
                          checked={formData.one_pound_kids_meal}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              one_pound_kids_meal: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="kids_coloring"
                          className="cursor-pointer"
                        >
                          Kids Coloring
                        </Label>
                        <Switch
                          id="kids_coloring"
                          checked={formData.kids_coloring}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, kids_coloring: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="kids_play_space"
                          className="cursor-pointer"
                        >
                          Kids Play Space
                        </Label>
                        <Switch
                          id="kids_play_space"
                          checked={formData.kids_play_space}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              kids_play_space: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="kids_potty_toilet"
                          className="cursor-pointer"
                        >
                          Kids Potty/Toilet
                        </Label>
                        <Switch
                          id="kids_potty_toilet"
                          checked={formData.kids_potty_toilet}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              kids_potty_toilet: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="baby_change_mens"
                          className="cursor-pointer"
                        >
                          Baby Change (Men's)
                        </Label>
                        <Switch
                          id="baby_change_mens"
                          checked={formData.baby_change_mens}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              baby_change_mens: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="baby_change_womens"
                          className="cursor-pointer"
                        >
                          Baby Change (Women's)
                        </Label>
                        <Switch
                          id="baby_change_womens"
                          checked={formData.baby_change_womens}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              baby_change_womens: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="baby_change_unisex"
                          className="cursor-pointer"
                        >
                          Baby Change (Unisex)
                        </Label>
                        <Switch
                          id="baby_change_unisex"
                          checked={formData.baby_change_unisex}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              baby_change_unisex: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="pram_storage"
                          className="cursor-pointer"
                        >
                          Pram Storage
                        </Label>
                        <Switch
                          id="pram_storage"
                          checked={formData.pram_storage}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, pram_storage: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="teen_favourite"
                          className="cursor-pointer"
                        >
                          Teen Favourite
                        </Label>
                        <Switch
                          id="teen_favourite"
                          checked={formData.teen_favourite}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              teen_favourite: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="tourist_attraction_nearby"
                          className="cursor-pointer"
                        >
                          Tourist Attraction Nearby
                        </Label>
                        <Switch
                          id="tourist_attraction_nearby"
                          checked={formData.tourist_attraction_nearby}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              tourist_attraction_nearby: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label htmlFor="buzzy" className="cursor-pointer">
                          Buzzy
                        </Label>
                        <Switch
                          id="buzzy"
                          checked={formData.buzzy}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, buzzy: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label htmlFor="relaxed" className="cursor-pointer">
                          Relaxed
                        </Label>
                        <Switch
                          id="relaxed"
                          checked={formData.relaxed}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, relaxed: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label htmlFor="posh" className="cursor-pointer">
                          Posh
                        </Label>
                        <Switch
                          id="posh"
                          checked={formData.posh}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, posh: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label htmlFor="fun_quirky" className="cursor-pointer">
                          Fun & Quirky
                        </Label>
                        <Switch
                          id="fun_quirky"
                          checked={formData.fun_quirky}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, fun_quirky: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <Label
                          htmlFor="friendly_staff"
                          className="cursor-pointer"
                        >
                          Friendly Staff
                        </Label>
                        <Switch
                          id="friendly_staff"
                          checked={formData.friendly_staff}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              friendly_staff: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#8dbf65] hover:bg-[#7aaa56]"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving
                      ? "Saving..."
                      : editingRestaurant
                      ? "Update"
                      : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the restaurant from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Dialog
              open={isLocalHeroDialogOpen}
              onOpenChange={setIsLocalHeroDialogOpen}
            >
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#8dbf65]" />
                    Create Local Hero Account
                  </DialogTitle>
                  <DialogDescription>
                    Create a new Local Hero user account with admin approval
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-email">Email Address *</Label>
                    <Input
                      id="hero-email"
                      type="email"
                      value={localHeroFormData.email}
                      onChange={(e) =>
                        setLocalHeroFormData({
                          ...localHeroFormData,
                          email: e.target.value,
                        })
                      }
                      placeholder="hero@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero-password">Password *</Label>
                    <Input
                      id="hero-password"
                      type="password"
                      value={localHeroFormData.password}
                      onChange={(e) =>
                        setLocalHeroFormData({
                          ...localHeroFormData,
                          password: e.target.value,
                        })
                      }
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero-name">Full Name *</Label>
                    <Input
                      id="hero-name"
                      value={localHeroFormData.fullName}
                      onChange={(e) =>
                        setLocalHeroFormData({
                          ...localHeroFormData,
                          fullName: e.target.value,
                        })
                      }
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero-city">
                      City Assignment (Optional)
                    </Label>
                    <Input
                      id="hero-city"
                      value={localHeroFormData.cityPreference}
                      onChange={(e) =>
                        setLocalHeroFormData({
                          ...localHeroFormData,
                          cityPreference: e.target.value,
                        })
                      }
                      placeholder="London, Manchester, etc."
                    />
                    <p className="text-xs text-slate-500">
                      Assign this Local Hero to a specific city. Leave blank to
                      assign later.
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsLocalHeroDialogOpen(false);
                      setLocalHeroFormData({
                        email: "",
                        password: "",
                        fullName: "",
                        cityPreference: "",
                      });
                    }}
                    disabled={isCreatingLocalHero}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#8dbf65] hover:bg-[#7aaa56]"
                    onClick={handleCreateLocalHero}
                    disabled={isCreatingLocalHero}
                  >
                    {isCreatingLocalHero ? "Creating..." : "Create Local Hero"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
