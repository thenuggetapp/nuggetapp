'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';

interface AmenitiesTabProps {
  formData: any;
  setFormData: (data: any) => void;
  // Owners can mark their own listing "Verified by <restaurant>"; Nugget curators set "Nugget Verified"
  variant?: 'owner' | 'curator';
}

const amenityGroups: Array<{ title: string; note?: string; amenities: Array<{ key: string; label: string }> }> = [
  {
    title: 'Family & Kids',
    amenities: [
      { key: 'kids_menu', label: 'Kids Menu' },
      { key: 'high_chairs', label: 'High Chairs Available' },
      { key: 'kids_play_space', label: 'Kids Play Space' },
      { key: 'kids_coloring', label: 'Kids Coloring/Activities' },
      { key: 'kids_potty_toilet', label: 'Kids Potty/Toilet' },
      { key: 'free_kids_meal', label: 'Free Kids Meal' },
      { key: 'games_available', label: 'Games Available' },
      { key: 'teen_favourite', label: 'Teen Favourite' },
    ],
  },
  {
    title: 'Accessibility',
    amenities: [
      { key: 'wheelchair_access', label: 'Wheelchair Access (includes accessible toilet)' },
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
      { key: 'small_plates', label: 'Small Plates / Shareables' },
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
      { key: 'buzzy', label: 'Buzzy Atmosphere (can get a bit loud)' },
      { key: 'relaxed', label: 'Relaxed (a bit chill, not as loud)' },
      { key: 'posh', label: 'Upscale / Posh (a bit fancy)' },
      { key: 'fun_quirky', label: 'Fun / Quirky (live music, events, something silly or unique)' },
    ],
  },
  {
    title: 'Location Features (within a 10 minute walk)',
    note: '*Include what you can, The Nugget team can add more specifics too!',
    amenities: [
      { key: 'playground_nearby', label: 'Playground Nearby' },
      { key: 'tourist_attraction_nearby', label: 'Tourist Attraction Nearby' },
    ],
  },
];

export default function AmenitiesTab({ formData, setFormData, variant = 'owner' }: AmenitiesTabProps) {
  const handleToggle = (key: string, value: boolean) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <div className="space-y-6">
      {variant === 'curator' ? (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Switch
              id="nugget_verified"
              checked={formData.nugget_verified || false}
              onCheckedChange={(checked) => handleToggle('nugget_verified', checked)}
            />
            <Label htmlFor="nugget_verified" className="text-sm font-medium cursor-pointer">
              Nugget Verified
            </Label>
          </div>
        </CardContent>
      </Card>
      ) : (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Switch
              id="owner_verified"
              checked={formData.owner_verified || false}
              onCheckedChange={(checked) => handleToggle('owner_verified', checked)}
            />
            <Label htmlFor="owner_verified" className="text-sm font-medium cursor-pointer">
              Verified by {formData.name?.trim() || 'your restaurant'}
            </Label>
          </div>
          <p className="text-sm text-slate-500 mt-2 ml-14">
            Turn this on to confirm the details on your listing are accurate. Families will see a &ldquo;Verified by {formData.name?.trim() || 'your restaurant'}&rdquo; badge.
          </p>
        </CardContent>
      </Card>
      )}

      <div className="mb-4">
        <h3 className="font-semibold text-slate-700">Restaurant Amenities</h3>
        <p className="text-sm text-slate-500">
          Select all amenities and features that apply to this restaurant
        </p>
      </div>

      {amenityGroups.map((group) => (
        <Card key={group.title}>
          <CardContent className="p-6">
            <h4 className="font-semibold text-slate-700 mb-4">{group.title}</h4>
            {group.note && <p className="text-sm text-slate-500 -mt-2 mb-4">{group.note}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.amenities.map((amenity) => (
                <div key={amenity.key} className="flex items-center space-x-3">
                  <Switch
                    id={amenity.key}
                    checked={formData[amenity.key] || false}
                    onCheckedChange={(checked) => handleToggle(amenity.key, checked)}
                  />
                  <Label
                    htmlFor={amenity.key}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {amenity.label}
                  </Label>
                </div>
              ))}
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
