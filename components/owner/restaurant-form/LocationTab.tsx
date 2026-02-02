"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

interface LocationTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function LocationTab({
  formData,
  setFormData,
}: LocationTabProps) {
  const handleChange = (field: string, value: any) => {
    console.log(`🔄 LocationTab - Updating ${field}:`, value);
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="address">
          Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder="123 High Street"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="city">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="London"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">
            Country <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.country}
            onValueChange={(value) => handleChange("country", value)}
          >
            <SelectTrigger id="country">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="New Zealand">New Zealand</SelectItem>
              <SelectItem value="Ireland">Ireland</SelectItem>
              <SelectItem value="France">France</SelectItem>
              <SelectItem value="Germany">Germany</SelectItem>
              <SelectItem value="Spain">Spain</SelectItem>
              <SelectItem value="Italy">Italy</SelectItem>
              <SelectItem value="Portugal">Portugal</SelectItem>
              <SelectItem value="Netherlands">Netherlands</SelectItem>
              <SelectItem value="Belgium">Belgium</SelectItem>
              <SelectItem value="Switzerland">Switzerland</SelectItem>
              <SelectItem value="Austria">Austria</SelectItem>
              <SelectItem value="Denmark">Denmark</SelectItem>
              <SelectItem value="Sweden">Sweden</SelectItem>
              <SelectItem value="Norway">Norway</SelectItem>
              <SelectItem value="Finland">Finland</SelectItem>
              <SelectItem value="Poland">Poland</SelectItem>
              <SelectItem value="Czech Republic">Czech Republic</SelectItem>
              <SelectItem value="Greece">Greece</SelectItem>
              <SelectItem value="Turkey">Turkey</SelectItem>
              <SelectItem value="Japan">Japan</SelectItem>
              <SelectItem value="South Korea">South Korea</SelectItem>
              <SelectItem value="China">China</SelectItem>
              <SelectItem value="India">India</SelectItem>
              <SelectItem value="Singapore">Singapore</SelectItem>
              <SelectItem value="Thailand">Thailand</SelectItem>
              <SelectItem value="Malaysia">Malaysia</SelectItem>
              <SelectItem value="Indonesia">Indonesia</SelectItem>
              <SelectItem value="Philippines">Philippines</SelectItem>
              <SelectItem value="Vietnam">Vietnam</SelectItem>
              <SelectItem value="United Arab Emirates">
                United Arab Emirates
              </SelectItem>
              <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
              <SelectItem value="Israel">Israel</SelectItem>
              <SelectItem value="South Africa">South Africa</SelectItem>
              <SelectItem value="Egypt">Egypt</SelectItem>
              <SelectItem value="Morocco">Morocco</SelectItem>
              <SelectItem value="Brazil">Brazil</SelectItem>
              <SelectItem value="Mexico">Mexico</SelectItem>
              <SelectItem value="Argentina">Argentina</SelectItem>
              <SelectItem value="Chile">Chile</SelectItem>
              <SelectItem value="Colombia">Colombia</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700">
          <MapPin className="h-4 w-4" />
          <Label>GPS Coordinates</Label>
        </div>
        <p className="text-sm text-slate-500">
          Set the exact location of the restaurant. You can drag the marker on
          the map or enter coordinates manually.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="latitude">
              Latitude <span className="text-red-500">*</span>
            </Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) =>
                handleChange("latitude", parseFloat(e.target.value) || 0)
              }
              placeholder="51.5074"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">
              Longitude <span className="text-red-500">*</span>
            </Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) =>
                handleChange("longitude", parseFloat(e.target.value) || 0)
              }
              placeholder="-0.1278"
              required
            />
          </div>
        </div>

        {(formData.latitude === 0 || formData.longitude === 0) && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              Please set the restaurant location. You can use Google Maps to
              find the coordinates, or enter the address above and use a
              geocoding service.
            </p>
          </div>
        )}

        {formData.latitude !== 0 && formData.longitude !== 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Location set: {formData.latitude.toFixed(6)},{" "}
              {formData.longitude.toFixed(6)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
