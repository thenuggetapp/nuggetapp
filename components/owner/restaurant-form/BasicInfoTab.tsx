'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ImageUpload';
import { MultiImageUpload } from '@/components/MultiImageUpload';
import { getRestaurantDisplayImageUrl } from '@/lib/restaurant-image';

interface BasicInfoTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

const cuisineTypes = [
  'American',
  'Asian',
  'Bakery',
  'Bar & Grill',
  'BBQ',
  'Breakfast',
  'British',
  'Burgers',
  'Cafe',
  'Chinese',
  'Dessert',
  'European',
  'Filipino',
  'French',
  'Greek',
  'Indian',
  'International',
  'Italian',
  'Japanese',
  'Korean',
  'Kosher',
  'Latin American',
  'Mediterranean',
  'Mexican',
  'Middle Eastern',
  'Persian',
  'Peruvian',
  'Portuguese',
  'Pub',
  'Sandwiches',
  'Seafood',
  'Spanish',
  'Steakhouse',
  'Thai',
  'Turkish',
  'Vegetarian',
  'Various',
];

export default function BasicInfoTab({ formData, setFormData }: BasicInfoTabProps) {
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            Restaurant Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter restaurant name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuisine">
            Cuisine Type <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.cuisine} onValueChange={(value) => handleChange('cuisine', value)}>
            <SelectTrigger id="cuisine">
              <SelectValue placeholder="Select cuisine type" />
            </SelectTrigger>
            <SelectContent>
              {cuisineTypes.map((cuisine) => (
                <SelectItem key={cuisine} value={cuisine}>
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe the restaurant, its atmosphere, and what makes it special..."
          rows={4}
        />
        <p className="text-sm text-slate-500">
          Tell potential customers what makes this restaurant unique
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+44 20 1234 5678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price_level">Price Level</Label>
          <Select
            value={formData.price_level?.toString()}
            onValueChange={(value) => handleChange('price_level', parseInt(value))}
          >
            <SelectTrigger id="price_level">
              <SelectValue placeholder="Select price level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">£ - Budget</SelectItem>
              <SelectItem value="2">££ - Moderate</SelectItem>
              <SelectItem value="3">£££ - Expensive</SelectItem>
              <SelectItem value="4">££££ - Very Expensive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="website_url">Website URL</Label>
          <Input
            id="website_url"
            type="url"
            value={formData.website_url}
            onChange={(e) => handleChange('website_url', e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="google_maps_url">Google Maps URL</Label>
          <Input
            id="google_maps_url"
            type="url"
            value={formData.google_maps_url}
            onChange={(e) => handleChange('google_maps_url', e.target.value)}
            placeholder="https://maps.google.com/..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking_url">Booking/Reservation URL</Label>
        <Input
          id="booking_url"
          type="url"
          value={formData.booking_url}
          onChange={(e) => handleChange('booking_url', e.target.value)}
          placeholder="https://opentable.com/... or https://resy.com/..."
        />
        <p className="text-sm text-slate-500">
          Link to make reservations (OpenTable, Resy, etc.)
        </p>
      </div>

      {formData.id ? (
        <MultiImageUpload
          restaurantId={formData.id}
          googlePlaceId={formData.google_place_id}
          restaurantName={formData.name}
          heroPreviewUrl={
            getRestaurantDisplayImageUrl({
              image_url: formData.image_url,
              google_place_id: formData.google_place_id,
            }) || undefined
          }
        />
      ) : (
        <ImageUpload
          currentImageUrl={formData.image_url}
          onImageChange={(url) => handleChange('image_url', url)}
          restaurantId={formData.id}
          label="Restaurant Image (you can add more after creating)"
        />
      )}
    </div>
  );
}
