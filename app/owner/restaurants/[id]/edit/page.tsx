"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Eye, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BasicInfoTab from "@/components/owner/restaurant-form/BasicInfoTab";
import LocationTab from "@/components/owner/restaurant-form/LocationTab";
import OpeningHoursTab from "@/components/owner/restaurant-form/OpeningHoursTab";
import AmenitiesTab from "@/components/owner/restaurant-form/AmenitiesTab";

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

export interface RestaurantFormData {
  id?: string;
  name: string;
  cuisine: string;
  description: string;
  phone: string;
  price_level: number;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  image_url: string;
  google_place_id: string;
  website_url: string;
  google_maps_url: string;
  booking_url: string;
  opening_times: OpeningTimes;
  nugget_verified: boolean;
  kids_menu: boolean;
  high_chairs: boolean;
  wheelchair_access: boolean;
  outdoor_seating: boolean;
  changing_table: boolean;
  vegetarian_options: boolean;
  vegan_options: boolean;
  gluten_free_options: boolean;
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
}

const initialFormData: RestaurantFormData = {
  name: "",
  cuisine: "",
  description: "",
  phone: "",
  price_level: 2,
  address: "",
  city: "",
  country: "United Kingdom",
  latitude: 0,
  longitude: 0,
  image_url: "",
  google_place_id: "",
  website_url: "",
  google_maps_url: "",
  booking_url: "",
  opening_times: {},
  nugget_verified: false,
  kids_menu: false,
  high_chairs: false,
  wheelchair_access: false,
  outdoor_seating: false,
  changing_table: false,
  vegetarian_options: false,
  vegan_options: false,
  gluten_free_options: false,
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
};

export default function EditRestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params?.id as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<RestaurantFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (restaurantId && user) {
      loadRestaurant();
    }
  }, [restaurantId, user]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);

      // Fetch restaurant data
      const { data: restaurant, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single();

      if (restaurantError) throw restaurantError;

      if (!restaurant) {
        toast({
          title: "Error",
          description: "Restaurant not found",
          variant: "destructive",
        });
        router.push("/owner/restaurants");
        return;
      }

      // Check ownership
      const { data: ownership, error: ownershipError } = await supabase
        .from("restaurant_ownership")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("owner_id", user?.id)
        .single();

      if (ownershipError || !ownership) {
        toast({
          title: "Error",
          description: "You do not have permission to edit this restaurant",
          variant: "destructive",
        });
        router.push("/owner/restaurants");
        return;
      }

      // Populate form data
      setFormData({
        id: restaurant.id,
        name: restaurant.name || "",
        cuisine: restaurant.cuisine || "",
        description: restaurant.description || "",
        phone: restaurant.phone || "",
        price_level: restaurant.price_level || 2,
        address: restaurant.address || "",
        city: restaurant.city || "",
        country: restaurant.country || "United Kingdom",
        latitude: parseFloat(restaurant.latitude) || 0,
        longitude: parseFloat(restaurant.longitude) || 0,
        image_url: restaurant.image_url || "",
        google_place_id: restaurant.google_place_id || "",
        website_url: restaurant.website_url || "",
        google_maps_url: restaurant.google_maps_url || "",
        booking_url: restaurant.booking_url || "",
        opening_times: restaurant.opening_times || {},
        nugget_verified: restaurant.nugget_verified || false,
        kids_menu: restaurant.kids_menu || false,
        high_chairs: restaurant.high_chairs || false,
        wheelchair_access: restaurant.wheelchair_access || false,
        outdoor_seating: restaurant.outdoor_seating || false,
        changing_table: restaurant.changing_table || false,
        vegetarian_options: restaurant.vegetarian_options || false,
        vegan_options: restaurant.vegan_options || false,
        gluten_free_options: restaurant.gluten_free_options || false,
        dog_friendly: restaurant.dog_friendly || false,
        playground_nearby: restaurant.playground_nearby || false,
        quick_service: restaurant.quick_service || false,
        good_for_groups: restaurant.good_for_groups || false,
        air_conditioning: restaurant.air_conditioning || false,
        baby_change_mens: restaurant.baby_change_mens || false,
        baby_change_unisex: restaurant.baby_change_unisex || false,
        baby_change_womens: restaurant.baby_change_womens || false,
        buzzy: restaurant.buzzy || false,
        free_kids_meal: restaurant.free_kids_meal || false,
        friendly_staff: restaurant.friendly_staff || false,
        fun_quirky: restaurant.fun_quirky || false,
        games_available: restaurant.games_available || false,
        halal: restaurant.halal || false,
        healthy_options: restaurant.healthy_options || false,
        kids_coloring: restaurant.kids_coloring || false,
        kids_play_space: restaurant.kids_play_space || false,
        kids_potty_toilet: restaurant.kids_potty_toilet || false,
        kosher: restaurant.kosher || false,
        one_pound_kids_meal: restaurant.one_pound_kids_meal || false,
        posh: restaurant.posh || false,
        pram_storage: restaurant.pram_storage || false,
        relaxed: restaurant.relaxed || false,
        small_plates: restaurant.small_plates || false,
        takeaway: restaurant.takeaway || false,
        teen_favourite: restaurant.teen_favourite || false,
        tourist_attraction_nearby:
          restaurant.tourist_attraction_nearby || false,
        visible: restaurant.visible || false,
      });
    } catch (error: any) {
      console.error("Error loading restaurant:", error);
      toast({
        title: "Error",
        description: "Failed to load restaurant data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push("Restaurant name is required");
    }
    if (!formData.cuisine.trim()) {
      errors.push("Cuisine type is required");
    }
    if (!formData.address.trim()) {
      errors.push("Address is required");
    }
    if (!formData.city.trim()) {
      errors.push("City is required");
    }
    if (formData.latitude === 0 || formData.longitude === 0) {
      errors.push(
        "Please set the restaurant location on the map (Location tab)"
      );
    }

    return errors;
  };

  const handleSave = async (publish: boolean) => {
    const errors = validateForm();

    if (errors.length > 0) {
      setValidationErrors(errors);
      setValidationDialogOpen(true);
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update a restaurant",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Generate base slug
      let slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if slug exists (excluding current restaurant) and add unique suffix if needed
      const { data: existingRestaurant } = await supabase
        .from("restaurants")
        .select("slug, id")
        .eq("slug", slug)
        .neq("id", restaurantId)
        .maybeSingle();

      if (existingRestaurant) {
        // Add timestamp to make slug unique
        const timestamp = Date.now().toString().slice(-6);
        slug = `${slug}-${timestamp}`;
      }

      const dataToSave = {
        ...formData,
        slug,
        visible: publish,
        city: formData.city.trim() || null,
        country: formData.country.trim() || null,
        phone: formData.phone.trim() || null,
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null,
        google_place_id: formData.google_place_id?.trim() || null,
        website_url: formData.website_url.trim() || null,
        google_maps_url: formData.google_maps_url.trim() || null,
        booking_url: formData.booking_url.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("restaurants")
        .update(dataToSave)
        .eq("id", restaurantId);

      if (updateError) {
        console.error("Restaurant update error:", updateError);
        throw updateError;
      }

      toast({
        title: "Success",
        description: `Restaurant ${
          publish ? "published" : "updated"
        } successfully`,
      });

      router.push("/owner/restaurants");
    } catch (error: any) {
      console.error("Error saving restaurant:", error);

      let errorMessage = error.message || "Failed to save restaurant";

      // Handle specific error cases
      if (error.code === "23505") {
        errorMessage =
          "A restaurant with this name already exists. Please use a different name.";
      } else if (error.code === "22003") {
        errorMessage =
          "Invalid location coordinates. Please check the location on the map.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#8dbf65]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/owner/restaurants">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Edit Restaurant
            </h1>
            <p className="text-slate-600 mt-1">
              Update your restaurant information
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restaurant Information</CardTitle>
          <CardDescription>
            Update the details for your restaurant listing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="hours">Opening Hours</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <BasicInfoTab formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="location" className="space-y-6">
              <LocationTab formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="hours" className="space-y-6">
              <OpeningHoursTab formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="amenities" className="space-y-6">
              <AmenitiesTab formData={formData} setFormData={setFormData} />
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex-1 bg-[#8dbf65] hover:bg-[#7aaa56]"
            >
              <Eye className="mr-2 h-4 w-4" />
              {saving ? "Publishing..." : "Save & Publish"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={validationDialogOpen}
        onOpenChange={setValidationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Missing Required Information
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Please complete the following required fields before publishing:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setValidationDialogOpen(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
