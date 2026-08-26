"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { LocalHeroNav } from "@/components/LocalHeroNav";
import { LocalHeroHeader } from "@/components/LocalHeroHeader";
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
import { Save, Eye, AlertCircle, Loader2, ArrowLeft, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { RestaurantFormData } from "@/app/owner/restaurants/new/page";

export default function EditRestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const restaurantId = params.id as string;
  const { isAuthorized, isChecking, user, userProfile } = useRequireAuth({
    requiredRole: "local_hero",
    allowAdminOverride: true,
  });
  const { toast } = useToast();
  const [formData, setFormData] = useState<RestaurantFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "amenities" ? "amenities" : "basic"
  );
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthorized) {
      loadRestaurant();
    }
  }, [isAuthorized, restaurantId]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);

      const { data: restaurant, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single();

      if (error) throw error;

      if (!restaurant) {
        toast({
          title: "Error",
          description: "Restaurant not found",
          variant: "destructive",
        });
        router.push("/local-hero/dashboard");
        return;
      }

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
        latitude: restaurant.latitude || 0,
        longitude: restaurant.longitude || 0,
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
        unverified_fields: restaurant.unverified_fields || [],
      });
    } catch (error: any) {
      console.error("Error loading restaurant:", error);
      toast({
        title: "Error",
        description: "Failed to load restaurant",
        variant: "destructive",
      });
      router.push("/local-hero/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): string[] => {
    if (!formData) return ["Form data not loaded"];

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
    console.log("💾 handleSave called with formData:", formData);
    const errors = validateForm();

    if (errors.length > 0) {
      setValidationErrors(errors);
      setValidationDialogOpen(true);
      return;
    }

    if (!user || !formData) {
      toast({
        title: "Error",
        description: "You must be logged in to update a restaurant",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const dataToSave = {
        ...formData,
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
      };
      delete (dataToSave as { slug?: string }).slug;

      console.log("📤 Sending data to Supabase:", {
        city: dataToSave.city,
        country: dataToSave.country,
        address: dataToSave.address,
        restaurantId,
      });

      const { data: result, error: updateError } = await supabase
        .from("restaurants")
        .update(dataToSave)
        .eq("id", restaurantId)
        .select();

      console.log("📥 Supabase response:", { result, error: updateError });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: `Restaurant ${
          publish ? "published" : "updated"
        } successfully`,
      });

      router.push("/local-hero/dashboard");
    } catch (error: any) {
      console.error("Error updating restaurant:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update restaurant",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8dbf65]" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Restaurant not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <LocalHeroNav />

      <div className="flex-1 flex flex-col">
        <LocalHeroHeader
          title="Edit Restaurant"
          description={`Update details for ${formData.name}`}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/local-hero/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          }
        />

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Restaurant Information</CardTitle>
                    <CardDescription>Update the restaurant details</CardDescription>
                  </div>
                  {(formData.unverified_fields?.length ?? 0) > 0 && (
                    <Badge
                      className="bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap cursor-pointer"
                      onClick={() => setActiveTab("amenities")}
                    >
                      <CircleHelp className="h-3.5 w-3.5 mr-1" />
                      {formData.unverified_fields!.length} field
                      {formData.unverified_fields!.length === 1 ? "" : "s"} need
                      {formData.unverified_fields!.length === 1 ? "s" : ""} your check
                    </Badge>
                  )}
                </div>
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
                    <TabsTrigger value="amenities" className="gap-1.5">
                      Amenities
                      {(formData.unverified_fields?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-semibold">
                          {formData.unverified_fields!.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <BasicInfoTab
                      formData={formData}
                      setFormData={setFormData}
                    />
                  </TabsContent>

                  <TabsContent value="location" className="space-y-6">
                    <LocationTab
                      formData={formData}
                      setFormData={setFormData}
                    />
                  </TabsContent>

                  <TabsContent value="hours" className="space-y-6">
                    <OpeningHoursTab
                      formData={formData}
                      setFormData={setFormData}
                    />
                  </TabsContent>

                  <TabsContent value="amenities" className="space-y-6">
                    <AmenitiesTab
                      formData={formData}
                      setFormData={setFormData}
                    />
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
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="flex-1 bg-[#8dbf65] hover:bg-[#7aaa56]"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {saving ? "Publishing..." : "Publish Restaurant"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
