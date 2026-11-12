'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleHelp } from 'lucide-react';

interface AmenitiesTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

const amenityGroups = [
  {
    title: 'Family & Kids',
    amenities: [
      { key: 'nugget_verified', label: 'Nugget Verified' },
      { key: 'kids_menu', label: 'Kids Menu' },
      { key: 'high_chairs', label: 'High Chairs Available' },
      { key: 'kids_play_space', label: 'Kids Play Space' },
      { key: 'kids_coloring', label: 'Kids Coloring/Activities' },
      { key: 'kids_potty_toilet', label: 'Kids Potty/Toilet' },
      { key: 'free_kids_meal', label: 'Free Kids Meal' },
      { key: 'one_pound_kids_meal', label: '£1 Kids Meal' },
      { key: 'games_available', label: 'Games Available' },
      { key: 'teen_favourite', label: 'Teen Favourite' },
    ],
  },
  {
    title: 'Accessibility',
    amenities: [
      { key: 'wheelchair_access', label: 'Wheelchair Access' },
      { key: 'changing_table', label: 'Changing Table' },
      { key: 'baby_change_mens', label: "Baby Change (Men's)" },
      { key: 'baby_change_womens', label: "Baby Change (Women's)" },
      { key: 'baby_change_unisex', label: 'Baby Change (Unisex)' },
      { key: 'pram_storage', label: 'Pram Storage' },
    ],
  },
  {
    title: 'Dining Options',
    amenities: [
      { key: 'vegetarian_options', label: 'Vegetarian Options' },
      { key: 'vegan_options', label: 'Vegan Options' },
      { key: 'gluten_free_options', label: 'Gluten-Free Options' },
      { key: 'halal', label: 'Halal Options' },
      { key: 'kosher', label: 'Kosher Options' },
      { key: 'healthy_options', label: 'Healthy Options' },
      { key: 'small_plates', label: 'Small Plates/Tapas' },
    ],
  },
  {
    title: 'Atmosphere & Services',
    amenities: [
      { key: 'outdoor_seating', label: 'Outdoor Seating' },
      { key: 'dog_friendly', label: 'Dog Friendly' },
      { key: 'good_for_groups', label: 'Good for Groups' },
      { key: 'quick_service', label: 'Quick Service' },
      { key: 'takeaway', label: 'Takeaway Available' },
      { key: 'air_conditioning', label: 'Air Conditioning' },
      { key: 'friendly_staff', label: 'Friendly Staff' },
    ],
  },
  {
    title: 'Vibe',
    amenities: [
      { key: 'buzzy', label: 'Buzzy Atmosphere' },
      { key: 'relaxed', label: 'Relaxed' },
      { key: 'posh', label: 'Upscale/Posh' },
      { key: 'fun_quirky', label: 'Fun & Quirky' },
    ],
  },
  {
    title: 'Location Features',
    amenities: [
      { key: 'playground_nearby', label: 'Playground Nearby' },
      { key: 'tourist_attraction_nearby', label: 'Tourist Attraction Nearby' },
    ],
  },
];

export default function AmenitiesTab({ formData, setFormData }: AmenitiesTabProps) {
  const unverifiedFields: string[] = formData.unverified_fields || [];

  const handleToggle = (key: string, value: boolean) => {
    // A human just made an explicit call on this field -- it's no longer
    // "needs local check," regardless of which way they set it.
    const nextUnverified = unverifiedFields.includes(key)
      ? unverifiedFields.filter((f) => f !== key)
      : unverifiedFields;

    setFormData({
      ...formData,
      [key]: value,
      unverified_fields: nextUnverified,
    });
  };

  const totalUnverified = unverifiedFields.length;

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-700">Restaurant Amenities</h3>
          <p className="text-sm text-slate-500">
            Select all amenities and features that apply to this restaurant
          </p>
        </div>
        {totalUnverified > 0 && (
          <Badge className="bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap">
            <CircleHelp className="h-3.5 w-3.5 mr-1" />
            {totalUnverified} need{totalUnverified === 1 ? 's' : ''} your check
          </Badge>
        )}
      </div>

      {totalUnverified > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
          Fields marked <span className="inline-flex items-center gap-1 font-medium"><CircleHelp className="h-3.5 w-3.5" />Needs check</span> below
          came from automated research, not a confirmed source -- toggle them on or off based on what you actually find on site
          (or leave as-is and just flip the toggle once to clear the flag once you've confirmed it).
        </div>
      )}

      {amenityGroups.map((group) => (
        <Card key={group.title}>
          <CardContent className="p-6">
            <h4 className="font-semibold text-slate-700 mb-4">{group.title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.amenities.map((amenity) => {
                const needsCheck = unverifiedFields.includes(amenity.key);
                return (
                  <div
                    key={amenity.key}
                    className={`flex items-center space-x-3 rounded-md p-2 -m-2 ${
                      needsCheck ? 'bg-amber-50 ring-1 ring-amber-200' : ''
                    }`}
                  >
                    <Switch
                      id={amenity.key}
                      checked={formData[amenity.key] || false}
                      onCheckedChange={(checked) => handleToggle(amenity.key, checked)}
                    />
                    <Label
                      htmlFor={amenity.key}
                      className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                    >
                      {amenity.label}
                      {needsCheck && (
                        <span
                          title="From automated research -- not yet confirmed by a local hero"
                          className="inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-700 bg-amber-100 border border-amber-300 rounded-full px-1.5 py-0.5"
                        >
                          <CircleHelp className="h-3 w-3" />
                          Needs check
                        </span>
                      )}
                    </Label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          Amenities help customers filter and find restaurants that meet their specific needs. Be accurate and only select amenities that are actually available.
        </p>
      </div>
    </div>
  );
}
